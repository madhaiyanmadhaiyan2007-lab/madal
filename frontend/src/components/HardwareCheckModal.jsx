import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  RefreshCw,
  ShieldCheck,
  Eye
} from 'lucide-react';

export default function HardwareCheckModal({ isOpen, onClose }) {
  const [micActive, setMicActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechTestStatus, setSpeechTestStatus] = useState('idle'); // idle | playing | done
  const [permissionError, setPermissionError] = useState(null);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Start Hardware Test
  const startHardwareCheck = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });

      mediaStreamRef.current = stream;

      // Video Stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }

      // Web Audio API for Live Audio Meter
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        setMicActive(true);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((avg / 128) * 100));
            setAudioLevel(normalized);
          }
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      }
    } catch (err) {
      console.warn('Hardware permission error:', err);
      setPermissionError('Camera or Microphone access was denied or is unavailable. You can still proceed with audio-only mode.');
    }
  };

  const stopHardwareCheck = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setMicActive(false);
    setCameraActive(false);
    setAudioLevel(0);
  };

  useEffect(() => {
    if (isOpen) {
      startHardwareCheck();
    } else {
      stopHardwareCheck();
    }
    return () => {
      stopHardwareCheck();
    };
  }, [isOpen]);

  const testTTSVoice = () => {
    if ('speechSynthesis' in window) {
      setSpeechTestStatus('playing');
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Hello! MockMate AI voice synthesis and speech recognition are calibrated and ready.');
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeechTestStatus('done');
      utterance.onerror = () => setSpeechTestStatus('idle');
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white/95 border border-[#E5E5EA] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden apple-glass">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#0071E3]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5EA] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#7B61FF] text-white flex items-center justify-center font-bold shadow-md shadow-[#0071E3]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1B1B1D] tracking-tight flex items-center gap-2">
                Studio Hardware & Gaze Calibration
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/25">
                  Pre-Check
                </span>
              </h3>
              <p className="text-xs text-[#6E6E73]">
                Verify camera feed, microphone input volume, and audio playback before starting.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6E6E73] hover:text-[#1B1B1D] hover:bg-[#F6F3F5] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {permissionError && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Studio Live Test Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Camera View & Gaze Centering Guide */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden aspect-video flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                {/* Visual Eye-Level Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-32 h-40 rounded-3xl border-2 border-dashed border-emerald-400/40 flex items-start justify-center pt-2">
                    <span className="text-[9px] font-mono text-emerald-300 bg-slate-950/70 px-1.5 py-0.5 rounded">
                      Face Area
                    </span>
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Camera Live
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <VideoOff className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <span className="text-xs text-slate-300 block font-medium">Camera Inactive</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Allow camera permissions in browser
                </span>
              </div>
            )}
          </div>

          {/* Audio & System Checklist */}
          <div className="flex flex-col justify-between gap-3 p-4 rounded-2xl bg-[#F6F3F5] border border-[#E5E5EA]">
            {/* Live Mic Meter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#1B1B1D] font-semibold flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-[#0071E3]" />
                  Microphone Input Level
                </span>
                <span className="font-mono text-[11px] text-[#0071E3] font-bold">{audioLevel}%</span>
              </div>

              {/* Dynamic Animated Meter */}
              <div className="w-full h-3 rounded-full bg-[#E5E5EA] overflow-hidden p-0.5 border border-[#D1D1D6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0071E3] via-[#7B61FF] to-[#34C759] transition-all duration-75"
                  style={{ width: `${Math.max(4, audioLevel)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-[#6E6E73] mt-1.5">
                Speak into your mic to verify sound pickup (ideal: 30%–70%).
              </p>
            </div>

            {/* AI Speech Synthesis (TTS) Test */}
            <div className="pt-3 border-t border-[#E5E5EA]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1B1B1D] block">AI Voice Playback (TTS)</span>
                  <span className="text-[10px] text-[#6E6E73]">Test interviewer question audio output</span>
                </div>
                <button
                  type="button"
                  onClick={testTTSVoice}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-[#EAE7EA] text-[#1B1B1D] border border-[#E5E5EA] shadow-sm transition cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#0071E3]" />
                  {speechTestStatus === 'playing' ? 'Playing...' : 'Test Speaker'}
                </button>
              </div>
            </div>

            {/* Privacy Guarantee */}
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E5EA] flex items-start gap-2 text-[10px] text-[#6E6E73]">
              <Eye className="w-3.5 h-3.5 text-[#0071E3] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1B1B1D]">100% Privacy-Preserving:</strong> Body language is tracked 100% client-side via MediaPipe. No raw video feed is stored on the server.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#E5E5EA] flex items-center justify-between">
          <button
            onClick={startHardwareCheck}
            className="flex items-center gap-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#1B1B1D] transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-scan Devices
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0071E3] to-[#7B61FF] text-white font-bold text-xs shadow-md shadow-[#0071E3]/25 cursor-pointer hover:opacity-95 transition active:scale-95"
          >
            Ready to Interview
          </button>
        </div>
      </div>
    </div>
  );
}
