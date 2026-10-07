import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import type { EnrollmentState } from '../../types';

interface ClassAccessPageProps {
  state: EnrollmentState;
  token: string;
  onResetSession?: () => void;
}

export const ClassAccessPage: React.FC<ClassAccessPageProps> = ({
  state,
  token,
  onResetSession,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const rawLearnerName = state.learner?.name;
  const learnerName =
    typeof rawLearnerName === 'string'
      ? rawLearnerName
      : typeof rawLearnerName === 'object' && rawLearnerName && (rawLearnerName as any).name
      ? String((rawLearnerName as any).name)
      : 'Learner';

  // Celebration confetti particles state
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; color: string; size: number; delay: number }>
  >([]);

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    const colors = ['#0B63E5', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];
    const generated = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 300 - 40,
      color: colors[i % colors.length],
      size: Math.random() * 6 + 4,
      delay: Math.random() * 0.5,
    }));
    setParticles(generated);
  }, [prefersReducedMotion]);

  const handleLaunchLms = () => {
    window.open('https://learning.ccbp.in', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-12 sm:py-20 relative overflow-hidden text-center">
      {/* Soft Confetti Burst */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -top-20 z-10">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.2, 1],
                x: p.x,
                y: p.y,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.6,
                delay: p.delay,
                ease: 'easeOut',
              }}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12 relative z-20 flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 shadow-xs ring-4 ring-emerald-50/50">
          <GraduationCap className="w-10 h-10 text-emerald-600 stroke-[1.5]" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tracking-tight mb-3">
          Congratulations, {learnerName.split(' ')[0]}!
        </h1>
        
        <p className="text-base sm:text-lg text-slate-800 font-medium mb-2">
          Your enrollment is complete.
        </p>

        <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto leading-relaxed mb-10">
          Everything is set. We wish you the very best for your learning journey and the opportunities ahead.
        </p>

        <button
          id="launch-lms-btn"
          type="button"
          onClick={handleLaunchLms}
          className="group w-full max-w-sm py-4 px-6 rounded-2xl bg-gradient-to-b from-blue-600 to-blue-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_2px_4px_rgba(37,99,235,0.2)] hover:from-blue-500 hover:to-blue-600 border border-blue-700 active:scale-[0.98] text-white font-extrabold tracking-tight text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Go to Learning Portal</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};
