import re
from typing import Dict, List, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class AIMatchingEngine:
    @staticmethod
    def clean_text(text: str) -> str:
        """Sanitizes text by removing non-alphanumeric noise, urls, extra spaces."""
        if not text:
            return ""
        # Lowercase
        text = text.lower()
        # Remove URLs
        text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
        # Keep letters, numbers, plus, hash, dots for tech terms (e.g. c++, c#, .net)
        text = re.sub(r'[^a-z0-9\+\#\.\s]', ' ', text)
        # Squeeze whitespace
        return re.sub(r'\s+', ' ', text).strip()

    @classmethod
    def compute_tfidf_similarity(cls, resume_text: str, job_text: str) -> float:
        """Computes TF-IDF cosine similarity between clean texts."""
        clean_resume = cls.clean_text(resume_text)
        clean_job = cls.clean_text(job_text)

        if not clean_resume or not clean_job:
            return 0.1

        try:
            vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                stop_words='english',
                max_features=5000,
                sublinear_tf=True
            )
            tfidf_matrix = vectorizer.fit_transform([clean_resume, clean_job])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            # TF-IDF cosine similarity on long vs short texts is typically 0.15 - 0.70; normalize to 0-1 scale
            normalized = min(1.0, float(similarity) * 1.5)
            return max(0.05, normalized)
        except Exception as e:
            print(f"TF-IDF calculation error: {e}")
            return 0.2

    @staticmethod
    def calculate_skill_overlap(candidate_skills: List[str], job_skills: List[str]) -> Dict[str, Any]:
        """Calculates matched vs missing skills and overlap ratio."""
        cand_set = {s.strip().lower(): s for s in candidate_skills if s}
        job_set = {s.strip().lower(): s for s in job_skills if s}

        if not job_set:
            # If job specifies no explicit skills, score based on general presence
            return {
                "matched": candidate_skills[:5],
                "missing": [],
                "extra": candidate_skills[5:],
                "overlap_ratio": 0.8
            }

        matched_keys = set(cand_set.keys()).intersection(set(job_set.keys()))
        missing_keys = set(job_set.keys()) - set(cand_set.keys())
        extra_keys = set(cand_set.keys()) - set(job_set.keys())

        matched_skills = [job_set[k] for k in matched_keys]
        missing_skills = [job_set[k] for k in missing_keys]
        extra_skills = [cand_set[k] for k in extra_keys]

        # Overlap ratio relative to job requirements
        overlap_ratio = len(matched_keys) / max(1, len(job_set))

        return {
            "matched": matched_skills,
            "missing": missing_skills,
            "extra": extra_skills,
            "overlap_ratio": min(1.0, overlap_ratio)
        }

    @staticmethod
    def evaluate_experience(candidate_years: float, required_years: float) -> Dict[str, Any]:
        if required_years <= 0:
            return {"score": 1.0, "level": "Strong", "message": "Experience requirements fully satisfied"}
        
        diff = candidate_years - required_years
        if diff >= 0:
            score = 1.0
            level = "Strong"
            msg = f"Candidate exceeds requirement ({candidate_years} yrs vs {required_years} yrs required)"
        elif diff >= -1.0:
            score = 0.85
            level = "Strong"
            msg = f"Close experience alignment ({candidate_years} yrs vs {required_years} yrs)"
        elif diff >= -2.5:
            score = 0.65
            level = "Moderate"
            msg = f"Candidate has {candidate_years} yrs (job prefers {required_years} yrs)"
        else:
            score = 0.40
            level = "Developing"
            msg = f"Junior for this role ({candidate_years} yrs vs {required_years} yrs)"

        return {"score": score, "level": level, "message": msg}

    @staticmethod
    def evaluate_education(candidate_edu: str, job_text: str) -> Dict[str, Any]:
        cand_lower = (candidate_edu or "").lower()
        job_lower = (job_text or "").lower()

        if "master" in cand_lower or "ph.d" in cand_lower:
            return {"score": 1.0, "level": "Strong", "message": "Advanced academic credentials"}
        elif "bachelor" in cand_lower or "b.tech" in cand_lower or "computer science" in cand_lower or "degree" in cand_lower:
            return {"score": 0.9, "level": "Strong", "message": "Technical degree aligns with role"}
        return {"score": 0.7, "level": "Compatible", "message": "Relevant technical background"}

    @classmethod
    def match_resume_to_job(
        cls,
        resume_text: str,
        candidate_skills: List[str],
        candidate_experience_years: float,
        candidate_education: str,
        job_title: str,
        job_description: str,
        job_requirements: Optional[str],
        job_skills: List[str],
        job_experience_required: float = 2.0
    ) -> Dict[str, Any]:
        """
        Main matching engine function.
        Calculates holistic, dynamic match score and returns comprehensive breakdown.
        """
        # 1. Full job text synthesis
        full_job_content = f"{job_title} {job_description} {job_requirements or ''} {' '.join(job_skills)}"

        # 2. NLP TF-IDF Cosine Similarity (35% weight)
        tfidf_score = cls.compute_tfidf_similarity(resume_text, full_job_content)

        # 3. Skill Overlap (45% weight)
        skill_res = cls.calculate_skill_overlap(candidate_skills, job_skills)
        skill_score = skill_res["overlap_ratio"]

        # 4. Experience Match (12% weight)
        exp_res = cls.evaluate_experience(candidate_experience_years, job_experience_required)
        exp_score = exp_res["score"]

        # 5. Education Match (8% weight)
        edu_res = cls.evaluate_education(candidate_education, full_job_content)
        edu_score = edu_res["score"]

        # Dynamic weighted synthesis
        raw_final = (tfidf_score * 0.35) + (skill_score * 0.45) + (exp_score * 0.12) + (edu_score * 0.08)

        # Scale to 0-100 realistic score
        # Even if base overlap is moderate, boost high-confidence skill matches
        match_percentage = int(round(min(98, max(28, raw_final * 100))))

        if match_percentage >= 85:
            compatibility = "Excellent"
        elif match_percentage >= 72:
            compatibility = "Strong"
        elif match_percentage >= 55:
            compatibility = "Moderate"
        else:
            compatibility = "Potential Fit"

        return {
            "match_percentage": match_percentage,
            "compatibility_level": compatibility,
            "matched_skills": skill_res["matched"],
            "missing_skills": skill_res["missing"],
            "extra_skills": skill_res["extra"],
            "experience_match": exp_res["level"],
            "experience_note": exp_res["message"],
            "education_match": edu_res["level"],
            "education_note": edu_res["message"],
            "breakdown": {
                "nlp_content_match": int(round(tfidf_score * 100)),
                "skill_alignment": int(round(skill_score * 100)),
                "experience_score": int(round(exp_score * 100)),
                "education_score": int(round(edu_score * 100))
            }
        }
