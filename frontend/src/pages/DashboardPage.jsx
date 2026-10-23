import React, { useState, useEffect } from 'react';
import {
  Code,
  BarChart3,
  Users,
  PlayCircle,
  LogOut,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  History,
  FileText,
  Clock,
  Award,
  ChevronRight,
  Cpu,
  Cloud,
  Compass,
  Mic,
  Target,
  Search,
  Zap,
  Tag,
  Plus
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { interviewsApi } from '../api/client';
import HardwareCheckModal from '../components/HardwareCheckModal';
import StarWarmupDrill from '../components/StarWarmupDrill';
import SkillRadarCard from '../components/SkillRadarCard';

export default function DashboardPage({ onStartInterview, onViewReport }) {
  const { user, logout } = useAuth();

  // Active Dashboard Tab
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'star' | 'readiness' | 'history'

  // Hardware Modal State
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);

  // Interview Configuration State
  const [selectedRole, setSelectedRole] = useState('Software Developer');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [interviewerPersona, setInterviewerPersona] = useState('supportive'); // 'supportive' | 'faang' | 'startup'
  const [customSkills, setCustomSkills] = useState(['React', 'Python', 'SQL', 'FastAPI']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  // Past Interviews & Progress State
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [historyLanguageFilter, setHistoryLanguageFilter] = useState('All');

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await interviewsApi.getInterviewHistory();
      setHistory(data || []);
    } catch (err) {
      console.error('Failed to load interview history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const roles = [
    {
      id: 'Software Developer',
      title: 'Software Developer',
      icon: Code,
      badge: 'Technical',
      level: 'Fresher to Mid',
      description: 'Data structures, algorithms, system design, REST APIs & OOP architecture.',
      color: 'from-blue-500 to-cyan-500',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      popularSkills: ['Python', 'Java', 'React', 'Data Structures', 'REST APIs']
    },
    {
      id: 'Data Analyst',
      title: 'Data Analyst',
      icon: BarChart3,
      badge: 'Analytics',
      level: 'Data & BI',
      description: 'SQL queries, data cleaning, statistical analysis, joins & business KPIs.',
      color: 'from-emerald-500 to-teal-500',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      popularSkills: ['SQL', 'Python', 'Pandas', 'PowerBI', 'Tableau']
    },
    {
      id: 'HR',
      title: 'HR / Behavioral',
      icon: Users,
      badge: 'Behavioral',
      level: 'STAR Method',
      description: 'Leadership, conflict management, situational judgment & cultural fit.',
      color: 'from-purple-500 to-pink-500',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      popularSkills: ['STAR Framework', 'Conflict Resolution', 'Team Collaboration']
    },
    {
      id: 'AI / ML Engineer',
      title: 'AI / ML Engineer',
      icon: Cpu,
      badge: 'Advanced AI',
      level: 'GenAI & ML',
      description: 'Supervised learning, LLMs, embeddings, RAG pipelines & model evaluation.',
      color: 'from-violet-500 to-indigo-500',
      tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      popularSkills: ['PyTorch', 'LLMs', 'Transformers', 'Vector DBs', 'NLP']
    },
    {
      id: 'DevOps & Cloud Engineer',
      title: 'DevOps & Cloud',
      icon: Cloud,
      badge: 'Infrastructure',
      level: 'Cloud & CI/CD',
      description: 'Docker containerization, Kubernetes, CI/CD pipelines & cloud reliability.',
      color: 'from-amber-500 to-orange-500',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      popularSkills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux']
    },
    {
      id: 'Product Manager',
      title: 'Product Manager',
      icon: Compass,
      badge: 'Strategy',
      level: 'Product Sense',
      description: 'Product sense, prioritization (RICE), North Star metrics & stakeholder trade-offs.',
      color: 'from-rose-500 to-red-500',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
      popularSkills: ['RICE Framework', 'A/B Testing', 'Roadmapping', 'User Empathy']
    }
  ];

  const personas = [
    {
      id: 'supportive',
      title: 'Supportive Mentor',
      desc: 'Encouraging, constructive, great for freshers & building confidence.',
      badge: 'Recommended'
    },
    {
      id: 'faang',
      title: 'FAANG Bar Raiser',
      desc: 'Rigorous architectural probing, edge cases & scalability depth.',
      badge: 'Advanced'
    },
    {
      id: 'startup',
      title: 'Fast-Paced Startup Founder',
      desc: 'Pragmatic, high speed, execution focus & situational agility.',
      badge: 'Speed Drill'
    }
  ];

  const languages = [
    {
      id: 'English',
      name: 'English',
      native: 'English (Standard)',
      desc: 'Global tech vocabulary & clear articulation.',
      flag: '🌐'
    },
    {
      id: 'Tamil',
      name: 'Tamil',
      native: 'தமிழ் (Tamil)',
      desc: 'Multilingual mode with Tamil questions & audio.',
      flag: '🇮🇳'
    }
  ];

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = newSkillInput.trim();
    if (clean && !customSkills.includes(clean)) {
      setCustomSkills([...customSkills, clean]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCustomSkills(customSkills.filter(s => s !== skillToRemove));
  };

  const handleStartInterview = async () => {
    setIsStarting(true);
    setStartError(null);

    try {
      const interviewData = await interviewsApi.startInterview({
        role: selectedRole,
        language: selectedLanguage,
      });

      if (onStartInterview) {
        onStartInterview(interviewData);
      }
    } catch (err) {
      setStartError(err.message || 'Failed to start interview. Please check backend service.');
    } finally {
      setIsStarting(false);
    }
  };

  // Stats
  const completedInterviews = history.filter(item => item.answered_questions > 0);
  const totalInterviewsCount = completedInterviews.length;
  const avgOverallScore = totalInterviewsCount > 0
    ? (completedInterviews.reduce((acc, it) => acc + it.overall_score, 0) / totalInterviewsCount).toFixed(1)
    : '0.0';
  const latestVerdict = history.length > 0 ? history[0].verdict : 'Ready to Start First Mock';

  // Chart Data
  const chartData = [...history]
    .filter(it => it.answered_questions > 0)
    .reverse()
    .map((it, idx) => ({
      session: `#${idx + 1} (${it.role.slice(0, 8)})`,
      overall: it.overall_score,
      speech: it.speech_score,
      quality: it.answer_quality_score,
      bodyLanguage: it.body_language_score,
      date: new Date(it.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }));

  // Filtered History
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.role.toLowerCase().includes(historySearch.toLowerCase()) ||
                          item.verdict.toLowerCase().includes(historySearch.toLowerCase());
    const matchesLang = historyLanguageFilter === 'All' || item.language === historyLanguageFilter;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      {/* Hardware Check Modal */}
      <HardwareCheckModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
      />

      {/* Top Banner & Profile Header */}
      <div className="apple-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Soft Ambient Light Disc */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#0071E3]/15 to-[#7B61FF]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#7B61FF] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#0071E3]/25 shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1B1B1D] tracking-tight">
                  Welcome, {user?.name || 'Candidate'}!
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/25">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Candidate Verified
                </span>
              </div>
              <p className="text-xs text-[#6E6E73] mt-1 font-mono tracking-tight">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsHardwareModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#F6F3F5] hover:bg-[#EAE7EA] text-[#0071E3] border border-[#0071E3]/25 transition duration-150 cursor-pointer shadow-sm active:scale-95"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Pre-Check Mic &amp; Cam</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#F6F3F5] hover:bg-red-50 text-[#6E6E73] hover:text-[#FF3B30] border border-[#E5E5EA] hover:border-[#FF3B30]/30 transition duration-150 cursor-pointer shadow-sm active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-[#E5E5EA]">
          <div className="p-4 rounded-2xl bg-[#F6F3F5] border border-[#E5E5EA]">
            <span className="text-[11px] font-medium text-[#6E6E73] block mb-1">Completed Mocks</span>
            <div className="text-2xl font-extrabold text-[#1B1B1D] font-mono">{totalInterviewsCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F6F3F5] border border-[#E5E5EA]">
            <span className="text-[11px] font-medium text-[#6E6E73] block mb-1">Average Overall Score</span>
            <div className="text-2xl font-extrabold text-[#0071E3] font-mono">
              {avgOverallScore}<span className="text-xs text-[#6E6E73] font-normal">/10</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F6F3F5] border border-[#E5E5EA]">
            <span className="text-[11px] font-medium text-[#6E6E73] block mb-1">Target Role</span>
            <div className="text-sm font-bold text-[#1B1B1D] truncate">{selectedRole}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F6F3F5] border border-[#E5E5EA]">
            <span className="text-[11px] font-medium text-[#6E6E73] block mb-1">Latest Standing</span>
            <div className="text-xs font-semibold text-[#34C759] truncate">{latestVerdict}</div>
          </div>
        </div>
      </div>

      {/* Feature Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#F0EDEF] border border-[#E5E5EA] overflow-x-auto">
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'studio'
              ? 'bg-white text-[#1B1B1D] shadow-sm border border-[#E5E5EA]'
              : 'text-[#6E6E73] hover:text-[#1B1B1D] hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#0071E3]" />
          <span>🎯 Mock Interview Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('star')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'star'
              ? 'bg-white text-[#7B61FF] shadow-sm border border-[#E5E5EA]'
              : 'text-[#6E6E73] hover:text-[#1B1B1D] hover:bg-white/60'
          }`}
        >
          <Zap className="w-4 h-4 text-[#7B61FF]" />
          <span>⚡ AI STAR Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('readiness')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'readiness'
              ? 'bg-white text-[#008633] shadow-sm border border-[#E5E5EA]'
              : 'text-[#6E6E73] hover:text-[#1B1B1D] hover:bg-white/60'
          }`}
        >
          <Target className="w-4 h-4 text-[#008633]" />
          <span>📊 Readiness &amp; Skill Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-[#0071E3] shadow-sm border border-[#E5E5EA]'
              : 'text-[#6E6E73] hover:text-[#1B1B1D] hover:bg-white/60'
          }`}
        >
          <History className="w-4 h-4 text-[#0071E3]" />
          <span>📜 Session History ({history.length})</span>
        </button>
      </div>

      {/* TAB 1: STUDIO SETUP */}
      {activeTab === 'studio' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Step 1: Role Grid */}
          <div className="apple-glass rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center text-xs font-bold border border-[#0071E3]/20">
                  1
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1B1B1D] tracking-tight">
                  Choose Target Interview Specialization
                </h3>
              </div>
              <span className="text-xs text-[#6E6E73]">
                Selected: <span className="text-[#0071E3] font-bold">{selectedRole}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-5 rounded-2xl text-left border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#F8FAFF] border-2 border-[#0071E3] ring-2 ring-[#0071E3]/15 shadow-md'
                        : 'bg-white border-[#E5E5EA] hover:border-[#0071E3]/40 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${role.color} text-white shadow-sm`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${role.tagColor}`}>
                          {role.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#1B1B1D] mb-1 tracking-tight">{role.title}</h3>
                      <p className="text-xs text-[#6E6E73] leading-relaxed font-normal mb-3">{role.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E5EA] flex items-center justify-between text-xs">
                      <span className={isSelected ? 'text-[#0071E3] font-bold' : 'text-[#6E6E73]'}>
                        {isSelected ? '✓ Selected' : 'Select Track'}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Language & AI Persona Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selection */}
            <div className="apple-glass rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#7B61FF]/10 text-[#7B61FF] flex items-center justify-center text-xs font-bold border border-[#7B61FF]/20">
                    2
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#1B1B1D] tracking-tight">
                    Interview Language
                  </h3>
                </div>
                <span className="text-[11px] text-[#6E6E73]">Dual Engine</span>
              </div>

              <div className="space-y-3">
                {languages.map((lang) => {
                  const isSelected = selectedLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.id)}
                      className={`w-full p-4 rounded-2xl text-left border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#F8FAFF] border-2 border-[#0071E3] ring-2 ring-[#0071E3]/15 shadow-sm'
                          : 'bg-white border-[#E5E5EA] hover:border-[#0071E3]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#1B1B1D]">{lang.name}</span>
                            <span className="text-[11px] text-[#6E6E73] font-medium">({lang.native})</span>
                          </div>
                          <p className="text-xs text-[#6E6E73] mt-0.5">{lang.desc}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#0071E3] bg-[#0071E3]' : 'border-[#E5E5EA]'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Persona Selection */}
            <div className="apple-glass rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#008633]/10 text-[#008633] flex items-center justify-center text-xs font-bold border border-[#008633]/20">
                    3
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#1B1B1D] tracking-tight">
                    Interviewer Style
                  </h3>
                </div>
                <span className="text-[11px] text-[#6E6E73]">Adaptive AI</span>
              </div>

              <div className="space-y-3">
                {personas.map((persona) => {
                  const isSelected = interviewerPersona === persona.id;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => setInterviewerPersona(persona.id)}
                      className={`w-full p-4 rounded-2xl text-left border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#F8FAFF] border-2 border-[#0071E3] ring-2 ring-[#0071E3]/15 shadow-sm'
                          : 'bg-white border-[#E5E5EA] hover:border-[#0071E3]/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1B1B1D]">{persona.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F6F3F5] text-[#6E6E73] border border-[#E5E5EA] font-semibold">
                            {persona.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#6E6E73] mt-0.5">{persona.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#0071E3] bg-[#0071E3]' : 'border-[#E5E5EA]'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Custom Domain Skills & Resume Focus Tags */}
          <div className="apple-glass rounded-3xl p-6 sm:p-7 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#0071E3]" />
                <h3 className="text-sm font-bold text-[#1B1B1D]">
                  Focus Topics &amp; Core Technical Concepts
                </h3>
              </div>
              <span className="text-xs text-[#6E6E73]">
                {customSkills.length} skills selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center pt-1">
              {customSkills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F6F3F5] text-[#1B1B1D] border border-[#E5E5EA]"
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk)}
                    className="hover:text-[#FF3B30] text-[#6E6E73] ml-0.5 text-xs font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}

              <form onSubmit={handleAddSkill} className="inline-flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Add custom skill..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  className="px-3 py-1 text-xs rounded-full bg-white border border-[#E5E5EA] text-[#1B1B1D] focus:outline-none focus:border-[#0071E3] placeholder:text-[#6E6E73]/60 w-36"
                />
                <button
                  type="submit"
                  className="p-1 rounded-full bg-[#0071E3] text-white hover:bg-[#0059B5] transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Launch Simulator CTA Banner */}
          <div className="apple-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-[#E5E5EA] shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-xs font-bold border border-[#0071E3]/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready for Live Interview Simulation</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B1B1D] tracking-tight">
                  Launch {selectedRole} Session
                </h3>
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  5 customized questions (Technical + HR), real-time speech analytics &amp; client-side MediaPipe body language tracking.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartInterview}
                  disabled={isStarting}
                  className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0071E3] to-[#7B61FF] hover:from-[#0059B5] hover:to-[#5B3CDD] text-white font-extrabold text-sm shadow-xl shadow-[#0071E3]/25 transition duration-150 cursor-pointer active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStarting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Generating Questions...
                    </span>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5" />
                      <span>Start Interview Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {startError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[#FF3B30] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{startError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI STAR SANDBOX */}
      {activeTab === 'star' && <StarWarmupDrill />}

      {/* TAB 3: READINESS RADAR */}
      {activeTab === 'readiness' && <SkillRadarCard history={history} />}

      {/* TAB 4 / COMMON: PROGRESS & PAST SESSIONS */}
      {(activeTab === 'history' || activeTab === 'studio') && (
        <div className="space-y-6">
          {/* Progress Chart */}
          {chartData.length > 1 && (
            <div className="apple-glass rounded-3xl p-6 sm:p-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-[#1B1B1D] flex items-center gap-2 tracking-tight">
                    <TrendingUp className="w-4 h-4 text-[#0071E3]" />
                    Performance Progress &amp; Improvement Trend
                  </h2>
                  <p className="text-xs text-[#6E6E73] mt-0.5">
                    Tracks score evolution across Speech (30%), Quality (40%), and Posture (30%).
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-mono font-semibold bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20">
                  {chartData.length} Evaluated Mocks
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
                    <XAxis dataKey="session" stroke="#6E6E73" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#6E6E73" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E5EA',
                        borderRadius: '16px',
                        fontSize: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        color: '#1B1B1D',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="overall" name="Overall (30-40-30)" stroke="#0071E3" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="quality" name="Quality (40%)" stroke="#7B61FF" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="speech" name="Speech (30%)" stroke="#34C759" strokeWidth={2} strokeDasharray="2 2" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="bodyLanguage" name="Posture (30%)" stroke="#FF9F0A" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Session History List */}
          <div className="apple-glass rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-[#1B1B1D] flex items-center gap-2 tracking-tight">
                  <History className="w-4 h-4 text-[#0071E3]" />
                  Recorded Mock Sessions &amp; Detailed Analytics
                </h2>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  Review per-question transcripts, audio pace, filler words &amp; AI scorecards.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#6E6E73] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by role or verdict..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#E5E5EA] text-xs text-[#1B1B1D] placeholder:text-[#6E6E73]/60 focus:outline-none focus:border-[#0071E3] w-48"
                  />
                </div>

                <select
                  value={historyLanguageFilter}
                  onChange={(e) => setHistoryLanguageFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5EA] text-xs text-[#1B1B1D] focus:outline-none focus:border-[#0071E3] cursor-pointer"
                >
                  <option value="All">All Languages</option>
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </div>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-[#6E6E73]">
                <div className="w-8 h-8 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span className="text-xs font-mono">Loading session records...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-[#6E6E73] border border-dashed border-[#E5E5EA] rounded-2xl">
                <FileText className="w-10 h-10 text-[#6E6E73]/50 mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#1B1B1D]">No interview sessions found</p>
                <p className="text-[11px] text-[#6E6E73] mt-0.5">Start your first mock interview above to see analytics and score history.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="apple-glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="p-3 rounded-xl bg-[#F6F3F5] text-[#0071E3] shrink-0 border border-[#E5E5EA]">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#1B1B1D]">{item.role}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#F6F3F5] text-[#6E6E73] border border-[#E5E5EA]">
                            {item.language}
                          </span>
                          <span className="text-[10px] font-mono text-[#6E6E73]">
                            Session #{item.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[#6E6E73] mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span>•</span>
                          <span>{item.answered_questions} of {item.total_questions} questions answered</span>
                          <span>•</span>
                          <span className="text-[#34C759] font-medium">{item.verdict}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-[#6E6E73]">Overall Score</div>
                        <div className="text-lg font-black text-[#0071E3] font-mono">
                          {item.overall_score}
                          <span className="text-xs font-normal text-[#6E6E73]">/10</span>
                        </div>
                      </div>

                      {onViewReport && item.answered_questions > 0 && (
                        <button
                          onClick={() => onViewReport(item.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#0071E3]/10 hover:bg-[#0071E3]/20 text-[#0071E3] font-semibold text-xs transition cursor-pointer"
                        >
                          <span>Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
