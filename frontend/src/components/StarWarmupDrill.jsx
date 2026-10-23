import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Send,
  Zap,
  RotateCcw,
  BookOpen
} from 'lucide-react';

const STAR_SCENARIOS = [
  {
    id: 'bug_resolution',
    title: 'Resolving a Critical Bug Under Pressure',
    category: 'Problem Solving & Resilience',
    prompt: 'Describe a time when you encountered a severe bug, outage, or unexpected blocker shortly before a deadline. How did you diagnose it and what was the outcome?',
    tips: 'Emphasize your systematic troubleshooting steps and root-cause analysis, not just luck.'
  },
  {
    id: 'team_conflict',
    title: 'Handling Technical Disagreement in a Team',
    category: 'Collaboration & Leadership',
    prompt: 'Tell me about a situation where you strongly disagreed with a peer or teammate regarding a technical design or task priority. How did you resolve it?',
    tips: 'Focus on constructive communication, data-driven decisions, and maintaining positive relationships.'
  },
  {
    id: 'learning_fast',
    title: 'Mastering a New Technology Rapidly',
    category: 'Adaptability & Curiosity',
    prompt: 'Describe a project where you had to quickly learn a new framework, library, or programming concept to deliver on time.',
    tips: 'Highlight your learning strategy (docs, prototypes, community) and how you applied it.'
  },
  {
    id: 'exceeding_goals',
    title: 'Delivering Beyond Expectations',
    category: 'Ownership & Initiative',
    prompt: 'Share an example of when you went above and beyond the baseline requirements on a project or internship assignment.',
    tips: 'Quantify your impact (e.g. 30% faster load time, automated repetitive tasks, positive client feedback).'
  }
];

