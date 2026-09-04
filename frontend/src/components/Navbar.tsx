import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, User, LogOut, Briefcase, ShieldCheck, ChevronDown, Menu, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'jobs', label: 'Find Jobs' },
    { id: 'recruiter', label: 'For Recruiters' },
    { id: 'about', label: 'About' },
  ];

  if (isAuthenticated) {
    if (user?.role === 'job_seeker') {
      navLinks.splice(3, 0, { id: 'candidate-dashboard', label: 'Dashboard' });
    } else if (user?.role === 'recruiter') {
      navLinks.splice(3, 0, { id: 'recruiter-dashboard', label: 'Recruiter Hub' });
    } else if (user?.role === 'admin') {
      navLinks.splice(3, 0, { id: 'admin-dashboard', label: 'Admin Panel' });
    }
  }

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (id === 'how-it-works' || id === 'about') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-[#E5EAF0] shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2.5 group focus:outline-none"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center p-[1px] shadow-sm">
              <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center transition-transform group-hover:scale-95 duration-200">
                <Sparkles className="w-4 h-4 text-teal-600 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-bold tracking-tight text-[#0B1220] flex items-center gap-1.5">
                JobMatch <span className="text-teal-700 font-mono text-xs uppercase px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200">AI</span>
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white/70 border border-[#E5EAF0] rounded-full px-4 py-1.5 backdrop-blur-md shadow-xs">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 rounded-full focus:outline-none ${
                    isActive ? 'text-[#0B1220] font-semibold' : 'text-[#526071] hover:text-[#0B1220]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-slate-900/[0.06] border border-slate-900/[0.08] rounded-full -z-10 shadow-xs"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Demo Switcher Quick Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center space-x-1.5 text-xs text-teal-800 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 px-2.5 py-1.5 rounded-lg transition-all font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-teal-600" />
              </button>

              <AnimatePresence>
                {demoDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E5EAF0] p-2 shadow-xl backdrop-blur-2xl z-50"
                  >
                    <div className="text-[11px] font-semibold text-slate-400 uppercase px-2.5 py-1">
                      1-Click Demo Profiles
                    </div>
                    <button
                      onClick={() => {
                        demoLogin('job_seeker');
                        setActiveTab('candidate-dashboard');
                        setDemoDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between text-left px-2.5 py-2 text-xs text-[#0B1220] hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-teal-600" />
                        <div>
                          <div className="font-semibold text-[#0B1220]">Alex Mercer</div>
                          <div className="text-[10px] text-slate-500">Senior AI Engineer</div>
                        </div>
                      </div>
                      {user?.email?.includes('alex') && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                    </button>

                    <button
                      onClick={() => {
                        demoLogin('recruiter');
                        setActiveTab('recruiter-dashboard');
                        setDemoDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between text-left px-2.5 py-2 text-xs text-[#0B1220] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <div>
                          <div className="font-semibold text-[#0B1220]">TechPulse Recruiter</div>
                          <div className="text-[10px] text-slate-500">Sarah Jenkins</div>
                        </div>
                      </div>
                      {user?.email?.includes('sarah') && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>

                    <button
                      onClick={() => {
                        demoLogin('admin');
                        setActiveTab('admin-dashboard');
                        setDemoDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between text-left px-2.5 py-2 text-xs text-[#0B1220] hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <div>
                          <div className="font-semibold text-[#0B1220]">Admin Lead</div>
                          <div className="text-[10px] text-slate-500">System Admin</div>
                        </div>
                      </div>
                      {user?.email?.includes('admin') && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resume Upload CTA Button */}
            <button
              onClick={onOpenUpload}
              className="btn-shimmer flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-[#0B1220] border border-[#E5EAF0] transition-all shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              <span>Upload Resume</span>
            </button>

            {/* Auth / Profile State */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (user?.role === 'recruiter') setActiveTab('recruiter-dashboard');
                    else if (user?.role === 'admin') setActiveTab('admin-dashboard');
                    else setActiveTab('candidate-dashboard');
                  }}
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 border border-[#E5EAF0] px-3 py-1.5 rounded-lg text-xs font-medium text-[#0B1220] transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.name}</span>
                </button>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-shimmer px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0F766E] hover:bg-[#115E59] text-white transition-all shadow-teal-glow"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenUpload}
              className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-[#E5EAF0] px-4 pt-3 pb-6 space-y-2 shadow-lg"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === link.id ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-[#526071] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 border-t border-[#E5EAF0] flex flex-col gap-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                  <span className="text-xs text-[#0B1220] font-semibold">{user?.name} ({user?.role})</span>
                  <button onClick={logout} className="text-xs text-rose-600 font-medium">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-semibold bg-[#0F766E] text-white rounded-lg"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
