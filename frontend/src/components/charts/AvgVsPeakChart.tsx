'use client';

import { BarChart2 } from 'lucide-react';

interface Props {
  zoneData: { zone_id: number; zone_label: string; count: number }[];
  frameData: { time: number; counts: { [key: string]: number } }[];
}

export default function AvgVsPeakChart({ zoneData, frameData }: Props) {
  if (!zoneData || !frameData) return null;

  const zones = Object.keys(frameData[0]?.counts || {});
  const stats = zones.map(zone => {
    const counts = frameData.map(f => f.counts[zone] || 0);
    const avg = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);
    const peak = Math.max(...counts);
    return { zone, avg, peak };
  });

  const maxPeak = Math.max(...stats.map(s => s.peak), 1);
  const yTicks = [0, Math.ceil(maxPeak / 2), maxPeak];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
          <BarChart2 size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Average vs Peak Count</h3>
          <p className="text-sm text-gray-500">Comparative traffic analysis by zone</p>
        </div>
      </div>
      <div className="h-80 bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl border-2 border-purple-100 shadow-lg relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <svg viewBox="0 0 140 80" className="w-full h-full relative z-10">
          {/* Grid */}
          {yTicks.map((tick, i) => {
            const y = 70 - (tick / maxPeak) * 60;
            return (
              <g key={i}>
                <line x1="15" y1={y} x2="130" y2={y} stroke="#e5e7eb" strokeWidth="0.3" strokeDasharray="1,1" />
                <text x="12" y={y + 1} fontSize="3.5" fill="#6b7280" textAnchor="end" fontWeight="600">{tick}</text>
              </g>
            );
          })}
          {/* Grouped Bars */}
          {stats.map((stat, idx) => {
            const groupWidth = 100 / stats.length;
            const barWidth = groupWidth * 0.3;
            const x1 = 20 + idx * groupWidth + groupWidth * 0.15;
            const x2 = x1 + barWidth + 2;

            const avgHeight = maxPeak > 0 ? (stat.avg / maxPeak) * 60 : 0;
            const peakHeight = maxPeak > 0 ? (stat.peak / maxPeak) * 60 : 0;

            return (
              <g key={stat.zone}>
                {/* Average bar with gradient */}
                <defs>
                  <linearGradient id={`avgGrad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id={`peakGrad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity="0.7" />
                  </linearGradient>
                </defs>
                {/* Bar shadows */}
                <rect x={x1 + 0.3} y={70 - avgHeight + 0.3} width={barWidth} height={avgHeight} fill="#00000015" rx="0.8" />
                <rect x={x2 + 0.3} y={70 - peakHeight + 0.3} width={barWidth} height={peakHeight} fill="#00000015" rx="0.8" />
                {/* Actual bars */}
                <rect
                  x={x1}
                  y={70 - avgHeight}
                  width={barWidth}
                  height={avgHeight || 0}
                  fill={`url(#avgGrad-${idx})`}
                  rx="0.8"
                  className="animate-bar-grow"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                />
                <rect
                  x={x2}
                  y={70 - peakHeight}
                  width={barWidth}
                  height={peakHeight || 0}
                  fill={`url(#peakGrad-${idx})`}
                  rx="0.8"
                  className="animate-bar-grow"
                  style={{ animationDelay: `${idx * 0.1 + 0.05}s` }}
                />
                {/* Value labels */}
                {avgHeight > 5 && (
                  <text x={x1 + barWidth / 2} y={70 - avgHeight - 2} fontSize="3" fill="#3B82F6" textAnchor="middle" fontWeight="bold">{stat.avg}</text>
                )}
                {peakHeight > 5 && (
                  <text x={x2 + barWidth / 2} y={70 - peakHeight - 2} fontSize="3" fill="#EF4444" textAnchor="middle" fontWeight="bold">{stat.peak}</text>
                )}
                {/* Zone label */}
                <text x={x1 + barWidth + 1} y="76" fontSize="3.5" fill="#6b7280" textAnchor="middle" fontWeight="600">{stat.zone}</text>
              </g>
            );
          })}
          {/* Axes */}
          <line x1="15" y1="70" x2="130" y2="70" stroke="#374151" strokeWidth="0.5" />
          <line x1="15" y1="10" x2="15" y2="70" stroke="#374151" strokeWidth="0.5" />
        </svg>
      </div>
      {/* Legend */}
      <div className="flex gap-4 justify-center p-3 bg-gradient-to-r from-gray-50 to-slate-100 rounded-xl border-2 border-gray-200">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-4 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded shadow-sm"></div>
          <span className="text-sm font-semibold text-gray-700">Avg</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-4 h-4 bg-gradient-to-b from-red-500 to-red-600 rounded shadow-sm"></div>
          <span className="text-sm font-semibold text-gray-700">Peak</span>
        </div>
      </div>
    </div>
  );
}
