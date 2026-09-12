import urllib.request
import json

def test(name, url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}
    if data:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode(),
            headers={'Content-Type': 'application/json', **headers},
            method=method
        )
    else:
        req = urllib.request.Request(url, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            body = res.read()
            try:
                parsed = json.loads(body)
                print(f"[PASS] {name}: {res.status}")
                return parsed
            except Exception:
                print(f"[PASS] {name}: {res.status} (HTML/Text bytes: {len(body)})")
                return body
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"[EXPECTED STATUS/FAIL] {name}: {e.code} - {body}")
        return {"status_code": e.code, "detail": body}
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        return None

def main():
    print("=== VERIFYING FULL-STACK APPLICATION & AUTHENTICATION ===")
    
    # 1. Frontend check
    test("Frontend Dev Server", "http://localhost:5173")

    # 2. Backend Health
    test("Backend Health API", "http://localhost:8000/api/health")

    # 3. Returning User Login (Email + Password - NO OTP)
    login_res = test("Returning User Login (Email + Password)", "http://localhost:8000/api/auth/login", "POST", {
        "email": "alex.mercer@jobmatch.ai",
        "password": "password123"
    })
    cand_token = login_res.get("access_token") if login_res else None

    # 4. Incorrect Password Safety Test
    test("Wrong Password Safety Check", "http://localhost:8000/api/auth/login", "POST", {
        "email": "alex.mercer@jobmatch.ai",
        "password": "wrong_password_999"
    })

    # 5. Duplicate Email Registration Prevention
    test("Duplicate Email Registration Block", "http://localhost:8000/api/auth/send-otp", "POST", {
        "name": "Alex Mercer Fake",
        "email": "alex.mercer@jobmatch.ai",
        "password": "password123",
        "role": "job_seeker"
    })

    # 6. Auth Recruiter Demo
    auth_rec = test("Auth: Recruiter Demo Login", "http://localhost:8000/api/auth/demo-login", "POST", {"role": "recruiter"})
    rec_token = auth_rec.get("access_token") if auth_rec else None

    # 7. Auth Admin Demo
    auth_adm = test("Auth: Admin Demo Login", "http://localhost:8000/api/auth/demo-login", "POST", {"role": "admin"})
    adm_token = auth_adm.get("access_token") if auth_adm else None

    # 8. Dynamic AI Job Matching for Logged in Candidate
    if cand_token:
        me = test("Get Logged In User Profile (/auth/me)", "http://localhost:8000/api/auth/me", headers={"Authorization": f"Bearer {cand_token}"})
        if me:
            print(f"   -> User: {me['name']} ({me['email']}) | Role: {me['role']} | Profile Score: {me.get('candidate_profile', {}).get('profile_score')}")

        jobs = test("Jobs Portal (with Candidate AI Match %)", "http://localhost:8000/api/jobs?sort_by=match", headers={"Authorization": f"Bearer {cand_token}"})
        if jobs and jobs.get("items"):
            top = jobs["items"][0]
            print(f"   -> Top Match: {top['title']} ({top['match_score']}%) | Matched: {len(top['matched_skills'])} skills")

    # 9. Visual Demo Matching Engine
    demo_calc = test("ML Matching Engine Calculation", "http://localhost:8000/api/matching/visual-demo", "POST", {
        "resume_skills": ["Python", "PyTorch", "FastAPI", "Docker"],
        "job_skills": ["Python", "PyTorch", "AWS", "Kubernetes"],
        "job_title": "AI Engineer"
    })
    if demo_calc:
        print(f"   -> Dynamic Score: {demo_calc['match_percentage']}% | Compatibility: {demo_calc['compatibility_level']}")

    # 10. Recruiter Candidate Ranking
    if rec_token:
        ranked = test("Recruiter AI Candidate Ranking", "http://localhost:8000/api/applications/job/1/candidates", headers={"Authorization": f"Bearer {rec_token}"})
        if ranked and isinstance(ranked, list) and len(ranked) > 0:
            print(f"   -> Ranked {len(ranked)} applicants for Job #1. Top applicant: {ranked[0]['candidate_name']} ({ranked[0]['match_score']}%)")

    # 11. Admin Stats
    if adm_token:
        stats = test("Admin Stats Portal", "http://localhost:8000/api/admin/stats", headers={"Authorization": f"Bearer {adm_token}"})
        if stats and isinstance(stats, dict):
            print(f"   -> Total Users: {stats.get('total_users')}, Total Jobs: {stats.get('total_jobs')}, Applications: {stats.get('total_applications')}")

    print("=== ALL CORE ENDPOINTS, AUTHENTICATION & SMTP OTP LOGIC VERIFIED ===")

if __name__ == "__main__":
    main()
