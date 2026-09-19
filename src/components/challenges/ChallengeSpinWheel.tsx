'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

type Phase = 'feature' | 'situation';

interface ChallengeSpinWheelProps {
  phase: Phase;
  disabled?: boolean;
  entries?: string[];
  onSpinStart: () => void;
  onSpinComplete: () => Promise<void>;
  prepareSpin?: () => Promise<string | null>;
}

const LABELS = {
  feature: ['Build', 'Design', 'Debug', 'Deploy', 'Secure', 'Scale', 'Test', 'Ship'],
  situation: ['Adapt', 'Respond', 'Recover', 'Decide', 'Lead', 'Solve', 'Deliver', 'Improve'],
};

// Fallback labels if no entries are provided
const FALLBACK_LABELS = LABELS;

const COLORS = {
  feature: ['#7c3aed', '#2563eb', '#0891b2', '#4f46e5', '#9333ea', '#0d9488', '#6366f1', '#0284c7'],
  situation: ['#ea580c', '#dc2626', '#f59e0b', '#b91c1c', '#f97316', '#ef4444', '#d97706', '#c2410c'],
};

function slicePath(index: number, total: number) {
  const center = 200;
  const radius = 200;
  const angle = 360 / total;
  const start = ((index * angle - 90) * Math.PI) / 180;
  const end = (((index + 1) * angle - 90) * Math.PI) / 180;
  const x1 = center + radius * Math.cos(start);
  const y1 = center + radius * Math.sin(start);
  const x2 = center + radius * Math.cos(end);
  const y2 = center + radius * Math.sin(end);
  return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
}

export function ChallengeSpinWheel({ phase, disabled = false, entries, onSpinStart, onSpinComplete, prepareSpin }: ChallengeSpinWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  // Use server-provided entries if available, otherwise fall back to generic labels
  const labels = entries?.length ? entries : FALLBACK_LABELS[phase];
  const colors = COLORS[phase];
  const accent = phase === 'feature' ? '#a855f7' : '#f97316';

  const spin = async () => {
    if (spinning || disabled) return;

    setSpinning(true);
    onSpinStart();
    let winnerIndex = Math.floor(Math.random() * labels.length);
    if (prepareSpin) {
      const title = await prepareSpin();
      if (!title) { setSpinning(false); return; }
      const matchingIndexes = labels.map((label, index) => label === title ? index : -1).filter((index) => index >= 0);
      winnerIndex = matchingIndexes[Math.floor(Math.random() * matchingIndexes.length)];
    }
    setRotation((current) => {
      const angle = 360 / labels.length;
      const desired = (360 - ((winnerIndex + 0.5) * angle) % 360) % 360;
      const currentAngle = ((current % 360) + 360) % 360;
      const adjustment = (desired - currentAngle + 360) % 360;
      return current + 2160 + adjustment;
    });

    // Match the reveal pacing of the original Lightning feature wheel.
    await new Promise((resolve) => setTimeout(resolve, 4800));
    try {
      await onSpinComplete();
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-5">
      <div className="relative flex h-60 w-60 items-center justify-center rounded-full border border-white/10 bg-void/40 p-2 shadow-[0_0_32px_rgba(168,85,247,0.2)] sm:h-72 sm:w-72">
        <div className="absolute -top-1 left-1/2 z-20 -translate-x-1/2 drop-shadow-[0_0_8px_rgba(255,255,255,0.75)]" aria-hidden="true">
          <svg width="26" height="32" viewBox="0 0 28 34" fill="none">
            <path d="M14 34L28 6H0L14 34Z" fill={accent} />
            <circle cx="14" cy="6" r="4" fill="#fff" />
          </svg>
        </div>

        <div className="h-full w-full overflow-hidden rounded-full border-2 border-white/10">
          <motion.div
            className="h-full w-full"
            animate={{ rotate: rotation }}
            transition={{ duration: 4.8, ease: [0.14, 0.84, 0.22, 1] }}
          >
            <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label={`${phase} challenge wheel`}>
              {labels.map((label, index) => {
                const angle = (index + 0.5) * (360 / labels.length);
                return (
                  <g key={`${label}-${index}`}>
                    <path d={slicePath(index, labels.length)} fill={colors[index % colors.length]} stroke="#090714" strokeWidth="2" />
                    <g transform={`rotate(${angle - 90} 200 200)`}>
                      <text x="200" y={labels.length > 24 ? '42' : '62'} textAnchor="middle" fill="#fff" fontSize={labels.length > 24 ? '6' : labels.length > 10 ? '10' : '15'} fontWeight="800">
                        {label.length > (labels.length > 24 ? 13 : 18) ? `${label.slice(0, labels.length > 24 ? 12 : 17)}…` : label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </motion.div>
        </div>

        <div className="absolute z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full border border-white/10 bg-void/90 text-center shadow-xl">
          <span className="text-[9px] font-bold tracking-[0.2em] text-white/45">GENESIS</span>
          <span className="mt-0.5 text-xs font-black" style={{ color: accent }}>{phase === 'feature' ? 'BUILD' : 'SITUATION'}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={disabled || spinning}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${phase === 'feature' ? 'bg-pulse hover:bg-pulse/80' : 'bg-ion text-void hover:bg-ion/80'}`}
      >
        <Play className="h-4 w-4 fill-current" />
        {spinning ? 'Spinning…' : `Spin ${phase === 'feature' ? 'Feature' : 'Situation'} Wheel`}
      </button>
    </div>
  );
}
