import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, MapPin, DollarSign, Clock, CheckCircle2,
  ChevronRight, Check, Send
} from 'lucide-react';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  onApplied?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect, onApplied }) => {
  const { user, isAuthenticated } = useAuth();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onSelect(job);
      return;
    }
    setApplying(true);
    try {
      await api.applications.apply(job.id, "Applied via JobMatch AI 1-click apply.");
      setApplied(true);
      if (onApplied) onApplied();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Application submission failed.");
    } finally {
      setApplying(false);
    }
  };

  const matchScore = job.match_score;
  const isHighMatch = matchScore !== null && matchScore !== undefined && matchScore >= 75;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onSelect(job)}
      className="glass-card rounded-3xl p-6 sm:p-7 border border-[#E5EAF0] relative cursor-pointer overflow-hidden group text-left"
    >
      {/* Subtle match glow accent border */}
      {isHighMatch && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10 group-hover:bg-teal-500/15 transition-all" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-[#0B1220] group-hover:text-teal-700 transition-colors">
              {job.title}
            </h3>
            {job.featured === 1 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wider">
                Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-[#526071] font-medium">
            <span className="text-[#0B1220] font-semibold">{job.company}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs flex items-center gap-1 text-[#526071]">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location} ({job.location_type})
            </span>
          </div>
        </div>

        {/* Dynamic AI Match % Badge */}
        {matchScore !== null && matchScore !== undefined ? (
          <div className="flex items-center self-start bg-teal-50/80 border border-teal-200 rounded-2xl px-3.5 py-1.5 shadow-xs">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[10px] font-mono text-teal-800 uppercase font-bold tracking-wider">AI Match</span>
              <span className="text-xs font-bold text-teal-900">{job.compatibility_level || 'Good Fit'}</span>
            </div>
            <span className={`text-xl font-bold font-mono ${
              matchScore >= 80 ? 'text-teal-700' : matchScore >= 60 ? 'text-blue-700' : 'text-amber-700'
            }`}>
              {matchScore}%
            </span>
          </div>
        ) : (
          <div className="self-start px-2.5 py-1 rounded-lg bg-slate-100 border border-[#E5EAF0] text-[11px] text-[#526071] font-mono font-medium">
            {job.job_type}
          </div>
        )}
      </div>

      {/* Tags row: Salary, Experience, Job Type */}
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-[#E5EAF0] text-xs text-[#526071] font-medium">
        <div className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
          <span>{job.salary_text || '$130k - $160k / yr'}</span>
        </div>
        <div className="flex items-center gap-1 text-[#526071]">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span>{job.experience_level} ({job.experience_years_required}+ yrs)</span>
        </div>
        <div className="flex items-center gap-1 text-[#526071]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{job.job_type}</span>
        </div>
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-[#526071] mt-3 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Matched & Missing Skills Highlights */}
      <div className="mt-4 pt-3 border-t border-[#E5EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {/* Matched skills checkmarks */}
          {(job.matched_skills && job.matched_skills.length > 0
            ? job.matched_skills.slice(0, 3)
            : job.skills.slice(0, 3).map((s) => s.name)
          ).map((sName) => (
            <span
              key={sName}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-medium"
            >
              <Check className="w-3 h-3 text-emerald-700" /> {sName}
            </span>
          ))}

          {/* Missing skill indicator if any */}
          {job.missing_skills && job.missing_skills.length > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-medium">
              +{job.missing_skills.length} missing
            </span>
          )}

          {job.skills.length > 3 && !job.matched_skills?.length && (
            <span className="text-[11px] text-slate-400 font-medium">+{job.skills.length - 3} more</span>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {user?.role === 'job_seeker' && (
            <button
              onClick={handleApply}
              disabled={applied || applying}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                applied
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 shadow-xs'
              }`}
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Applied</span>
                </>
              ) : applying ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-3 h-3 text-teal-700" />
                  <span>Quick Apply</span>
                </>
              )}
            </button>
          )}

          <div className="p-1 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
