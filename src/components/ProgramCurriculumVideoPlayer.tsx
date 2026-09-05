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
  Sparkles,
  Smartphone,
  Tv,
  Award,
  Briefcase,
  Code2,
  Rocket,
  Building2,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface ProgramCurriculumVideoPlayerProps {
  onVideoEnd?: () => void;
  defaultViewMode?: 'reel' | 'wide';
}

interface Scene {
  id: number;
  start: number;
  end: number;
  titleEn: string;
  titleTe: string;
  subtitleEn: string;
  subtitleTe: string;
  tag: string;
  image: string;
  bullet: string;
}

const TOTAL_DURATION = 71; // 1 minute 11 seconds

const SCENES: Scene[] = [
  {
    id: 1,
    start: 0,
    end: 6,
    titleEn: 'Traditional College vs Real Tech Skills',
    titleTe: 'సాధారణ కాలేజీ vs ప్రాక్టికల్ స్కిల్స్',
    subtitleEn:
      "You can spend four years in a traditional college, but most degrees don't teach the practical skills tech companies actually want.",
    subtitleTe:
      'మీరు సాధారణ కాలేజీలో 4 ఏళ్లు చదవవచ్చు, కానీ నేటి టెక్ కంపెనీలు కోరుకునే ప్రాక్టికల్ నైపుణ్యాలు డిగ్రీలు అందించలేవు.',
    tag: '4 Years vs Practical Skills',
    image: '/assets/program_scenes/scene_1_college.jpg',
    bullet: 'Traditional college degrees focus on outdated theory',
  },
  {
    id: 2,
    start: 6,
    end: 11,
    titleEn: "NxtWave's Alternative Path",
    titleTe: 'నెక్స్ట్‌వేవ్ సరికొత్త ప్రత్యేక మార్గం',
    subtitleEn:
      'That’s why NxtWave built a completely different path to high-paying software jobs.',
    subtitleTe:
      'అందుకే అధిక జీతాలు ఇచ్చే సాఫ్ట్‌వేర్ ఉద్యోగాల కోసం నెక్స్ట్‌వేవ్ ఒక సరికొత్త మార్గాన్ని నిర్మించింది.',
    tag: 'Direct High-Paying Path',
    image: '/assets/program_scenes/scene_2_developer.jpg',
    bullet: 'Engineered specifically for high-paying software careers',
  },
  {
    id: 3,
    start: 11,
    end: 26,
    titleEn: 'Reverse-Engineered Curriculum',
    titleTe: 'రివర్స్ ఇంజనీరింగ్ కరికులం',
    subtitleEn:
      'First up: A reverse-engineered curriculum. Developers from companies like Amazon looked at what top tech teams need today and built the lessons backward. Instead of memorizing outdated theory, you learn by building real-world applications like a Zomato clone.',
    subtitleTe:
      'మొదటిది: రివర్స్ ఇంజనీరింగ్ కరికులం. అమెజాన్ లాంటి కంపెనీల డెవలపర్లు పరిశ్రమకు ఏమి కావాలో చూసి పాఠాలు రూపొందించారు. పాత థియరీ కాకుండా, జొమాటో క్లోన్ లాంటి నిజమైన ప్రాజెక్ట్స్‌తో నేర్చుకుంటారు.',
    tag: 'Amazon Developers • Real Zomato Clone',
    image: '/assets/program_scenes/scene_3_curriculum.jpg',
    bullet: 'Project-based learning building full-stack production apps',
  },
  {
    id: 4,
    start: 26,
    end: 37,
    titleEn: 'Background Is No Longer a Barrier',
    titleTe: 'బ్యాక్‌గ్రౌండ్ ఇకపై అడ్డంకి కాదు',
    subtitleEn:
      'Next, your background is no longer a barrier. Whether you have a non-tech degree, a career gap, or zero coding experience, the step-by-step training takes you from absolute beginner to tech-ready in just a few months.',
    subtitleTe:
      'మీ పూర్వ చదువు అడ్డంకి కాదు. నాన్-టెక్ డిగ్రీ, కెరీర్ గ్యాప్ లేదా జీరో కోడింగ్ ఉన్నా... దశలవారీ శిక్షణతో కొద్ది నెలల్లోనే పూర్తి టెక్-రెడీగా ఎదుగుతారు.',
    tag: 'Non-Tech • Career Gap • Zero Coding',
    image: '/assets/program_scenes/scene_4_barrier.jpg',
    bullet: 'Step-by-step beginner to software engineer transition',
  },
  {
    id: 5,
    start: 37,
    end: 50,
    titleEn: 'NSDC Industry-Ready Certification',
    titleTe: 'భారత ప్రభుత్వ NSDC సర్టిఫికేషన్',
    subtitleEn:
      'And finally, unmatched placement support. NxtWave partnered with the government’s NSDC to create India’s first Industry-Ready Certification. That official certification unlocks direct interview access to a pool of over three thousand hiring companies.',
    subtitleTe:
      'చివరగా: తిరుగులేని ప్లేస్‌మెంట్ సపోర్ట్. నెక్స్ట్‌వేవ్ భారత ప్రభుత్వ NSDC తో కలిసి దేశంలోనే మొట్టమొదటి ఇండస్ట్రీ-రెడీ సర్టిఫికేషన్‌ను రూపొందించింది. ఇది 3,000+ కంపెనీల ప్రత్యక్ష ఇంటర్వ్యూలను అన్‌లాక్ చేస్తుంది.',
    tag: 'Govt. NSDC • 3,000+ Hiring Pool',
    image: '/assets/program_scenes/scene_5_nsdc.jpg',
    bullet: "India's first recognized Industry-Ready credential",
  },
  {
    id: 6,
    start: 50,
    end: 56,
    titleEn: 'Unlimited Interview Opportunities',
    titleTe: 'అపరిమిత ఇంటర్వ్యూ అవకాశాలు',
    subtitleEn:
      'And the best part? You get unlimited interview opportunities until you actually land a job.',
    subtitleTe:
      'అన్నింటికంటే ముఖ్యమైన విషయం: మీరు ఉద్యోగం సాధించే వరకు అపరిమిత ఇంటర్వ్యూ అవకాశాలు లభిస్తాయి.',
    tag: 'Unlimited Interviews Guaranteed',
    image: '/assets/program_scenes/scene_6_offer.jpg',
    bullet: 'Interview support continues until you land your tech job',
  },
  {
    id: 7,
    start: 56,
    end: 71,
    titleEn: 'Step Directly Into Tech Careers',
    titleTe: 'హై-పేయింగ్ టెక్ కెరీర్‌లోకి ప్రవేశం',
    subtitleEn:
      'NxtWave isn’t just an online coding class. It completely bypasses the outdated college system, giving you the exact skills, a proven portfolio, and the industry access you need to step directly into a high-paying tech career.',
    subtitleTe:
      'నెక్స్ట్‌వేవ్ కేవలం ఆన్‌లైన్ కోడింగ్ క్లాస్ మాత్రమే కాదు. ఇది పాత కాలేజీ వ్యవస్థను దాటి, అత్యధిక వేతనం గల టెక్ కెరీర్‌ను అందుకోవడానికి అవసరమైన నైపుణ్యాలు మరియు అవకాశాలను అందిస్తుంది.',
    tag: 'Skills • Portfolio • Industry Access',
    image: '/assets/program_scenes/scene_7_career.jpg',
    bullet: 'Complete career acceleration for software engineering',
  },
];

