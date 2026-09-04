import axios from 'axios';
import { User, Job, ResumeAnalysis, Application, JobCandidate, MatchResponse, UserProfileResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jobmatch_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  auth: {
    register: async (data: any) => {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    },
    login: async (data: any) => {
      const res = await apiClient.post('/auth/login', data);
      return res.data;
    },
    demoLogin: async (role: 'job_seeker' | 'recruiter' | 'admin') => {
      const res = await apiClient.post('/auth/demo-login', { role });
      return res.data;
    },
    getMe: async (): Promise<UserProfileResponse> => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
    updateProfile: async (data: any) => {
      const res = await apiClient.put('/auth/profile', data);
      return res.data;
    },
  },

  resume: {
    uploadResume: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    loadSampleResume: async (sampleType: 'ai_engineer' | 'fullstack' = 'ai_engineer') => {
      const formData = new FormData();
      formData.append('sample_type', sampleType);
      const res = await apiClient.post('/resume/load-sample', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    getAnalysis: async (): Promise<ResumeAnalysis> => {
      const res = await apiClient.get('/resume/analysis');
      return res.data;
    },
  },

  jobs: {
    getJobs: async (params?: Record<string, any>): Promise<{ items: Job[]; total: number }> => {
      const res = await apiClient.get('/jobs', { params });
      return res.data;
    },
    getJobById: async (id: number): Promise<Job> => {
      const res = await apiClient.get(`/jobs/${id}`);
      return res.data;
    },
    getRecruiterJobs: async () => {
      const res = await apiClient.get('/jobs/recruiter/my-jobs');
      return res.data;
    },
    createJob: async (data: any): Promise<Job> => {
      const res = await apiClient.post('/jobs', data);
      return res.data;
    },
    updateJob: async (id: number, data: any): Promise<Job> => {
      const res = await apiClient.put(`/jobs/${id}`, data);
      return res.data;
    },
    deleteJob: async (id: number) => {
      const res = await apiClient.delete(`/jobs/${id}`);
      return res.data;
    },
  },

  matching: {
    matchResumeJob: async (jobId: number, resumeId?: number): Promise<MatchResponse> => {
      const res = await apiClient.post('/matching/resume-job', null, {
        params: { job_id: jobId, resume_id: resumeId },
      });
      return res.data;
    },
    getRecommendations: async (limit = 6): Promise<Job[]> => {
      const res = await apiClient.get('/matching/recommendations', { params: { limit } });
      return res.data;
    },
    visualDemo: async (data: { resume_skills: string[]; job_skills: string[]; job_title?: string; candidate_exp?: number; required_exp?: number }) => {
      const res = await apiClient.post('/matching/visual-demo', data);
      return res.data;
    },
  },

  applications: {
    apply: async (jobId: number, coverNote?: string) => {
      const res = await apiClient.post('/applications', { job_id: jobId, cover_note: coverNote });
      return res.data;
    },
    getMyApplications: async (): Promise<Application[]> => {
      const res = await apiClient.get('/applications/my-applications');
      return res.data;
    },
    getJobCandidates: async (jobId: number): Promise<JobCandidate[]> => {
      const res = await apiClient.get(`/applications/job/${jobId}/candidates`);
      return res.data;
    },
    updateStatus: async (applicationId: number, status: string, notes?: string) => {
      const res = await apiClient.put(`/applications/${applicationId}/status`, { status, notes });
      return res.data;
    },
  },

  admin: {
    getStats: async () => {
      const res = await apiClient.get('/admin/stats');
      return res.data;
    },
    getUsers: async () => {
      const res = await apiClient.get('/admin/users');
      return res.data;
    },
    deleteUser: async (id: number) => {
      const res = await apiClient.delete(`/admin/users/${id}`);
      return res.data;
    },
    getJobs: async () => {
      const res = await apiClient.get('/admin/jobs');
      return res.data;
    },
  },
};
