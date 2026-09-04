import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, X,
  ArrowRight, Check
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ScoreGauge } from './ScoreGauge';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STAGES = [
  { step: 1, label: 'Reading Resume Document', desc: 'Parsing binary streams via PyMuPDF / python-docx' },
  { step: 2, label: 'Extracting Information', desc: 'Isolating contact, education, summary & work history' },
  { step: 3, label: 'Detecting Skills', desc: 'Running taxonomy matching against 500+ tech skills' },
  { step: 4, label: 'Understanding Experience', desc: 'Synthesizing career trajectory & seniority heuristics' },
  { step: 5, label: 'Matching Opportunities', desc: 'Calculating dynamic TF-IDF Cosine Similarity' },
];

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validExts = ['.pdf', '.docx', '.doc', '.txt'];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError('Please select a valid PDF or DOCX file format.');
      return;
    }
    setSelectedFile(file);
    processUpload(file);
  };

  const processUpload = async (file: File) => {
    setIsProcessing(true);
    setCurrentStage(1);
    setError(null);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    try {
      const result = await api.resume.uploadResume(file);
      clearInterval(stageInterval);
      setCurrentStage(5);
      await new Promise((r) => setTimeout(r, 400));
      setAnalysisResult(result);
      if (user) await refreshUser();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      clearInterval(stageInterval);
      setError(err?.response?.data?.detail || 'Failed to parse resume. Please ensure file is accessible.');
      setIsProcessing(false);
    }
  };

  const handleLoadSample = async (sampleType: 'ai_engineer' | 'fullstack') => {
    setIsProcessing(true);
    setCurrentStage(1);
    setError(null);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 500);

    try {
      const result = await api.resume.loadSampleResume(sampleType);
      clearInterval(stageInterval);
      setCurrentStage(5);
      await new Promise((r) => setTimeout(r, 300));
      setAnalysisResult(result);
      if (user) await refreshUser();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      clearInterval(stageInterval);
      setError('Failed to load sample resume.');
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setCurrentStage(1);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white border border-[#E5EAF0] rounded-3xl shadow-2xl overflow-hidden relative text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF0] bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1220]">AI Resume Parser & Analysis</h3>
              <p className="text-xs text-[#526071]">Extract skills, calculate score & match jobs</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B1220] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {!isProcessing && !analysisResult && (
            <div>
              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? 'border-teal-600 bg-teal-50/80 shadow-teal-glow'
                    : 'border-slate-300 bg-slate-50/50 hover:border-teal-500 hover:bg-teal-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-4 text-teal-700">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-[#0B1220]">
                  Drop your resume here, or <span className="text-teal-700 underline">browse</span>
                </h4>
                <p className="text-xs text-[#526071] mt-1.5">
                  Supports PDF & DOCX (up to 15MB). We extract skills, experience & education securely.
                </p>
              </div>

              {/* Sample Resume Quick Load */}
              <div className="mt-6 pt-5 border-t border-[#E5EAF0]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-[#526071] font-semibold">Or test with a pre-formatted resume:</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleLoadSample('ai_engineer')}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-[#E5EAF0] hover:border-teal-300 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-teal-700" />
                      <div>
                        <div className="text-xs font-bold text-[#0B1220] group-hover:text-teal-900">Alex Mercer</div>
                        <div className="text-[10px] text-[#526071]">Senior AI / ML Engineer</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => handleLoadSample('fullstack')}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-[#E5EAF0] hover:border-blue-300 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-700" />
                      <div>
                        <div className="text-xs font-bold text-[#0B1220] group-hover:text-blue-900">Sophia Chen</div>
                        <div className="text-[10px] text-[#526071]">Full Stack Engineer</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Processing Animation */}
          {isProcessing && !analysisResult && (
            <div className="py-8 px-4 text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-teal-200 border-t-teal-600 animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-blue-200 border-b-blue-600 animate-spin" style={{ animationDirection: 'reverse' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-teal-600 animate-pulse" />
                </div>
              </div>

              <h4 className="text-lg font-bold text-[#0B1220] mb-2">Analyzing Resume with AI</h4>
              <p className="text-xs text-[#526071] mb-8 max-w-sm mx-auto">
                Running real-time NLP text parsing, entity extraction, and matching pipelines.
              </p>

              {/* Progress Steps */}
              <div className="space-y-3 text-left max-w-md mx-auto">
                {STAGES.map((s) => {
                  const isDone = s.step < currentStage;
                  const isCurrent = s.step === currentStage;
                  return (
                    <div
                      key={s.step}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-teal-50 border border-teal-300'
                          : isDone
                          ? 'bg-slate-50 text-[#526071]'
                          : 'opacity-40'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 text-[10px] flex items-center justify-center text-slate-500">
                            {s.step}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isCurrent ? 'text-teal-900' : isDone ? 'text-[#0B1220]' : 'text-slate-500'}`}>
                          {s.label}
                        </div>
                        <div className="text-[11px] text-[#526071]">{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analysis Results View */}
          {analysisResult && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-teal-50 via-slate-50 to-blue-50 rounded-2xl border border-teal-200 shadow-xs">
                <div className="flex items-center gap-4">
                  <ScoreGauge score={analysisResult.score || analysisResult.resume_score || 85} size={90} strokeWidth={7} label="Resume Score" />
                  <div>
                    <div className="text-base font-bold text-[#0B1220]">{analysisResult.extracted_name || analysisResult.name || 'Candidate Profile'}</div>
                    <div className="text-xs text-[#526071] mt-0.5">{analysisResult.education || 'Computer Science'}</div>
                    <div className="text-xs text-teal-700 font-mono font-bold mt-1">
                      {analysisResult.experience_years} Years Experience Detected
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    resetModal();
                    onClose();
                  }}
                  className="btn-shimmer px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0F766E] text-white hover:bg-[#115E59] transition-colors shadow-teal-glow whitespace-nowrap"
                >
                  View Matched Jobs
                </button>
              </div>

              {/* Detected Skills */}
              <div>
                <h5 className="text-xs font-mono uppercase text-[#526071] font-bold tracking-wider mb-2">
                  Detected Industry Skills ({analysisResult.skills?.length || 0})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {(analysisResult.skills || []).map((s: string) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-[#E5EAF0]">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-2">
                    <Check className="w-3.5 h-3.5" /> Key Strengths
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#0B1220]">
                    {(analysisResult.strengths || ['Strong technical coverage']).map((st: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-[#E5EAF0]">
                  <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Recommended Additions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysisResult.recommended_skills || ['Docker', 'AWS', 'Kubernetes']).map((s: string) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200"
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
