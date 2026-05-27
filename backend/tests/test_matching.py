import unittest
from app.models import Job
from app.services.gemini_service import gemini_service

class TestMatchingEngine(unittest.TestCase):
    def setUp(self):
        self.resume_data = {
            "skills": ["Python", "SQL", "Machine Learning", "FastAPI", "React"],
            "experience": [
                {
                    "company": "Test Company",
                    "role": "Software Developer",
                    "duration": "1 year",
                    "description": "Developed backend APIs in Python and SQL."
                }
            ],
            "education": [],
            "projects": [],
            "certifications": [],
            "target_roles": ["Software Engineer", "Machine Learning Engineer"],
            "ats_score": 80,
            "career_insights": [],
            "role_recommendations": [],
            "resume_suggestions": []
        }
        
        self.job = Job(
            id=1,
            title="Senior Machine Learning Engineer",
            company_name="Test Org",
            location="Remote",
            salary="$120k",
            job_type="Full-time",
            workplace_type="Remote",
            experience_level="Senior",
            role_category="Engineering",
            required_skills="Python, PyTorch, SQL, Machine Learning",
            description="Looking for an ML engineer with Python, PyTorch, and SQL experience.",
            apply_url="http://example.com"
        )

    def test_matching_score_calculation(self):
        matched_tuples = gemini_service.calculate_job_matches(self.resume_data, [self.job])
        self.assertEqual(len(matched_tuples), 1)
        
        job_res, score, why, missing = matched_tuples[0]
        
        self.assertEqual(job_res.id, 1)
        self.assertTrue(15 <= score <= 99) # ensure score is within realistic bounds
        self.assertIn("Test Org", job_res.company_name)
        
        # Verify "why matched" contains matching skills
        self.assertTrue("Python" in why or "SQL" in why or "Machine Learning" in why or "target role" in why)
        
        # Verify missing skills list (PyTorch should be missing)
        self.assertIn("PyTorch", missing)
        self.assertNotIn("Python", missing)

if __name__ == "__main__":
    unittest.main()
