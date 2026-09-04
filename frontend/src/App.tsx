import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { FindJobsPage } from './pages/FindJobsPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ResumeUploadModal } from './components/ResumeUploadModal';
import { AuthModal } from './components/AuthModal';

function MainLayout() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'job_seeker' | 'recruiter' | 'admin'>('job_seeker');

  const handleOpenAuth = (role: 'job_seeker' | 'recruiter' | 'admin' = 'job_seeker') => {
    setAuthRole(role);
    setAuthModalOpen(true);
  };

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
        if (isAuthenticated && user?.role === 'recruiter') {
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
          if (isAuthenticated && user?.role === 'job_seeker') {
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
