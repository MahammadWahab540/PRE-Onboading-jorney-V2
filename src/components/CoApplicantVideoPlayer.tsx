import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Subtitles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Tv,
  Sparkles,
  Check,
  X,
  CreditCard,
  Building,
  GraduationCap,
  Users,
  Briefcase,
} from 'lucide-react';

interface CoApplicantVideoPlayerProps {
  onVideoEnd?: () => void;
  defaultViewMode?: 'reel' | 'wide';
}

interface Scene {
  id: number;
  start: number;
  end: number;
  teluguHeading: string;
  englishHeading: string;
  teluguSub: string;
  englishSub: string;
  badge: string;
  type: 'confused' | 'income_check' | 'relatives' | 'ideal_coapplicant' | 'approved' | 'outro';
}

const SCENES: Scene[] = [
  {
    id: 1,
    start: 0,
    end: 8,
    teluguHeading: 'ఎడ్యుకేషన్ లోన్',
    englishHeading: 'Education Loan Process',
    teluguSub:
      'ఎడ్యుకేషన్ లోన్ ప్రాసెస్ మొదలుపెట్టాలంటే కో-అప్లికెంట్ తప్పనిసరి. కానీ సరైన వ్యక్తిని ఎంచుకోకపోతే లోన్ రిజెక్ట్ అయ్యి మీ చదువు ఆగిపోవచ్చు.',
    englishSub:
      'A co-applicant is mandatory to initiate an education loan. Choosing the wrong person may lead to loan rejection and halt your studies.',
    badge: 'ముఖ్యమైన నిబంధన • Mandatory Rule',
    type: 'confused',
  },
  {
    id: 2,
    start: 8,
    end: 22,
    teluguHeading: 'కో-అప్లికెంట్ ఎంపిక',
    englishHeading: 'Co-Applicant Selection: Income Rule',
    teluguSub:
      'ఉదాహరణకు, ఆదాయం లేని హౌస్‌వైఫ్‌ను కో-అప్లికెంట్‌గా పెడితే ప్రాసెస్ ఆగిపోతుంది. ఎందుకంటే బ్యాంకులు కేవలం బంధుత్వాన్ని మాత్రమే చూడవు. స్థిరమైన ఆదాయం, యాక్టివ్ అకౌంట్ చూస్తాయి.',
    englishSub:
      'For instance, selecting a homemaker without steady income stalls the process. Banks look beyond relationship for stable monthly income & active banking.',
    badge: 'బ్యాంకు నిబంధనలు • Bank Criteria',
    type: 'income_check',
  },
  {
    id: 3,
    start: 22,
    end: 33,
    teluguHeading: 'ఉద్యోగం చేస్తున్న బంధువులు',
    englishHeading: 'Eligible Employed Relatives',
    teluguSub:
      'అందుకే ఉద్యోగం చేస్తున్న మీ అన్నయ్య, అక్క లేదా మావయ్యను కూడా ఎంచుకోవచ్చు. కానీ ఆదాయం ఉన్నా సరైన బ్యాంక్ లావాదేవీలు, పాన్ కార్డ్ లేకపోతే కష్టం.',
    englishSub:
      'You can select an employed brother, sister, or uncle. However, they must possess consistent bank statements and an active PAN card.',
    badge: 'అర్హులైన బంధువులు • Eligible Relatives',
    type: 'relatives',
  },
  {
    id: 4,
    start: 33,
    end: 46,
    teluguHeading: 'ఆదర్శ కో-అప్లికెంట్',
    englishHeading: 'The Ideal Co-Applicant Profile',
    teluguSub:
      'అందుకే రెగ్యులర్ ట్రాన్సాక్షన్స్ చేస్తూ, ఎలాంటి డిఫాల్ట్స్ లేని వ్యక్తినే ఎంచుకోవడమే అసలైన రహస్యం. అలా సరైన ఆర్థిక రికార్డు ఉన్న వ్యక్తిని ఎంచుకుంటే రిజెక్షన్ అనే మాటే ఉండదు.',
    englishSub:
      'The secret is choosing someone with regular transactions, zero loan defaults, and a clean credit profile. Approval becomes guaranteed.',
    badge: 'గ్యారంటీ అప్రూవల్ • Approval Blueprint',
    type: 'ideal_coapplicant',
  },
  {
    id: 5,
    start: 46,
    end: 52,
    teluguHeading: 'లోన్ అప్రూవ్ చేయబడింది!',
    englishHeading: 'Loan Approved Smoothly!',
    teluguSub:
      'వెంటనే ఎలాంటి ఆటంకం లేకుండా మీ లోన్ అప్రూవ్ అవుతుంది, ప్రశాంతంగా మీ క్లాసెస్ మొదలవుతాయి.',
    englishSub:
      'Your education loan is sanctioned without friction, and your NxtWave learning begins smoothly.',
    badge: 'విజయం • Success',
    type: 'approved',
  },
  {
    id: 6,
    start: 52,
    end: 54,
    teluguHeading: 'Gemini Notebook',
    englishHeading: 'Gemini Notebook Education',
    teluguSub: 'ప్రశాంతంగా మీ క్లాసెస్ మొదలవుతాయి.',
    englishSub: 'NxtWave financing guidance powered by Gemini Notebook.',
    badge: 'గైడ్ ముగింపు • Completed',
    type: 'outro',
  },
];

