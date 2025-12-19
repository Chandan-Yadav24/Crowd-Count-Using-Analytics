'use client';

import { PieChart } from 'lucide-react';

interface Props {
  zoneData: { zone_id: number; zone_label: string; count: number }[];
}

export default function ZoneComparisonChart({ zoneData }: Props) {
  if (!zoneData || zoneData.length === 0) return null;

  const total = zoneData.reduce((sum, z) => sum + z.count, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
          <PieChart size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Zone Distribution</h3>
          <p className="text-sm text-gray-500">Current occupancy split by zone</p>
        </div>
      </div>
      <div className="h-80 bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl border-2 border-blue-100 shadow-lg relative overflow-hidden flex items-center justify-center">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <svg viewBox="0 0 120 120" className="w-full h-full max-w-md">
            {/* Donut chart segments */}
            {zoneData.map((zone, idx) => {
              const percentage = (zone.count / total) * 100;
              const startAngle = zoneData.slice(0, idx).reduce((sum, z) => sum + (z.count / total) * 360, 0);
              const endAngle = startAngle + (percentage / 100) * 360;

              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (endAngle - 90) * Math.PI / 180;

              // Outer circle
              const x1 = 60 + 40 * Math.cos(startRad);
              const y1 = 60 + 40 * Math.sin(startRad);
              const x2 = 60 + 40 * Math.cos(endRad);
              const y2 = 60 + 40 * Math.sin(endRad);

              // Inner circle (donut hole)
              const ix1 = 60 + 25 * Math.cos(startRad);
              const iy1 = 60 + 25 * Math.sin(startRad);
              const ix2 = 60 + 25 * Math.cos(endRad);
              const iy2 = 60 + 25 * Math.sin(endRad);

              const largeArc = percentage > 50 ? 1 : 0;
              const pathData = `M ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A 25 25 0 ${largeArc} 0 ${ix1} ${iy1} Z`;

              return (
                <g key={zone.zone_id}>
                  <path
                    d={pathData}
                    fill={colors[idx % colors.length]}
                    stroke="white"
                    strokeWidth="0.5"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                </g>
              );
            })}
            {/* Center text */}
            <text x="60" y="55" fontSize="16" fill="#1f2937" textAnchor="middle" fontWeight="bold">{total}</text>
            <text x="60" y="65" fontSize="6" fill="#6b7280" textAnchor="middle" fontWeight="600">Total</text>
          </svg>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center p-4 bg-gradient-to-r from-gray-50 to-slate-100 rounded-xl border-2 border-gray-200">
        {zoneData.map((zone, idx) => {
          const percentage = ((zone.count / total) * 100).toFixed(1);
          return (
            <div key={zone.zone_id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: colors[idx % colors.length] }}></div>
              <span className="text-sm font-semibold text-gray-700">{zone.zone_label}: {zone.count} ({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
