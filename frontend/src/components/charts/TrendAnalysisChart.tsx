'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  frameData: { time: number; counts: { [key: string]: number } }[];
}

export default function TrendAnalysisChart({ frameData }: Props) {
  if (!frameData || frameData.length < 2) return null;

  const zones = Object.keys(frameData[0]?.counts || {});
  const colors = ['#14B8A6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const getTrend = (zone: string) => {
    const counts = frameData.map(f => f.counts[zone] || 0);
    const firstHalf = counts.slice(0, Math.floor(counts.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(counts.length / 2);
    const secondHalf = counts.slice(Math.floor(counts.length / 2)).reduce((a, b) => a + b, 0) / (counts.length - Math.floor(counts.length / 2));
    const change = ((secondHalf - firstHalf) / firstHalf) * 100;
    return { zone, change, trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable' };
  };

  const trends = zones.map(getTrend);
  const maxChange = Math.max(...trends.map(t => Math.abs(t.change)), 1);

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-600" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-gray-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return { bg: '#10B981', text: 'text-green-600', badge: 'bg-green-100' };
    if (trend === 'down') return { bg: '#EF4444', text: 'text-red-600', badge: 'bg-red-100' };
    return { bg: '#9CA3AF', text: 'text-gray-600', badge: 'bg-gray-100' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Trend Analysis</h3>
          <p className="text-sm text-gray-500">Is crowd growing or shrinking</p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl border-2 border-indigo-100 shadow-lg">
        <div className="space-y-4">
          {trends.map((trend, idx) => {
            const colorInfo = getTrendColor(trend.trend);
            return (
              <div key={trend.zone} className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{trend.zone}</span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${colorInfo.badge}`}>
                      {getTrendIcon(trend.trend)}
                      {trend.trend === 'up' && <span className={`text-xs font-bold ${colorInfo.text}`}>Rising</span>}
                      {trend.trend === 'down' && <span className={`text-xs font-bold ${colorInfo.text}`}>Falling</span>}
                      {trend.trend === 'stable' && <span className={`text-xs font-bold ${colorInfo.text}`}>Stable</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trend.trend === 'up' && <span className={`text-sm font-bold ${colorInfo.text}`}>+{trend.change.toFixed(1)}%</span>}
                    {trend.trend === 'down' && <span className={`text-sm font-bold ${colorInfo.text}`}>-{Math.abs(trend.change).toFixed(1)}%</span>}
                    {trend.trend === 'stable' && <span className={`text-sm font-bold ${colorInfo.text}`}>~{Math.abs(trend.change).toFixed(1)}%</span>}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max((Math.abs(trend.change) / maxChange) * 100, 5)}%`,
                      backgroundColor: colorInfo.bg,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {/* Summary */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="font-semibold text-gray-700">
                {trends.filter(t => t.trend === 'up').length} Growing
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown size={16} className="text-red-600" />
              <span className="font-semibold text-gray-700">
                {trends.filter(t => t.trend === 'down').length} Declining
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Minus size={16} className="text-gray-600" />
              <span className="font-semibold text-gray-700">
                {trends.filter(t => t.trend === 'stable').length} Stable
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
