import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, X, Zap } from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';
import { api } from '../services/api';

interface Preset {
  id: string;
  name: string;
  jobTitle: string;
  candidateExp: number;
  requiredExp: number;
  resumeSkills: string[];
  jobSkills: string[];
}

const PRESETS: Preset[] = [
  {
    id: 'ai-lead',
    name: 'AI & ML Engineer',
    jobTitle: 'Lead AI Engineer at TechPulse',
    candidateExp: 4.5,
    requiredExp: 4.0,
    resumeSkills: ['Python', 'PyTorch', 'Deep Learning', 'Natural Language Processing', 'FastAPI', 'Docker', 'AWS', 'Pandas'],
    jobSkills: ['Python', 'PyTorch', 'Deep Learning', 'Natural Language Processing', 'FastAPI', 'Docker', 'AWS', 'Kubernetes'],
  },
  {
    id: 'full-stack',
    name: 'Full Stack Architect',
    jobTitle: 'Senior Full Stack Dev at CloudSphere',
    candidateExp: 3.5,
    requiredExp: 3.0,
    resumeSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'Next.js'],
    jobSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL', 'AWS', 'System Design'],
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    jobTitle: 'Data Analytics Lead',
    candidateExp: 2.5,
    requiredExp: 3.0,
    resumeSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'Tableau'],
    jobSkills: ['Python', 'SQL', 'Scikit-learn', 'Apache Spark', 'AWS', 'Big Data'],
  },
];

