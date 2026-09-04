import React from 'react';
import { motion } from 'framer-motion';
import {
  Upload, Search, Sparkles, CheckCircle2,
  Users, Award
} from 'lucide-react';
import { HeroScene } from '../three/HeroScene';
import { InteractiveMatchingDemo } from '../components/InteractiveMatchingDemo';

interface LandingPageProps {
  onOpenUpload: () => void;
  onExploreJobs: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenUpload,
  onExploreJobs,
  onOpenAuth,
}) => {
  return (
    <div className="relative min-h-screen bg-[#F7F9FC] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-teal-500/8 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[800px] left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH 3D CANVAS                                            */}
      {/* ========================================================================= */}
      <section className="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-6 text-left z-10"
          >
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5EAF0] shadow-xs backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
              </span>
              <span className="text-xs font-mono text-teal-800 font-bold tracking-wide">
                AI-powered resume matching
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B1220] leading-[1.1]">
              Find the job <br />
              <span className="text-gradient-hero">that fits you.</span>
            </h1>

            {/* Supporting Subtext */}
            <p className="text-base sm:text-lg text-[#526071] max-w-xl leading-relaxed font-normal">
              JobMatch AI understands your resume, analyzes your skills, and connects you with opportunities where you actually belong.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onOpenUpload}
                className="btn-shimmer flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-sm transition-all shadow-teal-glow"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resume</span>
              </button>

              <button
                onClick={onExploreJobs}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0B1220] font-bold text-sm border border-[#E5EAF0] shadow-xs transition-all"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Explore Jobs</span>
              </button>
            </div>

            {/* Micro Feature Bullet Points */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-[#526071] font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>PyMuPDF & Docx Parsing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>TF-IDF Vector NLP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No Guesswork</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Animated Hero Core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative w-full h-[440px] sm:h-[520px] rounded-3xl overflow-hidden glass-panel border border-[#E5EAF0] shadow-glass"
          >
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full border border-[#E5EAF0] text-[11px] font-mono text-[#0B1220] font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Three.js Real-Time Career Graph</span>
            </div>
            <HeroScene />
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. RESUME UPLOAD PROMO CTA                                                */}
      {/* ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-teal-50 via-white to-blue-50 border border-teal-200 shadow-glass flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-teal-800 font-bold tracking-wider">
              Instant AI Evaluation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1220] tracking-tight">
              Turn your resume into opportunities.
            </h2>
            <p className="text-sm text-[#526071] max-w-xl">
              Upload your PDF or DOCX file to get an immediate ATS compatibility score, extracted technical skills, and tailored job matches.
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="btn-shimmer flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs whitespace-nowrap shadow-teal-glow transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume Now</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS SECTION                                                   */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase text-teal-800 font-bold tracking-wider">
            Intelligent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1220] tracking-tight">
            How AI Matching Works
          </h2>
          <p className="text-sm text-[#526071]">
            From raw document parsing to verified recruiter placement in 4 transparent stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload Resume',
              desc: 'Upload your PDF or DOCX resume. Our parser isolates text streams and normalizes keywords without data loss.',
              color: 'text-teal-700',
              border: 'border-teal-200',
              bg: 'bg-teal-50/50',
            },
            {
              step: '02',
              title: 'AI Understands You',
              desc: 'Entity extraction detects technical proficiencies, seniority levels, project scopes, and credentials.',
              color: 'text-blue-700',
              border: 'border-blue-200',
              bg: 'bg-blue-50/50',
            },
            {
              step: '03',
              title: 'Jobs Are Matched',
              desc: 'Scikit-learn TF-IDF vectorization and Cosine Similarity compute objective match percentages across all database jobs.',
              color: 'text-cyan-700',
              border: 'border-cyan-200',
              bg: 'bg-cyan-50/50',
            },
            {
              step: '04',
              title: 'Apply With Confidence',
              desc: 'View matched vs missing skills, experience compatibility, and submit applications directly to top recruiters.',
              color: 'text-emerald-700',
              border: 'border-emerald-200',
              bg: 'bg-emerald-50/50',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`glass-card p-6 rounded-2xl border ${item.border} text-left space-y-3 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold font-mono ${item.color}`}>{item.step}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-[#0B1220]">{item.title}</h3>
              <p className="text-xs text-[#526071] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. VISUAL MATCHING DEMO                                                   */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <InteractiveMatchingDemo />
      </section>

      {/* ========================================================================= */}
      {/* 5. CANDIDATE VS RECRUITER BENEFIT SPLIT                                   */}
      {/* ========================================================================= */}
      <section id="recruiter" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          {/* Candidate Card */}
          <div className="glass-card p-8 sm:p-10 rounded-3xl border border-teal-200 space-y-6 relative overflow-hidden shadow-glass">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-mono font-bold">
              <Users className="w-3.5 h-3.5 text-teal-700" />
              For Job Seekers
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0B1220] tracking-tight">
              Stop guessing. Know your exact match score before applying.
            </h3>
            <ul className="space-y-3 text-sm text-[#526071]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span>See matched skills vs missing skills on every single job posting.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span>Automated resume quality score out of 100 with actionable feedback.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span>One-click applications with live tracking from Applied to Selected.</span>
              </li>
            </ul>
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition-all shadow-xs"
            >
              Analyze My Resume
            </button>
          </div>

          {/* Recruiter Card */}
          <div className="glass-card p-8 sm:p-10 rounded-3xl border border-blue-200 space-y-6 relative overflow-hidden shadow-glass">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold">
              <Award className="w-3.5 h-3.5 text-blue-700" />
              For Recruiters & Hiring Managers
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0B1220] tracking-tight">
              AI candidate ranking that cuts screening time by 80%.
            </h3>
            <ul className="space-y-3 text-sm text-[#526071]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Applicants automatically ranked by mathematical compatibility score.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Instant breakdown of skill overlap, seniority, and degree alignment.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Manage job postings, pipeline stages, and applicant shortlists effortlessly.</span>
              </li>
            </ul>
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold transition-all shadow-xs"
            >
              Post a Job as Recruiter
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STATS & PLATFORM METRICS                                               */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[#E5EAF0] grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-white shadow-glass">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0B1220] font-mono">94.2%</div>
            <div className="text-xs text-[#526071] uppercase tracking-wider font-mono mt-1 font-bold">
              Matching Precision
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-700 font-mono">500+</div>
            <div className="text-xs text-[#526071] uppercase tracking-wider font-mono mt-1 font-bold">
              Indexed Tech Skills
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-700 font-mono">&lt; 50ms</div>
            <div className="text-xs text-[#526071] uppercase tracking-wider font-mono mt-1 font-bold">
              Vector Inference Time
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono">100%</div>
            <div className="text-xs text-[#526071] uppercase tracking-wider font-mono mt-1 font-bold">
              Dynamic Real Data Flow
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FINAL CALL TO ACTION                                                   */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8 relative">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-8 h-8 text-teal-700" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0B1220] tracking-tight max-w-3xl mx-auto">
          "Your next opportunity is closer than you think."
        </h2>

        <p className="text-base sm:text-lg text-[#526071] max-w-2xl mx-auto leading-relaxed">
          Upload your resume and discover jobs that match your skills, experience, and ambitions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onOpenUpload}
            className="btn-shimmer px-8 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-sm transition-all shadow-teal-glow flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume</span>
          </button>

          <button
            onClick={onExploreJobs}
            className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0B1220] font-bold text-sm border border-[#E5EAF0] shadow-xs transition-all"
          >
            Explore Jobs
          </button>
        </div>
      </section>
    </div>
  );
};
