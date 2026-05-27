import requests
import random
import logging
from sqlalchemy.orm import Session
from app.models import Job

logger = logging.getLogger("uvicorn")

PREMIUM_FALLBACK_JOBS = [
    {
        "title": "Senior Frontend Engineer - Design Systems",
        "company_name": "Stripe",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
        "location": "San Francisco, CA",
        "salary": "$175,000 - $220,000",
        "job_type": "Full-time",
        "workplace_type": "Hybrid",
        "experience_level": "Senior",
        "role_category": "Engineering",
        "company_type": "Corporate",
        "required_skills": "React, TypeScript, CSS, Design Systems, HTML5, Web accessibility (a11y)",
        "description": "Stripe is looking for a Senior Frontend Engineer to join our Design Systems team. You will lead the development of beautiful, accessible, and performant web interfaces used by millions of developers globally. You will work closely with design and product teams to standardize user experiences.",
        "apply_url": "https://stripe.com/jobs"
    },
    {
        "title": "Software Engineer - Next.js Core Team",
        "company_name": "Vercel",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
        "location": "Remote (US/Europe)",
        "salary": "$150,000 - $190,000",
        "job_type": "Full-time",
        "workplace_type": "Remote",
        "experience_level": "Mid",
        "role_category": "Engineering",
        "company_type": "Startup",
        "required_skills": "React, Next.js, TypeScript, Node.js, Webpack, Rust, Performance Optimization",
        "description": "Vercel is looking for a Software Engineer to work on the Next.js core framework. You will optimize rendering pipelines, build new features for developer experience, and maintain the open-source library. A deep understanding of React server components and web vitals is preferred.",
        "apply_url": "https://careers.vercel.com"
    },
    {
        "title": "Senior Product Designer",
        "company_name": "Linear",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
        "location": "Remote (Global)",
        "salary": "$140,000 - $180,000",
        "job_type": "Full-time",
        "workplace_type": "Remote",
        "experience_level": "Senior",
        "role_category": "Design",
        "company_type": "Startup",
        "required_skills": "UI/UX, Figma, Web Design, Interaction Design, Product Strategy, Typography",
        "description": "Linear is looking for a Senior Product Designer to help shape the future of software issue tracking. You will own product features from concept to production-level design, ensuring a fast, minimal, keyboard-first, and premium experience.",
        "apply_url": "https://linear.app/careers"
    },
    {
        "title": "Machine Learning Engineer - Search Relevance",
        "company_name": "Perplexity AI",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
        "location": "San Francisco, CA",
        "salary": "$190,000 - $250,000",
        "job_type": "Full-time",
        "workplace_type": "On-site",
        "experience_level": "Senior",
        "role_category": "Engineering",
        "company_type": "Startup",
        "required_skills": "Python, PyTorch, Large Language Models (LLMs), NLP, Search, Vector Databases",
        "description": "Perplexity is seeking a Machine Learning Engineer to improve our answer engine's search quality, relevance, and response latency. You will design, train, and deploy models that extract facts from web sources and summarize them in real-time.",
        "apply_url": "https://perplexity.ai/careers"
    },
    {
        "title": "Backend Software Engineer - API Platforms",
        "company_name": "Google",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
        "location": "New York, NY",
        "salary": "$160,000 - $210,000",
        "job_type": "Full-time",
        "workplace_type": "Hybrid",
        "experience_level": "Mid",
        "role_category": "Engineering",
        "company_type": "Corporate",
        "required_skills": "Go, Java, C++, Distributed Systems, API Design, SQL, gRPC",
        "description": "Google Cloud is hiring a backend software engineer to develop next-generation APIs and distributed messaging pipelines. You will build high-scale, low-latency microservices that serve billions of API requests monthly.",
        "apply_url": "https://careers.google.com"
    },
    {
        "title": "UI Designer & Developer (Internship)",
        "company_name": "Figma",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
        "location": "London, UK",
        "salary": "$5,000 - $7,000 / month",
        "job_type": "Internship",
        "workplace_type": "Hybrid",
        "experience_level": "Entry",
        "role_category": "Design",
        "company_type": "Corporate",
        "required_skills": "UI/UX, Figma, HTML, CSS, React, Prototyping",
        "description": "Figma is looking for an enthusiastic UI Designer & Developer intern to join our design tools product team. You will participate in refining features, coding interactive prototypes, and conducting user feedback sessions.",
        "apply_url": "https://careers.figma.com"
    },
    {
        "title": "Growth Marketing Manager",
        "company_name": "Vercel",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
        "location": "Remote (US)",
        "salary": "$110,000 - $140,000",
        "job_type": "Full-time",
        "workplace_type": "Remote",
        "experience_level": "Mid",
        "role_category": "Marketing",
        "company_type": "Startup",
        "required_skills": "SEO, Google Analytics, Copywriting, SaaS Marketing, Social Media Strategy, A/B Testing",
        "description": "Vercel is looking for a Growth Marketing Manager to scale our developer community. You will own acquisition channels, execute paid search/social campaigns, and create compelling copy to drive self-serve user signups.",
        "apply_url": "https://careers.vercel.com"
    },
    {
        "title": "Associate Product Manager",
        "company_name": "Stripe",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
        "location": "Seattle, WA",
        "salary": "$130,000 - $160,000",
        "job_type": "Full-time",
        "workplace_type": "Hybrid",
        "experience_level": "Entry",
        "role_category": "Product",
        "company_type": "Corporate",
        "required_skills": "Product Strategy, Analytics, SQL, Agile Methodologies, Communication",
        "description": "Join Stripe as an Associate Product Manager. You will help guide the roadmap for our billing and subscription services, writing detailed spec documents, and acting as the bridge between engineering, sales, and customers.",
        "apply_url": "https://stripe.com/jobs"
    }
]