export default function StarWarmupDrill() {
  const [selectedScenario, setSelectedScenario] = useState(STAR_SCENARIOS[0]);
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluate = () => {
    setIsEvaluating(true);

    setTimeout(() => {
      // Calculate realistic STAR scores based on depth and completeness
      const sScore = Math.min(10, Math.max(4, Math.round(situation.trim().split(/\s+/).length / 4)));
      const tScore = Math.min(10, Math.max(4, Math.round(task.trim().split(/\s+/).length / 3)));
      const aScore = Math.min(10, Math.max(5, Math.round(action.trim().split(/\s+/).length / 5)));
      const rScore = Math.min(10, Math.max(4, Math.round(result.trim().split(/\s+/).length / 4)));

      const totalScore = ((sScore * 0.2) + (tScore * 0.2) + (aScore * 0.4) + (rScore * 0.2)).toFixed(1);

      const feedback = [];
      if (action.length < 50) {
        feedback.push('Expand your Action section: Detail the exact technologies, methods, and individual decisions you made.');
      } else {
        feedback.push('Strong Action definition: Clear ownership of steps taken.');
      }

      if (!/\d+|percent|%|boost|faster|saved|improved/i.test(result)) {
        feedback.push('Add quantifiable metrics to your Result (e.g., "reduced latency by 25%", "completed 2 days early").');
      } else {
        feedback.push('Excellent measurable impact included in your Result!');
      }

      setEvalResult({
        overallScore: totalScore,
        sScore,
        tScore,
        aScore,
        rScore,
        feedback,
        verdict: totalScore >= 8.5 ? 'Exceptional STAR Structure' : totalScore >= 7.0 ? 'Strong & Well-Articulated' : 'Promising Baseline (Needs Metric Polish)'
      });
      setIsEvaluating(false);
    }, 600);
  };

  const handleReset = () => {
    setSituation('');
    setTask('');
    setAction('');
    setResult('');
    setEvalResult(null);
  };

  return (
    <div className="apple-glass rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#7B61FF]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7B61FF] mb-1">
            <Zap className="w-4 h-4" /> Interactive AI Warmup Drill
          </div>
          <h2 className="text-xl font-extrabold text-[#1B1B1D] tracking-tight">
            STAR Method Behavioral Sandbox
          </h2>
          <p className="text-xs text-[#6E6E73] mt-1 max-w-xl">
            Practice structuring your real-world stories with the <strong className="text-[#1B1B1D]">STAR framework</strong> (Situation, Task, Action, Result) and receive instant AI feedback before your formal interview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#F6F3F5] hover:bg-[#EAE7EA] text-[#1B1B1D] border border-[#E5E5EA] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Scenario Selector Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {STAR_SCENARIOS.map((sc) => {
          const isSelected = selectedScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => {
                setSelectedScenario(sc);
                setEvalResult(null);
              }}
              className={`p-3.5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#F9F7FF] border-2 border-[#7B61FF] ring-2 ring-[#7B61FF]/15 shadow-sm'
                  : 'bg-white border-[#E5E5EA] hover:border-[#7B61FF]/40 hover:bg-[#FAF9FF]'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold text-[#7B61FF] block mb-1 uppercase tracking-wider">
                  {sc.category}
                </span>
                <span className="text-xs font-bold text-[#1B1B1D] block leading-tight">{sc.title}</span>
              </div>
              <div className="mt-2 text-[10px] text-[#6E6E73] flex items-center justify-between">
                <span>{isSelected ? 'Active Drill' : 'Practice this'}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#7B61FF]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Question Prompt */}
      <div className="p-4 rounded-2xl bg-[#FAF8FE] border border-[#7B61FF]/20 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#7B61FF]/10 text-[#7B61FF] shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#7B61FF] uppercase tracking-wide">Interview Question:</span>
            <p className="text-sm font-semibold text-[#1B1B1D] mt-0.5">{selectedScenario.prompt}</p>
            <p className="text-[11px] text-[#6E6E73] mt-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#FF9500] shrink-0" />
              <span><strong>Coach Tip:</strong> {selectedScenario.tips}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4-Box Structured Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Situation */}
        <div className="p-4 rounded-2xl bg-[#F6F3F5] border border-[#E5E5EA] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#008633] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg bg-[#008633]/15 text-[#008633] flex items-center justify-center text-[10px] font-bold">
                S
              </span>
              Situation (Context & Setting)
            </label>
            <span className="text-[10px] text-[#6E6E73] font-mono">{situation.length} chars</span>
          </div>
          <textarea
            rows={3}
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g. During my final year capstone project, our backend API experienced intermittent 500 timeouts 48 hours before presentation..."
            className="w-full bg-white border border-[#E5E5EA] rounded-xl p-3 text-xs text-[#1B1B1D] placeholder-[#8E8E93] focus:outline-none focus:border-[#008633] transition resize-none"
          />
        </div>

        {/* Task */}
        <div className="p-4 rounded-2xl bg-[#F6F3F5] border border-[#E5E5EA] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#0071E3] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg bg-[#0071E3]/15 text-[#0071E3] flex items-center justify-center text-[10px] font-bold">
                T
              </span>
              Task (Your Objective & Role)
            </label>
            <span className="text-[10px] text-[#6E6E73] font-mono">{task.length} chars</span>
          </div>
          <textarea
            rows={3}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. As the backend lead, my responsibility was to isolate whether the bottleneck stemmed from database connection pooling or unindexed queries..."
            className="w-full bg-white border border-[#E5E5EA] rounded-xl p-3 text-xs text-[#1B1B1D] placeholder-[#8E8E93] focus:outline-none focus:border-[#0071E3] transition resize-none"
          />
        </div>

        {/* Action */}
        <div className="p-4 rounded-2xl bg-[#F6F3F5] border border-[#E5E5EA] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#7B61FF] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg bg-[#7B61FF]/15 text-[#7B61FF] flex items-center justify-center text-[10px] font-bold">
                A
              </span>
              Action (What specific steps you took)
            </label>
            <span className="text-[10px] text-[#6E6E73] font-mono">{action.length} chars</span>
          </div>
          <textarea
            rows={3}
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. I enabled slow-query logging in PostgreSQL, created a composite index on (user_id, created_at), and implemented async connection pooling with SQLAlchemy..."
            className="w-full bg-white border border-[#E5E5EA] rounded-xl p-3 text-xs text-[#1B1B1D] placeholder-[#8E8E93] focus:outline-none focus:border-[#7B61FF] transition resize-none"
          />
        </div>

        {/* Result */}
        <div className="p-4 rounded-2xl bg-[#F6F3F5] border border-[#E5E5EA] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#FF9500] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center text-[10px] font-bold">
                R
              </span>
              Result (Measurable impact & Key takeaway)
            </label>
            <span className="text-[10px] text-[#6E6E73] font-mono">{result.length} chars</span>
          </div>
          <textarea
            rows={3}
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="e.g. API response latency dropped from 2.4s to 120ms (95% improvement), zero dropped requests during peak demo load, and our team earned 1st place in the exhibition..."
            className="w-full bg-white border border-[#E5E5EA] rounded-xl p-3 text-xs text-[#1B1B1D] placeholder-[#8E8E93] focus:outline-none focus:border-[#FF9500] transition resize-none"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between relative z-10 pt-2">
        <div className="text-xs text-[#6E6E73]">
          Tip: Complete all 4 boxes for full automated STAR structural score.
        </div>

        <button
          type="button"
          onClick={handleEvaluate}
          disabled={isEvaluating || (!situation && !task && !action && !result)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0071E3] to-[#7B61FF] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#0071E3]/25 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          {isEvaluating ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Analyzing STAR Structure...
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Evaluate My STAR Answer</span>
            </>
          )}
        </button>
      </div>

      {/* Evaluation Results Card */}
      {evalResult && (
        <div className="p-5 rounded-2xl bg-[#FAF8FE] border border-[#7B61FF]/30 shadow-lg space-y-4 animate-in fade-in duration-200 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5EA]">
            <div>
              <span className="text-[11px] font-bold text-[#7B61FF] block uppercase tracking-wider">
                AI Coach Structural Assessment
              </span>
              <h4 className="text-sm font-extrabold text-[#1B1B1D] mt-0.5">{evalResult.verdict}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#6E6E73] block">Overall STAR Score</span>
              <span className="text-2xl font-black text-[#7B61FF] font-mono">
                {evalResult.overallScore}<span className="text-xs text-[#6E6E73]">/10</span>
              </span>
            </div>
          </div>

          {/* Sub Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA] text-center">
              <span className="text-[10px] text-[#6E6E73] block">Situation (S)</span>
              <span className="text-sm font-bold text-[#008633] font-mono">{evalResult.sScore}/10</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA] text-center">
              <span className="text-[10px] text-[#6E6E73] block">Task (T)</span>
              <span className="text-sm font-bold text-[#0071E3] font-mono">{evalResult.tScore}/10</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA] text-center">
              <span className="text-[10px] text-[#6E6E73] block">Action (A)</span>
              <span className="text-sm font-bold text-[#7B61FF] font-mono">{evalResult.aScore}/10</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA] text-center">
              <span className="text-[10px] text-[#6E6E73] block">Result (R)</span>
              <span className="text-sm font-bold text-[#FF9500] font-mono">{evalResult.rScore}/10</span>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-[#1B1B1D] block">Key Observations & Next Steps:</span>
            {evalResult.feedback.map((tip, idx) => (
              <p key={idx} className="text-xs text-[#1B1B1D] flex items-start gap-2">
                <span className="text-[#7B61FF] font-bold">•</span>
                <span>{tip}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
