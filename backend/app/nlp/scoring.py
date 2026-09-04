from typing import Dict, Any, List
from app.nlp.skills_dataset import ALL_SKILL_NAMES

def calculate_resume_score(parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes an objective, multi-factor score out of 100 based on:
    - Skill depth & diversity (35 pts)
    - Experience detail (25 pts)
    - Education clarity (15 pts)
    - Contact info completeness (15 pts)
    - Content volume & length (10 pts)
    """
    score = 0
    breakdown = {}
    strengths = []
    improvements = []

    # 1. Skills factor (max 35)
    skills: List[str] = parsed_data.get("skills", [])
    skill_count = len(skills)
    if skill_count >= 10:
        skill_pts = 35
        strengths.append(f"Exceptional technical breadth with {skill_count} detected industry skills")
    elif skill_count >= 6:
        skill_pts = 28
        strengths.append(f"Solid skill baseline covering key tools ({skill_count} skills)")
    elif skill_count >= 3:
        skill_pts = 20
        improvements.append("Expand technical skill coverage with modern frameworks and libraries")
    else:
        skill_pts = 10
        improvements.append("Highlight specific programming languages, tools, and platforms clearly")
    score += skill_pts
    breakdown["skills_score"] = skill_pts

    # 2. Experience factor (max 25)
    exp_years = parsed_data.get("experience_years", 0)
    if exp_years >= 4:
        exp_pts = 25
        strengths.append(f"Demonstrated senior trajectory ({exp_years}+ years estimated experience)")
    elif exp_years >= 2:
        exp_pts = 20
        strengths.append(f"Good professional experience track record ({exp_years} years)")
    elif exp_years >= 1:
        exp_pts = 15
        improvements.append("Elaborate on quantified project outcomes and responsibilities")
    else:
        exp_pts = 10
        improvements.append("Add more project accomplishments, open source contributions, or internships")
    score += exp_pts
    breakdown["experience_score"] = exp_pts

    # 3. Education factor (max 15)
    education = parsed_data.get("education", "")
    if "Master" in education or "Ph.D" in education:
        edu_pts = 15
        strengths.append("Advanced academic credentials clearly articulated")
    elif "Bachelor" in education or "Degree" in education or "Computer Science" in education:
        edu_pts = 13
        strengths.append("Standard accredited technical degree background")
    else:
        edu_pts = 8
        improvements.append("Specify degree title, institution, and graduation year clearly")
    score += edu_pts
    breakdown["education_score"] = edu_pts

    # 4. Contact Information (max 15)
    has_email = bool(parsed_data.get("email"))
    has_phone = bool(parsed_data.get("phone"))
    has_name = bool(parsed_data.get("name") and parsed_data.get("name") != "Candidate")
    
    contact_pts = 0
    if has_name: contact_pts += 5
    if has_email: contact_pts += 5
    if has_phone: contact_pts += 5
    if contact_pts == 15:
        strengths.append("Complete contact profile with valid email, phone, and name")
    else:
        improvements.append("Ensure your direct phone number and professional email are easily readable")
    score += contact_pts
    breakdown["contact_score"] = contact_pts

    # 5. Content Volume / Word count (max 10)
    words = parsed_data.get("total_words", 0)
    if 250 <= words <= 1200:
        vol_pts = 10
        strengths.append("Optimal resume length and word density for ATS parsers")
    elif words > 1200:
        vol_pts = 7
        improvements.append("Resume is somewhat verbose; consider condensing into 1-2 focused pages")
    elif words >= 100:
        vol_pts = 6
        improvements.append("Resume is brief; add more bullet points with metrics and tech stack details")
    else:
        vol_pts = 3
        improvements.append("Content volume is very low; add complete job history and achievements")
    score += vol_pts
    breakdown["content_score"] = vol_pts

    # Recommended skills based on current skills
    current_skills_set = set(skills)
    popular_skills = ["Docker", "Kubernetes", "AWS", "FastAPI", "TypeScript", "React", "PostgreSQL", "CI/CD", "PyTorch", "Redis"]
    recommended_skills = [s for s in popular_skills if s not in current_skills_set][:4]

    return {
        "overall_score": min(100, max(20, score)),
        "breakdown": breakdown,
        "strengths": strengths,
        "improvements": improvements,
        "recommended_skills": recommended_skills
    }
