'use client';

import { TrendingUp, TrendingDown, Minus, Crown, Users, Activity, Info } from 'lucide-react';

interface Props {
  zoneData: { zone_id: number; zone_label: string; count: number }[];
  frameData: { time: number; counts: { [key: string]: number } }[];
  totalCount: number;
}

export default function InsightsSummary({ zoneData, frameData, totalCount }: Props) {
  if (!zoneData || !frameData || frameData.length === 0 || zoneData.length === 0) return null;

  const zones = Object.keys(frameData[0]?.counts || {});
  const allCounts = frameData.flatMap(f => Object.values(f.counts)).filter(n => !isNaN(n)) as number[];
  if (allCounts.length === 0) return null;

  const avgCount = Math.round(allCounts.reduce((a: number, b: number) => a + b, 0) / allCounts.length) || 0;
  const maxCount = Math.max(...allCounts) || 0;
  const minCount = Math.min(...allCounts) || 0;

  const peakZone = zoneData.reduce((max, z) => (z.count || 0) > (max.count || 0) ? z : max, zoneData[0]);
  const lowZone = zoneData.reduce((min, z) => (z.count || 0) < (min.count || 0) ? z : min, zoneData[0]);

  const midPoint = Math.floor(frameData.length / 2);
  const firstHalfCounts = frameData.slice(0, midPoint).flatMap(f => Object.values(f.counts)).filter(n => !isNaN(n)) as number[];
  const secondHalfCounts = frameData.slice(midPoint).flatMap(f => Object.values(f.counts)).filter(n => !isNaN(n)) as number[];
  const firstHalf = firstHalfCounts.length > 0 ? firstHalfCounts.reduce((a: number, b: number) => a + b, 0) / firstHalfCounts.length : 0;
  const secondHalf = secondHalfCounts.length > 0 ? secondHalfCounts.reduce((a: number, b: number) => a + b, 0) / secondHalfCounts.length : 0;
  const trend = secondHalf > firstHalf ? 'increasing' : secondHalf < firstHalf ? 'decreasing' : 'stable';

  const getTrendIcon = () => {
    if (trend === 'increasing') return <TrendingUp className="text-purple-600" size={28} />;
    if (trend === 'decreasing') return <TrendingDown className="text-purple-600" size={28} />;
    return <Minus className="text-purple-600" size={28} />;
  };

  const getTrendText = () => {
    if (trend === 'increasing') return 'Rising';
    if (trend === 'decreasing') return 'Falling';
    return 'Stable';
  };

  return (
    <div className="space-y-5">
      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Peak Zone */}
        <div className="group bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md group-hover:scale-110 transition-transform">
              <Crown className="text-white" size={20} />
            </div>
            <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">Peak Zone</p>
          </div>
          <p className="text-3xl font-bold text-blue-900 mb-2 tracking-tight">{peakZone?.zone_label || 'N/A'}</p>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-blue-600" />
            <p className="text-sm text-blue-700 font-semibold">{peakZone?.count || 0} people</p>
          </div>
          <p className="text-xs text-blue-600 mt-1">Highest occupancy</p>
        </div>

        {/* Average Occupancy */}
        <div className="group bg-gradient-to-br from-green-50 to-emerald-100 p-5 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md group-hover:scale-110 transition-transform">
              <Activity className="text-white" size={20} />
            </div>
            <p className="text-xs text-green-700 font-bold uppercase tracking-wider">Average</p>
          </div>
          <p className="text-3xl font-bold text-green-900 mb-2 tracking-tight">{avgCount || 0}</p>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-green-600" />
            <p className="text-sm text-green-700 font-semibold">people</p>
          </div>
          <p className="text-xs text-green-600 mt-1">Range: {minCount || 0} - {maxCount || 0}</p>
        </div>

        {/* Trend */}
        <div className="group bg-gradient-to-br from-purple-50 to-pink-100 p-5 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md group-hover:scale-110 transition-transform">
              {getTrendIcon()}
            </div>
            <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">Trend</p>
          </div>
          <p className="text-3xl font-bold text-purple-900 mb-2 tracking-tight">{getTrendText()}</p>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-purple-600" />
            <p className="text-sm text-purple-700 font-semibold capitalize">{trend}</p>
          </div>
          <p className="text-xs text-purple-600 mt-1">Crowd movement</p>
        </div>

        {/* Least Crowded */}
        <div className="group bg-gradient-to-br from-orange-50 to-amber-100 p-5 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md group-hover:scale-110 transition-transform">
              <Users className="text-white" size={20} />
            </div>
            <p className="text-xs text-orange-700 font-bold uppercase tracking-wider">Least Crowded</p>
          </div>
          <p className="text-3xl font-bold text-orange-900 mb-2 tracking-tight">{lowZone?.zone_label || 'N/A'}</p>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-orange-600" />
            <p className="text-sm text-orange-700 font-semibold">{lowZone?.count || 0} people</p>
          </div>
          <p className="text-xs text-orange-600 mt-1">Lowest occupancy</p>
        </div>
      </div>

      {/* Chart Guide */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-100 p-5 rounded-xl border-2 border-gray-200 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-gradient-to-br from-gray-600 to-slate-700 rounded-lg shadow-sm">
            <Info className="text-white" size={16} />
          </div>
          <p className="text-sm font-bold text-gray-800 tracking-tight">📊 Chart Guide</p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <p className="text-xs text-gray-700"><strong className="text-gray-900">Zone-wise Population:</strong> Current count in each zone</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <p className="text-xs text-gray-700"><strong className="text-gray-900">Total Occupancy:</strong> Overall crowd level over time</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">•</span>
            <p className="text-xs text-gray-700"><strong className="text-gray-900">Zone-wise Over Time:</strong> How each zone changes during video</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">•</span>
            <p className="text-xs text-gray-700"><strong className="text-gray-900">Peak Hour Analysis:</strong> Which time periods had most people</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">•</span>
            <p className="text-xs text-gray-700"><strong className="text-gray-900">Zone Distribution:</strong> Percentage of crowd in each zone</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">•</span>
            <p className="text-xs text-gray-700"><strong className="text-gray-900">Density Heatmap:</strong> Visual intensity (Green=Low, Yellow=Medium, Red=High)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-bold">•</span>
            <p className="text-xs text-gray-700"><strong className="text-gray-900">Avg vs Peak:</strong> Compare typical vs maximum counts per zone</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-500 font-bold">•</span>
            <p className="text-xs text-gray-700"><strong className="text-gray-900">Trend Analysis:</strong> Is crowd growing or shrinking</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
