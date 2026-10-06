import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Languages,
  Subtitles,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import type { EnrollmentState } from '../../types';

interface WhyNoCostEmiPageProps {
  state: EnrollmentState;
  onContinue: () => void;
  onBack: () => void;
}

interface EmiSubtitleCue {
  id: number;
  start: number;
  end: number;
  textEn: string;
  textTe: string;
}

const EMI_SUBTITLE_CUES: EmiSubtitleCue[] = [
  {
    id: 1,
    start: 0,
    end: 6.6,
    textEn: 'You want to join Nxtwave, but paying the entire program fee upfront is a massive roadblock.',
    textTe: 'à°®à±€à°°à± à°¨à±†à°•à±à°¸à±à°Ÿà±â€Œà°µà±‡à°µà±â€Œà°²à±‹ à°šà±‡à°°à°¾à°²à°¨à±à°•à±à°‚à°Ÿà±à°¨à±à°¨à°¾à°°à±, à°•à°¾à°¨à±€ à°®à±Šà°¤à±à°¤à°‚ à°«à±€à°œà±à°¨à± à°’à°•à±‡à°¸à°¾à°°à°¿ à°šà±†à°²à±à°²à°¿à°‚à°šà°¡à°‚ à°’à°• à°ªà±†à°¦à±à°¦ à°…à°¡à±à°¡à°‚à°•à°¿à°—à°¾ à°…à°¨à°¿à°ªà°¿à°‚à°šà°µà°šà±à°šà±.',
  },
  {
    id: 2,
    start: 6.6,
    end: 13.0,
    textEn: 'So when you stare at that daunting checkout screen, you do not have to hunt for bank loans alone.',
    textTe: 'à°šà±†à°•à±â€Œà°…à°µà±à°Ÿà± à°¸à±à°•à±à°°à±€à°¨à±â€Œà°¨à± à°šà±‚à°¸à°¿ à°®à±€à°°à± à°†à°‚à°¦à±‹à°³à°¨ à°šà±†à°‚à°¦à°¾à°²à±à°¸à°¿à°¨ à°ªà°¨à°¿à°²à±‡à°¦à±. à°®à±‡à°®à± à°®à±€à°•à± à°…à°‚à°¡à°—à°¾ à°‰à°‚à°Ÿà°¾à°®à±.',
  },
  {
    id: 3,
    start: 13.0,
    end: 19.4,
    textEn: 'Nxtwave teams up with specialized financing partners to make your education accessible and affordable.',
    textTe: 'à°¬à±à°¯à°¾à°‚à°•à± à°²à±‹à°¨à±à°² à°•à±‹à°¸à°‚ à°®à±€à°°à± à°’à°•à±à°•à°°à±‡ à°¤à°¿à°°à°—à°¾à°²à±à°¸à°¿à°¨ à°ªà°¨à°¿à°²à±‡à°¦à±. à°¨à±†à°•à±à°¸à±à°Ÿà±â€Œà°µà±‡à°µà± à°ªà±à°°à°®à±à°– à°«à±ˆà°¨à°¾à°¨à±à°¸à°¿à°‚à°—à± à°­à°¾à°—à°¸à±à°µà°¾à°®à±à°²à°¤à±‹ à°ªà°¨à°¿à°šà±‡à°¸à±à°¤à±à°‚à°¦à°¿.',
  },
  {
    id: 4,
    start: 19.4,
    end: 26.6,
    textEn: 'Here is how it works: That solid block of your total fee gets divided into equal monthly slices.',
    textTe: 'à°‡à°¦à°¿ à°Žà°²à°¾ à°ªà°¨à°¿à°šà±‡à°¸à±à°¤à±à°‚à°¦à°‚à°Ÿà±‡: à°®à±€ à°®à±Šà°¤à±à°¤à°‚ à°«à±€à°œà± à°¸à°®à°¾à°¨à°®à±ˆà°¨ à°¨à±†à°²à°µà°¾à°°à±€ à°µà°¾à°¯à°¿à°¦à°¾à°²à±à°—à°¾ à°µà°¿à°­à°œà°¿à°‚à°šà°¬à°¡à±à°¤à±à°‚à°¦à°¿.',
  },
  {
    id: 5,
    start: 26.6,
    end: 36.3,
    textEn: 'With a zero-percent interest payment plan, you pay the exact original fee with zero extra interest.',
    textTe: 'à°œà±€à°°à±‹ à°ªà°°à±à°¸à±†à°‚à°Ÿà± à°‡à°‚à°Ÿà±à°°à±†à°¸à±à°Ÿà± à°ªà±à°²à°¾à°¨à±â€Œà°¤à±‹, à°®à±€à°°à± à°…à°¸à°²à± à°«à±€à°œà±à°¨à± à°®à°¾à°¤à±à°°à°®à±‡ à°šà±†à°²à±à°²à°¿à°¸à±à°¤à°¾à°°à±. à°Žà°²à°¾à°‚à°Ÿà°¿ à°…à°¦à°¨à°ªà± à°µà°¡à±à°¡à±€ à°‰à°‚à°¡à°¦à±.',
  },
  {
    id: 6,
    start: 36.3,
    end: 46.4,
    textEn: 'Because most students lack an income history, you need an earning co-applicant, like a working parent.',
    textTe: 'à°µà°¿à°¦à±à°¯à°¾à°°à±à°¥à±à°²à°•à± à°¸à±à°µà°‚à°¤ à°†à°¦à°¾à°¯à°‚ à°‰à°‚à°¡à°¦à± à°•à°¾à°¬à°Ÿà±à°Ÿà°¿, à°¸à°‚à°ªà°¾à°¦à°¿à°¸à±à°¤à±à°¨à±à°¨ à°¤à°²à±à°²à°¿à°¦à°‚à°¡à±à°°à±à°²à°¨à± à°•à±‹-à°…à°ªà±à°²à°¿à°•à±†à°‚à°Ÿà±â€Œà°—à°¾ à°Žà°‚à°šà±à°•à±‹à°µà°¾à°²à°¿.',
  },
  {
    id: 7,
    start: 46.4,
    end: 57.9,
    textEn: 'Nxtwave provides the education, while the financing partner independently evaluates and approves you.',
    textTe: 'à°¨à±†à°•à±à°¸à±à°Ÿà±â€Œà°µà±‡à°µà± à°•à±‡à°µà°²à°‚ à°µà°¿à°¦à±à°¯à°¨à± à°®à°¾à°¤à±à°°à°®à±‡ à°…à°‚à°¦à°¿à°¸à±à°¤à±à°‚à°¦à°¿. à°«à±ˆà°¨à°¾à°¨à±à°¸à°¿à°‚à°—à± à°­à°¾à°—à°¸à±à°µà°¾à°®à°¿ à°¸à±à°µà°¤à°‚à°¤à±à°°à°‚à°—à°¾ à°†à°®à±‹à°¦à°‚ à°¤à±†à°²à±à°ªà±à°¤à±à°‚à°¦à°¿.',
  },
  {
    id: 8,
    start: 57.9,
    end: 66.6,
    textEn: 'Once approved, the gate opens. Those monthly blocks lock into an automated sequence for hassle-free repayment.',
    textTe: 'à°†à°®à±‹à°¦à°‚ à°ªà±Šà°‚à°¦à°¿à°¨ à°µà±†à°‚à°Ÿà°¨à±‡, à°¸à±à°²à°­à°®à±ˆà°¨ à°°à±€à°ªà±‡à°®à±†à°‚à°Ÿà± à°•à±‹à°¸à°‚ à°¨à±†à°²à°µà°¾à°°à±€ à°µà°¾à°¯à°¿à°¦à°¾à°²à± à°†à°Ÿà±‹à°®à±‡à°Ÿà°¿à°•à±â€Œà°—à°¾ à°ªà±à°°à°¾à°°à°‚à°­à°®à°µà±à°¤à°¾à°¯à°¿.',
  },
  {
    id: 9,
    start: 66.6,
    end: 78.3,
    textEn: 'Instead of stressing over the total, you can rely on a monthly plan, letting you focus entirely on your new tech career.',
    textTe: 'à°’à°•à±‡à°¸à°¾à°°à°¿ à°«à±€à°œà± à°­à°¾à°°à°‚ à°²à±‡à°•à±à°‚à°¡à°¾, à°¸à±Œà°•à°°à±à°¯à°µà°‚à°¤à°®à±ˆà°¨ à°¨à±†à°²à°µà°¾à°°à±€ à°ªà±à°²à°¾à°¨à±â€Œà°¤à±‹ à°®à±€à°°à± à°ªà±‚à°°à±à°¤à°¿à°—à°¾ à°®à±€ à°Ÿà±†à°•à± à°•à±†à°°à±€à°°à± à°¨à°¿à°°à±à°®à°¾à°£à°‚à°ªà±ˆ à°¦à±ƒà°·à±à°Ÿà°¿ à°ªà±†à°Ÿà±à°Ÿà°µà°šà±à°šà±.',
  },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const WhyNoCostEmiPage: React.FC<WhyNoCostEmiPageProps> = ({
  state,
  onContinue,
  onBack,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isIitOcn = state.program?.name?.toLowerCase().includes('iit') || state.program?.name?.toLowerCase().includes('ocn');
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(78);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);

  // Unconditionally stop VoiceAgent speaking immediately
  const stopVoiceAgent = () => {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.pause();
          window.speechSynthesis.cancel();
        } catch {}
      }
      window.dispatchEvent(new CustomEvent('stop-voice-agent'));
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      stopVoiceAgent();
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch((err) => {
        console.warn('Video play blocked:', err);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Switch audio language
  const toggleLanguage = (newLang: 'en' | 'te') => {
    if (newLang === language) return;
    const timeBeforeSwitch = videoRef.current ? videoRef.current.currentTime : currentTime;
    const wasPlaying = isPlaying;
    setLanguage(newLang);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = timeBeforeSwitch;
        if (wasPlaying) {
          stopVoiceAgent();
          videoRef.current.play().catch(() => {});
        }
      }
    }, 50);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  // Restart video
  const handleRestart = () => {
    if (!videoRef.current) return;
    stopVoiceAgent();
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {});
  };

  // Seekbar change
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  // Active subtitle text calculation
  const activeCue = EMI_SUBTITLE_CUES.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );
  const activeSubtitle = activeCue
    ? language === 'te'
      ? activeCue.textTe
      : activeCue.textEn
    : '';

  const videoSource =
    language === 'te'
      ? '/videos/nxtwave_emi_explainer_te.mp4'
      : '/videos/nxtwave_emi_explainer.mp4';

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-7 flex flex-col items-center"
      >
        {/* Header - Clean and focused */}
        <div className="w-full text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-[#0B63E5] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isIitOcn ? 'Financing & EMI Guide' : 'Financing & No-Cost EMI Guide'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A192F] tracking-tight">
            If you choose {isIitOcn ? 'EMI' : 'No-Cost EMI'}
          </h1>
          <div className="text-xs sm:text-sm text-slate-500 mt-2 space-y-2 max-w-md mx-auto">
            <p>
              Before you continue, we'll explain how the payment plan works, including the monthly payment, financing process, and any applicable charges.
            </p>
            <p>
              Watch the short video to understand the EMI process, co-applicant requirements, and what happens after you apply.
            </p>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mr-1">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <span>Audio:</span>
            </span>
            <button
              id="emi-lang-en-btn"
              type="button"
              onClick={() => toggleLanguage('en')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#0B63E5] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              English
            </button>
            <button
              id="emi-lang-te-btn"
              type="button"
              onClick={() => toggleLanguage('te')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                language === 'te'
                  ? 'bg-[#0B63E5] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Telugu
            </button>
          </div>
        </div>

        {/* EMBEDDED EMI VIDEO PLAYER */}
        <div
          ref={containerRef}
          className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg group select-none"
        >
          {/* Native HTML5 Video Element */}
          <video
            ref={videoRef}
            id="emi-explainer-video"
            key={videoSource}
            src={videoSource}
            playsInline
            preload="metadata"
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
            onPointerDown={stopVoiceAgent}
            onPlay={() => {
              stopVoiceAgent();
              setIsPlaying(true);
              setHasStarted(true);
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setHasStarted(false);
            }}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration || 78);
              }
            }}
          >
            <track
              kind="subtitles"
              src={language === 'te' ? '/videos/emi_subtitles_te.vtt' : '/videos/emi_subtitles_en.vtt'}
              srcLang={language}
              label={language === 'te' ? 'Telugu' : 'English'}
              default={showSubtitles}
            />
          </video>

          {/* Large Center Play Overlay (when paused or before started) */}
          {(!isPlaying || !hasStarted) && (
            <div
              onClick={togglePlay}
              onPointerDown={stopVoiceAgent}
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[2px] transition-all cursor-pointer z-20"
            >
              <div className="w-16 h-16 rounded-full bg-[#0B63E5] text-white flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-105 active:scale-95">
                <Play className="w-8 h-8 ml-1 fill-white" />
              </div>
              <span className="mt-3 text-xs font-semibold text-white/95 tracking-wide drop-shadow-sm bg-black/40 px-3 py-1 rounded-full">
                {hasStarted ? 'Click to Resume' : 'Play EMI Video Guide'}
              </span>
            </div>
          )}

          {/* Subtitle Display Overlay */}
          {showSubtitles && activeSubtitle && isPlaying && (
            <div className="absolute bottom-16 left-3 right-3 text-center pointer-events-none z-20">
              <div className="inline-block bg-slate-950/85 backdrop-blur-sm text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg shadow-md max-w-full leading-relaxed border border-white/10">
                {activeSubtitle}
              </div>
            </div>
          )}

          {/* Video Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 pt-6 flex flex-col gap-1.5 z-30 transition-opacity">
            {/* Scrubber Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={duration || 78}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                onPointerDown={stopVoiceAgent}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0B63E5] hover:h-1.5 transition-all"
              />
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between text-white/90 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  onPointerDown={stopVoiceAgent}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  onPointerDown={stopVoiceAgent}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                  title="Restart"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Time Display */}
                <span className="text-[11px] font-mono text-slate-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Subtitles (CC) Toggle */}
                <button
                  type="button"
                  onClick={() => setShowSubtitles((prev) => !prev)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    showSubtitles ? 'text-[#60A5FA] bg-white/10' : 'text-slate-400 hover:bg-white/10'
                  }`}
                  title={showSubtitles ? 'Subtitles ON' : 'Subtitles OFF'}
                >
                  <Subtitles className="w-3.5 h-3.5" />
                </button>

                {/* Mute/Unmute */}
                <button
                  type="button"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !videoRef.current.muted;
                      setIsMuted(videoRef.current.muted);
                    }
                  }}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Fullscreen */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT PLAN & ELIGIBILITY */}
        <div className="w-full mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-left text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Payment Plan & Eligibility</span>
          </div>
          
          {isIitOcn ? (
            <ul className="space-y-2.5 text-slate-600">
              <li>
                <strong className="text-slate-800 block mb-0.5">EMI Financing Available</strong>
                You can choose to pay your program fee through monthly installments. Interest or financing charges may apply depending on the selected lender, tenure, and approved financing plan.
              </li>
              <li>
                <strong className="text-slate-800 block mb-0.5">Know Your Payment Before You Continue</strong>
                We’ll show you the applicable EMI amount, tenure, interest or financing charges, and total repayment before you proceed with the financing application.
              </li>
              <li>
                <strong className="text-slate-800 block mb-0.5">Financing Partner Approval</strong>
                Applications are evaluated independently by the applicable lending partner based on eligibility, credit profile, banking information, and verification requirements.
              </li>
              <li>
                <strong className="text-slate-800 block mb-0.5">Approval is Subject to Eligibility</strong>
                Loan approval, applicable interest rate, EMI amount, and disbursement are determined by the financing partner after completing their underwriting process.
              </li>
            </ul>
          ) : (
            <ul className="space-y-2.5 text-slate-600">
              <li>
                <strong className="text-slate-800 block mb-0.5">No-Cost EMI</strong>
                Pay your program fee in convenient monthly installments with no additional interest, subject to lender approval and the applicable financing plan.
              </li>
              <li>
                <strong className="text-slate-800 block mb-0.5">Financing Partner Approval</strong>
                Your application may be evaluated by our lending partners based on their eligibility, credit, and verification criteria.
              </li>
              <li>
                <strong className="text-slate-800 block mb-0.5">Approval is Subject to Eligibility</strong>
                Final approval depends on the lender’s underwriting process, required documents, credit profile, and verification checks.
              </li>
            </ul>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
          <button
            id="emi-back-btn"
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Program</span>
          </button>

          <button
            id="emi-continue-btn"
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B63E5] text-white text-xs sm:text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isIitOcn ? 'Continue with EMI' : 'Continue with No-Cost EMI'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};



