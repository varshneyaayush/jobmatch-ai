import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Users, Sparkles, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { JobCandidate } from '../types';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [candidates, setCandidates] = useState<JobCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [, setLoading] = useState(true);

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState(user?.company_name || 'TechPulse AI');
  const [newLocation, setNewLocation] = useState('San Francisco, CA');
  const [newLocationType, setNewLocationType] = useState('Hybrid');
  const [newJobType] = useState('Full-time');
  const [newExpLevel] = useState('Senior');
  const [newExpYears] = useState(3.5);
  const [newSalaryText, setNewSalaryText] = useState('$140,000 - $180,000 / yr');
  const [newSkills, setNewSkills] = useState('Python, PyTorch, Docker, FastAPI, AWS');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements] = useState('');
  const [submittingJob, setSubmittingJob] = useState(false);

  const fetchRecruiterJobs = async () => {
    setLoading(true);
    try {
      const data = await api.jobs.getRecruiterJobs();
      setJobs(data);
      if (data.length > 0 && !selectedJob) {
        setSelectedJob(data[0]);
        fetchCandidates(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async (jobId: number) => {
    setLoadingCandidates(true);
    try {
      const data = await api.applications.getJobCandidates(jobId);
      setCandidates(data);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
  }, []);

  const handleSelectJob = (job: any) => {
    setSelectedJob(job);
    fetchCandidates(job.id);
  };

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      await api.applications.updateStatus(applicationId, newStatus);
      if (selectedJob) fetchCandidates(selectedJob.id);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCreateJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingJob(true);
    try {
      const skillsArray = newSkills.split(',').map((s) => s.trim()).filter(Boolean);
      await api.jobs.createJob({
        title: newTitle.trim(),
        company: newCompany.trim(),
        location: newLocation.trim(),
        location_type: newLocationType,
        job_type: newJobType,
        experience_level: newExpLevel,
        experience_years_required: Number(newExpYears),
        salary_text: newSalaryText.trim(),
        description: newDescription.trim(),
        requirements: newRequirements.trim() || undefined,
        skills: skillsArray,
      });
      setIsCreatingJob(false);
      setNewTitle('');
      setNewDescription('');
      fetchRecruiterJobs();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to create job posting');
    } finally {
      setSubmittingJob(false);
    }
  };

  const totalApplications = jobs.reduce((acc, j) => acc + (j.applications_count || 0), 0);
  const topMatch = jobs.reduce((max, j) => Math.max(max, j.top_match_score || 0), 0) || 94;

  return (
    <div className="min-h-screen bg-[#F7F9FC] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5EAF0]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-blue-700" />
            Recruiter Talent & Ranking Portal
          </div>
          <h1 className="text-3xl font-extrabold text-[#0B1220] tracking-tight">
            {user?.company_name || 'TechPulse AI'} Recruiting Hub
          </h1>
          <p className="text-xs text-[#526071] mt-1 font-medium">
            Recruiter: {user?.name || 'Sarah Jenkins'} | AI-ranked applicant workflows
          </p>
        </div>

        <button
          onClick={() => setIsCreatingJob(true)}
          className="btn-shimmer flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-teal-glow self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Recruiter Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-3xl border border-[#E5EAF0] shadow-glass">
          <span className="text-[11px] font-mono uppercase text-[#526071] font-bold tracking-wider">Active Jobs</span>
          <div className="text-3xl font-bold font-mono text-[#0B1220] mt-1">{jobs.length}</div>
          <span className="text-[11px] text-[#526071] font-medium mt-0.5 block">Live open requisitions</span>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-[#E5EAF0] shadow-glass">
          <span className="text-[11px] font-mono uppercase text-[#526071] font-bold tracking-wider">Total Applications</span>
          <div className="text-3xl font-bold font-mono text-teal-700 mt-1">{totalApplications}</div>
          <span className="text-[11px] text-[#526071] font-medium mt-0.5 block">Parsed candidate profiles</span>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-[#E5EAF0] shadow-glass">
          <span className="text-[11px] font-mono uppercase text-[#526071] font-bold tracking-wider">Shortlisted Candidates</span>
          <div className="text-3xl font-bold font-mono text-blue-700 mt-1">
            {candidates.filter((c) => ['Shortlisted', 'Interview', 'Selected'].includes(c.status)).length}
          </div>
          <span className="text-[11px] text-[#526071] font-medium mt-0.5 block">Active interview pipeline</span>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-teal-200 shadow-glass">
          <span className="text-[11px] font-mono uppercase text-[#526071] font-bold tracking-wider">Top Candidate Match</span>
          <div className="text-3xl font-bold font-mono text-emerald-700 mt-1">{topMatch}%</div>
          <span className="text-[11px] text-[#526071] font-medium mt-0.5 block">Deep ML score alignment</span>
        </div>
      </div>

      {/* Main Recruiter Work Area: Jobs Column + Ranked Applicants Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Job Postings List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wider font-mono">
              Your Job Postings ({jobs.length})
            </h3>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-300 shadow-teal-glow'
                      : 'glass-card border-[#E5EAF0] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1220]">{job.title}</h4>
                      <div className="text-xs text-[#526071] mt-0.5">
                        {job.location} • {job.job_type}
                      </div>
                    </div>
                    {job.top_match_score > 0 && (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Top {job.top_match_score}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 text-xs">
                    <span className="text-teal-800 font-mono font-bold">
                      {job.applications_count || 0} applicants
                    </span>
                    <span className="text-[#526071] font-mono text-[11px]">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI-Ranked Candidates for Selected Job */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0B1220] uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700" />
                AI Candidate Ranking & Compatibility
              </h3>
              <p className="text-xs text-[#526071] mt-0.5 font-medium">
                Role: <strong className="text-[#0B1220]">{selectedJob?.title || 'Selected Position'}</strong>
              </p>
            </div>
            <span className="text-xs text-[#526071] font-mono font-bold">{candidates.length} candidates</span>
          </div>

          {loadingCandidates ? (
            <div className="p-12 text-center text-xs text-[#526071] animate-pulse glass-card rounded-3xl">
              Running AI Cosine Similarity ranking on applicants...
            </div>
          ) : candidates.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-3xl border border-[#E5EAF0] space-y-3">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-[#0B1220]">No applicants yet for this job</h4>
              <p className="text-xs text-[#526071] max-w-sm mx-auto">
                Candidate applications will automatically be ranked by AI match score here as candidates apply.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((cand, idx) => (
                <div
                  key={cand.application_id}
                  className="glass-card p-6 rounded-3xl border border-[#E5EAF0] space-y-4 relative overflow-hidden shadow-glass"
                >
                  {/* Rank Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5EAF0]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-300 text-teal-900 font-mono font-bold text-sm flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0B1220]">{cand.candidate_name}</h4>
                        <div className="text-xs text-[#526071]">{cand.headline || 'Software Engineer'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono text-teal-800 uppercase font-bold">AI Match</span>
                        <span className="text-lg font-bold font-mono text-teal-700">{cand.match_score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Match Breakdown */}
                  <div className="space-y-2 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-[#526071] font-mono mr-1 font-semibold">Matched:</span>
                      {cand.matched_skills?.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                        >
                          ✓ {s}
                        </span>
                      ))}
                      {cand.missing_skills?.length > 0 && (
                        <>
                          <span className="text-[11px] text-[#526071] font-mono ml-2 mr-1 font-semibold">Missing:</span>
                          {cand.missing_skills.map((ms) => (
                            <span
                              key={ms}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-50 text-rose-800 border border-rose-200 font-medium"
                            >
                              × {ms}
                            </span>
                          ))}
                        </>
                      )}
                    </div>

                    {cand.cover_note && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-[#E5EAF0] text-[#0B1220] italic text-[11px]">
                        "{cand.cover_note}"
                      </div>
                    )}
                  </div>

                  {/* Status update controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5EAF0]">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#526071] font-mono font-semibold">Status:</span>
                      <select
                        value={cand.status}
                        onChange={(e) => handleStatusChange(cand.application_id, e.target.value)}
                        className="glass-input rounded-xl px-3 py-1 text-xs bg-white text-teal-900 border border-teal-300 font-bold"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <span className="text-[11px] text-[#526071] font-mono font-medium">
                      Applied {new Date(cand.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Job Modal */}
      <AnimatePresence>
        {isCreatingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white border border-[#E5EAF0] rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-8 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF0]">
                <h3 className="text-lg font-bold text-[#0B1220]">Create New Job Posting</h3>
                <button onClick={() => setIsCreatingJob(false)} className="text-slate-400 hover:text-[#0B1220]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateJobSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#0B1220] font-bold mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Senior Machine Learning Engineer"
                      className="w-full glass-input rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[#0B1220] font-bold mb-1">Company</label>
                    <input
                      type="text"
                      required
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="e.g. TechPulse AI"
                      className="w-full glass-input rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#0B1220] font-bold mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full glass-input rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[#0B1220] font-bold mb-1">Location Type</label>
                    <select
                      value={newLocationType}
                      onChange={(e) => setNewLocationType(e.target.value)}
                      className="w-full glass-input rounded-xl p-2.5 bg-white font-medium"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#0B1220] font-bold mb-1">Salary Range</label>
                    <input
                      type="text"
                      value={newSalaryText}
                      onChange={(e) => setNewSalaryText(e.target.value)}
                      placeholder="$140k - $180k / yr"
                      className="w-full glass-input rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#0B1220] font-bold mb-1">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    required
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    placeholder="Python, PyTorch, Docker, FastAPI, AWS"
                    className="w-full glass-input rounded-xl p-2.5 font-mono text-teal-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#0B1220] font-bold mb-1">Job Description</label>
                  <textarea
                    rows={4}
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe role mission and daily objectives..."
                    className="w-full glass-input rounded-xl p-2.5 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E5EAF0]">
                  <button
                    type="button"
                    onClick={() => setIsCreatingJob(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-[#526071] hover:bg-slate-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingJob}
                    className="btn-shimmer px-6 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold shadow-teal-glow"
                  >
                    {submittingJob ? 'Publishing...' : 'Publish Job'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
