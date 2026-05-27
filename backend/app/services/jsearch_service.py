"""
JSearch API Service — Real-time job fetching from RapidAPI JSearch.

Architecture:
- Aggressive in-memory + Redis caching (30-min TTL)
- Smart merged query generation (max 2 queries per upload)
- Query normalization to prevent duplicate cache entries
- NLP skill extraction from job descriptions
- Graceful error handling with fallback to cached results
"""

import re
import time
import json
import hashlib
import logging
import requests
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("uvicorn")

# ─── Curated skill keywords for NLP extraction ────────────────────────────────
KNOWN_SKILLS = [
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "dart", "perl",
    "objective-c", "shell", "bash", "lua", "matlab", "haskell", "elixir",
    # Web & Frontend
    "react", "angular", "vue", "vue.js", "next.js", "nextjs", "nuxt", "svelte",
    "html", "html5", "css", "css3", "tailwind", "tailwindcss", "bootstrap",
    "sass", "less", "webpack", "vite", "jquery",
    # Backend & APIs
    "node.js", "nodejs", "express", "fastapi", "flask", "django", "spring",
    "spring boot", "rails", "laravel", "asp.net", ".net", "graphql", "rest",
    "grpc", "microservices",
    # Databases
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "firebase", "sqlite", "oracle", "mariadb",
    "neo4j", "couchdb",
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "ci/cd", "github actions", "gitlab",
    "heroku", "vercel", "netlify", "cloudflare",
    # Data & ML/AI
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "spark", "apache spark", "hadoop", "airflow",
    "data science", "data analysis", "data engineering", "etl",
    "power bi", "tableau", "looker", "jupyter",
    # Mobile
    "react native", "flutter", "android", "ios", "swiftui",
    # Tools & Practices
    "git", "github", "jira", "confluence", "agile", "scrum",
    "linux", "unix", "figma", "photoshop",
    # Testing
    "jest", "mocha", "pytest", "selenium", "cypress", "playwright",
    "unit testing", "tdd",
    # Other Tech
    "blockchain", "web3", "solidity", "api", "oauth", "jwt",
    "websocket", "kafka", "rabbitmq", "nginx", "apache",
]

# Pre-compile skill patterns for fast matching
_SKILL_PATTERNS = [(skill, re.compile(r'\b' + re.escape(skill) + r'\b', re.IGNORECASE)) for skill in KNOWN_SKILLS]


class JSearchCache:
    """In-memory cache with TTL. Falls back from Redis if configured."""

    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}
        self._redis = None
        if settings.REDIS_URL:
            try:
                import redis as redis_lib
                self._redis = redis_lib.from_url(settings.REDIS_URL)
                self._redis.ping()
                logger.info("JSearch cache connected to Redis.")
            except Exception as e:
                logger.warning(f"Redis unavailable for JSearch cache: {e}. Using in-memory.")
                self._redis = None

    def _make_key(self, query: str) -> str:
        normalized = self._normalize_query(query)
        return f"jsearch:{hashlib.md5(normalized.encode()).hexdigest()}"

    @staticmethod
    def _normalize_query(query: str) -> str:
        """Normalize query: lowercase, dedup words, sort, remove extra spaces."""
        words = query.lower().split()
        seen = set()
        unique = []
        for w in words:
            w_clean = w.strip()
            if w_clean and w_clean not in seen:
                seen.add(w_clean)
                unique.append(w_clean)
        return " ".join(sorted(unique))

    def get(self, query: str) -> Optional[List[Dict]]:
        key = self._make_key(query)

        # Try Redis first
        if self._redis:
            try:
                raw = self._redis.get(key)
                if raw:
                    logger.info(f"JSearch cache HIT (Redis) for query key: {key}")
                    return json.loads(raw)
            except Exception:
                pass

        # In-memory fallback
        entry = self._store.get(key)
        if entry and time.time() < entry["expires_at"]:
            logger.info(f"JSearch cache HIT (memory) for query key: {key}")
            return entry["data"]
        elif entry:
            del self._store[key]

        return None

    def set(self, query: str, data: List[Dict]) -> None:
        key = self._make_key(query)
        ttl = settings.JSEARCH_CACHE_TTL

        # Redis
        if self._redis:
            try:
                self._redis.setex(key, ttl, json.dumps(data))
            except Exception as e:
                logger.warning(f"Redis cache write error: {e}")

        # Always also store in memory
        self._store[key] = {
            "data": data,
            "expires_at": time.time() + ttl,
        }

    def get_any_cached(self) -> Optional[List[Dict]]:
        """Return any non-expired cached results as a fallback."""
        now = time.time()
        for key, entry in self._store.items():
            if now < entry["expires_at"] and entry["data"]:
                logger.info("Returning fallback cached jobs from a previous query.")
                return entry["data"]
        return None


