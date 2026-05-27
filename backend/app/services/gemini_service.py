import io
import os
import json
import logging
import random
import re
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from docx import Document
from app.config import settings
from app.schemas import ResumeData
from app.models import Job

logger = logging.getLogger("uvicorn")

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-2.5-flash")
                logger.info("Gemini API service initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to configure Gemini API: {e}. Running in mockup mode.")
                self.model = None
        else:
            logger.info("No GEMINI_API_KEY provided. Resume parsing will run in mockup mode.")
            self.model = None

    def extract_text_from_file(self, file_content: bytes, filename: str) -> str:
        """
        Extract text content from PDF or DOCX file.
        """
        ext = filename.split(".")[-1].lower()
        text = ""
        try:
            if ext == "pdf":
                reader = PdfReader(io.BytesIO(file_content))
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            elif ext in ["docx", "doc"]:
                doc = Document(io.BytesIO(file_content))
                for para in doc.paragraphs:
                    text += para.text + "\n"
            else:
                # Fallback to general decoding
                text = file_content.decode("utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Error extracting text from {filename}: {e}")
            # If text extraction fails, we return a fallback string so parsing can proceed
            text = f"Resume file name: {filename}. Content extraction failed."
        return text

    def parse_resume(self, text: str, filename: str) -> Dict[str, Any]:
        """
        Call Gemini API to extract structured JSON from the resume text using exact instructions.
        Falls back to high-fidelity mock structure if API key is not configured or errors out.
        """
        print("\n=== EXTRACTED RESUME TEXT ===")
        print(text)
        print("==============================\n")
        
        if self.model:
            try:
                prompt = f"""You are an advanced AI resume analysis engine for an AI-powered job matching platform called JobMatchr.

Analyze the following resume and extract structured career information.

IMPORTANT RULES:
- Return ONLY valid JSON
- No markdown
- No explanations
- No extra text
- Output must be machine-readable JSON

Extract:
1. Full Name
2. Skills
3. Technical Skills
4. Soft Skills
5. Education
6. Certifications
7. Projects
8. Experience Level
9. Years of Experience
10. Suggested Job Roles
11. ATS Score
12. Missing Skills
13. Strong Areas
14. Resume Summary

Return JSON in this structure:

{{
  "full_name": "",
  "skills": [],
  "technical_skills": [],
  "soft_skills": [],
  "education": [],
  "certifications": [],
  "projects": [],
  "experience_level": "",
  "years_of_experience": 0,
  "suggested_roles": [],
  "ats_score": 0,
  "missing_skills": [],
  "strong_areas": [],
  "resume_summary": ""
}}

Resume Text:
{text}
"""
                response = self.model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                
                raw_response = response.text
                print("\n=== GEMINI RAW RESPONSE ===")
                print(raw_response)
                print("============================\n")
                
                # Safely strip markdown wrappers if present
                cleaned_response = raw_response.strip()
                if cleaned_response.startswith("```"):
                    # Strip starting ```json or ```
                    cleaned_response = re.sub(r'^```(?:json)?\n', '', cleaned_response)
                    # Strip ending ```
                    cleaned_response = re.sub(r'\n```$', '', cleaned_response)
                    cleaned_response = cleaned_response.strip()
                
                parsed = json.loads(cleaned_response)
                
                # Normalize types to avoid validation failures
                # Normalize education
                if "education" in parsed and isinstance(parsed["education"], list):
                    normalized_edu = []
                    for edu in parsed["education"]:
                        if isinstance(edu, dict):
                            parts = []
                            degree = edu.get("degree") or edu.get("major")
                            univ = edu.get("university") or edu.get("school") or edu.get("institution")
                            yr = edu.get("year") or edu.get("graduation_year") or edu.get("date")
                            if degree: parts.append(degree)
                            if univ: parts.append(univ)
                            if yr: parts.append(f"({yr})")
                            normalized_edu.append(" - ".join(parts) if parts else str(edu))
                        else:
                            normalized_edu.append(str(edu))
                    parsed["education"] = normalized_edu

                # Normalize certifications
                if "certifications" in parsed and isinstance(parsed["certifications"], list):
                    normalized_certs = []
                    for cert in parsed["certifications"]:
                        if isinstance(cert, dict):
                            parts = []
                            name = cert.get("name") or cert.get("title")
                            yr = cert.get("year") or cert.get("date")
                            if name: parts.append(name)
                            if yr: parts.append(f"({yr})")
                            normalized_certs.append(" ".join(parts) if parts else str(cert))
                        else:
                            normalized_certs.append(str(cert))
                    parsed["certifications"] = normalized_certs

                # Normalize projects
                if "projects" in parsed and isinstance(parsed["projects"], list):
                    normalized_proj = []
                    for proj in parsed["projects"]:
                        if isinstance(proj, dict):
                            title = proj.get("title") or proj.get("name")
                            desc = proj.get("description") or proj.get("desc")
                            if title and desc:
                                normalized_proj.append(f"{title}: {desc}")
                            elif title:
                                normalized_proj.append(title)
                            elif desc:
                                normalized_proj.append(desc)
                            else:
                                normalized_proj.append(str(proj))
                        else:
                            normalized_proj.append(str(proj))
                    parsed["projects"] = normalized_proj

                # Guarantee numeric values
                try:
                    parsed["years_of_experience"] = float(parsed.get("years_of_experience", 0.0))
                except Exception:
                    parsed["years_of_experience"] = 0.0

                try:
                    parsed["ats_score"] = int(parsed.get("ats_score", 70))
                except Exception:
                    parsed["ats_score"] = 70

                # Ensure string lists
                for list_key in ["skills", "technical_skills", "soft_skills", "suggested_roles", "missing_skills", "strong_areas"]:
                    if list_key in parsed and isinstance(parsed[list_key], list):
                        parsed[list_key] = [str(x) for x in parsed[list_key]]
                    else:
                        parsed[list_key] = []

                # Ensure string values
                for str_key in ["full_name", "experience_level", "resume_summary"]:
                    if str_key in parsed:
                        parsed[str_key] = str(parsed[str_key])
                    else:
                        parsed[str_key] = ""

                print("\n=== PARSED & NORMALIZED JSON ===")
                print(json.dumps(parsed, indent=2))
                print("====================\n")
                return parsed
                
            except Exception as e:
                logger.error(f"Gemini API parse_resume failed: {e}. Falling back to mock parsing.")
                
        # High fidelity Mock Parser based on file name keywords
        parsed_mock = self._generate_mock_resume(filename)
        print("\n=== PARSED MOCK JSON ===")
        print(json.dumps(parsed_mock, indent=2))
        print("========================\n")
        return parsed_mock

    def calculate_job_matches(self, resume_data: Dict[str, Any], jobs: List[Job]) -> List[Tuple[Job, int, str, List[str]]]:
        """
        Compare resume skills & experience with database jobs.
        Returns a list of tuples: (Job, match_percentage, why_matched_explanation, missing_skills)
        Ordered by match percentage descending.
        """
        matched_jobs = []
        resume_skills = [s.lower().strip() for s in resume_data.get("skills", [])]
        resume_roles = [r.lower().strip() for r in resume_data.get("suggested_roles", [])]
        resume_text_blob = " ".join(resume_skills) + " " + " ".join(resume_roles) + " " + resume_data.get("resume_summary", "").lower()
        
        for job in jobs:
            job_skills = [s.strip() for s in job.required_skills.split(",") if s.strip()]
            job_skills_lower = [s.lower() for s in job_skills]
            
            # 1. Skills overlap
            matched_skills_count = sum(1 for s in job_skills_lower if s in resume_skills)
            skills_score = (matched_skills_count / len(job_skills_lower)) * 100 if job_skills_lower else 50
            
            # 2. Title / Role match
            title_score = 0
            job_title_lower = job.title.lower()
            for role in resume_roles:
                if role in job_title_lower or job_title_lower in role:
                    title_score = 100
                    break
            if not title_score:
                # Check keyword overlap
                overlap = sum(1 for w in resume_roles if any(keyword in job_title_lower for keyword in w.split()))
                title_score = 50 if overlap > 0 else 20
                
            # 3. Overall calculation (60% skills, 40% role/experience fit)
            match_percentage = int((skills_score * 0.6) + (title_score * 0.4))
            
            # Add some subtle variability
            match_percentage = max(15, min(99, match_percentage + random.randint(-5, 5)))
            
            # Identify missing skills
            missing_skills = [s for s in job_skills if s.lower() not in resume_skills]
            
            # Generate "why this matched" explanation
            matching_items = [s for s in job_skills if s.lower() in resume_skills]
            if len(matching_items) >= 2:
                why_matched = f"Matched because of your experience in {', '.join(matching_items[:3])}."
            elif matching_items:
                why_matched = f"Matched because of your proficiency in {matching_items[0]}."
            else:
                # Default explanation based on role
                why_matched = f"Matched due to target role similarity in {job.role_category}."
                
            matched_jobs.append((job, match_percentage, why_matched, missing_skills))
            
        # Sort by match percentage descending
        matched_jobs.sort(key=lambda x: x[1], reverse=True)
        return matched_jobs

    def _generate_mock_resume(self, filename: str) -> Dict[str, Any]:
        """
        Generates structured resume mock data based on keywords in the uploaded filename.
        Produces extremely clean, startup-grade mock outputs matching the new JSON schema.
        """
        fn = filename.lower()
        
        # 1. Data Science / AI
        if any(w in fn for w in ["data", "science", "ml", "machine", "python", "ai", "analyst"]):
            full_name = "Alex Mercer"
            skills = ["Python", "SQL", "PyTorch", "Machine Learning", "Data Analysis", "Pandas", "Scikit-Learn", "FastAPI", "Git", "Docker"]
            technical_skills = ["Python", "SQL", "PyTorch", "Pandas", "Scikit-Learn", "FastAPI", "Docker", "Git"]
            soft_skills = ["Problem Solving", "Team Collaboration", "Technical Writing", "Analytical Thinking"]
            education = ["B.S. in Computer Science (AI Track) - Stanford University (2026)"]
            certifications = ["AWS Certified Cloud Practitioner", "Google Data Analytics Certificate"]
            projects = [
                "LLM Semantic Search Engine: Developed a vector-search system using ChromaDB and FastAPI to search across 100k academic papers.",
                "Realtime Anomaly Detection: Created a streaming pipeline using Pandas and Scikit-Learn to detect financial transaction fraud."
            ]
            experience_level = "Mid"
            years_of_experience = 2.0
            suggested_roles = ["Machine Learning Engineer", "Data Scientist", "Data Analyst"]
            ats_score = 84
            missing_skills = ["Kubernetes", "Apache Spark", "Airflow"]
            strong_areas = ["Deep Learning Model Tuning", "Vector Databases & Search", "Python API Design"]
            resume_summary = "Enthusiastic Machine Learning Engineer with 2+ years of hands-on experience designing and deploying predictive models, data extraction pipelines, and vector search engines. Proficient in Python, SQL, and PyTorch."
            
        # 2. Design / UI/UX
        elif any(w in fn for w in ["design", "ui", "ux", "figma", "product", "creative"]):
            full_name = "Sophia Chen"
            skills = ["Figma", "UI/UX Design", "Wireframing", "Interaction Design", "User Research", "Prototyping", "Adobe Creative Suite", "HTML", "CSS", "Web Design"]
            technical_skills = ["Figma", "Wireframing", "Interaction Design", "Prototyping", "HTML", "CSS"]
            soft_skills = ["Empathy", "Communication", "Critical Thinking", "User Advocacy"]
            education = ["B.F.A. in Industrial & Graphic Design - Rhode Island School of Design (2025)"]
            certifications = ["NN/g UX Certification", "Google UX Design Professional Certificate"]
            projects = [
                "E-Commerce App Design System: Created a comprehensive, dark-themed UI library with 80+ reusable Figma components.",
                "Redesign of Booking Flow: Structured and executed usability tests with 15 users to optimize SaaS checkouts."
            ]
            experience_level = "Senior"
            years_of_experience = 5.0
            suggested_roles = ["Product Designer", "UI/UX Designer", "Interaction Designer"]
            ats_score = 79
            missing_skills = ["Framer", "Webflow", "React"]
            strong_areas = ["User Interface Craftsmanship", "User Testing & Wireframing", "Design System Architecture"]
            resume_summary = "Senior Product Designer with 5 years of experience leading UI/UX design initiatives for mobile and web platforms. Specializes in building modular design systems, running user interviews, and increasing checkout conversion metrics."
            
        # 3. Default: Full Stack / Web Developer
        else:
            full_name = "Jordan Miller"
            skills = ["React", "TypeScript", "Next.js", "JavaScript", "HTML5", "CSS3", "Node.js", "FastAPI", "SQL", "Git", "Tailwind CSS"]
            technical_skills = ["React", "TypeScript", "Next.js", "Node.js", "FastAPI", "SQL", "Tailwind CSS", "Git"]
            soft_skills = ["Agile Methodology", "Code Review Collaboration", "Proactive Debugging", "Adaptability"]
            education = ["B.S. in Computer Science - Massachusetts Institute of Technology (2026)"]
            certifications = ["Meta Front-End Developer Professional Certificate", "React Advanced Developer"]
            projects = [
                "Task Manager SaaS Dashboard: Built a responsive dashboard application with user authentication, real-time board updates, and list filters.",
                "API Gateway Framework: Developed secure backend endpoints and JSON routers in Node.js for high-concurrency client sessions."
            ]
            experience_level = "Entry"
            years_of_experience = 1.0
            suggested_roles = ["Software Engineer", "Frontend Developer", "Full Stack Engineer"]
            ats_score = 82
            missing_skills = ["AWS", "Docker", "Jest"]
            strong_areas = ["Responsive UI Development", "React Component Lifecycle", "API Routing & Logic"]
            resume_summary = "Detail-oriented Full Stack Developer with experience building responsive web interfaces in Next.js/React and secure REST APIs in FastAPI/Node.js. Passionate about performance, clean code, and writing typing schemas in TypeScript."
            
        return {
            "full_name": full_name,
            "skills": skills,
            "technical_skills": technical_skills,
            "soft_skills": soft_skills,
            "education": education,
            "certifications": certifications,
            "projects": projects,
            "experience_level": experience_level,
            "years_of_experience": years_of_experience,
            "suggested_roles": suggested_roles,
            "ats_score": ats_score,
            "missing_skills": missing_skills,
            "strong_areas": strong_areas,
            "resume_summary": resume_summary
        }

gemini_service = GeminiService()
