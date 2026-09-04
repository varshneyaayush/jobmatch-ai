import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, User, Briefcase, ShieldCheck, Mail, Lock, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'job_seeker' | 'recruiter' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'job_seeker',
}) => {
  const { login, demoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'job_seeker' | 'recruiter' | 'admin'>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'register') {
        const res = await api.auth.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          company_name: role === 'recruiter' ? companyName.trim() : undefined,
        });
        login(res.access_token, res.user);
      } else {
        const res = await api.auth.login({
          email: email.trim().toLowerCase(),
          password,
        });
        login(res.access_token, res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoRole: 'job_seeker' | 'recruiter' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(demoRole);
      onClose();
    } catch (err: any) {
      setError('Failed to log in with demo profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white border border-[#E5EAF0] rounded-3xl shadow-2xl overflow-hidden relative text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF0] bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-700" />
            </div>
            <span className="text-sm font-bold text-[#0B1220]">
              {mode === 'login' ? 'Sign In to JobMatch AI' : 'Create JobMatch AI Account'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-[#0B1220] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* 1-Click Instant Demo Login Buttons */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
            <div className="text-[11px] font-mono text-teal-900 uppercase tracking-wider font-bold">
              Instant 1-Click Demo Profiles:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('job_seeker')}
                className="p-2.5 rounded-xl bg-white hover:bg-teal-100/70 text-[#0B1220] border border-teal-200 text-[11px] font-semibold transition-all text-center flex flex-col items-center gap-1 shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-teal-700" />
                <span>Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('recruiter')}
                className="p-2.5 rounded-xl bg-white hover:bg-blue-100/70 text-[#0B1220] border border-blue-200 text-[11px] font-semibold transition-all text-center flex flex-col items-center gap-1 shadow-2xs"
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                <span>Recruiter</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                className="p-2.5 rounded-xl bg-white hover:bg-purple-100/70 text-[#0B1220] border border-purple-200 text-[11px] font-semibold transition-all text-center flex flex-col items-center gap-1 shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2 text-[10px] text-slate-400 uppercase font-mono font-medium absolute">
              Or email credentials
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                {/* Role Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRole('job_seeker')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      role === 'job_seeker' ? 'bg-white text-teal-800 shadow-xs' : 'text-[#526071]'
                    }`}
                  >
                    Job Seeker
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      role === 'recruiter' ? 'bg-white text-blue-800 shadow-xs' : 'text-[#526071]'
                    }`}
                  >
                    Recruiter
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1220] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full glass-input rounded-xl py-2.5 pl-9 pr-3 text-xs"
                    />
                  </div>
                </div>

                {role === 'recruiter' && (
                  <div>
                    <label className="block text-xs font-bold text-[#0B1220] mb-1">Company Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="TechPulse AI"
                        className="w-full glass-input rounded-xl py-2.5 pl-9 pr-3 text-xs"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#0B1220] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.mercer@jobmatch.ai"
                  className="w-full glass-input rounded-xl py-2.5 pl-9 pr-3 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1220] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input rounded-xl py-2.5 pl-9 pr-3 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-shimmer py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-teal-glow flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-xs text-[#526071] hover:text-teal-800 transition-colors"
            >
              {mode === 'login' ? (
                <span>Don't have an account? <strong className="text-teal-700 underline font-semibold">Register</strong></span>
              ) : (
                <span>Already have an account? <strong className="text-teal-700 underline font-semibold">Sign In</strong></span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