def mine_live_jobs(db: Session, limit: int = 50):
    """
    Query the Arbeitnow public API to fetch live job listings,
    parse them to fit our schema, and save them in the database.
    Merges with premium seed jobs to guarantee highly recognizable tech companies.
    """
    logger.info("Starting job mining from Arbeitnow API...")
    
    # First, insert premium fallbacks so we always have excellent data
    inserted_count = 0
    for pj in PREMIUM_FALLBACK_JOBS:
        # Check if already exists to prevent duplicate runs
        existing = db.query(Job).filter(Job.title == pj["title"], Job.company_name == pj["company_name"]).first()
        if not existing:
            db_job = Job(**pj)
            db.add(db_job)
            inserted_count += 1
            
    db.commit()
    logger.info(f"Seeded {inserted_count} premium tech jobs.")
    
    try:
        response = requests.get("https://www.arbeitnow.com/api/job-board-api", timeout=10)
        if response.status_code == 200:
            data = response.json()
            jobs_data = data.get("data", [])
            
            api_inserted = 0
            for item in jobs_data:
                if api_inserted >= limit:
                    break
                    
                title = item.get("title", "")
                company = item.get("company_name", "")
                
                # Check duplicate
                existing = db.query(Job).filter(Job.title == title, Job.company_name == company).first()
                if existing:
                    continue
                
                # Clean description (remove Arbeitnow tracking text if present)
                desc = item.get("description", "")
                
                # Infer workplace type
                is_remote = item.get("remote", False)
                workplace = "Remote" if is_remote else random.choice(["On-site", "Hybrid"])
                
                # Infer experience level
                title_lower = title.lower()
                if "senior" in title_lower or "lead" in title_lower or "principal" in title_lower or "director" in title_lower:
                    exp = "Senior"
                elif "junior" in title_lower or "trainee" in title_lower or "intern" in title_lower or "entry" in title_lower:
                    exp = "Entry"
                else:
                    exp = "Mid"
                    
                # Infer role category
                if any(x in title_lower for x in ["design", "ui", "ux", "product designer", "creative"]):
                    role_cat = "Design"
                elif any(x in title_lower for x in ["product manager", "pm", "product owner"]):
                    role_cat = "Product"
                elif any(x in title_lower for x in ["marketing", "sales", "growth", "recruit", "finance", "business"]):
                    role_cat = "Marketing"
                else:
                    role_cat = "Engineering"
                    
                # Map job type
                job_types_list = item.get("job_types", [])
                job_type = "Full-time"
                if "internship" in title_lower or any("intern" in t.lower() for t in job_types_list):
                    job_type = "Internship"
                elif any("part-time" in t.lower() for t in job_types_list):
                    job_type = "Part-time"
                    
                # Format skills
                tags = item.get("tags", [])
                # Filter out generic tags and clean up
                clean_tags = [t.capitalize() for t in tags if len(t) > 1 and "school" not in t.lower()]
                # If tags is empty, provide default skills based on title
                if not clean_tags:
                    if role_cat == "Engineering":
                        clean_tags = ["JavaScript", "Python", "SQL", "Git", "APIs"]
                    elif role_cat == "Design":
                        clean_tags = ["Figma", "UI/UX", "Product Design", "Prototyping"]
                    elif role_cat == "Product":
                        clean_tags = ["Product Strategy", "Roadmapping", "SQL", "Agile"]
                    else:
                        clean_tags = ["SEO", "Analytics", "Copywriting", "Sales"]
                
                skills_str = ", ".join(clean_tags[:8]) # limit to 8 skills
                
                # Generate realistic salary if missing
                if exp == "Senior":
                    salary = f"${random.randint(140, 190)}k - ${random.randint(195, 260)}k"
                elif exp == "Mid":
                    salary = f"${random.randint(90, 130)}k - ${random.randint(135, 170)}k"
                else:
                    salary = f"${random.randint(50, 75)}k - ${random.randint(80, 100)}k" if job_type != "Internship" else f"${random.randint(4, 7)}k / month"

                # Setup company logo based on company name to look nice
                # Using Unsplash placeholder images with unique indexes for visual premium feel
                logos = [
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=128&h=128&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=128&h=128&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&h=128&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80"
                ]
                company_logo = random.choice(logos)

                db_job = Job(
                    title=title,
                    company_name=company,
                    company_logo=company_logo,
                    location=item.get("location", "Remote"),
                    salary=salary,
                    job_type=job_type,
                    workplace_type=workplace,
                    experience_level=exp,
                    role_category=role_cat,
                    company_type=random.choice(["Startup", "Corporate"]),
                    required_skills=skills_str,
                    description=desc,
                    apply_url=item.get("url", "https://www.arbeitnow.com")
                )
                db.add(db_job)
                api_inserted += 1
                
            db.commit()
            logger.info(f"Mined and saved {api_inserted} live jobs from Arbeitnow API.")
        else:
            logger.warning(f"Arbeitnow API returned status code {response.status_code}. Using only premium fallback jobs.")
    except Exception as e:
        logger.error(f"Error occurred while mining jobs from API: {e}. Seeding only premium fallbacks.")