export const ProgramCurriculumVideoPlayer: React.FC<ProgramCurriculumVideoPlayerProps> = ({
  onVideoEnd,
  defaultViewMode = 'reel',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(0.95);
  const [subtitlesLanguage, setSubtitlesLanguage] = useState<'en' | 'te' | 'off'>('en');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'reel' | 'wide'>(defaultViewMode);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const currentScene =
    SCENES.find((s) => currentTime >= s.start && currentTime < s.end) || SCENES[0];

  // Stop any ongoing speech or audio element
  const stopAllAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAudioSpeaking(false);
  };

  // Play Gemini Female Voice narration audio
  const playNarrationForScene = (sceneId: number, lang: 'en' | 'te' | 'off') => {
    if (isMuted || customVideoUrl || lang === 'off') {
      stopAllAudio();
      return;
    }

    const actualLang = lang === 'te' ? 'te' : 'en';
    const actualSceneId = Math.min(Math.max(sceneId, 1), 7);
    const audioPath = `/api/program-video-narration/${actualLang}/${actualSceneId}`;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
    }

    const audio = audioElementRef.current;
    audio.src = audioPath;
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
          console.warn('Audio auto-play policy notice:', err);
          setAudioBlocked(true);
          setIsAudioSpeaking(false);

          // Fallback to browser speech synthesis using explicitly female voice
          try {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              const sceneObj = SCENES.find((s) => s.id === sceneId) || SCENES[0];
              const textToSpeak = actualLang === 'en' ? sceneObj.subtitleEn : sceneObj.subtitleTe;
              const utterance = new SpeechSynthesisUtterance(textToSpeak);
              utterance.rate = playbackSpeed;
              utterance.volume = isMuted ? 0 : volume;
              utterance.pitch = 1.15; // Pleasant, natural female tone
              utterance.lang = actualLang === 'te' ? 'te-IN' : 'en-US';

              const voices = window.speechSynthesis.getVoices();
              const femaleVoice =
                voices.find((v) => {
                  const name = v.name.toLowerCase();
                  const isFemale =
                    name.includes('female') ||
                    name.includes('zira') ||
                    name.includes('samantha') ||
                    name.includes('kavya') ||
                    name.includes('heera') ||
                    name.includes('victoria') ||
                    name.includes('kore');
                  if (actualLang === 'te') {
                    return v.lang.startsWith('te');
                  }
                  return isFemale && (v.lang.startsWith('en') || v.lang.includes('IN'));
                }) ||
                voices.find((v) =>
                  actualLang === 'te' ? v.lang.startsWith('te') : v.lang.startsWith('en')
                );

              if (femaleVoice) utterance.voice = femaleVoice;

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
      // If audio file has error or hasn't loaded, fallback to female speech synthesis
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const sceneObj = SCENES.find((s) => s.id === sceneId) || SCENES[0];
          const textToSpeak = actualLang === 'en' ? sceneObj.subtitleEn : sceneObj.subtitleTe;
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = playbackSpeed;
          utterance.volume = isMuted ? 0 : volume;
          utterance.pitch = 1.15;
          utterance.lang = actualLang === 'te' ? 'te-IN' : 'en-US';

          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes('female') ||
              name.includes('zira') ||
              name.includes('samantha') ||
              name.includes('kavya') ||
              name.includes('heera')
            );
          });
          if (femaleVoice) utterance.voice = femaleVoice;

          utterance.onstart = () => setIsAudioSpeaking(true);
          utterance.onend = () => setIsAudioSpeaking(false);
          utterance.onerror = () => setIsAudioSpeaking(false);

          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      } catch {
        // ignore
      }
    };
  };

  // Playback timer simulation for animated player
  useEffect(() => {
    if (customVideoUrl && videoElementRef.current) return;

    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            stopAllAudio();
            if (onVideoEnd) onVideoEnd();
            return 0;
          }
          return Math.min(prev + 0.25 * playbackSpeed, TOTAL_DURATION);
        });
      }, 250);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, customVideoUrl, onVideoEnd]);

  // Synchronize narration on scene changes
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
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (customVideoUrl && videoElementRef.current) {
      videoElementRef.current.currentTime = newTime;
    } else if (isPlaying) {
      const sceneAtTime = SCENES.find((s) => newTime >= s.start && newTime < s.end) || SCENES[0];
      playNarrationForScene(sceneAtTime.id, subtitlesLanguage);
    }
  };

  const jumpToScene = (sceneIndex: number) => {
    const targetScene = SCENES[sceneIndex];
    if (targetScene) {
      setCurrentTime(targetScene.start);
      if (customVideoUrl && videoElementRef.current) {
        videoElementRef.current.currentTime = targetScene.start;
      } else if (isPlaying) {
        playNarrationForScene(targetScene.id, subtitlesLanguage);
      }
    }
  };

  const handleCustomVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      stopAllAudio();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl border border-slate-800 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : ''
      }`}
    >
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold tracking-tight text-white/90">
            NxtWave Genius Explainer
          </span>
          <span className="text-[10px] font-semibold bg-[#0B63E5]/80 text-white px-2 py-0.5 rounded-full border border-blue-400/30">
            Why It Beats College
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Equalizer Live Pill with Gemini Female Voice */}
          {isPlaying && !isMuted ? (
            <div
              className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-emerald-300 text-[10px] font-bold shadow-sm"
              title="Gemini Female Voice (Kore) Narration Active"
            >
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-2" />
                <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s] h-3" />
                <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s] h-1.5" />
              </div>
              <span>Gemini Female Voice • {subtitlesLanguage === 'te' ? 'తెలుగు (Kore)' : 'English (Kore)'}</span>
            </div>
          ) : (
            <div
              className="hidden sm:flex items-center gap-1.5 bg-white/10 border border-white/15 px-2 py-1 rounded-lg text-slate-300 text-[10px] font-medium"
              title="Gemini Female Voice (Kore) Narration"
            >
              <Volume2 className="w-3 h-3 text-blue-400" />
              <span>Gemini Female Voice (Kore)</span>
            </div>
          )}

          {/* Aspect Ratio Toggle */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('reel')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'reel' ? 'bg-[#0B63E5] text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
              title="Reel View (9:16 Portrait)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('wide')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'wide' ? 'bg-[#0B63E5] text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
              title="Widescreen Theater (16:9)"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Load MP4 / Video Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors cursor-pointer"
            title="Load custom MP4 video file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {customVideoUrl ? 'Replace MP4' : 'Load MP4'}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleCustomVideoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Main Visual Stage */}
      <div
        className={`relative w-full flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black ${
          viewMode === 'reel' ? 'aspect-[9/13] sm:aspect-[9/14] max-h-[580px]' : 'aspect-video'
        }`}
      >
        {customVideoUrl ? (
          /* Native HTML5 Video Element for uploaded MP4 */
          <video
            ref={videoElementRef}
            src={customVideoUrl}
            className="w-full h-full object-contain"
            playsInline
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => {
              setIsPlaying(false);
              if (onVideoEnd) onVideoEnd();
            }}
          />
        ) : (
          /* High-Fidelity Papercraft Video Simulation */
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Background Papercraft Scene Image with Ken-Burns Camera Effect */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScene.id}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className="relative w-full h-full"
                >
                  <img
                    src={currentScene.image}
                    alt={currentScene.titleEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.04]"
                  />
                  {/* Subtle paper grain texture & gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/50" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Scene Badge & Progress Pill */}
            <div className="relative z-10 pt-14 px-4 sm:px-6 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#0B63E5]/90 text-white shadow-lg backdrop-blur-md border border-blue-400/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentScene.tag}</span>
              </span>

              <span className="text-[11px] font-semibold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-slate-300 border border-white/10">
                Scene {currentScene.id} of {SCENES.length}
              </span>
            </div>

            {/* Middle Focal Card / Key Highlight */}
            <div className="relative z-10 px-4 sm:px-6 my-auto">
              <motion.div
                key={`badge-${currentScene.id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-md mx-auto bg-black/60 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    {currentScene.id === 1 && <GraduationCap className="w-4 h-4" />}
                    {currentScene.id === 2 && <Rocket className="w-4 h-4" />}
                    {currentScene.id === 3 && <Code2 className="w-4 h-4" />}
                    {currentScene.id === 4 && <CheckCircle2 className="w-4 h-4" />}
                    {currentScene.id === 5 && <Award className="w-4 h-4" />}
                    {currentScene.id === 6 && <Briefcase className="w-4 h-4" />}
                    {currentScene.id === 7 && <Building2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {subtitlesLanguage === 'te' ? currentScene.titleTe : currentScene.titleEn}
                    </h3>
                    <p className="text-[11px] text-blue-300 font-medium">
                      {currentScene.bullet}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Subtitle Display Card (Styled exactly like the papercraft reel card) */}
            <div className="relative z-10 pb-20 px-4 sm:px-6">
              {subtitlesLanguage !== 'off' && (
                <motion.div
                  key={`sub-${currentScene.id}-${subtitlesLanguage}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-lg mx-auto bg-amber-50/95 text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl border border-amber-200 text-center"
                >
                  <p className="text-xs sm:text-sm font-bold leading-snug tracking-tight font-serif">
                    &ldquo;
                    {subtitlesLanguage === 'te'
                      ? currentScene.subtitleTe
                      : currentScene.subtitleEn}
                    &rdquo;
                  </p>
                  <span className="text-[10px] text-slate-500 font-sans mt-0.5 block font-semibold">
                    {subtitlesLanguage === 'te' ? 'నెక్స్ట్‌వేవ్ తెలుగు వివరణ' : 'NxtWave Curriculum Explainer'}
                  </span>
                </motion.div>
              )}
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
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 hover:bg-black/35 transition-colors cursor-pointer group"
            aria-label="Play video"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0B63E5] hover:bg-[#0047BA] text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-30 bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 backdrop-blur-md">
        {/* Progress Bar & Scene Markers */}
        <div className="relative mb-2.5">
          <input
            type="range"
            min="0"
            max={TOTAL_DURATION}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0B63E5]"
            title={`Progress: ${formatTime(currentTime)} / ${formatTime(TOTAL_DURATION)}`}
          />
          {/* Scene marker dots */}
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex justify-between pointer-events-none px-1">
            {SCENES.map((scene) => (
              <span
                key={scene.id}
                style={{ left: `${(scene.start / TOTAL_DURATION) * 100}%` }}
                className="w-1.5 h-1.5 rounded-full bg-white/40 absolute -translate-x-1/2"
                title={scene.titleEn}
              />
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Play/Pause, Replay, Prev/Next, Timestamps */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-lg bg-[#0B63E5] hover:bg-[#0047BA] text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Skip Prev Scene */}
            <button
              type="button"
              onClick={() => {
                const prevIndex = Math.max(0, SCENES.findIndex((s) => s.id === currentScene.id) - 1);
                jumpToScene(prevIndex);
              }}
              title="Previous Scene"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer hidden sm:block"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Skip Next Scene */}
            <button
              type="button"
              onClick={() => {
                const nextIndex = Math.min(SCENES.length - 1, SCENES.findIndex((s) => s.id === currentScene.id) + 1);
                jumpToScene(nextIndex);
              }}
              title="Next Scene"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer hidden sm:block"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTime(0);
                if (customVideoUrl && videoElementRef.current) {
                  videoElementRef.current.currentTime = 0;
                }
              }}
              title="Restart from beginning"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Time Indicator */}
            <div className="text-xs font-mono text-slate-300">
              <span className="font-bold text-white">{formatTime(currentTime)}</span>
              <span className="text-slate-500"> / {formatTime(TOTAL_DURATION)}</span>
            </div>
          </div>

          {/* Right: Audio Volume Slider, Subtitles, Speed, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-2.5">
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
                className="w-12 sm:w-16 h-1 bg-slate-600 rounded cursor-pointer accent-[#0B63E5]"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>

            {/* Subtitles Language Toggle */}
            <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setSubtitlesLanguage('en')}
                className={`px-1.5 py-1 rounded transition-colors ${
                  subtitlesLanguage === 'en' ? 'bg-[#0B63E5] text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title="English Subtitles & Voice"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setSubtitlesLanguage('te')}
                className={`px-1.5 py-1 rounded transition-colors ${
                  subtitlesLanguage === 'te' ? 'bg-[#0B63E5] text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title="Telugu Subtitles & Voice (తెలుగు)"
              >
                తెలుగు
              </button>
              <button
                type="button"
                onClick={() => setSubtitlesLanguage('off')}
                className={`px-1.5 py-1 rounded transition-colors ${
                  subtitlesLanguage === 'off' ? 'bg-[#0B63E5] text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title="Subtitles Off"
              >
                Off
              </button>
            </div>

            {/* Speed Selector */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-0.5 text-[10px]">
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-1 rounded transition-colors ${
                    playbackSpeed === speed ? 'bg-[#0B63E5] text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
