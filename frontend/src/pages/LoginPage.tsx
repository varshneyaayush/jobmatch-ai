import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  User,
  Briefcase,
  ShieldCheck,
  Mail,
  Lock,
  Building,
  ArrowRight,
  ArrowLeft,
  Phone,
  Upload,
  FileText,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface LoginPageProps {
  onSuccessRedirect?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessRedirect }) => {
  const { login, demoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Registration Wizard Step: 1 = Details, 2 = Resume, 3 = Password, 4 = OTP Verification
  const [regStep, setRegStep] = useState<number>(1);
  const [role, setRole] = useState<'job_seeker' | 'recruiter' | 'admin'>('job_seeker');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Staged Resume State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [tempResumePath, setTempResumePath] = useState<string | null>(null);
  const [tempResumeName, setTempResumeName] = useState<string | null>(null);
  const [parsedSkillsPreview, setParsedSkillsPreview] = useState<string[]>([]);
  const [parsedScorePreview, setParsedScorePreview] = useState<number | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // OTP Cooldown Timer
  const [cooldown, setCooldown] = useState<number>(0);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const resetForm = () => {
    setRegStep(1);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setCompanyName('');
    setOtpCode('');
    setResumeFile(null);
    setTempResumePath(null);
    setTempResumeName(null);
    setParsedSkillsPreview([]);
    setParsedScorePreview(null);
    setError(null);
    setSuccessMsg(null);
  };

  // RETURNING USER LOGIN
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.login({
        email: email.trim().toLowerCase(),
        password,
      });
      login(res.access_token, res.user);
      if (onSuccessRedirect) onSuccessRedirect();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 1-CLICK DEMO LOGIN
  const handleDemoClick = async (demoRole: 'job_seeker' | 'recruiter' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(demoRole);
      if (onSuccessRedirect) onSuccessRedirect();
    } catch (err: any) {
      setError('Failed to log in with demo profile.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: TEMP RESUME UPLOAD
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
      setError('Unsupported format. Please upload a PDF or DOCX file.');
      return;
    }

    setResumeFile(file);
    setIsUploadingResume(true);
    setError(null);

    try {
      const res = await api.resume.uploadTempResume(file);
      if (res.success) {
        setTempResumePath(res.temp_resume_path);
        setTempResumeName(res.file_name);
        setParsedSkillsPreview(res.skills || []);
        setParsedScorePreview(res.score || 70);
        setSuccessMsg('Resume parsed successfully!');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to parse uploaded resume.');
      setResumeFile(null);
    } finally {
      setIsUploadingResume(false);
    }
  };

  // STEP 3 -> STEP 4: SEND REAL SMTP OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.sendOtp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        company_name: role === 'recruiter' ? companyName.trim() : undefined,
        phone: phone.trim() || undefined,
        temp_resume_path: tempResumePath || undefined,
        temp_resume_name: tempResumeName || undefined,
      });

      setSuccessMsg(res.message || `Verification code sent to ${email}.`);
      setCooldown(res.cooldown_seconds || 60);
      setRegStep(4);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to send OTP verification email.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 4: RESEND OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.auth.resendOtp({ email: email.trim().toLowerCase() });
      setSuccessMsg(res.message || 'A new verification code has been sent.');
      setCooldown(res.cooldown_seconds || 60);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 4: VERIFY OTP & CREATE ACCOUNT
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the exact 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        otp_code: otpCode.trim(),
      });

      login(res.access_token, res.user);
      if (onSuccessRedirect) onSuccessRedirect();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0B1220] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-teal-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center space-y-2 z-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-blue-600 p-[1.5px] shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-teal-700" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1220] flex items-center gap-2">
          JobMatch <span className="text-teal-700 font-mono text-xs uppercase px-2 py-0.5 rounded bg-teal-50 border border-teal-200">AI</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium max-w-sm">
          Intelligent AI-Powered Resume Matching & Career Platform
        </p>
      </div>

      {/* Main Authentication Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white border border-[#E5EAF0] rounded-3xl shadow-2xl overflow-hidden relative z-10 text-left"
      >
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-[#E5EAF0] bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-700" />
            </div>
            <span className="text-sm font-bold text-[#0B1220]">
              {mode === 'login' ? 'Sign In to JobMatch AI' : 'Create JobMatch AI Account'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* RETURNING USER LOGIN MODE */}
          {mode === 'login' && (
            <div className="space-y-4">
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

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
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
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMode('register');
                    resetForm();
                  }}
                  className="text-xs text-[#526071] hover:text-teal-800 transition-colors"
                >
                  Don't have an account? <strong className="text-teal-700 underline font-semibold">Create Account</strong>
                </button>
              </div>
            </div>
          )}

          {/* NEW USER MULTI-STEP REGISTRATION ONBOARDING FLOW */}
          {mode === 'register' && (
            <div className="space-y-4">
              {/* Step Progress Bar */}
              <div className="flex items-center justify-between px-1">
                {[
                  { num: 1, label: 'Details' },
                  { num: 2, label: 'Resume' },
                  { num: 3, label: 'Security' },
                  { num: 4, label: 'OTP' },
                ].map((s) => (
                  <div key={s.num} className="flex items-center space-x-1.5">
                    <div
                      className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-all ${
                        regStep === s.num
                          ? 'bg-[#0F766E] text-white shadow-teal-glow'
                          : regStep > s.num
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {regStep > s.num ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" /> : s.num}
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        regStep === s.num ? 'text-[#0B1220]' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#0F766E] h-full transition-all duration-300"
                  style={{ width: `${(regStep / 4) * 100}%` }}
                />
              </div>

              {/* STEP 1: PERSONAL DETAILS */}
              {regStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5">
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
                    <label className="block text-xs font-bold text-[#0B1220] mb-1">Phone Number (Optional)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
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

                  <button
                    type="button"
                    onClick={() => {
                      if (!name.trim() || !email.trim()) {
                        setError('Please enter your name and email address.');
                        return;
                      }
                      setError(null);
                      setRegStep(role === 'job_seeker' ? 2 : 3);
                    }}
                    className="w-full btn-shimmer py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-teal-glow flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Next: {role === 'job_seeker' ? 'Upload Resume' : 'Create Password'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: RESUME UPLOAD */}
              {regStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5">
                  <div className="text-center space-y-1">
                    <h4 className="text-xs font-bold text-[#0B1220]">Upload Your Resume</h4>
                    <p className="text-[11px] text-slate-500">
                      Our AI will parse your skills & experience automatically for instant job matching.
                    </p>
                  </div>

                  <div className="border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/40 rounded-2xl p-4 text-center transition-all relative">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {isUploadingResume ? (
                      <div className="flex flex-col items-center justify-center space-y-2 py-2">
                        <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
                        <span className="text-xs font-semibold text-teal-800">Parsing resume text & extracting skills...</span>
                      </div>
                    ) : resumeFile ? (
                      <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
                        <FileText className="w-7 h-7 text-teal-700" />
                        <span className="text-xs font-bold text-[#0B1220]">{resumeFile.name}</span>
                        <span className="text-[11px] text-teal-700 font-semibold bg-teal-100 px-2 py-0.5 rounded-full">
                          AI Resume Score: {parsedScorePreview || 75}/100
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 py-2">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-semibold text-[#0B1220]">
                          Click to browse or drag PDF/DOCX here
                        </div>
                        <span className="text-[10px] text-slate-400">Supported formats: PDF, DOCX (Max 10MB)</span>
                      </div>
                    )}
                  </div>

                  {parsedSkillsPreview.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detected Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {parsedSkillsPreview.slice(0, 8).map((sk, idx) => (
                          <span key={idx} className="text-[10px] font-semibold bg-white text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md">
                            {sk}
                          </span>
                        ))}
                        {parsedSkillsPreview.length > 8 && (
                          <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                            +{parsedSkillsPreview.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setRegStep(1);
                      }}
                      className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-[#526071] hover:bg-slate-50 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setRegStep(3);
                      }}
                      className="flex-1 btn-shimmer py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-teal-glow flex items-center justify-center gap-2"
                    >
                      <span>{resumeFile ? 'Next: Create Password' : 'Skip & Create Password'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CREATE PASSWORD */}
              {regStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5">
                  <form onSubmit={handleSendOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1220] mb-1">Create Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full glass-input rounded-xl py-2.5 pl-9 pr-3 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B1220] mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full glass-input rounded-xl py-2.5 pl-9 pr-3 text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                      <div className="font-semibold text-[#0B1220]">Security & Verification Notice:</div>
                      <div>A 6-digit email OTP will be sent to <strong>{email}</strong> via SMTP for initial email verification.</div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setRegStep(role === 'job_seeker' ? 2 : 1);
                        }}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-[#526071] hover:bg-slate-50 flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-shimmer py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-teal-glow flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span>Sending Verification Code...</span>
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 4: OTP VERIFICATION */}
              {regStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-[#0B1220]">Enter Email Verification Code</h4>
                    <p className="text-[11px] text-slate-500">
                      We sent a 6-digit code to <strong className="text-teal-800">{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full text-center text-xl font-mono font-bold tracking-widest py-3 rounded-2xl bg-teal-50/50 border-2 border-teal-200 text-teal-900 focus:outline-none focus:border-teal-600 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-shimmer py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-teal-glow flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span>Verifying Code & Creating Account...</span>
                      ) : (
                        <>
                          <span>Verify & Create Account</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Didn't receive the code?</span>
                    <button
                      type="button"
                      disabled={cooldown > 0 || loading}
                      onClick={handleResendOtp}
                      className={`font-semibold flex items-center gap-1 ${
                        cooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-teal-700 underline hover:text-teal-900'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      onClick={() => setRegStep(3)}
                      className="text-xs text-slate-500 underline hover:text-slate-700"
                    >
                      Change password or details
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMode('login');
                    resetForm();
                  }}
                  className="text-xs text-[#526071] hover:text-teal-800 transition-colors"
                >
                  Already have an account? <strong className="text-teal-700 underline font-semibold">Sign In</strong>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
