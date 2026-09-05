import React, { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowLeft,
  Languages,
} from 'lucide-react';
import type { EnrollmentState } from '../../types';

interface ProgramSummaryPageProps {
  state: EnrollmentState;
  onNext: () => void;
  onBack: () => void;
}

interface SubtitleCue {
  start: number;
  end: number;
  textEn: string;
  textTe: string;
}

const SUBTITLE_CUES: SubtitleCue[] = [
  {
    start: 0,
    end: 8.69,
    textEn: "You can spend four years in a traditional college, but most degrees don't teach the practical skills tech companies actually want.",
    textTe: 'మీరు సాధారణ కాలేజీలో 4 ఏళ్లు చదవవచ్చు, కానీ నేటి టెక్ కంపెనీలు కోరుకునే ప్రాక్టికల్ నైపుణ్యాలు డిగ్రీలు అందించలేవు.',
  },
  {
    start: 8.69,
    end: 14.33,
    textEn: "That's why NxtWave built a completely different path to high-paying software jobs.",
    textTe: 'అందుకే అధిక జీతాలు ఇచ్చే సాఫ్ట్‌వేర్ ఉద్యోగాల కోసం నెక్స్ట్‌వేవ్ ఒక సరికొత్త మార్గాన్ని నిర్మించింది.',
  },
  {
    start: 14.33,
    end: 33.55,
    textEn: 'A reverse-engineered curriculum. Developers from Amazon looked at what top tech teams need today and built the lessons backward. You learn by building real-world applications like a Zomato clone.',
    textTe: 'మొదటిది: రివర్స్ ఇంజనీరింగ్ కరికులం. అమెజాన్ లాంటి అగ్రశ్రేణి డెవలపర్లు పాఠాలను రూపొందించారు. జొమాటో క్లోన్ లాంటి నిజమైన ప్రాజెక్ట్‌లను నిర్మిస్తూ నేర్చుకుంటారు.',
  },
  {
    start: 33.55,
    end: 49.63,
    textEn: 'Your background is no longer a barrier. Whether you have a non-tech degree, a career gap, or zero coding experience, the step-by-step training takes you from beginner to tech-ready.',
    textTe: 'మీ పూర్వ చదువు అడ్డంకి కాదు. నాన్-టెక్ డిగ్రీ, కెరీర్ గ్యాప్ లేదా జీరో కోడింగ్ ఉన్నా, దశలవారీ శిక్షణతో పూర్తి టెక్-రెడీగా ఎదుగుతారు.',
  },
  {
    start: 49.63,
    end: 69.82,
    textEn: "Unmatched placement support. NxtWave partnered with NSDC to create India's first Industry-Ready Certification, unlocking direct interview access to 3,000+ hiring companies.",
    textTe: 'తిరుగులేని ప్లేస్‌మెంట్ సపోర్ట్. ఎన్‌ఎస్‌డీసీ తో కలిసి భారతదేశపు మొట్టమొదటి ఇండస్ట్రీ-రెడీ సర్టిఫికేషన్ ద్వారా 3,000+ కంపెనీల ఇంటర్వ్యూలను అన్‌లాక్ చేస్తుంది.',
  },
  {
    start: 69.82,
    end: 76.25,
    textEn: 'And the best part? You get unlimited interview opportunities until you actually land a job.',
    textTe: 'అన్నింటికంటే ముఖ్యమైన విషయం: మీరు ఉద్యోగం సాధించే వరకు అపరిమిత ఇంటర్వ్యూ అవకాశాలు లభిస్తాయి.',
  },
  {
    start: 76.25,
    end: 107.0,
    textEn: "NxtWave isn't just an online coding class. It completely bypasses the outdated college system, giving you the exact skills and access you need for a high-paying tech career.",
    textTe: 'నెక్స్ట్‌వేవ్ పాత కాలేజీ వ్యవస్థను దాటి, అత్యధిక వేతనం గల టెక్ కెరీర్‌ను అందుకోవడానికి అవసరమైన నైపుణ్యాలు మరియు అవకాశాలను అందిస్తుంది.',
  },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const ProgramSummaryPage: React.FC<ProgramSummaryPageProps> = ({
  state,
  onNext,
  onBack,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(107);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);

  const programName = state.program.name || 'Genius';

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

  // Toggle language and preserve current playback position
  const toggleLanguage = (newLang: 'en' | 'te') => {
    if (newLang === language) return;
    const timeBeforeSwitch = videoRef.current ? videoRef.current.currentTime : currentTime;
    const wasPlaying = isPlaying;
    setLanguage(newLang);

    // Apply new src and restore time
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
  const activeCue = SUBTITLE_CUES.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );
  const activeSubtitle = activeCue
    ? language === 'te'
      ? activeCue.textTe
      : activeCue.textEn
    : '';

  const videoSource =
    language === 'te'
      ? '/videos/nxtwave_program_te.mp4'
      : '/videos/nxtwave_program.mp4';

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-7 flex flex-col items-center"
      >
        {/* Header - Simple and uncluttered */}
        <div className="w-full text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-[#0B63E5] mb-2">
            <span>NxtWave {programName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A192F] tracking-tight">
            Program Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Watch how our curriculum prepares you for high-paying software jobs.
          </p>

          {/* Language Switcher */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mr-1">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <span>Audio:</span>
            </span>
            <button
              id="lang-en-btn"
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
              id="lang-te-btn"
              type="button"
              onClick={() => toggleLanguage('te')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                language === 'te'
                  ? 'bg-[#0B63E5] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              తెలుగు (Telugu)
            </button>
          </div>
        </div>

        {/* EMBEDDED PROGRAM VIDEO PLAYER */}
        <div
          ref={containerRef}
          className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg group select-none"
        >
          {/* Native HTML5 Video Element */}
          <video
            ref={videoRef}
            id="program-curriculum-video"
            src={videoSource}
            poster="/assets/program_scenes/scene_1_college.jpg"
            playsInline
            muted={isMuted}
            preload="metadata"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => {
              stopVoiceAgent();
              togglePlay();
            }}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration || 107);
              }
            }}
            onPlay={() => {
              stopVoiceAgent();
              setIsPlaying(true);
              setHasStarted(true);
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Initial Tap to Play Overlay */}
          {!hasStarted && !isPlaying && (
            <div
              id="program-video-overlay"
              onClick={() => {
                stopVoiceAgent();
                togglePlay();
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-opacity z-10"
            >
              <button
                id="program-video-play-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  stopVoiceAgent();
                  togglePlay();
                }}
                className="w-16 h-16 rounded-full bg-[#0B63E5] hover:bg-[#0047BA] text-white flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all mb-3 cursor-pointer"
              >
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              </button>
              <span className="text-sm font-semibold text-white tracking-wide drop-shadow-sm">
                Watch Program Explainer
              </span>
              <span className="text-xs text-white/75 mt-0.5">
                {language === 'te' ? 'తెలుగు ఆడియోతో వీక్షించండి' : '1 min 47 sec'}
              </span>
            </div>
          )}

          {/* Subtitle Badge Overlay (matching the uploaded video design) */}
          {showSubtitles && activeSubtitle && (
            <div className="absolute bottom-16 left-3 right-3 flex justify-center pointer-events-none z-10 transition-all">
              <div className="bg-[#FAF8F5]/95 text-[#1E293B] border border-amber-100/60 rounded-md px-3 py-1.5 shadow-md max-w-[90%] text-center backdrop-blur-xs">
                <p className="text-xs sm:text-[13px] font-medium leading-snug tracking-tight font-serif">
                  {activeSubtitle}
                </p>
              </div>
            </div>
          )}

          {/* Video Control Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 flex flex-col gap-1.5 z-20">
            {/* Scrubber Seekbar */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={duration || 107}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#0B63E5]"
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <button
                  id="program-video-control-play-pause-btn"
                  type="button"
                  onClick={() => {
                    stopVoiceAgent();
                    togglePlay();
                  }}
                  className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>

                <button
                  id="program-video-control-restart-btn"
                  type="button"
                  onClick={() => {
                    stopVoiceAgent();
                    handleRestart();
                  }}
                  className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Replay from start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <span className="text-[11px] text-white/80 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubtitles((prev) => !prev)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    showSubtitles
                      ? 'border-white/80 bg-white/20 text-white'
                      : 'border-white/30 text-white/40'
                  }`}
                  title="Toggle Captions"
                >
                  CC
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Clear Next and Back */}
        <div className="w-full mt-6 space-y-2">
          <button
            id="choose-payment-method-btn"
            type="button"
            onClick={onNext}
            className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-[#0B63E5] hover:bg-[#0047BA] active:scale-[0.99] shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Payment Method</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="back-to-congratulations-btn"
            type="button"
            onClick={onBack}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
