import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Sparkles, Briefcase
} from 'lucide-react';
import { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { JobDetailsModal } from '../components/JobDetailsModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FindJobsPageProps {
  onOpenUpload: () => void;
  onOpenAuth: () => void;
}

export const FindJobsPage: React.FC<FindJobsPageProps> = ({ onOpenUpload, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocationType, setSelectedLocationType] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedExpLevel, setSelectedExpLevel] = useState('all');
  const [sortBy, setSortBy] = useState('match');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.jobs.getJobs({
        q: searchQuery.trim() || undefined,
        location: locationQuery.trim() || undefined,
        location_type: selectedLocationType !== 'all' ? selectedLocationType : undefined,
        job_type: selectedJobType !== 'all' ? selectedJobType : undefined,
        experience_level: selectedExpLevel !== 'all' ? selectedExpLevel : undefined,
        sort_by: sortBy,
      });
      setJobs(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedLocationType, selectedJobType, selectedExpLevel, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          <span>Live AI Job Portal & Match Index</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1220] tracking-tight">
          Explore Tech Roles & AI Matches
        </h1>
        <p className="text-sm text-[#526071] max-w-2xl">
          Jobs sorted dynamically by compatibility with your verified skills and resume profile.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl border border-[#E5EAF0] mb-8 space-y-4 shadow-glass">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword search input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Job title, keyword, or company (e.g. AI Engineer, React)..."
              className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-xs"
            />
          </div>

          {/* Location input */}
          <div className="sm:col-span-4 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="City, State, or 'Remote'..."
              className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-xs"
            />
          </div>

          {/* Search Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full btn-shimmer py-2.5 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-teal-glow flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5EAF0] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Workplace Location Type */}
            <select
              value={selectedLocationType}
              onChange={(e) => setSelectedLocationType(e.target.value)}
              className="glass-input rounded-xl px-3 py-1.5 text-xs bg-white text-[#0B1220] border border-slate-200 font-medium"
            >
              <option value="all">All Workplaces</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>

            {/* Job Type */}
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="glass-input rounded-xl px-3 py-1.5 text-xs bg-white text-[#0B1220] border border-slate-200 font-medium"
            >
              <option value="all">All Employment Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
            </select>

            {/* Seniority */}
            <select
              value={selectedExpLevel}
              onChange={(e) => setSelectedExpLevel(e.target.value)}
              className="glass-input rounded-xl px-3 py-1.5 text-xs bg-white text-[#0B1220] border border-slate-200 font-medium"
            >
              <option value="all">All Experience Levels</option>
              <option value="Entry">Entry Level</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior Level</option>
              <option value="Lead">Lead / Architect</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-[#526071] font-mono text-[11px] font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-input rounded-xl px-3 py-1.5 text-xs bg-teal-50 text-teal-900 border border-teal-200 font-bold"
            >
              <option value="match">AI Match Score (High to Low)</option>
              <option value="newest">Newest Postings</option>
              <option value="salary_high">Highest Compensation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upload Callout if Not Authenticated or Missing Resume */}
      {(!isAuthenticated || !user?.candidate_profile) && (
        <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-teal-50 via-white to-blue-50 border border-teal-200 shadow-glass flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0B1220]">Want to see your personal AI Match Scores on every job?</div>
              <div className="text-[11px] text-[#526071]">Upload your resume to calculate personalized match percentages and skill gaps.</div>
            </div>
          </div>
          <button
            onClick={onOpenUpload}
            className="btn-shimmer px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-teal-glow"
          >
            Upload Resume
          </button>
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-card rounded-3xl p-6 h-56 animate-pulse bg-white border border-[#E5EAF0]" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-[#E5EAF0] bg-white">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-[#0B1220]">No job postings found</h3>
          <p className="text-xs text-[#526071] max-w-md mx-auto">
            Try adjusting your search criteria, clearing keyword filters, or expanding location parameters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setLocationQuery('');
              setSelectedLocationType('all');
              setSelectedJobType('all');
              setSelectedExpLevel('all');
              fetchJobs();
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0B1220]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={(j) => setSelectedJob(j)}
              onApplied={fetchJobs}
            />
          ))}
        </div>
      )}

      {/* Detailed Modal on Job Click */}
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApplied={fetchJobs}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
};
