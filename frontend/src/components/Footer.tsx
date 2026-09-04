import React from 'react';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="relative bg-white border-t border-[#E5EAF0] pt-16 pb-12 overflow-hidden">
      {/* Background glow ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-gradient-to-b from-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#E5EAF0]">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0B1220]">
                JobMatch <span className="text-teal-700 font-mono text-sm">AI</span>
              </span>
            </div>
            <p className="text-sm text-[#526071] max-w-sm leading-relaxed">
              Your career. Matched intelligently. Connecting exceptional talent with forward-thinking teams using real-time NLP and deep skill ontology matching.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                NLP Engine Active v1.0
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-4 font-mono">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('jobs')} className="text-[#526071] hover:text-teal-700 transition-colors">
                  Find Jobs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="text-[#526071] hover:text-teal-700 transition-colors">
                  Resume Matching
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('recruiter')} className="text-[#526071] hover:text-teal-700 transition-colors">
                  For Recruiters
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('candidate-dashboard')} className="text-[#526071] hover:text-teal-700 transition-colors">
                  Candidate Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-4 font-mono">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('about')} className="text-[#526071] hover:text-teal-700 transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="text-[#526071] hover:text-teal-700 transition-colors">
                  Technology Stack
                </a>
              </li>
              <li>
                <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="text-[#526071] hover:text-teal-700 transition-colors inline-flex items-center gap-1">
                  API Docs <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-4 font-mono">Security</h4>
            <ul className="space-y-2.5 text-sm text-[#526071]">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>JWT Encrypted Auth</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Private Resume Vectorization</span>
              </li>
              <li className="text-xs text-slate-400 pt-2">
                Privacy & Data Protected
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526071]">
          <div>
            © 2026 JobMatch AI. Built with precision for modern tech careers.
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-6">
            <span>FastAPI + Scikit-Learn + React + Three.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
