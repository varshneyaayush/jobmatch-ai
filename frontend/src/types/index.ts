export type UserRole = 'job_seeker' | 'recruiter' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  company_name?: string | null;
  company_logo?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category?: string | null;
}

export interface CandidateProfile {
  id: number;
  headline?: string;
  bio?: string;
  location?: string;
  experience_years: number;
  education?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  profile_score: number;
  skills: Skill[];
}

export interface UserProfileResponse extends User {
  candidate_profile?: CandidateProfile | null;
}

export interface Job {
  id: number;
  recruiter_id: number;
  title: string;
  company: string;
  company_logo?: string | null;
  description: string;
  requirements?: string | null;
  responsibilities?: string | null;
  location: string;
  location_type: 'Remote' | 'Hybrid' | 'On-site' | string;
  job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | string;
  experience_level: string;
  experience_years_required: number;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency: string;
  salary_period: string;
  salary_text?: string | null;
  is_active: number;
  featured: number;
  created_at: string;
  skills: Skill[];
  recruiter?: User | null;
  // Computed dynamic matching fields
  match_score?: number | null;
  compatibility_level?: string | null;
  matched_skills?: string[];
  missing_skills?: string[];
  match_details?: MatchResponse | null;
}

export interface MatchResponse {
  job_id: number;
  job_title?: string;
  company?: string;
  match_percentage: number;
  compatibility_level: 'Excellent' | 'Strong' | 'Moderate' | 'Potential Fit' | string;
  matched_skills: string[];
  missing_skills: string[];
  extra_skills: string[];
  experience_match: 'Strong' | 'Moderate' | 'Developing' | string;
  experience_note: string;
  education_match: 'Strong' | 'Compatible' | 'Basic' | string;
  education_note: string;
  breakdown: {
    nlp_content_match: number;
    skill_alignment: number;
    experience_score: number;
    education_score: number;
  };
}

export interface ResumeAnalysis {
  resume_id: number;
  file_name: string;
  resume_score: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  education: string;
  experience_years: number;
  skills: string[];
  skills_by_category: Record<string, string[]>;
  summary: string;
  breakdown: {
    skills_score: number;
    experience_score: number;
    education_score: number;
    contact_score: number;
    content_score: number;
  };
  strengths: string[];
  improvements: string[];
  recommended_skills: string[];
}

export interface Application {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  location: string;
  location_type: string;
  salary_text?: string;
  match_score: number;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected' | string;
  applied_at: string;
  updated_at: string;
  match_breakdown?: MatchResponse;
}

export interface JobCandidate {
  application_id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  headline?: string;
  location?: string;
  experience_years: number;
  education?: string;
  skills: string[];
  match_score: number;
  compatibility_level: string;
  matched_skills: string[];
  missing_skills: string[];
  experience_match: string;
  education_match: string;
  status: string;
  cover_note?: string;
  notes?: string;
  applied_at: string;
  resume_id?: number;
}