class JSearchService:
    """Service to fetch live jobs from JSearch RapidAPI with caching."""

    JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"
    JSEARCH_HOST = "jsearch.p.rapidapi.com"

    def __init__(self):
        self.api_key = settings.JSEARCH_API_KEY
        self.cache = JSearchCache()
        if self.api_key:
            logger.info("JSearch API service initialized.")
        else:
            logger.warning("No JSEARCH_API_KEY provided. Live job search disabled.")

    # ─── Query Generation ─────────────────────────────────────────────────────

    def build_search_queries(self, resume_data: Dict[str, Any]) -> List[str]:
        """
        Generate max 2 optimized merged search queries from resume data.
        Combines top skills + suggested roles into compact queries.
        """
        skills = resume_data.get("skills", []) or resume_data.get("technical_skills", [])
        roles = resume_data.get("suggested_roles", [])

        # Take top 4 skills and top 2 roles
        top_skills = [s.strip() for s in skills[:4] if s.strip()]
        top_roles = [r.strip() for r in roles[:2] if r.strip()]

        if not top_skills and not top_roles:
            return ["software developer India"]

        # Query 1: primary skills + primary role + India
        parts_1 = top_skills[:3] + top_roles[:1] + ["India"]
        query_1 = " ".join(parts_1)

        queries = [query_1]

        # Query 2 (optional): remaining skills + secondary role + India
        if len(top_skills) > 2 or len(top_roles) > 1:
            parts_2 = top_skills[2:5] + top_roles[1:2] + ["India"]
            query_2 = " ".join(parts_2)
            if self.cache._normalize_query(query_2) != self.cache._normalize_query(query_1):
                queries.append(query_2)

        return queries[:settings.JSEARCH_MAX_QUERIES_PER_UPLOAD]

    # ─── API Fetching ─────────────────────────────────────────────────────────

    def fetch_jobs(self, query: str) -> List[Dict[str, Any]]:
        """
        Fetch jobs from JSearch API. Cache-first: checks cache before calling API.
        """
        # 1. Check cache
        cached = self.cache.get(query)
        if cached is not None:
            return cached

        # 2. Call API
        if not self.api_key:
            logger.warning("No JSearch API key. Returning empty results.")
            return []

        try:
            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": self.JSEARCH_HOST,
            }
            params = {
                "query": query,
                "page": "1",
                "num_pages": "1",
                "date_posted": "month",
                "country": "in",
            }

            logger.info(f"JSearch API call: query='{query}'")
            response = requests.get(self.JSEARCH_URL, headers=headers, params=params, timeout=15)

            if response.status_code == 429:
                logger.error("JSearch API rate limit exceeded (429).")
                fallback = self.cache.get_any_cached()
                return fallback or []

            if response.status_code != 200:
                logger.error(f"JSearch API error: status={response.status_code}, body={response.text[:300]}")
                fallback = self.cache.get_any_cached()
                return fallback or []

            data = response.json()
            raw_jobs = data.get("data", [])

            if not raw_jobs:
                logger.warning(f"JSearch returned 0 results for query: '{query}'")
                return []

            # 3. Clean and extract skills
            cleaned = self._clean_jobs(raw_jobs[:settings.JSEARCH_MAX_RESULTS_PER_QUERY])

            # 4. Cache results
            self.cache.set(query, cleaned)
            logger.info(f"JSearch returned {len(cleaned)} jobs for query: '{query}'")

            return cleaned

        except requests.exceptions.Timeout:
            logger.error("JSearch API request timed out.")
            fallback = self.cache.get_any_cached()
            return fallback or []
        except requests.exceptions.ConnectionError:
            logger.error("JSearch API connection error.")
            fallback = self.cache.get_any_cached()
            return fallback or []
        except Exception as e:
            logger.error(f"JSearch fetch error: {e}")
            fallback = self.cache.get_any_cached()
            return fallback or []

    # ─── Response Cleaning ────────────────────────────────────────────────────

    def _clean_jobs(self, raw_jobs: List[Dict]) -> List[Dict[str, Any]]:
        """Extract only needed fields from JSearch response and add extracted skills."""
        cleaned = []
        seen_titles = set()

        for job in raw_jobs:
            title = (job.get("job_title") or "").strip()
            company = (job.get("employer_name") or "").strip()

            # Skip duplicates
            dedup_key = f"{title.lower()}:{company.lower()}"
            if dedup_key in seen_titles:
                continue
            seen_titles.add(dedup_key)

            if not title or not company:
                continue

            description = job.get("job_description") or ""

            # Extract skills from description
            extracted_skills = self.extract_skills(description)

            # Infer experience level from title
            title_lower = title.lower()
            if any(w in title_lower for w in ["senior", "lead", "principal", "staff", "director", "head"]):
                exp_level = "Senior"
            elif any(w in title_lower for w in ["junior", "intern", "trainee", "entry", "fresher", "graduate"]):
                exp_level = "Entry"
            else:
                exp_level = "Mid"

            # Infer role category
            if any(w in title_lower for w in ["design", "ui", "ux", "creative"]):
                role_cat = "Design"
            elif any(w in title_lower for w in ["product manager", "product owner"]):
                role_cat = "Product"
            elif any(w in title_lower for w in ["marketing", "sales", "growth", "seo"]):
                role_cat = "Marketing"
            else:
                role_cat = "Engineering"

            # Employment type mapping
            emp_type = (job.get("job_employment_type") or "").upper()
            if "INTERN" in emp_type:
                job_type = "Internship"
            elif "PARTTIME" in emp_type or "PART_TIME" in emp_type:
                job_type = "Part-time"
            elif "CONTRACT" in emp_type:
                job_type = "Contract"
            else:
                job_type = "Full-time"

            # Workplace type
            is_remote = job.get("job_is_remote", False)
            workplace = "Remote" if is_remote else "On-site"

            # Salary
            min_sal = job.get("job_min_salary")
            max_sal = job.get("job_max_salary")
            currency = job.get("job_salary_currency", "INR")
            if min_sal and max_sal:
                salary = f"{currency} {int(min_sal):,} - {int(max_sal):,}"
            elif min_sal:
                salary = f"{currency} {int(min_sal):,}+"
            elif max_sal:
                salary = f"Up to {currency} {int(max_sal):,}"
            else:
                salary = "Not Disclosed"

            # Location
            city = job.get("job_city") or ""
            state = job.get("job_state") or ""
            country = job.get("job_country") or "India"
            location_parts = [p for p in [city, state, country] if p]
            location = ", ".join(location_parts) if location_parts else "India"

            cleaned.append({
                "job_id": job.get("job_id", ""),
                "title": title,
                "company_name": company,
                "company_logo": job.get("employer_logo") or "",
                "location": location,
                "salary": salary,
                "job_type": job_type,
                "workplace_type": workplace,
                "experience_level": exp_level,
                "role_category": role_cat,
                "company_type": "Corporate",
                "required_skills": ", ".join(extracted_skills[:10]) if extracted_skills else "General",
                "description": description[:2000],  # Truncate to save memory
                "apply_url": job.get("job_apply_link") or job.get("job_google_link") or "#",
                "posted_at": job.get("job_posted_at_datetime_utc") or "",
                "extracted_skills": extracted_skills,
            })

        return cleaned

    # ─── NLP Skill Extraction ─────────────────────────────────────────────────

    @staticmethod
    def extract_skills(text: str) -> List[str]:
        """Extract known tech/business skills from a job description using pattern matching."""
        if not text:
            return []

        found = []
        text_lower = text.lower()
        for skill_name, pattern in _SKILL_PATTERNS:
            if pattern.search(text_lower):
                # Capitalize nicely
                found.append(skill_name.title() if len(skill_name) > 3 else skill_name.upper())

        # Deduplicate while preserving order
        seen = set()
        unique = []
        for s in found:
            s_lower = s.lower()
            if s_lower not in seen:
                seen.add(s_lower)
                unique.append(s)

        return unique

    # ─── Full Pipeline ────────────────────────────────────────────────────────

    def search_jobs_for_resume(self, resume_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Full pipeline: generate queries from resume → fetch → deduplicate → return.
        """
        queries = self.build_search_queries(resume_data)
        logger.info(f"Generated {len(queries)} search queries: {queries}")

        all_jobs: List[Dict[str, Any]] = []
        seen_ids = set()

        for query in queries:
            jobs = self.fetch_jobs(query)
            for job in jobs:
                jid = job.get("job_id") or f"{job['title']}:{job['company_name']}"
                if jid not in seen_ids:
                    seen_ids.add(jid)
                    all_jobs.append(job)

        logger.info(f"Total unique jobs fetched: {len(all_jobs)}")
        return all_jobs


# Singleton
jsearch_service = JSearchService()