const TOTAL_DURATION = 54;

export const CoApplicantVideoPlayer: React.FC<CoApplicantVideoPlayerProps> = ({
  onVideoEnd,
  defaultViewMode = 'reel',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(0.95);
  const [subtitlesLanguage, setSubtitlesLanguage] = useState<'te' | 'en' | 'off'>('te');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'reel' | 'wide'>(defaultViewMode);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active scene
  const currentScene =
    SCENES.find((s) => currentTime >= s.start && currentTime < s.end) || SCENES[0];

  // Stop any ongoing audio
  const stopAllAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAudioSpeaking(false);
  };

  // Play narration audio
  const playNarrationForScene = (sceneId: number, lang: 'te' | 'en' | 'off') => {
    if (isMuted || customVideoUrl) {
      stopAllAudio();
      return;
    }

    const actualLang = lang === 'en' ? 'en' : 'te';
    const actualSceneId = Math.min(Math.max(sceneId, 1), 5);
    const primaryAudioPath = `/audio/scene_${actualLang}_${actualSceneId}.wav`;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
    }

    const audio = audioElementRef.current;
    audio.src = primaryAudioPath;
    audio.playbackRate = playbackSpeed;
    audio.volume = isMuted ? 0 : volume;

    setIsAudioSpeaking(true);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setAudioBlocked(false);
          setIsAudioSpeaking(true);
        })
        .catch((err) => {
          console.warn('Audio auto-play policy or file loading notice:', err);
          setAudioBlocked(true);
          setIsAudioSpeaking(false);

          // Fallback to browser speech synthesis
          try {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              const sceneObj = SCENES.find((s) => s.id === sceneId) || SCENES[0];
              const textToSpeak = actualLang === 'en' ? sceneObj.englishSub : sceneObj.teluguSub;
              const utterance = new SpeechSynthesisUtterance(textToSpeak);
              utterance.rate = playbackSpeed;
              utterance.volume = isMuted ? 0 : volume;
              utterance.lang = actualLang === 'te' ? 'te-IN' : 'en-IN';

              const voices = window.speechSynthesis.getVoices();
              const voice = voices.find((v) =>
                actualLang === 'te' ? v.lang.startsWith('te') : v.lang.includes('IN') || v.lang.startsWith('en')
              );
              if (voice) utterance.voice = voice;

              utterance.onstart = () => setIsAudioSpeaking(true);
              utterance.onend = () => setIsAudioSpeaking(false);
              utterance.onerror = () => setIsAudioSpeaking(false);

              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(utterance);
            }
          } catch {
            // ignore
          }
        });
    }

    audio.onended = () => {
      setIsAudioSpeaking(false);
    };
    audio.onerror = () => {
      // If audio file has error or hasn't loaded, fallback to speech synthesis
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const sceneObj = SCENES.find((s) => s.id === sceneId) || SCENES[0];
          const textToSpeak = actualLang === 'en' ? sceneObj.englishSub : sceneObj.teluguSub;
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = playbackSpeed;
          utterance.volume = isMuted ? 0 : volume;
          utterance.lang = actualLang === 'te' ? 'te-IN' : 'en-IN';
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      } catch {
        // ignore
      }
    };
  };

  // Playback timer simulation
  useEffect(() => {
    if (customVideoUrl && videoElementRef.current) return;

    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            stopAllAudio();
            if (onVideoEnd) onVideoEnd();
            return 0;
          }
          return Math.min(TOTAL_DURATION, prev + 0.25 * playbackSpeed);
        });
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, customVideoUrl, onVideoEnd]);

  // Synchronized voice audio narration
  useEffect(() => {
    if (!isPlaying || isMuted || customVideoUrl) {
      stopAllAudio();
      return;
    }

    playNarrationForScene(currentScene.id, subtitlesLanguage);

    return () => {
      stopAllAudio();
    };
  }, [currentScene.id, isPlaying, isMuted, subtitlesLanguage, playbackSpeed, volume, customVideoUrl]);

  const togglePlay = () => {
    if (customVideoUrl && videoElementRef.current) {
      if (videoElementRef.current.paused) {
        videoElementRef.current.play();
        setIsPlaying(true);
      } else {
        videoElementRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        // Directly unlock audio context synchronously in user click gesture
        setAudioBlocked(false);
        playNarrationForScene(currentScene.id, subtitlesLanguage);
      } else {
        stopAllAudio();
      }
      return next;
    });
  };

  const enableAudio = () => {
    setIsMuted(false);
    setAudioBlocked(false);
    if (!isPlaying) {
      setIsPlaying(true);
    }
    playNarrationForScene(currentScene.id, subtitlesLanguage);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (customVideoUrl && videoElementRef.current) {
      videoElementRef.current.currentTime = time;
    }
  };

  const jumpToScene = (start: number) => {
    setCurrentTime(start);
    if (customVideoUrl && videoElementRef.current) {
      videoElementRef.current.currentTime = start;
    }
    setIsPlaying(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#121A2A] rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl text-white mb-6"
    >
      {/* Top Header Bar */}
      <div className="bg-[#0B1528] px-4 py-3 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <span>కో-అప్లికెంట్ వీడియో గైడ్</span>
            <span className="text-slate-400 font-normal hidden sm:inline">
              • Who can be your co-applicant? (54s)
            </span>
          </span>
        </div>

        {/* View Mode & Captions Control */}
        <div className="flex items-center gap-2">
          {/* Reel (9:16) vs Wide (16:9) Mode Toggle */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('reel')}
              className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                viewMode === 'reel'
                  ? 'bg-[#0B63E5] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Vertical Reel view (Exact 9:16 format of the video)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Reel (9:16)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('wide')}
              className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                viewMode === 'wide'
                  ? 'bg-[#0B63E5] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Wide Theater view"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Wide</span>
            </button>
          </div>

          {/* Subtitle Selector */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setSubtitlesLanguage('te')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                subtitlesLanguage === 'te'
                  ? 'bg-[#0B63E5] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              తెలుగు
            </button>
            <button
              type="button"
              onClick={() => setSubtitlesLanguage('en')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                subtitlesLanguage === 'en'
                  ? 'bg-[#0B63E5] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setSubtitlesLanguage('off')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                subtitlesLanguage === 'off'
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Turn off captions"
            >
              Off
            </button>
          </div>

          {/* Voice Narration Live Indicator */}
          {isPlaying && !isMuted && (
            <div
              className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-emerald-300 text-[10px] font-bold"
              title="Studio Voice Narration is Active"
            >
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-2" />
                <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s] h-3" />
                <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s] h-1.5" />
              </div>
              <span>{subtitlesLanguage === 'en' ? 'Voice: EN' : 'వాయిస్: తెలుగు'}</span>
            </div>
          )}

          {/* Load MP4 Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Load local .mp4 video"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition-colors flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">Load MP4</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="p-3 sm:p-5 flex flex-col items-center justify-center bg-[#070D18]">
        {/* Video Canvas Card */}
        <div
          className={`relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 select-none bg-[#F5F1E8] transition-all duration-300 ${
            viewMode === 'reel'
              ? 'w-full max-w-[340px] aspect-[9/16]'
              : 'w-full max-w-2xl aspect-[16/9]'
          }`}
        >
          {customVideoUrl ? (
            <video
              ref={videoElementRef}
              src={customVideoUrl}
              className="w-full h-full object-contain bg-black"
              playsInline
              onTimeUpdate={() => {
                if (videoElementRef.current) {
                  setCurrentTime(videoElementRef.current.currentTime);
                }
              }}
              onEnded={() => {
                setIsPlaying(false);
                if (onVideoEnd) onVideoEnd();
              }}
            />
          ) : (
            /* EXACT REPRODUCTION OF THE UPLOADED VIDEO'S VISUAL ARTWORK */
            <div className="w-full h-full relative flex flex-col justify-between overflow-hidden text-[#1E293B]">
              {/* Torn Paper Header Art matching the uploaded video */}
              <div className="relative w-full z-10 shrink-0">
                {/* Orange top band */}
                <div className="h-4 sm:h-5 bg-[#E68A2E] w-full" />
                {/* Teal torn paper line */}
                <div className="h-3 bg-[#4E9AA7] w-full transform -skew-y-1 origin-top-left" />
                {/* Jagged paper shadow edge */}
                <div className="h-2 bg-[#D5CEBF] w-full" />
              </div>

              {/* Central Dynamic Stage based on Active Scene */}
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 relative z-10 overflow-hidden">
                <AnimatePresence mode="wait">
                  {/* SCENE 1 (0:00 - 0:08): Confused student with question marks, books, lamp, "ఎడ్యుకేషన్ లోన్" badge */}
                  {currentScene.type === 'confused' && (
                    <motion.div
                      key="scene-1"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center text-center w-full"
                    >
                      {/* Stylized Telugu Title Badge on folded sticker */}
                      <div className="bg-white border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] px-3.5 py-1 rounded-md mb-3 rotate-[-1deg]">
                        <span className="text-sm sm:text-base font-black text-[#0F172A] tracking-wide">
                          ఎడ్యుకేషన్ లోన్
                        </span>
                      </div>

                      {/* Illustration of student scratching head at desk */}
                      <div className="relative w-36 sm:w-44 h-36 sm:h-44 my-1 flex items-center justify-center">
                        <svg
                          viewBox="0 0 200 200"
                          className="w-full h-full drop-shadow-md"
                        >
                          {/* Desk / Table */}
                          <rect x="20" y="160" width="160" height="10" rx="3" fill="#D2B48C" stroke="#1E293B" strokeWidth="3" />
                          <rect x="40" y="170" width="10" height="25" fill="#B38B59" stroke="#1E293B" strokeWidth="2.5" />
                          <rect x="150" y="170" width="10" height="25" fill="#B38B59" stroke="#1E293B" strokeWidth="2.5" />

                          {/* Lamp on desk */}
                          <path d="M 30 160 L 35 125 L 50 125 L 45 160 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2" />
                          <path d="M 25 125 L 55 125 L 45 105 L 35 105 Z" fill="#FBBF24" stroke="#1E293B" strokeWidth="2.5" />
                          <circle cx="40" cy="115" r="3" fill="#FFF" />

                          {/* Stack of books */}
                          <rect x="135" y="145" width="40" height="7" rx="1.5" fill="#3B82F6" stroke="#1E293B" strokeWidth="2" />
                          <rect x="138" y="137" width="37" height="8" rx="1.5" fill="#10B981" stroke="#1E293B" strokeWidth="2" />
                          <rect x="134" y="129" width="42" height="8" rx="1.5" fill="#F97316" stroke="#1E293B" strokeWidth="2" />

                          {/* Student sitting at desk */}
                          {/* Torso in blue shirt */}
                          <path d="M 80 160 L 80 120 C 80 108 120 108 120 120 L 120 160 Z" fill="#60A5FA" stroke="#1E293B" strokeWidth="3" />
                          {/* Arms: left arm on desk, right arm scratching head */}
                          <path d="M 80 125 L 60 150 L 75 155" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                          <path d="M 120 125 L 138 105 L 124 90" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

                          {/* Head with confused face */}
                          <circle cx="100" cy="85" r="22" fill="#FED7AA" stroke="#1E293B" strokeWidth="3" />
                          {/* Messy black hair */}
                          <path d="M 78 85 C 78 62 122 62 122 85 C 122 70 100 65 78 85 Z" fill="#1E293B" />
                          {/* Eyebrows angled in confusion */}
                          <line x1="88" y1="78" x2="96" y2="82" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                          <line x1="104" y1="82" x2="112" y2="78" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                          {/* Eyes */}
                          <circle cx="92" cy="86" r="2" fill="#1E293B" />
                          <circle cx="108" cy="86" r="2" fill="#1E293B" />
                          {/* Wavy mouth */}
                          <path d="M 94 98 Q 100 94 106 97" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

                          {/* Floating question marks & thought bubbles */}
                          <text x="125" y="65" fontSize="16" fill="#F59E0B" fontWeight="bold">❓</text>
                          <text x="70" y="60" fontSize="14" fill="#3B82F6" fontWeight="bold">💡</text>
                          <text x="95" y="45" fontSize="18" fill="#EF4444" fontWeight="bold">?</text>
                        </svg>
                      </div>

                      {/* Bottom Sticker Box */}
                      <div className="bg-[#FFFDF9] border border-[#CBD5E1] rounded-lg p-2 max-w-[270px] shadow-xs mt-1">
                        <span className="text-[11px] font-bold text-[#0F172A] block leading-snug">
                          ఎడ్యుకేషన్ లోన్ మొదలుపెట్టాలంటే
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold">
                          కో-అప్లికెంట్ తప్పనిసరి!
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* SCENE 2 (0:08 - 0:22): Student vs Housewife (ఆదాయం: లేదు) -> ప్రాసెస్ ఆగిపోయింది */}
                  {currentScene.type === 'income_check' && (
                    <motion.div
                      key="scene-2"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center w-full"
                    >
                      <div className="bg-[#FFFDF9] border border-[#94A3B8] shadow-xs px-3 py-0.5 rounded-full mb-2">
                        <span className="text-[11px] font-bold text-slate-800">
                          కో-అప్లికెంట్ ఎంపిక
                        </span>
                      </div>

                      {/* 2 Characters Comparison */}
                      <div className="flex items-center justify-around w-full max-w-[280px] my-2">
                        {/* Student */}
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center text-blue-700 mb-1">
                            <GraduationCap className="w-7 h-7" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800">స్టూడెంట్</span>
                        </div>

                        {/* Stalled Arrow */}
                        <div className="flex flex-col items-center px-1">
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md mb-0.5">
                            స్టేటస్: ఆగిపోయింది
                          </span>
                          <div className="w-12 h-0.5 border-t-2 border-dashed border-rose-400" />
                          <X className="w-4 h-4 text-rose-500 mt-0.5" />
                        </div>

                        {/* Housewife */}
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-full bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-rose-700 mb-1">
                            <Users className="w-7 h-7" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800">ఆదాయం లేని హౌస్‌వైఫ్</span>
                          <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mt-0.5">
                            ఆదాయం: లేదు
                          </span>
                        </div>
                      </div>

                      {/* Bank Requirements checklist from video */}
                      <div className="bg-white/90 border border-slate-300 rounded-xl p-2.5 w-full max-w-[260px] shadow-xs text-left mt-1 text-[11px] space-y-1">
                        <span className="text-[10px] font-bold text-slate-600 block border-b border-slate-200 pb-1">
                          బ్యాంకులు చూసేవి:
                        </span>
                        <div className="flex items-center justify-between text-slate-700 font-medium">
                          <span>బంధుత్వం (Relation)</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <Check className="w-3.5 h-3.5" /> సరిపోదు
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-rose-700 font-semibold">
                          <span>స్థిరమైన ఆదాయం (Stable Income)</span>
                          <span className="flex items-center gap-0.5">
                            <X className="w-3.5 h-3.5" /> తప్పనిసరి
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-rose-700 font-semibold">
                          <span>యాక్టివ్ బ్యాంక్ అకౌంట్ (Active A/C)</span>
                          <span className="flex items-center gap-0.5">
                            <X className="w-3.5 h-3.5" /> తప్పనిసరి
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* SCENE 3 (0:22 - 0:32): 3 working relatives (అన్నయ్య, అక్క, మావయ్య) + PAN & Statement warning */}
                  {currentScene.type === 'relatives' && (
                    <motion.div
                      key="scene-3"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center w-full"
                    >
                      <div className="bg-[#FFFDF9] border border-[#94A3B8] shadow-xs px-3 py-0.5 rounded-full mb-2">
                        <span className="text-[11px] font-bold text-slate-800">
                          ఉద్యోగం చేస్తున్న బంధువులు
                        </span>
                      </div>

                      {/* 3 Relatives */}
                      <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] my-1 text-center">
                        {/* Brother (అన్నయ్య) */}
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center mb-1">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800">అన్నయ్య</span>
                          <span className="text-[9px] text-slate-500">Brother</span>
                        </div>

                        {/* Sister (అక్క) */}
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-[#4E9AA7] text-white flex items-center justify-center mb-1">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800">అక్క</span>
                          <span className="text-[9px] text-slate-500">Sister</span>
                        </div>

                        {/* Uncle (మావయ్య) */}
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-[#E68A2E] text-white flex items-center justify-center mb-1">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800">మావయ్య</span>
                          <span className="text-[9px] text-slate-500">Uncle</span>
                        </div>
                      </div>

                      {/* PAN Card & Bank statement warning note */}
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 w-full max-w-[260px] text-left mt-2 text-[10px] space-y-1 text-amber-900">
                        <span className="font-bold flex items-center gap-1 text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          కానీ ఈ క్రింది రికార్డులు తప్పనిసరి:
                        </span>
                        <div className="flex items-center gap-1.5 pl-2 font-medium">
                          <CreditCard className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>పాన్ కార్డ్ (Valid PAN Card)</span>
                        </div>
                        <div className="flex items-center gap-1.5 pl-2 font-medium">
                          <Building className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>రెగ్యులర్ బ్యాంక్ లావాదేవీలు (Bank Statement)</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* SCENE 4 (0:32 - 0:46): Ideal Co-applicant + Big "అప్రూవ్ చేయబడింది!" stamp */}
                  {currentScene.type === 'ideal_coapplicant' && (
                    <motion.div
                      key="scene-4"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center w-full relative"
                    >
                      <div className="bg-[#FFFDF9] border border-[#94A3B8] shadow-xs px-3 py-0.5 rounded-full mb-1">
                        <span className="text-[11px] font-bold text-slate-800">
                          ఆదర్శ కో-అప్లికెంట్
                        </span>
                      </div>

                      {/* Professional Lady Avatar in mustard yellow blazer */}
                      <div className="w-16 h-16 rounded-full bg-[#EAB308]/20 border-2 border-[#CA8A04] flex items-center justify-center text-[#854D0E] my-1.5 shadow-sm">
                        <Sparkles className="w-8 h-8" />
                      </div>

                      {/* Checklist badges */}
                      <div className="space-y-1 w-full max-w-[240px] text-[11px] mb-2">
                        <div className="bg-emerald-50 border border-emerald-300 rounded-lg py-1 px-2.5 flex items-center justify-between text-emerald-900 font-semibold shadow-2xs">
                          <span>రెగ్యులర్ ట్రాన్సాక్షన్స్</span>
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="bg-emerald-50 border border-emerald-300 rounded-lg py-1 px-2.5 flex items-center justify-between text-emerald-900 font-semibold shadow-2xs">
                          <span>ఎలాంటి డిఫాల్ట్స్ లేవు</span>
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>

                      {/* Animated Approval Green Stamp stamping down */}
                      <motion.div
                        initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: -8 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.2 }}
                        className="border-3 border-emerald-600 bg-white/95 px-3 py-1 rounded-md text-emerald-700 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20"
                      >
                        అప్రూవ్ చేయబడింది! (Approved)
                      </motion.div>
                    </motion.div>
                  )}

                  {/* SCENE 5 (0:46 - 0:52): Happy student coding on laptop, green checkmark, education loan ribbon */}
                  {currentScene.type === 'approved' && (
                    <motion.div
                      key="scene-5"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center w-full"
                    >
                      {/* Ribbon */}
                      <div className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-0.5 rounded-full mb-1 tracking-wider uppercase flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Education Loan Sanctioned</span>
                      </div>

                      {/* Boy coding on laptop illustration */}
                      <div className="w-32 sm:w-36 h-28 my-1 flex items-center justify-center relative">
                        <svg viewBox="0 0 160 120" className="w-full h-full">
                          {/* Laptop screen */}
                          <rect x="35" y="30" width="90" height="55" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
                          <rect x="40" y="35" width="80" height="45" fill="#0F172A" />
                          {/* Code text lines */}
                          <text x="44" y="46" fontSize="5" fill="#38BDF8" fontFamily="monospace">import pandas as pd</text>
                          <text x="44" y="54" fontSize="5" fill="#4ADE80" fontFamily="monospace">def calculate_loan():</text>
                          <text x="48" y="62" fontSize="5" fill="#FACC15" fontFamily="monospace">credit_score &gt; 750</text>
                          <text x="48" y="70" fontSize="5" fill="#4ADE80" fontFamily="monospace">return 'APPROVED'</text>

                          {/* Laptop base */}
                          <path d="M 25 85 L 135 85 L 125 92 L 35 92 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
                          {/* Coffee mug */}
                          <rect x="135" y="75" width="10" height="12" rx="2" fill="#F59E0B" />
                        </svg>

                        {/* Big Green Checkmark badge overlay */}
                        <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                      </div>

                      <div className="text-center mt-1">
                        <span className="text-xs font-black text-slate-800 block">
                          లోన్ వెంటనే అప్రూవ్ అవుతుంది!
                        </span>
                        <span className="text-[10px] text-slate-600">
                          ప్రశాంతంగా మీ క్లాసెస్ మొదలవుతాయి.
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* SCENE 6 (0:52 - 0:54): Gemini Notebook outro */}
                  {currentScene.type === 'outro' && (
                    <motion.div
                      key="scene-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-center w-full h-full py-6"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center mb-2">
                        <div className="w-8 h-8 rounded-full border-3 border-transparent border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-blue-500 animate-spin" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        Gemini Notebook
                      </span>
                      <span className="text-[10px] text-slate-500">
                        NxtWave Education Financing
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subtitles Banner at bottom of Reel */}
              {subtitlesLanguage !== 'off' && (
                <div className="p-2 sm:p-2.5 bg-black/85 backdrop-blur-xs text-white text-center z-20 shrink-0">
                  <p className="text-[11px] sm:text-xs font-semibold leading-relaxed">
                    {subtitlesLanguage === 'te'
                      ? currentScene.teluguSub
                      : currentScene.englishSub}
                  </p>
                </div>
              )}

              {/* Watermark in bottom right */}
              <div className="absolute bottom-1 right-2 text-[8px] text-slate-500 pointer-events-none opacity-60">
                Gemini Notebook
              </div>
            </div>
          )}

          {/* Autoplay blocked notification banner */}
          {audioBlocked && isPlaying && (
            <button
              type="button"
              onClick={enableAudio}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-amber-300 animate-pulse cursor-pointer"
              title="Browser blocked audio autoplay. Click to unmute."
            >
              <Volume2 className="w-4 h-4" />
              <span>వాయిస్ వినడానికి ఇక్కడ క్లిక్ చేయండి (Click to Enable Voice)</span>
            </button>
          )}

          {/* Big Center Play Overlay (when paused) */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Play video"
              className="absolute inset-0 m-auto z-30 w-16 h-16 rounded-full bg-[#0B63E5]/95 hover:bg-[#0047BA] text-white flex items-center justify-center shadow-2xl transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Control Bar & Timeline Scrubber */}
      <div className="bg-[#0B1528] p-3 sm:p-4 border-t border-slate-700/80 space-y-3">
        {/* Timeline Range Scrubber */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={TOTAL_DURATION}
            step="0.5"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0B63E5]"
          />
          <div className="text-[11px] font-mono text-slate-300 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
          </div>
        </div>

        {/* Action Controls and Scene Jumper Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
            </button>

            {/* Restart */}
            <button
              type="button"
              onClick={() => {
                setCurrentTime(0);
                if (customVideoUrl && videoElementRef.current) {
                  videoElementRef.current.currentTime = 0;
                }
                setIsPlaying(true);
              }}
              title="Restart Video"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Audio Toggle & Volume Slider */}
            <div className="flex items-center bg-white/10 rounded-lg px-2 py-1 gap-1.5">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="text-white hover:text-blue-300 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVol = parseFloat(e.target.value);
                  setVolume(newVol);
                  if (isMuted && newVol > 0) setIsMuted(false);
                }}
                className="w-14 h-1 bg-slate-600 rounded cursor-pointer accent-[#0B63E5]"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>

            {/* Speed Selector */}
            <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[10px]">
              {[1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
                    playbackSpeed === speed
                      ? 'bg-[#0B63E5] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Quick Scene Jump Tabs */}
          <div className="hidden sm:flex items-center gap-1 text-[10px]">
            <span className="text-slate-400 mr-1 font-medium">Scenes:</span>
            {SCENES.slice(0, 5).map((scene) => {
              const isActive = currentTime >= scene.start && currentTime < scene.end;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => jumpToScene(scene.start)}
                  className={`px-2 py-1 rounded transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-white/5 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  {scene.id}. {scene.teluguHeading}
                </button>
              );
            })}
          </div>

          {/* Fullscreen & Subtitles Indicator */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSubtitlesLanguage((prev) =>
                  prev === 'te' ? 'en' : prev === 'en' ? 'off' : 'te'
                )
              }
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs ${
                subtitlesLanguage !== 'off'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                  : 'bg-white/10 text-slate-400'
              }`}
              title="Toggle Subtitles Language"
            >
              <Subtitles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">
                {subtitlesLanguage}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Toggle Fullscreen"
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
  );
};