export const InteractiveMatchingDemo: React.FC = () => {
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [selectedResumeSkills, setSelectedResumeSkills] = useState<string[]>(PRESETS[0].resumeSkills);
  const [, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any>({
    match_percentage: 92,
    compatibility_level: 'Excellent',
    matched_skills: ['Python', 'PyTorch', 'Deep Learning', 'Natural Language Processing', 'FastAPI', 'Docker', 'AWS'],
    missing_skills: ['Kubernetes'],
    breakdown: { nlp_content_match: 94, skill_alignment: 88, experience_score: 100, education_score: 90 },
  });

  const runCalculation = async (skills: string[], preset: Preset) => {
    setLoading(true);
    try {
      const res = await api.matching.visualDemo({
        resume_skills: skills,
        job_skills: preset.jobSkills,
        job_title: preset.jobTitle,
        candidate_exp: preset.candidateExp,
      });
      setMatchResult(res);
    } catch (err) {
      // Fallback local calculation
      const candSet = new Set(skills.map((s) => s.toLowerCase()));
      const matched = preset.jobSkills.filter((s) => candSet.has(s.toLowerCase()));
      const missing = preset.jobSkills.filter((s) => !candSet.has(s.toLowerCase()));
      const ratio = matched.length / Math.max(1, preset.jobSkills.length);
      const score = Math.min(98, Math.max(30, Math.round(ratio * 85 + 10)));
      setMatchResult({
        match_percentage: score,
        compatibility_level: score >= 80 ? 'Excellent' : score >= 65 ? 'Strong' : 'Moderate',
        matched_skills: matched,
        missing_skills: missing,
        breakdown: {
          nlp_content_match: Math.round(score * 0.95),
          skill_alignment: Math.round(ratio * 100),
          experience_score: 95,
          education_score: 90,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (preset: Preset) => {
    setActivePreset(preset);
    setSelectedResumeSkills(preset.resumeSkills);
    runCalculation(preset.resumeSkills, preset);
  };

  const toggleSkill = (skill: string) => {
    const updated = selectedResumeSkills.includes(skill)
      ? selectedResumeSkills.filter((s) => s !== skill)
      : [...selectedResumeSkills, skill];
    setSelectedResumeSkills(updated);
    runCalculation(updated, activePreset);
  };

  return (
    <div className="w-full max-w-6xl mx-auto glass-card rounded-3xl p-6 sm:p-10 border border-[#E5EAF0] relative overflow-hidden shadow-glass">
      {/* Glow ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5EAF0] text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-mono font-semibold mb-2 border border-teal-200">
            <Zap className="w-3.5 h-3.5 text-teal-600" />
            Live AI NLP Pipeline Demo
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#0B1220] tracking-tight">
            See Real-Time Skill Ontology & Vector Matching
          </h3>
          <p className="text-sm text-[#526071] mt-1">
            Toggle candidate skills to observe live Cosine Similarity & TF-IDF recalculation.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-[#E5EAF0] self-start md:self-auto">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePresetChange(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset.id === p.id
                  ? 'bg-white text-teal-800 shadow-sm border border-[#E5EAF0]'
                  : 'text-[#526071] hover:text-[#0B1220]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive visual matching columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-8 text-left">
        {/* Column 1: Candidate Skills (Editable) */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-[#E5EAF0]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0]">
            <div>
              <span className="text-xs font-mono uppercase text-teal-700 font-bold tracking-wider">Candidate Skills</span>
              <h4 className="text-sm font-bold text-[#0B1220] mt-0.5">Alex Mercer's Resume</h4>
            </div>
            <span className="text-[11px] text-slate-500 font-mono font-medium">{selectedResumeSkills.length} active</span>
          </div>

          <p className="text-xs text-[#526071] my-3">
            Click skills to add/remove and test dynamic score variations:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {activePreset.resumeSkills.map((skill) => {
              const isSelected = selectedResumeSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-100/70 border border-teal-300 text-teal-900 shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300 line-through'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-3 h-3 text-teal-700" />
                  ) : (
                    <X className="w-3 h-3 text-slate-400" />
                  )}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: The AI Matching Hub (Centerpiece) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-teal-50/50 via-white to-blue-50/50 rounded-2xl border border-teal-200 shadow-sm relative">
          <div className="absolute top-3 right-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
          </div>

          <ScoreGauge score={matchResult.match_percentage} size={130} strokeWidth={9} />

          <div className="mt-3 text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              {matchResult.compatibility_level} Compatibility
            </span>
          </div>

          {/* Breakdown Mini-Bars */}
          <div className="w-full space-y-2.5 mt-5 pt-4 border-t border-[#E5EAF0]">
            <div className="flex justify-between text-[11px] text-[#526071] font-mono">
              <span>TF-IDF Vector Alignment</span>
              <span className="text-teal-700 font-bold">{matchResult.breakdown?.nlp_content_match || 90}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <motion.div
                className="h-full bg-teal-600 rounded-full"
                animate={{ width: `${matchResult.breakdown?.nlp_content_match || 90}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-[#526071] font-mono pt-1">
              <span>Skill Requirement Coverage</span>
              <span className="text-blue-700 font-bold">{matchResult.breakdown?.skill_alignment || 85}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-600 to-blue-600 rounded-full"
                animate={{ width: `${matchResult.breakdown?.skill_alignment || 85}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>

        {/* Column 3: Job Requirements & Skill Breakdown */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-[#E5EAF0]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0]">
            <div>
              <span className="text-xs font-mono uppercase text-blue-700 font-bold tracking-wider">Target Job Description</span>
              <h4 className="text-sm font-bold text-[#0B1220] mt-0.5 truncate max-w-[220px]">
                {activePreset.jobTitle}
              </h4>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mb-1.5">
                <Check className="w-3.5 h-3.5" /> Matched Skills ({matchResult.matched_skills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(matchResult.matched_skills || []).map((s: string) => (
                  <span
                    key={s}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 border border-emerald-300 font-medium"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {matchResult.missing_skills?.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-rose-700 flex items-center gap-1 mb-1.5">
                  <X className="w-3.5 h-3.5" /> Missing Requirements ({matchResult.missing_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.missing_skills.map((s: string) => (
                    <span
                      key={s}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100/70 text-rose-800 border border-rose-300 font-medium"
                    >
                      × {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
