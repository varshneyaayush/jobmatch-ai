import json
import os
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.profile import CandidateProfile
from app.models.skill import Skill
from app.models.job import Job
from app.models.resume import Resume
from app.models.application import Application, ApplicationStatus
from app.utils.security import get_password_hash
from app.nlp.skills_dataset import TECH_SKILLS_DATA, categorize_skill
from app.nlp.resume_parser import ResumeParser
from app.nlp.scoring import calculate_resume_score
from app.ml.matching_engine import AIMatchingEngine
from app.utils.sample_resumes import SAMPLE_AI_ENGINEER_RESUME, SAMPLE_FULLSTACK_RESUME
from app.config import settings

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).first():
        print("Database already contains records. Skipping seed.")
        return

    print("Seeding database with skills, demo accounts, and jobs...")

    # 1. Populate Skills
    skill_lookup = {}
    for skill_name in TECH_SKILLS_DATA.keys():
        cat = categorize_skill(skill_name)
        s = Skill(name=skill_name, category=cat)
        db.add(s)
        skill_lookup[skill_name.lower()] = s
    db.commit()

    # 2. Seed Users
    # Admin
    admin_user = User(
        name="Admin Lead",
        email="admin@jobmatch.ai",
        password_hash=get_password_hash("password123"),
        role=UserRole.ADMIN.value,
        company_name="JobMatch AI HQ"
    )
    db.add(admin_user)

    # Recruiter 1: TechPulse AI
    recruiter_1 = User(
        name="Sarah Jenkins",
        email="sarah.recruiter@techpulse.ai",
        password_hash=get_password_hash("password123"),
        role=UserRole.RECRUITER.value,
        company_name="TechPulse AI",
        company_logo="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop"
    )
    # Recruiter 2: CloudSphere
    recruiter_2 = User(
        name="David Vance",
        email="david.recruiter@cloudsphere.io",
        password_hash=get_password_hash("password123"),
        role=UserRole.RECRUITER.value,
        company_name="CloudSphere Systems",
        company_logo="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&h=120&fit=crop"
    )
    db.add(recruiter_1)
    db.add(recruiter_2)
    db.commit()
    db.refresh(recruiter_1)
    db.refresh(recruiter_2)

    # Candidate 1: Alex Mercer (AI Engineer)
    alex_user = User(
        name="Alex Mercer",
        email="alex.mercer@jobmatch.ai",
        password_hash=get_password_hash("password123"),
        role=UserRole.JOB_SEEKER.value
    )
    db.add(alex_user)
    db.commit()
    db.refresh(alex_user)

    # Create Alex's Profile and Resume
    alex_profile = CandidateProfile(
        user_id=alex_user.id,
        headline="Senior AI & Machine Learning Engineer",
        bio="Specializing in Large Language Models, PyTorch, RAG retrieval systems, and scalable ML microservices.",
        location="San Francisco, CA (Open to Remote)",
        experience_years=4.5,
        education="M.S. in Computer Science (Artificial Intelligence) - Stanford",
        phone="+1 (555) 234-5678",
        linkedin_url="https://linkedin.com/in/alex-mercer-ai",
        github_url="https://github.com/alexmercer-ai",
        profile_score=88
    )
    alex_skills = ["Python", "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning", "Natural Language Processing", "FastAPI", "SQL", "Pandas", "NumPy", "AWS", "Docker", "Git"]
    alex_profile.skills = [skill_lookup[s.lower()] for s in alex_skills if s.lower() in skill_lookup]
    db.add(alex_profile)

    # Resume file for Alex
    alex_resume_path = os.path.join(settings.UPLOAD_DIR, "seed_alex_mercer_ai.txt")
    with open(alex_resume_path, "w", encoding="utf-8") as f:
        f.write(SAMPLE_AI_ENGINEER_RESUME)

    alex_parsed = ResumeParser.parse_full_resume(alex_resume_path)
    alex_score_res = calculate_resume_score(alex_parsed)
    alex_resume = Resume(
        user_id=alex_user.id,
        file_name="Alex_Mercer_AI_Engineer.pdf",
        file_path=alex_resume_path,
        file_type="pdf",
        extracted_text=SAMPLE_AI_ENGINEER_RESUME,
        resume_score=alex_score_res["overall_score"],
        parsed_data_json=json.dumps({**alex_parsed, "scoring": alex_score_res}),
        is_primary=1
    )
    db.add(alex_resume)

    # Candidate 2: Sophia Chen (Full Stack)
    sophia_user = User(
        name="Sophia Chen",
        email="sophia.chen@jobmatch.ai",
        password_hash=get_password_hash("password123"),
        role=UserRole.JOB_SEEKER.value
    )
    db.add(sophia_user)
    db.commit()
    db.refresh(sophia_user)

    sophia_profile = CandidateProfile(
        user_id=sophia_user.id,
        headline="Full Stack Software Engineer",
        bio="Building cinematic web applications with React, TypeScript, Node.js, and Three.js.",
        location="Austin, TX",
        experience_years=3.2,
        education="B.S. in Computer Science - UT Austin",
        phone="+1 (555) 876-5432",
        linkedin_url="https://linkedin.com/in/sophia-chen-dev",
        github_url="https://github.com/sophiachen-dev",
        profile_score=84
    )
    sophia_skills = ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "FastAPI", "Python", "Tailwind CSS", "Three.js", "PostgreSQL", "Docker", "Git"]
    sophia_profile.skills = [skill_lookup[s.lower()] for s in sophia_skills if s.lower() in skill_lookup]
    db.add(sophia_profile)

    sophia_resume_path = os.path.join(settings.UPLOAD_DIR, "seed_sophia_chen.txt")
    with open(sophia_resume_path, "w", encoding="utf-8") as f:
        f.write(SAMPLE_FULLSTACK_RESUME)
    sophia_parsed = ResumeParser.parse_full_resume(sophia_resume_path)
    sophia_score_res = calculate_resume_score(sophia_parsed)
    sophia_resume = Resume(
        user_id=sophia_user.id,
        file_name="Sophia_Chen_FullStack.pdf",
        file_path=sophia_resume_path,
        file_type="pdf",
        extracted_text=SAMPLE_FULLSTACK_RESUME,
        resume_score=sophia_score_res["overall_score"],
        parsed_data_json=json.dumps({**sophia_parsed, "scoring": sophia_score_res}),
        is_primary=1
    )
    db.add(sophia_resume)
    db.commit()

    # 3. Seed Realistic Jobs
    jobs_data = [
        {
            "recruiter_id": recruiter_1.id,
            "title": "Lead AI & Machine Learning Engineer",
            "company": "TechPulse AI",
            "location": "San Francisco, CA",
            "location_type": "Hybrid",
            "job_type": "Full-time",
            "experience_level": "Senior",
            "experience_years_required": 4.0,
            "salary_min": 160000,
            "salary_max": 210000,
            "salary_currency": "USD",
            "salary_text": "$160k – $210k / yr",
            "featured": 1,
            "skills": ["Python", "PyTorch", "Machine Learning", "Deep Learning", "Natural Language Processing", "FastAPI", "Docker", "AWS"],
            "description": "We are seeking a Lead AI Engineer to drive next-generation multimodal neural networks, LLM agent pipelines, and high-throughput model serving infrastructures.",
            "requirements": "4+ years of hands-on experience in PyTorch or TensorFlow, deploying ML pipelines on AWS, building low-latency inference endpoints with FastAPI, and leading ML teams.",
            "responsibilities": "Design and architect RAG and fine-tuning pipelines for proprietary enterprise foundation models. Mentor junior ML engineers and collaborate directly with product leads."
        },
        {
            "recruiter_id": recruiter_1.id,
            "title": "Senior Full-Stack Architect",
            "company": "TechPulse AI",
            "location": "Remote (US/Global)",
            "location_type": "Remote",
            "job_type": "Full-time",
            "experience_level": "Lead",
            "experience_years_required": 5.0,
            "salary_min": 150000,
            "salary_max": 190000,
            "salary_currency": "USD",
            "salary_text": "$150k – $190k / yr",
            "featured": 1,
            "skills": ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "Docker", "System Design"],
            "description": "Join our core platform group to architect ultra-fast, cinematic web interfaces and distributed backend APIs for millions of creative professionals.",
            "requirements": "Deep mastery of React, TypeScript, high-concurrency Node.js microservices, PostgreSQL query optimization, and resilient web architectures.",
            "responsibilities": "Own frontend performance, glass UI component libraries, real-time WebSocket communication, and distributed API scaling."
        },
        {
            "recruiter_id": recruiter_2.id,
            "title": "Cloud Infrastructure & DevOps Engineer",
            "company": "CloudSphere Systems",
            "location": "Seattle, WA",
            "location_type": "Hybrid",
            "job_type": "Full-time",
            "experience_level": "Mid-Level",
            "experience_years_required": 3.0,
            "salary_min": 130000,
            "salary_max": 165000,
            "salary_currency": "USD",
            "salary_text": "$130k – $165k / yr",
            "featured": 0,
            "skills": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Python"],
            "description": "CloudSphere is looking for a DevOps Engineer to manage multi-region Kubernetes clusters, automated zero-downtime CI/CD pipelines, and cloud security postures.",
            "requirements": "3+ years automating cloud infrastructure with Terraform, orchestrating container workloads on Kubernetes/EKS, and configuring GitHub Actions.",
            "responsibilities": "Implement automated disaster recovery, maintain 99.99% uptime SLAs, and harden cloud network security."
        },
        {
            "recruiter_id": recruiter_2.id,
            "title": "Data Scientist & Analytics Specialist",
            "company": "CloudSphere Systems",
            "location": "New York, NY",
            "location_type": "Hybrid",
            "job_type": "Full-time",
            "experience_level": "Mid-Level",
            "experience_years_required": 2.5,
            "salary_min": 120000,
            "salary_max": 155000,
            "salary_currency": "USD",
            "salary_text": "$120k – $155k / yr",
            "featured": 0,
            "skills": ["Python", "Data Science", "SQL", "Pandas", "Scikit-learn", "Tableau", "Data Analysis"],
            "description": "Drive predictive growth analytics, cohort segmentation, and customer lifetime value machine learning models for fast-scaling enterprise SaaS products.",
            "requirements": "Proficiency in statistical modeling, Scikit-learn, exploratory data analysis with Pandas/NumPy, and complex SQL joins.",
            "responsibilities": "Build executive dashboards in Tableau, deliver actionable insights to executive leadership, and deploy predictive churn models."
        },
        {
            "recruiter_id": recruiter_1.id,
            "title": "AI Research Scientist - Generative NLP",
            "company": "TechPulse AI",
            "location": "Boston, MA / Remote",
            "location_type": "Remote",
            "job_type": "Full-time",
            "experience_level": "Senior",
            "experience_years_required": 3.5,
            "salary_min": 175000,
            "salary_max": 230000,
            "salary_currency": "USD",
            "salary_text": "$175k – $230k / yr",
            "featured": 1,
            "skills": ["Python", "PyTorch", "Generative AI", "Natural Language Processing", "Deep Learning", "Hugging Face"],
            "description": "Pioneer state-of-the-art token pruning, attention mechanisms, and reinforcement learning from human feedback (RLHF) techniques for next-gen models.",
            "requirements": "M.S. or Ph.D. in Computer Science, published AI papers or demonstrated experience fine-tuning 7B+ parameter language models.",
            "responsibilities": "Experiment with synthetic dataset generation, alignment techniques, and novel LLM routing architectures."
        },
        {
            "recruiter_id": recruiter_2.id,
            "title": "Frontend Engineer - 3D & Creative UI",
            "company": "CloudSphere Systems",
            "location": "Austin, TX",
            "location_type": "On-site",
            "job_type": "Full-time",
            "experience_level": "Mid-Level",
            "experience_years_required": 2.0,
            "salary_min": 115000,
            "salary_max": 145000,
            "salary_currency": "USD",
            "salary_text": "$115k - $145k / yr",
            "featured": 0,
            "skills": ["JavaScript", "TypeScript", "React", "Three.js", "Tailwind CSS", "UI/UX Design"],
            "description": "Craft mesmerizing 3D data visualizations, interactive dashboard canvases, and smooth motion graphics using WebGL, Three.js, and React.",
            "requirements": "Strong aesthetic eye, experience with shaders/materials in Three.js or React Three Fiber, and high fidelity CSS animation skills.",
            "responsibilities": "Develop interactive 3D product walkthroughs, optimize 60fps canvas render loops, and integrate design tokens."
        }
    ]

    created_jobs = []
    for jd in jobs_data:
        skills_to_link = jd.pop("skills")
        j = Job(**jd, is_active=1)
        j.skills = [skill_lookup[s.lower()] for s in skills_to_link if s.lower() in skill_lookup]
        db.add(j)
        created_jobs.append(j)

    db.commit()

    # 4. Seed Real Applications with AI Match Scores
    # Alex Mercer applying to Lead AI Engineer
    ai_job = created_jobs[0]
    alex_match = AIMatchingEngine.match_resume_to_job(
        resume_text=SAMPLE_AI_ENGINEER_RESUME,
        candidate_skills=alex_skills,
        candidate_experience_years=4.5,
        candidate_education="Master of Science in Computer Science - Stanford",
        job_title=ai_job.title,
        job_description=ai_job.description,
        job_requirements=ai_job.requirements,
        job_skills=[s.name for s in ai_job.skills],
        job_experience_required=ai_job.experience_years_required
    )

    app1 = Application(
        job_id=ai_job.id,
        candidate_id=alex_profile.id,
        resume_id=alex_resume.id,
        match_score=float(alex_match["match_percentage"]),
        match_breakdown_json=json.dumps(alex_match),
        cover_note="Excited to apply my 4+ years of PyTorch and LLM inference optimization experience to TechPulse AI's foundation models.",
        status=ApplicationStatus.SHORTLISTED
    )
    db.add(app1)

    # Sophia Chen applying to Senior Full-Stack Architect
    fs_job = created_jobs[1]
    sophia_match = AIMatchingEngine.match_resume_to_job(
        resume_text=SAMPLE_FULLSTACK_RESUME,
        candidate_skills=sophia_skills,
        candidate_experience_years=3.2,
        candidate_education="Bachelor of Science in Computer Science",
        job_title=fs_job.title,
        job_description=fs_job.description,
        job_requirements=fs_job.requirements,
        job_skills=[s.name for s in fs_job.skills],
        job_experience_required=fs_job.experience_years_required
    )

    app2 = Application(
        job_id=fs_job.id,
        candidate_id=sophia_profile.id,
        resume_id=sophia_resume.id,
        match_score=float(sophia_match["match_percentage"]),
        match_breakdown_json=json.dumps(sophia_match),
        cover_note="Passionate about cinematic glass UI and high-throughput Node.js microservices.",
        status=ApplicationStatus.INTERVIEW
    )
    db.add(app2)

    db.commit()
    print("Database seeding completed successfully.")
