import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Target,
  Sparkles,
  Building2,
  CheckCircle2,
  BrainCircuit,
  MessageSquare,
  Smile,
  Zap,
  BookOpen
} from 'lucide-react';

const TARGET_COMPANIES = [
  {
    id: 'faang',
    name: 'FAANG / Tier-1 Tech',
    examples: 'Google, Amazon, Microsoft, Meta',
    focus: 'Deep algorithmic complexity, distributed systems & STAR leadership principles.',
    threshold: '8.8+ / 10'
  },
  {
    id: 'product',
    name: 'High-Growth Product Unicorns',
    examples: 'Zoho, Swiggy, Razorpay, Freshworks',
    focus: 'Practical coding agility, fullstack architecture & fast problem decomposition.',
    threshold: '8.0+ / 10'
  },
  {
    id: 'enterprise',
    name: 'Global IT & Consulting',
    examples: 'TCS, Infosys, Wipro, Accenture, Cognizant',
    focus: 'Foundational CS concepts, clear English/Tamil communication & project teamwork.',
    threshold: '7.2+ / 10'
  }
];

export default function SkillRadarCard({ history = [] }) {
  const [selectedCompanyTier, setSelectedCompanyTier] = useState(TARGET_COMPANIES[0]);

  // Aggregate stats from history if any
  const completedMocks = history.filter(h => h.answered_questions > 0);
  const hasData = completedMocks.length > 0;

  const avgOverall = hasData
    ? (completedMocks.reduce((acc, it) => acc + it.overall_score, 0) / completedMocks.length).toFixed(1)
    : '7.5';

  const avgSpeech = hasData
    ? (completedMocks.reduce((acc, it) => acc + it.speech_score, 0) / completedMocks.length).toFixed(1)
    : '7.8';

  const avgQuality = hasData
    ? (completedMocks.reduce((acc, it) => acc + it.answer_quality_score, 0) / completedMocks.length).toFixed(1)
    : '7.2';

  const avgPosture = hasData
    ? (completedMocks.reduce((acc, it) => acc + it.body_language_score, 0) / completedMocks.length).toFixed(1)
    : '8.1';

  const competencies = [
    {
      name: 'Technical Precision & Depth',
      score: avgQuality,
      max: 10,
      icon: BrainCircuit,
      color: 'text-purple-400',
      barColor: 'from-purple-500 to-indigo-500',
      tip: 'Focus on architectural tradeoffs and big-O time/space memory nuances.'
    },
    {
      name: 'Speech Fluency & Cadence',
      score: avgSpeech,
      max: 10,
      icon: MessageSquare,
      color: 'text-blue-400',
      barColor: 'from-blue-500 to-cyan-400',
      tip: 'Target 120-150 words per minute; minimize vocal fillers ("um", "uh").'
    },
    {
      name: 'Body Language & Posture',
      score: avgPosture,
      max: 10,
      icon: Smile,
      color: 'text-amber-400',
      barColor: 'from-amber-500 to-orange-400',
      tip: 'Maintain 75%+ direct camera eye contact to project confident presence.'
    },
    {
      name: 'STAR Structural Alignment',
      score: ((parseFloat(avgQuality) * 0.5) + (parseFloat(avgSpeech) * 0.5)).toFixed(1),
      max: 10,
      icon: Zap,
      color: 'text-emerald-400',
      barColor: 'from-emerald-500 to-teal-400',
      tip: 'Explicitly label Situation, Task, Action, and Quantifiable Results in answers.'
    }
  ];

  return (
    <div className="apple-glass rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#34C759]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#008633] mb-1">
            <Target className="w-4 h-4" /> Comprehensive Readiness Matrix
          </div>
          <h2 className="text-xl font-extrabold text-[#1B1B1D] tracking-tight">
            Candidate Competency & Target Readiness
          </h2>
          <p className="text-xs text-[#6E6E73] mt-1 max-w-xl">
            Real-time multi-dimensional scoring benchmarked against industry standards and company hiring bars.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-[#008633]/10 border border-[#008633]/25 text-[#008633] font-mono text-xs font-bold">
            Composite Index: {avgOverall}/10
          </div>
        </div>
      </div>

      {/* 4-Dimension Competency Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {competencies.map((comp, idx) => {
          const Icon = comp.icon;
          const pct = Math.round((parseFloat(comp.score) / comp.max) * 100);

          return (
            <div key={idx} className="p-4 rounded-2xl bg-[#F6F3F5] border border-[#E5E5EA] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl bg-white border border-[#E5E5EA] shadow-sm ${comp.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1B1B1D] block">{comp.name}</span>
                    <span className="text-[10px] text-[#6E6E73]">Mastery Level: {pct}%</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-black font-mono ${comp.color}`}>
                    {comp.score}
                    <span className="text-[10px] text-[#6E6E73] font-normal">/10</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-[#E5E5EA] overflow-hidden border border-[#D1D1D6] p-0.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${comp.barColor} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>

              <p className="text-[10px] text-[#6E6E73] leading-tight">
                💡 <strong className="text-[#1B1B1D]">Action Tip:</strong> {comp.tip}
              </p>
            </div>
          );
        })}
      </div>

      {/* Target Company Track Selector */}
      <div className="pt-2 relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1B1B1D] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#008633]" /> Target Company Readiness Benchmarks
          </div>
          <span className="text-xs text-[#6E6E73]">Select target hiring bar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TARGET_COMPANIES.map((company) => {
            const isSelected = selectedCompanyTier.id === company.id;
            return (
              <button
                key={company.id}
                type="button"
                onClick={() => setSelectedCompanyTier(company)}
                className={`p-4 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#F4FAF6] border-2 border-[#008633] ring-2 ring-[#008633]/15 shadow-sm'
                    : 'bg-white border-[#E5E5EA] hover:border-[#008633]/40 hover:bg-[#F9FCFA]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-[#1B1B1D]">{company.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-[#008633]/10 text-[#008633] border border-[#008633]/25">
                      {company.threshold}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#008633] font-medium block mb-1">
                    {company.examples}
                  </span>
                  <p className="text-[11px] text-[#6E6E73] leading-relaxed font-normal">
                    {company.focus}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E5E5EA] flex items-center justify-between text-[10px]">
                  <span className={isSelected ? 'text-[#008633] font-semibold' : 'text-[#6E6E73]'}>
                    {isSelected ? 'Active Target Track' : 'Select Track'}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#008633]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
