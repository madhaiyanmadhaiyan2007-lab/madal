import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bot,
  Briefcase,
  Layers,
  RotateCcw,
  Mic,
  VideoOff,
  Camera,
  Square,
  AlertTriangle,
  RefreshCw,
  Clock,
  Radio,
  Gauge,
  PauseCircle,
  Hash,
  Award,
  ThumbsUp,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Target,
  BarChart2,
  Eye,
  Smile,
  ShieldCheck,
  Settings,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { answersApi } from '../api/client';
import { BodyLanguageTracker } from '../utils/bodyLanguageDetector';
import HardwareCheckModal from '../components/HardwareCheckModal';

export default function InterviewPage({ interview, onExit, onViewReport }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);

  // Calibration Modal State
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [showStarDrawer, setShowStarDrawer] = useState(false);

  // Media & Permission State
  const [mediaStream, setMediaStream] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Real-time Audio Level & Frequency Ribbon
  const [audioBands, setAudioBands] = useState([15, 25, 40, 20, 35, 18, 28, 12]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioAnimRef = useRef(null);

  // Client-Side Body Language Tracker (MediaPipe & Optical Telemetry)
  const trackerRef = useRef(null);
  const [telemetry, setTelemetry] = useState({
    faceDetected: true,
    eyeContactPct: 88,
    headTiltPct: 94,
    smilePct: 76,
    faceVisiblePct: 98,
    gazeOffset: { x: 0.1, y: -0.2 },
    framingAssessment: 'Centered (98% Optimal)',
    lightingLux: 720,
    faceBounds: { x: 28, y: 22, width: 44, height: 56 },
  });
  const [pendingBodyLanguageMetrics, setPendingBodyLanguageMetrics] = useState(null);

  // Track answers uploaded for each question
  const [savedAnswers, setSavedAnswers] = useState({});
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  const questions = interview?.questions || [];
  const currentQ = questions[currentIndex] || null;
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  // 1. Initialize Tracker
  useEffect(() => {
    trackerRef.current = new BodyLanguageTracker();
    return () => {
      if (trackerRef.current) {
        trackerRef.current.stopTracking();
      }
    };
  }, []);

  // 2. Audio Level Visualizer
  const setupAudioAnalyser = useCallback((stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx || !stream.getAudioTracks().length) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateBands = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          // Pick 8 representative bands
          const bands = [];
          for (let i = 0; i < 8; i++) {
            const raw = dataArray[i * 2] || 0;
            bands.push(Math.min(100, Math.round((raw / 255) * 100)));
          }
          setAudioBands(bands);
        }
        audioAnimRef.current = requestAnimationFrame(updateBands);
      };
      updateBands();
    } catch {
      // AudioContext failure gracefully ignored
    }
  }, []);

  // 3. Initialize Media Devices (Camera + Mic)
  const initializeMedia = useCallback(async () => {
    setIsRequestingPermission(true);
    setPermissionError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media recording is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });

      setMediaStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (trackerRef.current) {
            trackerRef.current.startTracking(videoRef.current, (newMetrics) => {
              setTelemetry(newMetrics);
            });
          }
        };
      }

      setupAudioAnalyser(stream);
    } catch (err) {
      console.error('Media permission error:', err);
      let message = 'Microphone & camera access was denied. Please allow permissions in your browser bar.';
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera or microphone found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Your camera or microphone is already in use by another application.';
      }
      setPermissionError(message);
    } finally {
      setIsRequestingPermission(false);
    }
  }, [setupAudioAnalyser]);

  // Speech cancellation
  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Recording controls
  const stopRecording = useCallback((shouldCapture = true) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (trackerRef.current && isRecording) {
      const averagedMetrics = trackerRef.current.stopRecording();
      if (shouldCapture) {
        setPendingBodyLanguageMetrics(averagedMetrics);
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false);
    }
  }, [isRecording]);

  useEffect(() => {
    initializeMedia();
    if (!('speechSynthesis' in window)) {
      setTtsSupported(false);
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioAnimRef.current) cancelAnimationFrame(audioAnimRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      stopSpeech();
    };
  }, [initializeMedia, mediaStream, stopSpeech]);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // Reset or load saved answer state when navigating questions
  useEffect(() => {
    stopSpeech();
    stopRecording(false);
    setUploadError(null);
    setShowModelAnswer(false);

    if (currentQ && savedAnswers[currentQ.id]) {
      const saved = savedAnswers[currentQ.id];
      setCurrentAnalysis(saved);
      setRecordedAudioUrl(saved.audioUrl || null);
    } else {
      setCurrentAnalysis(null);
      setRecordedAudioUrl(null);
      setRecordedBlob(null);
      setRecordingSeconds(0);
      setPendingBodyLanguageMetrics(null);
    }
  }, [currentIndex, isCompleted, currentQ, savedAnswers, stopRecording, stopSpeech]);

  const speakCurrentQuestion = () => {
    if (!ttsSupported || !currentQ) return;
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQ.question_text);
    const isTamil = interview?.language?.toLowerCase().includes('tamil');

    utterance.lang = isTamil ? 'ta-IN' : 'en-US';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (isTamil) {
        const tamilVoice = voices.find(
          (v) => v.lang.toLowerCase().includes('ta') || v.name.toLowerCase().includes('tamil')
        );
        if (tamilVoice) utterance.voice = tamilVoice;
      } else {
        const enVoice = voices.find(
          (v) => (v.lang.startsWith('en') && v.name.includes('Google')) || v.lang === 'en-US'
        );
        if (enVoice) utterance.voice = enVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    if (!mediaStream) {
      initializeMedia();
      return;
    }

    stopSpeech();
    setUploadError(null);
    setRecordedAudioUrl(null);
    setRecordedBlob(null);
    setCurrentAnalysis(null);
    setRecordingSeconds(0);
    setPendingBodyLanguageMetrics(null);
    audioChunksRef.current = [];

    // Start Tracker Recording Buffer
    if (trackerRef.current) {
      trackerRef.current.startRecording();
    }

    const audioStream = new MediaStream(mediaStream.getAudioTracks());

    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else mimeType = '';
    }

    const options = mimeType ? { mimeType } : {};
    const mediaRecorder = new MediaRecorder(audioStream, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setRecordedBlob(audioBlob);
      setRecordedAudioUrl(audioUrl);
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };

    mediaRecorder.start(250);
    setIsRecording(true);

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Upload Audio & Trigger Whisper + LLM Evaluation + Body Language
  const handleUploadAndAnalyze = async () => {
    if (!recordedBlob || !currentQ) return;

    setIsUploading(true);
    setUploadError(null);

    // Compute or retrieve body language metrics
    const bodyMetrics = pendingBodyLanguageMetrics || {
      eye_contact_pct: telemetry.eyeContactPct,
      head_tilt_pct: telemetry.headTiltPct,
      smile_pct: telemetry.smilePct,
      face_visible_pct: telemetry.faceVisiblePct,
    };

    try {
      const response = await answersApi.uploadAnswer(
        interview.id,
        currentQ.id,
        recordedBlob,
        bodyMetrics
      );

      const analysisPayload = {
        id: response.id,
        audioUrl: recordedAudioUrl,
        transcript: response.transcript,
        metrics: response.metrics,
        evaluation: response.evaluation,
        body_language: response.body_language,
        status: 'saved',
      };

      setSavedAnswers((prev) => ({
        ...prev,
        [currentQ.id]: analysisPayload,
      }));

      setCurrentAnalysis(analysisPayload);
    } catch (err) {
      console.error('Answer evaluation error:', err);
      setUploadError(err.message || 'Failed to upload and evaluate audio answer.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProceedNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.round(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isTechnical = currentQ?.category?.toLowerCase() === 'technical';

  // Session cumulative statistics
  const savedAnswersList = Object.values(savedAnswers);
  const avgOverallScore =
    savedAnswersList.length > 0
      ? (
          savedAnswersList.reduce((acc, a) => acc + (a.evaluation?.scores?.overall || 0), 0) /
          savedAnswersList.length
        ).toFixed(1)
      : '0.0';
  const avgWpm =
    savedAnswersList.length > 0
      ? Math.round(
          savedAnswersList.reduce((acc, a) => acc + (a.metrics?.words_per_minute || 0), 0) /
            savedAnswersList.length
        )
      : 0;
  const avgEyeContact =
    savedAnswersList.length > 0
      ? Math.round(
          savedAnswersList.reduce((acc, a) => acc + (a.body_language?.eye_contact_pct || 85), 0) /
            savedAnswersList.length
        )
      : 85;
  const totalFillers = savedAnswersList.reduce(
    (acc, a) => acc + (a.metrics?.filler_words_count || 0),
    0
  );
  const totalPauses = savedAnswersList.reduce(
    (acc, a) => acc + (a.metrics?.long_pauses_count || 0),
    0
  );

  // COMPLETION VIEW
  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
        <div className="apple-glass rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-4 shadow-lg shadow-emerald-500/10">
              <Award className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Mock Interview Scorecard
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto">
              Evaluation report generated for {interview.role} ({interview.language}) with AI scoring across 30% Speech + 40% Answer Quality + 30% Body Language.
            </p>
          </div>

          {/* Session Cumulative Scorecard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            <div className="p-4 rounded-2xl apple-glass-card border-emerald-500/30 text-center">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Overall
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {avgOverallScore}
                <span className="text-xs text-slate-400 font-normal">/10</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-medium">30-40-30 Metric</span>
            </div>

            <div className="p-4 rounded-2xl apple-glass-card text-center">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                Avg Pace
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {avgWpm} <span className="text-xs text-slate-400 font-normal">WPM</span>
              </div>
              <span className="text-[10px] text-blue-400 font-medium">110-165 Target</span>
            </div>

            <div className="p-4 rounded-2xl apple-glass-card text-center">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                Eye Contact
              </div>
              <div className="text-2xl font-extrabold text-purple-300 font-mono">
                {avgEyeContact}%
              </div>
              <span className="text-[10px] text-purple-400 font-medium">MediaPipe Vision</span>
            </div>

            <div className="p-4 rounded-2xl apple-glass-card text-center">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                Filler Words
              </div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {totalFillers}
              </div>
              <span className="text-[10px] text-slate-400">Total Count</span>
            </div>

            <div className="p-4 rounded-2xl apple-glass-card text-center col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                <PauseCircle className="w-3.5 h-3.5 text-indigo-400" />
                Pauses
              </div>
              <div className="text-2xl font-extrabold text-indigo-400 font-mono">
                {totalPauses}
              </div>
              <span className="text-[10px] text-slate-400">&gt; 2s Dead Air</span>
            </div>
          </div>

          {/* Question-by-Question Evaluation Breakdown */}
          <div className="space-y-4 mb-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Question Evaluations &amp; Model Answers Breakdown
            </div>

            {questions.map((q, idx) => {
              const ans = savedAnswers[q.id];
              const scores = ans?.evaluation?.scores;
              const bl = ans?.body_language;

              return (
                <div
                  key={q.id || idx}
                  className="p-5 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-start gap-2 text-xs text-slate-200">
                      <span className="font-mono text-emerald-400 font-bold shrink-0">Q{idx + 1}.</span>
                      <span className="font-semibold text-white">{q.question_text}</span>
                    </div>
                    {scores && (
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {bl && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Eye: {bl.eye_contact_pct}%
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Score: {scores.overall}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {ans?.evaluation ? (
                    <div className="space-y-3 text-xs">
                      {/* 4 Scores Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400">Relevance</span>
                          <div className="font-bold text-slate-200">{scores.relevance}/10</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400">Structure</span>
                          <div className="font-bold text-slate-200">{scores.structure}/10</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400">Depth</span>
                          <div className="font-bold text-slate-200">{scores.depth}/10</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400">Communication</span>
                          <div className="font-bold text-slate-200">{scores.communication}/10</div>
                        </div>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 space-y-1">
                          <span className="font-semibold flex items-center gap-1.5 text-emerald-400">
                            <ThumbsUp className="w-3 h-3" /> Strengths:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-200/90">
                            {ans.evaluation.strengths?.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-300 space-y-1">
                          <span className="font-semibold flex items-center gap-1.5 text-amber-400">
                            <AlertCircle className="w-3 h-3" /> Areas for Improvement:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90">
                            {ans.evaluation.weaknesses?.map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Model Sample Answer */}
                      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" /> Improved Model Answer:
                        </span>
                        <p className="text-[11px] leading-relaxed text-slate-300 whitespace-pre-line">
                          {ans.evaluation.improved_sample_answer}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No audio recorded or evaluated for this question.</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsCompleted(false);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Review / Re-record Answers
            </button>
            {onViewReport && (
              <button
                onClick={() => onViewReport(interview.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer transition"
              >
                <Award className="w-4 h-4" />
                <span>View Full Performance Report</span>
              </button>
            )}
            <button
              onClick={onExit}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer transition"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE INTERVIEW VIEW
  const evalData = currentAnalysis?.evaluation;
  const evalScores = evalData?.scores;
  const currentBl = currentAnalysis?.body_language;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* Hardware Calibration Modal */}
      <HardwareCheckModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
      />

      {/* Top Header Card / Session HUD */}
      <div className="apple-glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">{interview.role}</h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-teal-500/15 text-teal-300 border border-teal-500/25">
                {interview.language}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                MediaPipe Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Speech Fluency, 4-Dimension AI Scoring &amp; Client-Side Posture Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCalibrationOpen(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
            title="Adjust Camera & Microphone"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Calibrate</span>
          </button>

          <button
            onClick={() => setShowStarDrawer(!showStarDrawer)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              showStarDrawer
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10'
            }`}
            title="Toggle STAR Methodology Guide"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">STAR Tips</span>
          </button>

          <button
            onClick={onExit}
            className="text-xs px-3 py-1.5 rounded-xl apple-glass hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Permission Warning Alert */}
      {permissionError && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in backdrop-blur-xl">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Camera / Microphone Access Notice</p>
              <p className="text-amber-300/80 mt-0.5">{permissionError}</p>
            </div>
          </div>
          <button
            onClick={initializeMedia}
            disabled={isRequestingPermission}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 font-semibold cursor-pointer transition shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${isRequestingPermission ? 'animate-spin' : ''}`} />
            Retry Access
          </button>
        </div>
      )}

      {/* STAR Coach Guide Drawer (Collapsible) */}
      {showStarDrawer && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900/80 border border-purple-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 text-xs text-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold text-purple-300">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>STAR Formula Answering Guide:</span>
            </div>
            <button
              onClick={() => setShowStarDrawer(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-[11px] mt-2">
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20">
              <span className="font-bold text-purple-400 block mb-0.5">S - Situation</span>
              <p className="text-slate-300">Set the context, project scope, team background, or technical challenge.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20">
              <span className="font-bold text-blue-400 block mb-0.5">T - Task</span>
              <p className="text-slate-300">Define what was required from you specifically and what criteria defined success.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20">
              <span className="font-bold text-emerald-400 block mb-0.5">A - Action</span>
              <p className="text-slate-300">Explain the precise steps, architectures, tools, and technical problem-solving you led.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20">
              <span className="font-bold text-amber-400 block mb-0.5">R - Result</span>
              <p className="text-slate-300">Deliver quantified metrics (latency reduced, users served) and what you learned.</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-300 font-medium">
          <span>
            Question <strong className="text-white">{currentIndex + 1}</strong> of {totalQuestions}
          </span>
          <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-900/80 h-2 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full transition-all duration-300 ease-out shadow-sm"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Grid: Left (Question & Recording & LLM Evaluation) + Right (Webcam Preview & Telemetry) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Details & Evaluation (7 Cols) */}
        <div className="lg:col-span-7 apple-glass rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6">
          {/* Header row: Category tag & TTS */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                isTechnical
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              {isTechnical ? 'Technical Domain' : 'HR & Behavioral'}
            </span>

            {ttsSupported && (
              <button
                onClick={speakCurrentQuestion}
                className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition cursor-pointer active:scale-95 ${
                  isSpeaking
                    ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-300 animate-pulse'
                    : 'apple-glass hover:bg-slate-800/80 text-slate-200'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-emerald-400" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Read Aloud</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Question Text */}
          <div>
            <div className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase mb-2">
              Question #{currentIndex + 1}
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-white leading-relaxed tracking-tight">
              {currentQ?.question_text}
            </h1>
          </div>

          {/* Answer Evaluation Card (Phase 6 & 7) */}
          {currentAnalysis && evalData && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header with Overall Score */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">AI Evaluation &amp; Scorecard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Overall:</span>
                  <span className="text-sm font-extrabold font-mono px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {evalScores?.overall || 0}/10
                  </span>
                </div>
              </div>

              {/* 4-Dimension Scores Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Relevance</span>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">{evalScores?.relevance}/10</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Structure</span>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">{evalScores?.structure}/10</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Depth</span>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">{evalScores?.depth}/10</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Communication</span>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">{evalScores?.communication}/10</div>
                </div>
              </div>

              {/* Phase 7: Body Language Telemetry Strip */}
              {currentBl && (
                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Body Language Telemetry:</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-purple-300">Eye: {currentBl.eye_contact_pct}%</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-teal-300">Posture: {currentBl.head_tilt_pct}%</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-300">Smile: {currentBl.smile_pct}%</span>
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 space-y-1.5">
                  <span className="font-semibold flex items-center gap-1.5 text-emerald-400 text-xs">
                    <ThumbsUp className="w-3.5 h-3.5" /> Strengths:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-200/90">
                    {evalData.strengths?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/40 text-amber-300 space-y-1.5">
                  <span className="font-semibold flex items-center gap-1.5 text-amber-400 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" /> Areas for Improvement:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-200/90">
                    {evalData.weaknesses?.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Sample Answer Accordion */}
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800/80 text-xs font-semibold text-emerald-400 flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    View Improved Model Answer ({interview.language})
                  </span>
                  {showModelAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showModelAnswer && (
                  <div className="p-3.5 bg-slate-950 text-xs text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800 animate-in fade-in">
                    {evalData.improved_sample_answer}
                  </div>
                )}
              </div>

              {/* Transcribed Speech & Fluency Strip */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between gap-3">
                <div className="line-clamp-1 italic text-slate-400">"{currentAnalysis.transcript}"</div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className="text-blue-400">{currentAnalysis.metrics?.words_per_minute || 0} WPM</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400">
                    {currentAnalysis.metrics?.filler_words_count || 0} fillers
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Audio Recording Control Panel */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Mic className="w-4 h-4 text-emerald-400" />
                {currentAnalysis ? 'Answer Evaluated' : 'Audio Response'}
              </div>

              {/* Timer Badge */}
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    REC {formatTimer(recordingSeconds)}
                  </span>
                ) : recordedAudioUrl ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimer(recordingSeconds || currentAnalysis?.metrics?.duration_seconds || 0)} recorded
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">00:00</span>
                )}
              </div>
            </div>

            {/* Recording & Upload Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {!isRecording && !recordedAudioUrl ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition active:scale-95"
                >
                  <Radio className="w-4 h-4" />
                  <span>Start Answer</span>
                </button>
              ) : isRecording ? (
                <button
                  type="button"
                  onClick={() => stopRecording(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 cursor-pointer transition active:scale-95 animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Answer</span>
                </button>
              ) : !currentAnalysis ? (
                <div className="flex-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-record</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUploadAndAnalyze}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition active:scale-95 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        Evaluating with Whisper &amp; LLM...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit &amp; Evaluate Answer</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-record Answer</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedNext}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition active:scale-95"
                  >
                    <span>
                      {currentIndex === totalQuestions - 1
                        ? 'Finish Interview'
                        : 'Continue to Next Question'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Audio Playback Review Player */}
            {recordedAudioUrl && !isRecording && (
              <div className="pt-2">
                <audio src={recordedAudioUrl} controls className="w-full h-9 rounded-lg opacity-90" />
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {uploadError}
              </div>
            )}
          </div>

          {/* Bottom Nav: Previous & Skip */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => currentIndex > 0 && setCurrentIndex((p) => p - 1)}
              disabled={currentIndex === 0 || isRecording || isUploading}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => {
                if (currentIndex < totalQuestions - 1) {
                  setCurrentIndex((p) => p + 1);
                } else {
                  setIsCompleted(true);
                }
              }}
              disabled={isRecording || isUploading}
              className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {currentIndex === totalQuestions - 1 ? 'Skip to Finish →' : 'Skip Question →'}
            </button>
          </div>
        </div>

        {/* Right Column: Live Webcam Preview with MediaPipe Computer Vision HUD (5 Cols) */}
        <div className="lg:col-span-5 apple-glass rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Candidate Vision Telemetry</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Feed
            </span>
          </div>

          {/* Video Preview Box with Computer Vision Landmark Overlays */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center shadow-inner group">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {!mediaStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950/90 backdrop-blur-md">
                <VideoOff className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-xs">Webcam feed unavailable</p>
                <button
                  onClick={initializeMedia}
                  className="mt-3 text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  Enable Camera
                </button>
              </div>
            )}

            {/* Subtle Rule-of-Thirds Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
              <div className="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"></div>
              <div className="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"></div>
              <div className="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"></div>
              <div className="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"></div>
              <div className="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"></div>
              <div className="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"></div>
              <div className="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"></div>
              <div className="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"></div>
              <div className="shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"></div>
            </div>

            {/* Computer Vision Landmark Reticle Box */}
            {mediaStream && (
              <div
                className="absolute pointer-events-none transition-all duration-150 border border-emerald-400/30 rounded-xl"
                style={{
                  top: `${telemetry.faceBounds.y}%`,
                  left: `${telemetry.faceBounds.x}%`,
                  width: `${telemetry.faceBounds.width}%`,
                  height: `${telemetry.faceBounds.height}%`,
                }}
              >
                {/* 4 Corner Brackets (Apple-Stitch Hardware Aesthetic) */}
                <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#72fe88] rounded-tl-sm shadow-[0_0_8px_#72fe88]"></span>
                <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#72fe88] rounded-tr-sm shadow-[0_0_8px_#72fe88]"></span>
                <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#72fe88] rounded-bl-sm shadow-[0_0_8px_#72fe88]"></span>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#72fe88] rounded-br-sm shadow-[0_0_8px_#72fe88]"></span>

                {/* Face Center Gaze Reticle Node */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-5 h-5 rounded-full border border-emerald-400/80 flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="text-[9px] text-[#72fe88] font-mono bg-black/75 px-1.5 py-0.5 rounded mt-1 backdrop-blur-sm shadow">
                    Gaze: {telemetry.gazeOffset.x > 0 ? `+${telemetry.gazeOffset.x}` : telemetry.gazeOffset.x}° ({telemetry.eyeContactPct}%)
                  </span>
                </div>
              </div>
            )}

            {/* Top HUD Badges Over Video Feed */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-[10px] text-white font-medium border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{telemetry.framingAssessment}</span>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/65 backdrop-blur-md text-[10px] text-slate-300 font-mono border border-white/10">
                <span>{telemetry.lightingLux} lux</span>
              </div>
            </div>

            {/* Bottom HUD: Live Audio Dynamic Waveform Ribbon */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
                <Mic className="w-3 h-3 text-blue-400" />
                <div className="flex items-end gap-0.5 h-3.5 w-14">
                  {audioBands.map((val, idx) => (
                    <div
                      key={idx}
                      className="w-1 rounded-full bg-gradient-to-t from-blue-500 to-indigo-400 transition-all duration-75"
                      style={{ height: `${Math.max(15, (val / 100) * 100)}%` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-blue-300 font-bold ml-0.5">
                  {isRecording ? 'REC' : 'MIC'}
                </span>
              </div>

              {isRecording && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-bold shadow-lg backdrop-blur-sm animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>{formatTimer(recordingSeconds)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Telemetry Readout Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-center">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                <Eye className="w-3 h-3 text-purple-400" />
                <span>Eye Contact</span>
              </div>
              <div className="text-sm font-extrabold text-white font-mono">
                {telemetry.eyeContactPct}%
              </div>
              <span className="text-[9px] text-emerald-400">Target &gt; 70%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-center">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                <Target className="w-3 h-3 text-teal-400" />
                <span>Head Stability</span>
              </div>
              <div className="text-sm font-extrabold text-white font-mono">
                {telemetry.headTiltPct}%
              </div>
              <span className="text-[9px] text-teal-400">Postural Axis</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-center">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                <Smile className="w-3 h-3 text-amber-400" />
                <span>Expression</span>
              </div>
              <div className="text-sm font-extrabold text-white font-mono">
                {telemetry.smilePct}%
              </div>
              <span className="text-[9px] text-amber-300">Positive Flow</span>
            </div>
          </div>

          {/* Scoring Rubric Reference */}
          <div className="p-3.5 rounded-2xl apple-glass-card text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" /> 30-40-30 Composite Weighting:
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Overall Score = (30% Speech Fluency) + (40% Answer Depth &amp; Structure) + (30% Body Language &amp; Gaze).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
