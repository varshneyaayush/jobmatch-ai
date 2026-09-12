import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { FindJobsPage } from './pages/FindJobsPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { ResumeUploadModal } from './components/ResumeUploadModal';
import { AuthModal } from './components/AuthModal';
import { Sparkles } from 'lucide-react';

function MainLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'job_seeker' | 'recruiter' | 'admin'>('job_seeker');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (role: 'job_seeker' | 'recruiter' | 'admin' = 'job_seeker', mode: 'login' | 'register' = 'login') => {
    setAuthRole(role);
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // 1. Initial Authentication Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6 text-teal-700 animate-spin" />
        </div>
        <span className="text-xs font-bold text-[#0B1220] tracking-wide font-mono">Loading JobMatch AI...</span>
      </div>
    );
  }

  // 2. Strict Authentication Protection: If not logged in, ALWAYS show Login Page first
  if (!isAuthenticated) {
    return <LoginPage onSuccessRedirect={() => setActiveTab('home')} />;
  }

  // 3. Authenticated User Layout (Redirects to Existing Landing Page / Active Tab)
  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return (
          <FindJobsPage
            onOpenUpload={() => setUploadModalOpen(true)}
            onOpenAuth={() => handleOpenAuth('job_seeker')}
          />
        );
      case 'candidate-dashboard':
        return (
          <CandidateDashboard
            onOpenUpload={() => setUploadModalOpen(true)}
            onExploreJobs={() => setActiveTab('jobs')}
          />
        );
      case 'recruiter-dashboard':
        return <RecruiterDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'recruiter':
        if (user?.role === 'recruiter') {
          return <RecruiterDashboard />;
        }
        return (
          <LandingPage
            onOpenUpload={() => setUploadModalOpen(true)}
            onExploreJobs={() => setActiveTab('jobs')}
            onOpenAuth={() => handleOpenAuth('recruiter')}
          />
        );
      case 'home':
      case 'how-it-works':
      case 'about':
      default:
        return (
          <LandingPage
            onOpenUpload={() => setUploadModalOpen(true)}
            onExploreJobs={() => setActiveTab('jobs')}
            onOpenAuth={() => handleOpenAuth('job_seeker')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0B1220] flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenAuth={() => handleOpenAuth('job_seeker')}
      />

      <main className="flex-1">{renderContent()}</main>

      <Footer onNavigate={(tab) => setActiveTab(tab)} />

      {/* Global Modals */}
      <ResumeUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          if (user?.role === 'job_seeker') {
            setActiveTab('candidate-dashboard');
          } else {
            setActiveTab('jobs');
          }
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultRole={authRole}
        initialMode={authMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
