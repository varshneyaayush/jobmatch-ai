import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, MapPin, Sparkles, Check,
  X as CrossIcon, Send, CheckCircle2, Building
} from 'lucide-react';
import { Job } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface JobDetailsModalProps {
  job: Job | null;
  onClose: () => void;
  onApplied?: () => void;
  onOpenAuth?: () => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  onClose,
  onApplied,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [coverNote, setCoverNote] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!job) return null;

  const matchScore = job.match_score || 82;
  const matchDetails = job.match_details;

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    setIsApplying(true);
    setErrorMsg(null);
    try {
      await api.applications.apply(job.id, coverNote.trim() || undefined);
      setAppliedSuccess(true);
      if (onApplied) onApplied();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl max-h-[90vh] bg-white border border-[#E5EAF0] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative my-8 text-left"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF0] bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
            <span className="text-xs font-mono uppercase text-teal-800 font-bold tracking-wider">
              Job Overview & AI Match Intelligence
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B1220] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Job title & Company Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#E5EAF0]">
            <div className="space-y-2 flex-1">
              <h2 className="text-2xl font-bold text-[#0B1220] tracking-tight">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#526071]">
                <span className="font-semibold text-[#0B1220] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-teal-700" />
                  {job.company}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-[#526071]">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location} ({job.location_type})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {job.salary_text || '$130k - $160k'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#0B1220] border border-[#E5EAF0] font-semibold">
                  {job.job_type}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#0B1220] border border-[#E5EAF0] font-semibold">
                  {job.experience_level} ({job.experience_years_required}+ yrs)
                </span>
              </div>
            </div>

            {/* AI Compatibility Score Card */}
            <div className="p-4 bg-gradient-to-br from-teal-50 via-white to-blue-50 rounded-2xl border border-teal-200 shadow-sm flex items-center gap-4 self-start">
              <ScoreGauge score={matchScore} size={95} strokeWidth={7} />
              <div>
                <span className="text-[10px] font-mono text-teal-800 uppercase font-bold tracking-wider block">AI Compatibility</span>
                <span className="text-base font-bold text-[#0B1220] block mt-0.5">
                  {job.compatibility_level || 'Strong Match'}
                </span>
                <span className="text-[11px] text-[#526071] mt-1 block">
                  TF-IDF & Ontology Analyzed
                </span>
              </div>
            </div>
          </div>

          {/* Section: AI Match Deep Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-teal-200/60 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <h4 className="text-sm font-bold text-[#0B1220] uppercase tracking-wider font-mono">
                AI Compatibility Breakdown
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Matched Skills */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-700" /> Matched Skills ({job.matched_skills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(job.matched_skills && job.matched_skills.length > 0
                    ? job.matched_skills
                    : job.skills.map((s) => s.name)
                  ).map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded text-xs font-mono bg-emerald-100/70 text-emerald-800 border border-emerald-300 flex items-center gap-1 font-semibold"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                  <CrossIcon className="w-3.5 h-3.5 text-rose-700" /> Missing Skills ({job.missing_skills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.missing_skills && job.missing_skills.length > 0 ? (
                    job.missing_skills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-0.5 rounded text-xs font-mono bg-rose-100/70 text-rose-800 border border-rose-300 flex items-center gap-1 font-semibold"
                      >
                        × {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">All required skills present in resume!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Experience & Education Compatibility Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div className="text-xs p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[#526071] block text-[11px] uppercase font-mono font-medium">Experience Alignment</span>
                <span className="font-bold text-[#0B1220] mt-1 block">
                  {matchDetails?.experience_match || 'Strong'} Match
                </span>
                <span className="text-[#526071] text-[11px] mt-0.5 block">
                  {matchDetails?.experience_note || `Job requires ${job.experience_years_required}+ years`}
                </span>
              </div>

              <div className="text-xs p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[#526071] block text-[11px] uppercase font-mono font-medium">Education Fit</span>
                <span className="font-bold text-[#0B1220] mt-1 block">
                  {matchDetails?.education_match || 'Strong'} Compatibility
                </span>
                <span className="text-[#526071] text-[11px] mt-0.5 block">
                  {matchDetails?.education_note || 'Technical degree satisfies criteria'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#0B1220] font-mono uppercase tracking-wider">About the Role</h4>
            <p className="text-sm text-[#526071] leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#0B1220] font-mono uppercase tracking-wider">Key Requirements</h4>
              <p className="text-sm text-[#526071] leading-relaxed whitespace-pre-line">{job.requirements}</p>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#0B1220] font-mono uppercase tracking-wider">Responsibilities</h4>
              <p className="text-sm text-[#526071] leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}

          {/* Application Box */}
          <div className="pt-6 border-t border-[#E5EAF0]">
            {appliedSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">Application Submitted Successfully!</h4>
                <p className="text-xs text-emerald-800">
                  Your profile and AI match score ({matchScore}%) have been delivered to {job.company}.
                </p>
              </div>
            ) : user?.role === 'job_seeker' ? (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-[#0B1220] mb-1.5 font-mono">
                    Cover Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Highlight why you're a great fit for this position..."
                    className="w-full glass-input rounded-xl p-3 text-xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#526071] font-mono">
                    Applying as: <strong className="text-[#0B1220]">{user?.name || 'Candidate'}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="btn-shimmer px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-teal-glow flex items-center gap-2"
                  >
                    {isApplying ? (
                      <span>Sending Application...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply Now with AI Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : !isAuthenticated ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-[#E5EAF0] text-center space-y-3">
                <h4 className="text-sm font-bold text-[#0B1220]">Ready to apply with your resume?</h4>
                <p className="text-xs text-[#526071] max-w-md mx-auto">
                  Sign in or use our 1-click candidate demo to apply and automatically rank your candidate profile.
                </p>
                <button
                  onClick={onOpenAuth}
                  className="btn-shimmer px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-colors shadow-teal-glow"
                >
                  Sign In to Apply
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 text-xs text-[#526071] text-center font-mono">
                You are currently logged in as a {user?.role}. (Job applications are reserved for Job Seekers).
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
