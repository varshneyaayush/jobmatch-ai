import React, { useState, useEffect } from 'react';
import {
  User, Sparkles, Upload, Check,
  TrendingUp, ArrowRight
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { JobCard } from '../components/JobCard';
import { JobDetailsModal } from '../components/JobDetailsModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Application, Job, ResumeAnalysis } from '../types';

interface CandidateDashboardProps {
  onOpenUpload: () => void;
  onExploreJobs: () => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  onOpenUpload,
  onExploreJobs,
}) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Resume Analysis
      try {
        const ana = await api.resume.getAnalysis();
        setAnalysis(ana);
      } catch (e) {
        console.log('No resume uploaded yet for user.');
      }

      // 2. Fetch AI Job Recommendations
      try {
        const recs = await api.matching.getRecommendations(6);
        setRecommendations(recs);
      } catch (e) {
        console.error('Failed to load recommendations:', e);
      }

      // 3. Fetch Candidate Applications
      try {
        const apps = await api.applications.getMyApplications();
        setApplications(apps);
      } catch (e) {
        console.error('Failed to load applications:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const resumeScore = analysis?.resume_score || user?.candidate_profile?.profile_score || 82;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selected': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Interview': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Shortlisted': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Under Review': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Rejected': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5EAF0]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono font-bold mb-2">
            <User className="w-3.5 h-3.5 text-teal-700" />
            Candidate Intelligence Hub
          </div>
          <h1 className="text-3xl font-extrabold text-[#0B1220] tracking-tight">
            Welcome back, {user?.name || 'Alex Mercer'}
          </h1>
          <p className="text-xs text-[#526071] mt-1 font-medium">
            {user?.candidate_profile?.headline || 'Senior AI & Machine Learning Engineer'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUpload}
            className="btn-shimmer flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-teal-glow"
          >
            <Upload className="w-4 h-4" />
            <span>Update / Re-analyze Resume</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Resume Score */}
        <div className="glass-card p-5 rounded-3xl border border-teal-200 relative overflow-hidden flex items-center justify-between shadow-glass">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#526071] font-bold tracking-wider">Resume Score</span>
            <div className="text-2xl font-bold font-mono text-teal-700 mt-1">{resumeScore}/100</div>
            <span className="text-[11px] text-teal-800 font-medium mt-0.5 block">ATS Optimized</span>
          </div>
          <ScoreGauge score={resumeScore} size={68} strokeWidth={6} showLabel={false} />
        </div>

        {/* Metric 2: Recommended Jobs */}
        <div className="glass-card p-5 rounded-3xl border border-[#E5EAF0] relative overflow-hidden shadow-glass">
          <span className="text-[11px] font-mono uppercase text-[#526071] font-bold tracking-wider">Recommended Jobs</span>
          <div className="text-2xl font-bold font-mono text-[#0B1220] mt-1">{recommendations.length}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">High compatibility match</span>
        </div>

        {/* Metric 3: Active Applications */}
        <div className="glass-card p-5 rounded-3xl border border-[#E5EAF0] relative overflow-hidden shadow-glass">
          <span className="text-[11px] font-mono uppercase text-[#526071] font-bold tracking-wider">Applications</span>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{applications.length}</div>
          <span className="text-[11px] text-[#526071] font-medium mt-0.5 block">Active recruiter pipelines</span>
        </div>

        {/* Metric 4: Shortlisted / Interviews */}
        <div className="glass-card p-5 rounded-3xl border border-[#E5EAF0] relative overflow-hidden shadow-glass">
          <span className="text-[11px] font-mono uppercase text-[#526071] font-bold tracking-wider">Interviews & Shortlists</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {applications.filter((a) => ['Shortlisted', 'Interview', 'Selected'].includes(a.status)).length}
          </div>
          <span className="text-[11px] text-emerald-800 font-medium mt-0.5 block">Next stage advanced</span>
        </div>
      </div>

      {/* Analysis & Skill Insights Split */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Detected Skills */}
          <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-3xl border border-[#E5EAF0] space-y-4 shadow-glass">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700" />
                Detected Technical Profile & Skills
              </h3>
              <span className="text-xs text-[#526071] font-mono font-medium">{analysis.skills?.length || 0} skills detected</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(analysis.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Strengths */}
            <div className="pt-4 border-t border-[#E5EAF0] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-[#E5EAF0]">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                  <Check className="w-3.5 h-3.5 text-emerald-700" /> Resume Strengths
                </span>
                <ul className="space-y-1 text-xs text-[#0B1220]">
                  {analysis.strengths.slice(0, 3).map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-[#E5EAF0]">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-700" /> Recommended Additions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.recommended_skills.map((rs) => (
                    <span
                      key={rs}
                      className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-100/70 text-amber-900 border border-amber-300"
                    >
                      + {rs}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Profile Summary */}
          <div className="lg:col-span-4 glass-card p-6 sm:p-8 rounded-3xl border border-[#E5EAF0] space-y-4 flex flex-col justify-between shadow-glass">
            <div>
              <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wider font-mono mb-3">
                Extracted Summary
              </h3>
              <p className="text-xs text-[#526071] leading-relaxed italic">
                "{analysis.summary || 'Senior AI professional specialized in scalable algorithms and model architectures.'}"
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#E5EAF0] text-xs">
              <div className="flex justify-between text-[#526071]">
                <span>Education:</span>
                <span className="text-[#0B1220] font-bold truncate max-w-[170px]">{analysis.education}</span>
              </div>
              <div className="flex justify-between text-[#526071]">
                <span>Experience:</span>
                <span className="text-teal-700 font-mono font-bold">{analysis.experience_years} Years</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Pipeline Tracker */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#E5EAF0] space-y-6 shadow-glass">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#0B1220] tracking-tight">Active Applications Tracking</h3>
            <p className="text-xs text-[#526071]">Live recruitment statuses and AI match rankings</p>
          </div>
          <span className="text-xs text-[#526071] font-mono font-semibold">{applications.length} submitted</span>
        </div>

        {applications.length === 0 ? (
          <div className="p-8 text-center text-[#526071] text-xs border border-dashed border-slate-300 rounded-2xl bg-slate-50">
            You haven't submitted any job applications yet. Browse recommended positions below to apply!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5EAF0] text-[#526071] font-mono uppercase tracking-wider">
                  <th className="pb-3 pl-2">Job Title</th>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">AI Match</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF0]">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-[#0B1220]">{app.job_title}</td>
                    <td className="py-3.5 text-[#526071] font-medium">{app.company}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {app.match_score}%
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#526071] font-mono text-[11px]">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recommended Jobs for You */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#0B1220] tracking-tight">Recommended for you</h3>
            <p className="text-xs text-[#526071]">Sorted dynamically by your highest AI compatibility scores</p>
          </div>
          <button
            onClick={onExploreJobs}
            className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={(j) => setSelectedJob(j)}
              onApplied={loadDashboardData}
            />
          ))}
        </div>
      </div>

      {/* Modal on Job Click */}
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApplied={loadDashboardData}
      />
    </div>
  );
};
