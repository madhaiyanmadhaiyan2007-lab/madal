import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bot,
  HeartPulse,
  RefreshCw,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import InterviewPage from './pages/InterviewPage';
import ReportPage from './pages/ReportPage';
import Background3D from './components/Background3D';
import { authApi } from './api/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function MainContent() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const [activeInterview, setActiveInterview] = useState(null);
  const [viewingReportId, setViewingReportId] = useState(null);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const data = await authApi.getHealth();
      setHealthData(data);
    } catch {
      setHealthData(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#6E6E73]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-[#6E6E73]">Initializing MockMate AI...</span>
        </div>
      </div>
    );
  }

  const isApiOk = healthData?.api?.status === 'ok';
  const isDbOk = healthData?.database?.status === 'connected';

  return (
    <div className="min-h-screen flex flex-col justify-between text-[#1B1B1D] p-4 sm:p-8 relative">
      {/* Apple Cupertino Ambient Background Lighting Canvas */}
      <Background3D />

      {/* Global Top Navbar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4 px-5 rounded-2xl apple-glass mb-8 relative z-20">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#7B61FF] text-white font-bold shadow-md shadow-[#0071E3]/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#1B1B1D] flex items-center gap-2">
              MockMate AI
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] animate-pulse"></span>
                AI Studio Pro v2.5
              </span>
            </h1>
            <p className="text-xs text-[#6E6E73] tracking-normal">
              Multilingual (Tamil தமிழ் + English) AI Mock Interview Coach &amp; Speech Analytics
            </p>
          </div>
        </div>

        {/* System Health Quick Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHealthModal(!showHealthModal)}
            className="flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-xl bg-[#F6F3F5] hover:bg-[#EAE7EA] text-[#1B1B1D] border border-[#E5E5EA] transition cursor-pointer shadow-sm active:scale-95"
          >
            <HeartPulse className="w-3.5 h-3.5 text-[#34C759]" />
            <span className="hidden sm:inline">System Health:</span>
            {healthLoading ? (
              <span className="text-[#0071E3]">Checking...</span>
            ) : isApiOk && isDbOk ? (
              <span className="text-[#34C759] font-semibold">Healthy</span>
            ) : isApiOk ? (
              <span className="text-[#FF9F0A] font-semibold">DB Offline</span>
            ) : (
              <span className="text-[#FF3B30] font-semibold">Offline</span>
            )}
          </button>
        </div>
      </header>

      {/* Health Status Collapsible Drawer / Modal */}
      {showHealthModal && (
        <div className="max-w-5xl mx-auto w-full mb-6 p-5 rounded-2xl bg-white/95 border border-[#E5E5EA] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1B1B1D]">
              <Activity className="w-4 h-4 text-[#34C759]" />
              Backend &amp; Database Connection Health
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchHealth}
                disabled={healthLoading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#F6F3F5] hover:bg-[#EAE7EA] text-[#1B1B1D] border border-[#E5E5EA] cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowHealthModal(false)}
                className="text-xs px-2.5 py-1.5 rounded-lg text-[#6E6E73] hover:text-[#1B1B1D] hover:bg-[#F6F3F5] cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F6F3F5] border border-[#E5E5EA]">
              <div className="text-[#6E6E73] mb-1 flex items-center justify-between">
                <span>FastAPI Service</span>
                <span className={isApiOk ? 'text-[#34C759] font-medium' : 'text-[#FF3B30] font-medium'}>
                  {isApiOk ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="font-mono text-[#1B1B1D] text-[11px]">{API_BASE_URL}/health</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F6F3F5] border border-[#E5E5EA]">
              <div className="text-[#6E6E73] mb-1 flex items-center justify-between">
                <span>PostgreSQL DB (SQLAlchemy)</span>
                <span className={isDbOk ? 'text-[#34C759] font-medium' : 'text-[#FF9F0A] font-medium'}>
                  {healthData?.database?.status || 'Offline'}
                </span>
              </div>
              <div className="font-mono text-[#6E6E73] text-[11px] truncate">
                {healthData?.database?.message || 'Check database connection in backend/.env'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main View: Report | Active Interview | Dashboard | Auth */}
      <main className="flex-1 flex flex-col justify-center">
        {isAuthenticated ? (
          viewingReportId ? (
            <ReportPage
              interviewId={viewingReportId}
              onBackToDashboard={() => setViewingReportId(null)}
              onStartNewInterview={() => {
                setViewingReportId(null);
                setActiveInterview(null);
              }}
            />
          ) : activeInterview ? (
            <InterviewPage
              interview={activeInterview}
              onExit={() => setActiveInterview(null)}
              onViewReport={(id) => {
                setActiveInterview(null);
                setViewingReportId(id);
              }}
            />
          ) : (
            <DashboardPage
              onStartInterview={(data) => setActiveInterview(data)}
              onViewReport={(id) => setViewingReportId(id)}
            />
          )
        ) : authView === 'login' ? (
          <LoginPage onNavigateToSignup={() => setAuthView('signup')} />
        ) : (
          <SignupPage onNavigateToLogin={() => setAuthView('login')} />
        )}
      </main>

      {/* Global Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-6 border-t border-[#E5E5EA] text-xs text-[#6E6E73] mt-8">
        MockMate AI &copy; 2026 &bull; Phase 8: Comprehensive Performance Reports &amp; Progress Analytics Complete
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
