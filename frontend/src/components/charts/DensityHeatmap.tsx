'use client';

import { Flame } from 'lucide-react';

interface Props {
  zoneData: { zone_id: number; zone_label: string; count: number }[];
}

export default function DensityHeatmap({ zoneData }: Props) {
  if (!zoneData || zoneData.length === 0) return null;

  const maxCount = Math.max(...zoneData.map(z => z.count), 1);

  const getColor = (count: number) => {
    const ratio = count / maxCount;
    if (ratio < 0.33) return { bg: '#10B981', label: 'Low', text: 'Moderate Activity' };
    if (ratio < 0.66) return { bg: '#F59E0B', label: 'Medium', text: 'Moderate Activity' };
    return { bg: '#EF4444', label: 'High', text: 'Near Capacity' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
          <Flame size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Crowd Density Levels</h3>
          <p className="text-sm text-gray-500">Real-time capacity utilization</p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl border-2 border-orange-100 shadow-lg">
        <div className="space-y-4">
          {zoneData.map((zone) => {
            const ratio = zone.count / maxCount;
            const colorInfo = getColor(zone.count);
            return (
              <div key={zone.zone_id} className="group">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{zone.zone_label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">{colorInfo.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{zone.count} People</span>
                    <span className="text-xs text-gray-500">{colorInfo.text}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-7 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max(ratio * 100, 5)}%`,
                      backgroundColor: colorInfo.bg,
                    }}
                  >
                    {ratio > 0.15 && (
                      <span className="text-xs font-bold text-white">{Math.round(ratio * 100)}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex gap-4 justify-center mt-6 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
            <span className="text-sm font-semibold text-gray-700">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm"></div>
            <span className="text-sm font-semibold text-gray-700">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
            <span className="text-sm font-semibold text-gray-700">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
