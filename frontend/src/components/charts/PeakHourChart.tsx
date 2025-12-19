'use client';

import { Clock } from 'lucide-react';

interface Props {
  frameData: { time: number; counts: { [key: string]: number } }[];
}

export default function PeakHourChart({ frameData }: Props) {
  if (!frameData || frameData.length === 0) return null;

  const buckets = 6;
  const framesPerBucket = Math.ceil(frameData.length / buckets);
  const hourData = Array.from({ length: buckets }, (_, i) => {
    const start = i * framesPerBucket;
    const end = Math.min(start + framesPerBucket, frameData.length);
    const frames = frameData.slice(start, end);
    const sumTotal = frames.reduce((sum, f) => sum + Object.values(f.counts).reduce((a: number, b: number) => a + b, 0), 0);
    const avg = frames.length > 0 ? sumTotal / frames.length : 0;
    return { hour: `${i * 10}s`, count: Math.round(avg) };
  });

  const maxCount = Math.max(...hourData.map(h => h.count), 1);
  const yTicks = [0, Math.ceil(maxCount / 2), maxCount];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
            <Clock size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">Peak Hour Analysis</h3>
            <p className="text-sm text-gray-500">Visitor traffic distribution over time intervals</p>
          </div>
        </div>
      </div>
      <div className="h-80 bg-gradient-to-br from-white to-emerald-50 p-6 rounded-xl border-2 border-emerald-100 shadow-lg relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <svg viewBox="0 0 140 80" className="w-full h-full relative z-10">
          {/* Grid */}
          {yTicks.map((tick, i) => {
            const y = 70 - (tick / maxCount) * 60;
            return (
              <g key={i}>
                <line x1="15" y1={y} x2="130" y2={y} stroke="#e5e7eb" strokeWidth="0.3" strokeDasharray="1,1" />
                <text x="12" y={y + 1} fontSize="3.5" fill="#6b7280" textAnchor="end" fontWeight="600">{tick}</text>
              </g>
            );
          })}
          {/* Bars with gradient and animation */}
          {hourData.map((hour, idx) => {
            const barWidth = 100 / hourData.length;
            const x = 20 + idx * barWidth;
            const height = maxCount > 0 ? (hour.count / maxCount) * 60 : 0;
            const y = 70 - height;
            return (
              <g key={idx}>
                {/* Bar shadow */}
                <rect x={x + 0.3} y={y + 0.3} width={barWidth * 0.7} height={height} fill="#00000015" rx="1" />
                {/* Animated bar with gradient */}
                <defs>
                  <linearGradient id={`barGradient-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
                  </linearGradient>
                </defs>
                <rect
                  x={x}
                  y={y}
                  width={barWidth * 0.7}
                  height={height || 0}
                  fill={`url(#barGradient-${idx})`}
                  rx="1"
                  className="animate-bar-grow"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                />
                {/* Value label on top */}
                {height > 5 && (
                  <text x={x + barWidth * 0.35} y={y - 2} fontSize="3.5" fill="#374151" textAnchor="middle" fontWeight="bold">{hour.count}</text>
                )}
                {/* Time label */}
                <text x={x + barWidth * 0.35} y="76" fontSize="3.5" fill="#6b7280" textAnchor="middle" fontWeight="600">{hour.hour}</text>
              </g>
            );
          })}
          {/* Axes */}
          <line x1="15" y1="70" x2="130" y2="70" stroke="#374151" strokeWidth="0.5" />
          <line x1="15" y1="10" x2="15" y2="70" stroke="#374151" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}
