import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'jobs'>('users');
  const [, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [sData, uData, jData] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.admin.getJobs(),
      ]);
      setStats(sData);
      setUsersList(uData);
      setJobsList(jData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      await api.admin.deleteUser(id);
      fetchAdminData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.jobs.deleteJob(id);
      fetchAdminData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete job');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5EAF0]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-mono font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            Platform Governance & Administration
          </div>
          <h1 className="text-3xl font-extrabold text-[#0B1220] tracking-tight">Admin System Control</h1>
          <p className="text-xs text-[#526071] mt-1 font-medium">Platform analytics, user lifecycle, and content moderation</p>
        </div>
      </div>

      {/* Analytics KPI Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-card p-4 rounded-3xl border border-[#E5EAF0] shadow-glass">
            <span className="text-[10px] font-mono uppercase text-[#526071] font-bold">Total Users</span>
            <div className="text-2xl font-bold font-mono text-[#0B1220] mt-1">{stats.total_users}</div>
          </div>
          <div className="glass-card p-4 rounded-3xl border border-[#E5EAF0] shadow-glass">
            <span className="text-[10px] font-mono uppercase text-[#526071] font-bold">Candidates</span>
            <div className="text-2xl font-bold font-mono text-teal-700 mt-1">{stats.total_candidates}</div>
          </div>
          <div className="glass-card p-4 rounded-3xl border border-[#E5EAF0] shadow-glass">
            <span className="text-[10px] font-mono uppercase text-[#526071] font-bold">Recruiters</span>
            <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{stats.total_recruiters}</div>
          </div>
          <div className="glass-card p-4 rounded-3xl border border-[#E5EAF0] shadow-glass">
            <span className="text-[10px] font-mono uppercase text-[#526071] font-bold">Total Jobs</span>
            <div className="text-2xl font-bold font-mono text-[#0B1220] mt-1">{stats.total_jobs}</div>
          </div>
          <div className="glass-card p-4 rounded-3xl border border-[#E5EAF0] shadow-glass">
            <span className="text-[10px] font-mono uppercase text-[#526071] font-bold">Applications</span>
            <div className="text-2xl font-bold font-mono text-purple-700 mt-1">{stats.total_applications}</div>
          </div>
          <div className="glass-card p-4 rounded-3xl border border-teal-200 shadow-glass">
            <span className="text-[10px] font-mono uppercase text-[#526071] font-bold">Avg Match %</span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{stats.average_match_score}%</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E5EAF0] pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-100 text-purple-900 border border-purple-300'
              : 'text-[#526071] hover:text-[#0B1220]'
          }`}
        >
          Manage Users ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'jobs'
              ? 'bg-purple-100 text-purple-900 border border-purple-300'
              : 'text-[#526071] hover:text-[#0B1220]'
          }`}
        >
          Manage Jobs ({jobsList.length})
        </button>
      </div>

      {/* Tables */}
      {activeTab === 'users' ? (
        <div className="glass-card rounded-3xl p-6 border border-[#E5EAF0] overflow-x-auto shadow-glass">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5EAF0] text-[#526071] font-mono uppercase tracking-wider">
                <th className="pb-3 pl-2">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Company / Profile</th>
                <th className="pb-3">Registered</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF0]">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-2 font-bold text-[#0B1220]">{u.name}</td>
                  <td className="py-3 text-[#526071] font-medium">{u.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : u.role === 'recruiter'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-teal-100 text-teal-800 border border-teal-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-[#526071]">{u.company_name || 'Individual Seeker'}</td>
                  <td className="py-3 text-[#526071] font-mono text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right pr-2">
                    {u.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 border border-[#E5EAF0] overflow-x-auto shadow-glass">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5EAF0] text-[#526071] font-mono uppercase tracking-wider">
                <th className="pb-3 pl-2">Job Title</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Applicants</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF0]">
              {jobsList.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-2 font-bold text-[#0B1220]">{j.title}</td>
                  <td className="py-3 text-[#526071] font-medium">{j.company}</td>
                  <td className="py-3 text-[#526071]">{j.location}</td>
                  <td className="py-3 text-[#526071]">{j.job_type}</td>
                  <td className="py-3 text-teal-700 font-mono font-bold">{j.applications_count}</td>
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={() => handleDeleteJob(j.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
