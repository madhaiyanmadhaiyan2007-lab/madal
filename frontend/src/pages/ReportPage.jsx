import React, { useState, useEffect } from 'react';
import {
  Award,
  ArrowLeft,
  RotateCcw,
  Printer,
  Sparkles,
  Target,
  Gauge,
  MessageSquare,
  Eye,
  Smile,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Volume2,
  Clock,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  BarChart2,
  Layers,
  Bot
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { interviewsApi } from '../api/client';

export default function ReportPage({ interviewId, onBackToDashboard, onStartNewInterview }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await interviewsApi.getInterviewReport(interviewId);
        setReport(data);
        // Expand first question by default
        if (data.questions_feedback && data.questions_feedback.length > 0) {
          setExpandedQuestions({ [data.questions_feedback[0].id]: true });
        }
      } catch (err) {
        console.error('Failed to load interview report:', err);
        setError(err.message || 'Failed to load report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchReport();
    }
  }, [interviewId]);

  const toggleQuestion = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto w-full py-16 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-white border border-[#E5E5EA] shadow-xl mb-4">
          <div className="w-10 h-10 border-4 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-bold text-[#1B1B1D] mb-1">Synthesizing Comprehensive Report</h3>
        <p className="text-xs text-[#6E6E73] font-mono">
          Calculating 30% Speech + 40% Answer Quality + 30% Body Language weighting...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto w-full p-8 rounded-2xl bg-white border border-red-200 text-center shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#1B1B1D] mb-2">Report Generation Error</h3>
        <p className="text-xs text-[#6E6E73] mb-6">{error || 'Could not find report for this interview.'}</p>
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold cursor-pointer shadow-md shadow-[#0071E3]/20"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { scores, speech_summary, body_language_summary, aggregated_strengths, aggregated_weaknesses, improvement_tips, questions_feedback } = report;

  // Chart data colors
  const barColors = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300 print:space-y-4 print:text-black">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5EA] print:hidden">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#6E6E73] hover:text-[#1B1B1D] apple-glass px-4 py-2 rounded-xl transition cursor-pointer shrink-0 hover:bg-[#F6F3F5] shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#6E6E73] hover:text-[#1B1B1D] apple-glass px-4 py-2 rounded-xl transition cursor-pointer hover:bg-[#F6F3F5] shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Export / Print Report
          </button>
          {onStartNewInterview && (
            <button
              onClick={onStartNewInterview}
              className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-[#0071E3] to-[#7B61FF] hover:opacity-95 px-4 py-2 rounded-xl shadow-md shadow-[#0071E3]/20 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Practice Again
            </button>
          )}
        </div>
      </div>

      {/* Main Report Banner */}
      <div className="apple-glass rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0071E3]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/25 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                {report.role}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-[#7B61FF]/10 text-[#7B61FF] border border-[#7B61FF]/25">
                Language: {report.language}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-[#34C759]/10 text-[#008633] border border-[#34C759]/25">
                {report.answered_questions} / {report.total_questions} Questions Answered
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1B1D] tracking-tight flex items-center gap-2.5">
              Candidate Performance Evaluation
            </h1>
            <p className="text-[#6E6E73] text-xs sm:text-sm mt-1">
              Generated on {new Date(report.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-4 apple-glass-pill p-4 rounded-2xl shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-[#6E6E73] block uppercase tracking-wider font-semibold">Overall Verdict</span>
              <span className="text-sm font-bold text-[#008633]">{scores.verdict}</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#7B61FF] text-white flex flex-col items-center justify-center font-extrabold shadow-md shadow-[#0071E3]/25">
              <span className="text-xl leading-none">{scores.overall_score}</span>
              <span className="text-[9px] font-semibold leading-none mt-0.5">/ 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Score Cards: Overall + Speech 30% + Answer Quality 40% + Body Language 30% */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Composite Card */}
        <div className="p-5 rounded-2xl apple-glass shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#008633]/10 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#1B1B1D] flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#008633]" />
                Overall Score
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#008633]/10 text-[#008633] font-bold border border-[#008633]/25">
                100% Total
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl font-extrabold text-[#008633] font-mono tracking-tight">{scores.overall_score}</span>
              <span className="text-sm text-[#6E6E73]">/ 10 ({scores.overall_percentage}%)</span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-[#E5E5EA] rounded-full h-2 mb-2 overflow-hidden border border-[#D1D1D6]">
              <div
                className="bg-gradient-to-r from-[#008633] to-[#34C759] h-2 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(scores.overall_score * 10, 100)}%` }}
              ></div>
            </div>
          </div>
          <span className="text-[11px] text-[#6E6E73] font-medium mt-2 block border-t border-[#E5E5EA] pt-2">
            30% Speech • 40% Quality • 30% Posture
          </span>
        </div>

        {/* Speech Score Card (30% weight) */}
        <div className="p-5 rounded-2xl apple-glass shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#1B1B1D] flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#0071E3]" />
                Speech &amp; Fluency
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-bold border border-[#0071E3]/25">
                30% Weight
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl font-extrabold text-[#0071E3] font-mono tracking-tight">{scores.speech_score}</span>
              <span className="text-sm text-[#6E6E73]">/ 10</span>
            </div>
            <div className="w-full bg-[#E5E5EA] rounded-full h-2 mb-2 overflow-hidden border border-[#D1D1D6]">
              <div
                className="bg-gradient-to-r from-[#0071E3] to-[#5AC8FA] h-2 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(scores.speech_score * 10, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-[#6E6E73] mt-2 border-t border-[#E5E5EA] pt-2 flex items-center justify-between">
            <span>{speech_summary.avg_wpm} WPM</span>
            <span className="text-[#0071E3] font-medium">{speech_summary.pace_verdict.split('(')[0]}</span>
          </div>
        </div>

        {/* Answer Quality Card (40% weight) */}
        <div className="p-5 rounded-2xl apple-glass shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#1B1B1D] flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#7B61FF]" />
                Answer Quality
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#7B61FF]/10 text-[#7B61FF] font-bold border border-[#7B61FF]/25">
                40% Weight
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl font-extrabold text-[#7B61FF] font-mono tracking-tight">{scores.answer_quality_score}</span>
              <span className="text-sm text-[#6E6E73]">/ 10</span>
            </div>
            <div className="w-full bg-[#E5E5EA] rounded-full h-2 mb-2 overflow-hidden border border-[#D1D1D6]">
              <div
                className="bg-gradient-to-r from-[#7B61FF] to-[#AF52DE] h-2 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(scores.answer_quality_score * 10, 100)}%` }}
              ></div>
            </div>
          </div>
          <span className="text-[11px] text-[#6E6E73] mt-2 block border-t border-[#E5E5EA] pt-2 truncate">
            Relevance, Depth &amp; STAR Method
          </span>
        </div>

        {/* Body Language Card (30% weight) */}
        <div className="p-5 rounded-2xl apple-glass shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#1B1B1D] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#FF9500]" />
                Body Language
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FF9500]/10 text-[#FF9500] font-bold border border-[#FF9500]/25">
                30% Weight
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl font-extrabold text-[#FF9500] font-mono tracking-tight">{scores.body_language_score}</span>
              <span className="text-sm text-[#6E6E73]">/ 10</span>
            </div>
            <div className="w-full bg-[#E5E5EA] rounded-full h-2 mb-2 overflow-hidden border border-[#D1D1D6]">
              <div
                className="bg-gradient-to-r from-[#FF9500] to-[#FFCC00] h-2 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(scores.body_language_score * 10, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-[#6E6E73] mt-2 border-t border-[#E5E5EA] pt-2 flex items-center justify-between">
            <span>Eye: {body_language_summary.avg_eye_contact_pct}%</span>
            <span className="text-[#FF9500] font-medium">Head: {body_language_summary.avg_head_stability_pct}%</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Filler Word Chart & Actionable Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filler Word Breakdown Chart (Recharts) */}
        <div className="lg:col-span-5 apple-glass rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1B1B1D] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#FF9500]" />
                Filler Word Breakdown
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono apple-glass-pill text-[#6E6E73] border border-[#E5E5EA]">
                Total: {speech_summary.total_filler_words}
              </span>
            </div>

            {speech_summary.filler_breakdown && speech_summary.filler_breakdown.length > 0 ? (
              <div className="w-full h-48 sm:h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={speech_summary.filler_breakdown}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6E6E73', fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fill: '#6E6E73', fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(16px)',
                        borderColor: '#E5E5EA',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#1B1B1D',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                      }}
                      formatter={(val) => [`${val} occurrences`, 'Frequency']}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {speech_summary.filler_breakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center bg-[#F6F3F5] rounded-2xl border border-dashed border-[#E5E5EA]">
                <CheckCircle2 className="w-8 h-8 text-[#008633] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#008633]">Flawless Delivery!</p>
                <p className="text-[11px] text-[#6E6E73] mt-1 max-w-xs mx-auto">
                  Zero filler words detected during your answers. Keep up this crisp vocal articulation!
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
            <span>Pauses &gt; 2s: <strong className="text-[#1B1B1D]">{speech_summary.total_long_pauses}</strong></span>
            <span>Avg WPM: <strong className="text-[#1B1B1D]">{speech_summary.avg_wpm}</strong></span>
          </div>
        </div>

        {/* Right Column: Strengths, Weaknesses & Improvement Tips */}
        <div className="lg:col-span-7 space-y-4">
          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="apple-glass rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-[#008633] mb-3">
                <CheckCircle2 className="w-4 h-4 text-[#008633]" />
                Demonstrated Strengths
              </div>
              <ul className="space-y-2">
                {aggregated_strengths && aggregated_strengths.length > 0 ? (
                  aggregated_strengths.map((st, idx) => (
                    <li key={idx} className="text-xs text-[#1B1B1D] flex items-start gap-2 bg-[#008633]/10 p-2.5 rounded-xl border border-[#008633]/20">
                      <span className="text-[#008633] text-xs font-bold">•</span>
                      <span>{st}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-[#6E6E73] italic">No specific strengths recorded.</li>
                )}
              </ul>
            </div>

            {/* Weaknesses / Areas for Improvement */}
            <div className="apple-glass rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF9500] mb-3">
                <AlertTriangle className="w-4 h-4 text-[#FF9500]" />
                Areas for Improvement
              </div>
              <ul className="space-y-2">
                {aggregated_weaknesses && aggregated_weaknesses.length > 0 ? (
                  aggregated_weaknesses.map((wk, idx) => (
                    <li key={idx} className="text-xs text-[#1B1B1D] flex items-start gap-2 bg-[#FF9500]/10 p-2.5 rounded-xl border border-[#FF9500]/20">
                      <span className="text-[#FF9500] text-xs font-bold">•</span>
                      <span>{wk}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-[#6E6E73] italic">No major weak points detected.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Actionable Improvement Tips Box */}
          <div className="bg-[#FAF8FE] border border-[#7B61FF]/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7B61FF] mb-3">
              <Lightbulb className="w-4 h-4 text-[#FF9500] animate-pulse" />
              Strategic AI Recommendations
            </div>
            <div className="space-y-2">
              {improvement_tips && improvement_tips.length > 0 ? (
                improvement_tips.map((tip, idx) => (
                  <div key={idx} className="text-xs text-[#1B1B1D] bg-white border border-[#E5E5EA] p-3 rounded-xl flex items-start gap-2 shadow-sm">
                    <span className="text-[#7B61FF] font-bold">0{idx + 1}.</span>
                    <span>{tip}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6E6E73]">Continue regular mock sessions to build interview endurance.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Per-Question Detailed Feedback Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1B1B1D] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0071E3]" />
            Per-Question In-Depth Breakdown
          </h2>
          <span className="text-xs text-[#6E6E73] font-mono">
            {questions_feedback.filter(q => q.has_answer).length} / {questions_feedback.length} Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {questions_feedback.map((qItem, idx) => {
            const isExpanded = !!expandedQuestions[qItem.id];
            const isAnswered = qItem.has_answer;

            return (
              <div
                key={qItem.id}
                className="apple-glass rounded-3xl overflow-hidden shadow-xl transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleQuestion(qItem.id)}
                  className="p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#F6F3F5]/60 transition select-none"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold text-xs shrink-0 border border-[#0071E3]/20">
                      Q{qItem.question_number || idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                          qItem.category?.toLowerCase() === 'technical'
                            ? 'bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20'
                            : 'bg-[#7B61FF]/10 text-[#7B61FF] border border-[#7B61FF]/20'
                        }`}>
                          {qItem.category?.toUpperCase() || 'QUESTION'}
                        </span>
                        {isAnswered ? (
                          <span className="text-[10px] text-[#008633] flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Answered
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#6E6E73] italic">Unanswered</span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-[#1B1B1D] line-clamp-1">{qItem.question_text}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isAnswered && qItem.scores && (
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="px-3 py-1 rounded-xl bg-[#008633]/10 border border-[#008633]/25 text-[#008633] font-mono font-bold text-xs">
                          {qItem.scores.overall}<span className="text-[10px] text-[#6E6E73] font-normal">/10</span>
                        </div>
                      </div>
                    )}
                    <button className="p-1 rounded-lg text-[#6E6E73] hover:text-[#1B1B1D]">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Question Body */}
                {isExpanded && (
                  <div className="p-6 pt-0 border-t border-[#E5E5EA] bg-[#FCF8FB] space-y-5 animate-in fade-in duration-200">
                    <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] text-xs text-[#1B1B1D] leading-relaxed font-sans shadow-sm">
                      <strong className="text-[#1B1B1D] block mb-1 font-semibold">Full Question:</strong>
                      {qItem.question_text}
                    </div>

                    {isAnswered ? (
                      <>
                        {/* 4-Dimension Sub-Score Pill Meters */}
                        {qItem.scores && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] text-center shadow-sm">
                              <span className="text-[10px] text-[#6E6E73] block mb-0.5">Relevance</span>
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-sm font-bold text-[#008633] font-mono">{qItem.scores.relevance}</span>
                                <span className="text-[10px] text-[#6E6E73]">/ 10</span>
                              </div>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] text-center shadow-sm">
                              <span className="text-[10px] text-[#6E6E73] block mb-0.5">Structure</span>
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-sm font-bold text-[#0071E3] font-mono">{qItem.scores.structure}</span>
                                <span className="text-[10px] text-[#6E6E73]">/ 10</span>
                              </div>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] text-center shadow-sm">
                              <span className="text-[10px] text-[#6E6E73] block mb-0.5">Technical Depth</span>
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-sm font-bold text-[#7B61FF] font-mono">{qItem.scores.depth}</span>
                                <span className="text-[10px] text-[#6E6E73]">/ 10</span>
                              </div>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] text-center shadow-sm">
                              <span className="text-[10px] text-[#6E6E73] block mb-0.5">Communication</span>
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-sm font-bold text-[#FF9500] font-mono">{qItem.scores.communication}</span>
                                <span className="text-[10px] text-[#6E6E73]">/ 10</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Candidate Transcript */}
                        <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#1B1B1D] flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-[#0071E3]" />
                              Candidate Audio Transcript
                            </span>
                            <span className="text-[11px] text-[#6E6E73] font-mono">
                              {qItem.duration_seconds}s • {qItem.words_per_minute} WPM • {qItem.filler_words_count} fillers
                            </span>
                          </div>
                          <p className="text-xs text-[#1B1B1D] leading-relaxed font-sans italic bg-[#F6F3F5] p-3 rounded-xl border border-[#E5E5EA]">
                            &ldquo;{qItem.transcript || '(No audible speech detected)'}&rdquo;
                          </p>
                        </div>

                        {/* Strengths & Weaknesses for this question */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-2xl bg-[#008633]/10 border border-[#008633]/20">
                            <span className="text-[11px] font-bold text-[#008633] block mb-1">👍 Strengths:</span>
                            <ul className="text-xs text-[#1B1B1D] space-y-1">
                              {qItem.strengths && qItem.strengths.length > 0 ? (
                                qItem.strengths.map((s, i) => <li key={i}>• {s}</li>)
                              ) : (
                                <li className="text-[#6E6E73] italic">Clear attempt</li>
                              )}
                            </ul>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/20">
                            <span className="text-[11px] font-bold text-[#FF9500] block mb-1">⚠️ To Improve:</span>
                            <ul className="text-xs text-[#1B1B1D] space-y-1">
                              {qItem.weaknesses && qItem.weaknesses.length > 0 ? (
                                qItem.weaknesses.map((w, i) => <li key={i}>• {w}</li>)
                              ) : (
                                <li className="text-[#6E6E73] italic">Keep practicing concise delivery</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* AI High-Impact Model Answer */}
                        {qItem.improved_sample_answer && (
                          <div className="p-4 rounded-2xl bg-[#FAF8FE] border border-[#7B61FF]/25 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#7B61FF] mb-2">
                              <Sparkles className="w-3.5 h-3.5 text-[#7B61FF]" />
                              AI Recommended Model Answer ({report.language})
                            </div>
                            <p className="text-xs text-[#1B1B1D] leading-relaxed font-sans bg-white p-3 rounded-xl border border-[#E5E5EA]">
                              {qItem.improved_sample_answer}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-4 text-center text-xs text-[#6E6E73] italic">
                        This question was skipped or not recorded during the session.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
