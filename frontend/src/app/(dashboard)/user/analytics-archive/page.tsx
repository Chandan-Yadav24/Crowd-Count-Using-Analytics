'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Activity,
  ArrowLeft,
  Archive,
  Clock,
  Users,
  Video as VideoIcon,
  Calendar,
  Database,
  Layers,
  Zap,
  FileText,
  MoreVertical,
  ChevronDown,
  Square,
  Upload,
  Settings
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PeakHourChart from '@/components/charts/PeakHourChart';
import ZoneComparisonChart from '@/components/charts/ZoneComparisonChart';
import DensityHeatmap from '@/components/charts/DensityHeatmap';
import AvgVsPeakChart from '@/components/charts/AvgVsPeakChart';
import TrendAnalysisChart from '@/components/charts/TrendAnalysisChart';
import InsightsSummary from '@/components/charts/InsightsSummary';

interface AnalysisRecord {
  id: number;
  video_id: number;
  video_filename: string;
  total_count: number;
  zone_counts: { zone_id: number; zone_label: string; count: number }[];
  processed_at: string;
  frame_data?: { time: number; counts: { [key: string]: number } }[];
}

export default function AnalyticsArchive() {
  const router = useRouter();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'multi'>('bar');
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>('total');
  const [selectedZone3, setSelectedZone3] = useState<string>('all');
  const [liveRecords, setLiveRecords] = useState<AnalysisRecord[]>([]);
  const [liveFrame, setLiveFrame] = useState<string>('');
  const [isPipClosed, setIsPipClosed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadAnalysisRecords();
    loadLiveSessions();
  }, [router]);

  useEffect(() => {
    const liveInterval = setInterval(() => {
      const prevLiveCount = liveRecords.length;
      loadLiveSessions();

      if (selectedRecord && selectedRecord.id < 0) {
        const key = `live_stream_${selectedRecord.video_id}`;
        const data = localStorage.getItem(key);
        if (data) {
          const liveData = JSON.parse(data);
          if (Date.now() - liveData.timestamp < 5000) {
            setSelectedRecord(prev => ({
              ...prev!,
              total_count: liveData.total_count || 0,
              zone_counts: liveData.zone_counts || [],
              frame_data: liveData.frame_data || []
            }));
            if (!isPipClosed) {
              setLiveFrame(liveData.currentFrame || '');
            }
          } else {
            loadAnalysisRecords();
            setLiveFrame('');
          }
        } else {
          loadAnalysisRecords();
          setLiveFrame('');
        }
      } else if (!selectedRecord && liveRecords.length > 0) {
        loadRecordDetails(liveRecords[0]);
      }
    }, 300);

    return () => clearInterval(liveInterval);
  }, [selectedRecord, liveRecords, isPipClosed]);

  const loadAnalysisRecords = async () => {
    try {
      const username = localStorage.getItem('username');
      const res = await fetch(`http://127.0.0.1:8000/api/analysis/all/${username}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
        if (!selectedRecord && data.length > 0 && liveRecords.length === 0) {
          loadRecordDetails(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load analysis records');
    } finally {
      setLoading(false);
    }
  };

  const loadRecordDetails = async (record: AnalysisRecord) => {
    setSelectedRecord(record);
    setLiveFrame('');
    setIsPipClosed(false);

    if (record.id < 0) {
      const key = `live_stream_${record.video_id}`;
      const data = localStorage.getItem(key);
      if (data) {
        const liveData = JSON.parse(data);
        setLiveFrame(liveData.currentFrame || '');
      }
      return;
    }

    if (record.video_id) {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/analysis/frame-data/${record.video_id}`);
        if (res.ok) {
          const frameData = await res.json();
          setSelectedRecord({ ...record, frame_data: frameData });
        }
      } catch (err) {
        console.error('Failed to load frame data');
      }
    }
  };

  const loadLiveSessions = () => {
    try {
      const liveSessions: AnalysisRecord[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('live_stream_') || key.startsWith('session_analysis_'))) {
          const data = localStorage.getItem(key);
          if (data) {
            const liveData = JSON.parse(data);

            if (key.startsWith('live_stream_')) {
              if (Date.now() - liveData.timestamp < 5000) {
                liveSessions.push({
                  id: -liveData.videoId,
                  video_id: liveData.videoId,
                  video_filename: liveData.video_filename || `Video ${liveData.videoId}`,
                  total_count: liveData.total_count || 0,
                  zone_counts: liveData.zone_counts || [],
                  processed_at: new Date().toISOString(),
                  frame_data: liveData.frame_data || []
                });
              }
            } else if (key.startsWith('session_analysis_')) {
              liveSessions.push({
                id: liveData.id || -liveData.video_id,
                video_id: liveData.video_id,
                video_filename: liveData.video_filename || `Video ${liveData.video_id}`,
                total_count: liveData.total_count || 0,
                zone_counts: liveData.zone_counts || [],
                processed_at: liveData.processed_at,
                frame_data: liveData.frame_data || []
              });
            }
          }
        }
      }

      setLiveRecords(liveSessions);
    } catch (err) {
      console.error('Failed to load live sessions:', err);
    }
  };

  const renderBarChart = () => {
    if (!selectedRecord) return null;
    const maxCount = Math.max(...selectedRecord.zone_counts.map(z => z.count), 1);
    const yTicks = [0, Math.ceil(maxCount / 4), Math.ceil(maxCount / 2), Math.ceil(maxCount * 3 / 4), maxCount];

    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <BarChart3 size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Zone-wise Population</h3>
              <p className="text-sm font-medium text-gray-500">Maximum count detected in each zone</p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="h-96 bg-slate-50/50 rounded-2xl p-6 relative overflow-hidden border border-slate-100">
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
            {/* Horizontal Grid lines */}
            {[0, 3, 6, 9, 12].map((tick) => {
              const y = 90 - (tick / 12) * 80;
              return (
                <g key={tick}>
                  <line x1="10" y1={y} x2="95" y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
                  <text x="7" y={y + 1} fontSize="3.5" fill="#94a3b8" textAnchor="end" fontWeight="500">{tick}</text>
                </g>
              );
            })}

            {/* Bars */}
            {selectedRecord.zone_counts.map((zone, idx) => {
              const barWidth = 18;
              const spacing = 15;
              const x = 20 + idx * (barWidth + spacing);
              const height = (zone.count / 12) * 80;
              const y = 90 - height;
              const isHigh = zone.zone_label.toLowerCase().includes('high');
              const barColor = isHigh ? '#3B82F6' : '#10B981';
              const gradientId = `bar-grad-${idx}`;

              return (
                <g key={zone.zone_id} className="group">
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={barColor} />
                      <stop offset="100%" stopColor={barColor} stopOpacity="0.8" />
                    </linearGradient>
                    <filter id={`shadow-${idx}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                      <feOffset dx="0" dy="2" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.2" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height || 0}
                    fill={`url(#${gradientId})`}
                    rx="1.5"
                    filter={`url(#shadow-${idx})`}
                    className="animate-bar-grow opacity-90 group-hover:opacity-100 transition-opacity"
                    style={{ animationDelay: `${idx * 0.1}s`, transformOrigin: 'bottom' }}
                  />

                  {/* Zone Name Label */}
                  <text
                    x={x + barWidth / 2}
                    y="97"
                    fontSize="3.5"
                    fill="#64748b"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {zone.zone_label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    if (!selectedRecord?.frame_data || selectedRecord.frame_data.length === 0) return null;

    const data = selectedRecord.frame_data;
    const zones = Object.keys(data[0]?.counts || {});
    if (zones.length === 0) return null;

    const getCounts = (frame: any) => {
      if (selectedZone === 'total') {
        return (Object.values(frame.counts) as number[]).reduce((a: number, b: number) => a + b, 0);
      }
      return frame.counts[selectedZone] || 0;
    };

    const maxCount = Math.max(...data.map(f => getCounts(f)), 1);
    const minCount = Math.min(...data.map(f => getCounts(f)));
    const yTicks = [minCount, Math.ceil((minCount + maxCount) / 2), maxCount];

    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <Activity size={24} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Total Occupancy</h3>
              <p className="text-sm font-medium text-gray-500">Crowd levels over time</p>
            </div>
          </div>
          {zones.length > 1 && (
            <div className="relative">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="appearance-none pl-11 pr-10 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer hover:bg-gray-100"
              >
                <option value="total">Total (All Zones)</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          )}
        </div>

        <div className="h-96 bg-slate-50/50 rounded-2xl p-6 relative overflow-hidden border border-slate-100">
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
            {/* Horizontal Grid lines */}
            {[0, 4, 8, 12, 16].map((tick) => {
              const y = 90 - (tick / 16) * 80;
              return (
                <g key={tick}>
                  <line x1="10" y1={y} x2="95" y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1,2" />
                  <text x="7" y={y + 1} fontSize="3.5" fill="#94a3b8" textAnchor="end" fontWeight="500">{tick}</text>
                </g>
              );
            })}

            {/* Area fill under line */}
            <defs>
              <linearGradient id="lineAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            <polygon
              points={`10,90 ${data.map((frame, idx) => {
                const count = getCounts(frame);
                const x = 10 + (idx / (data.length - 1)) * 85;
                const y = 90 - (count / 16) * 80;
                return `${x},${y}`;
              }).join(' ')} 95,90`}
              fill="url(#lineAreaGradient)"
            />

            {/* Line */}
            <polyline
              points={data.map((frame, idx) => {
                const count = getCounts(frame);
                const x = 10 + (idx / (data.length - 1)) * 85;
                const y = 90 - (count / 16) * 80;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#EF4444"
              strokeWidth="0.7"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="animate-line-draw"
            />

            {/* Peak Markers (Nodes) */}
            {data.map((frame, idx) => {
              const count = getCounts(frame);
              const x = 10 + (idx / (data.length - 1)) * 85;
              const y = 90 - (count / 16) * 80;

              const isPeak = (idx > 0 && idx < data.length - 1 &&
                getCounts(data[idx - 1]) < count &&
                getCounts(data[idx + 1]) < count);

              if (isPeak || idx === 0 || idx === data.length - 1 || idx % Math.floor(data.length / 5) === 0) {
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="1.2" fill="#EF4444" />
                    <circle cx={x} cy={y} r="0.6" fill="white" />
                  </g>
                );
              }
              return null;
            })}

            {/* X-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((p) => {
              const idx = Math.floor(p * (data.length - 1));
              const x = 10 + p * 85;
              const timeStr = data[idx]?.time ? `${data[idx].time.toFixed(1)}s` : '';
              return (
                <text key={p} x={x} y="97" fontSize="3.5" fill="#94a3b8" textAnchor="middle" fontWeight="600">{timeStr}</text>
              );
            })}
          </svg>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            Time (Seconds)
          </div>
        </div>
      </div>
    );

  };

  const renderMultiLineChart = () => {
    if (!selectedRecord?.frame_data || selectedRecord.frame_data.length === 0) return null;

    const data = selectedRecord.frame_data;
    const zones = Object.keys(data[0]?.counts || {});
    if (zones.length === 0) return null;
    const colors = ['#14B8A6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const displayZones = selectedZone3 === 'all' ? zones : [selectedZone3];
    const allCounts = data.flatMap(f => Object.values(f.counts)) as number[];
    const maxCount = Math.max(...allCounts, 1);
    const minCount = Math.min(...allCounts);
    const range = maxCount - minCount || 1;
    const yTicks = [minCount, Math.ceil((minCount + maxCount) / 2), maxCount];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">Zone-wise Population Over Time</h3>
              <p className="text-sm text-gray-500">Real-time crowd density analysis across active zones</p>
            </div>
          </div>
          {zones.length > 1 && (
            <select
              value={selectedZone3}
              onChange={(e) => setSelectedZone3(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white hover:border-teal-300 transition-colors shadow-sm"
            >
              <option value="all">🌐 All Zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>📍 {zone}</option>
              ))}
            </select>
          )}
        </div>
        <div className="h-96 bg-gradient-to-br from-white to-teal-50 p-6 rounded-xl border-2 border-teal-100 shadow-lg relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <svg viewBox="0 0 140 80" className="w-full h-full relative z-10">
            <defs>
              {displayZones.map((zone, zoneIdx) => {
                const colorIdx = zones.indexOf(zone);
                const color = colors[colorIdx % colors.length];
                return (
                  <linearGradient key={`grad-${zoneIdx}`} id={`areaGradient-multi-${zoneIdx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.03" />
                  </linearGradient>
                );
              })}
            </defs>
            {/* Grid */}
            {yTicks.map((tick, i) => {
              const y = 70 - ((tick - minCount) / range) * 60;
              return (
                <g key={i}>
                  <line x1="15" y1={y} x2="130" y2={y} stroke="#e5e7eb" strokeWidth="0.3" strokeDasharray="1,1" />
                  <text x="12" y={y + 1} fontSize="3.5" fill="#6b7280" textAnchor="end" fontWeight="600">{tick}</text>
                </g>
              );
            })}
            {/* Area fills under lines */}
            {displayZones.map((zone, zoneIdx) => {
              return (
                <polygon
                  key={`area-${zoneIdx}`}
                  points={`15,70 ${data.map((frame, idx) => {
                    const count = frame.counts[zone] || 0;
                    const x = 15 + (idx / (data.length - 1)) * 115;
                    const y = 70 - ((count - minCount) / range) * 60;
                    return `${x},${y}`;
                  }).join(' ')} 130,70`}
                  fill={`url(#areaGradient-multi-${zoneIdx})`}
                />
              );
            })}
            {/* Lines - All zones merged */}
            {displayZones.map((zone, zoneIdx) => {
              const colorIdx = zones.indexOf(zone);
              return (
                <polyline
                  key={zoneIdx}
                  points={data.map((frame, idx) => {
                    const count = frame.counts[zone] || 0;
                    const x = 15 + (idx / (data.length - 1)) * 115;
                    const y = 70 - ((count - minCount) / range) * 60;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={colors[colorIdx % colors.length]}
                  strokeWidth="0.8"
                  className="animate-line-draw"
                  style={{ animationDelay: `${zoneIdx * 0.3}s` }}
                />
              );
            })}
            {/* Animated markers */}
            {displayZones.map((zone, zoneIdx) => {
              const colorIdx = zones.indexOf(zone);
              const color = colors[colorIdx % colors.length];
              return data.map((frame, idx) => {
                const count = frame.counts[zone] || 0;
                const x = 15 + (idx / (data.length - 1)) * 115;
                const y = 70 - ((count - minCount) / range) * 60;
                return (
                  <g key={`${zoneIdx}-${idx}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="1.2"
                      fill={color}
                      className="animate-marker-pop"
                      style={{ animationDelay: `${zoneIdx * 0.3 + idx * 0.015}s` }}
                    />
                    <circle cx={x} cy={y} r="0.5" fill="white" />
                  </g>
                );
              });
            })}
            {/* X-axis time ticks */}
            {data.length > 0 && [0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75), data.length - 1].map((idx) => {
              const x = 15 + (idx / (data.length - 1)) * 115;
              const timeLabel = data[idx]?.time || 0;
              return (
                <g key={`tick-${idx}`}>
                  <line x1={x} y1="70" x2={x} y2="72" stroke="#374151" strokeWidth="0.3" />
                  <text x={x} y="76" fontSize="3.5" fill="#6b7280" textAnchor="middle" fontWeight="600">{timeLabel.toFixed(1)}s</text>
                </g>
              );
            })}
            {/* Axes */}
            <line x1="15" y1="70" x2="130" y2="70" stroke="#374151" strokeWidth="0.5" />
            <line x1="15" y1="10" x2="15" y2="70" stroke="#374151" strokeWidth="0.5" />
            <text x="72.5" y="79" fontSize="4" fill="#374151" textAnchor="middle" fontWeight="bold">Time (seconds)</text>
            <text x="5" y="40" fontSize="4" fill="#374151" textAnchor="middle" transform="rotate(-90 5 40)" fontWeight="bold">Count</text>
          </svg>
        </div>
        {/* Enhanced Legend */}
        <div className="flex flex-wrap gap-4 justify-center p-4 bg-gradient-to-r from-gray-50 to-slate-100 rounded-xl border-2 border-gray-200">
          {displayZones.map((zone) => {
            const idx = zones.indexOf(zone);
            const color = colors[idx % colors.length];
            return (
              <div key={zone} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="relative">
                  <div className="w-6 h-1 rounded-full" style={{ backgroundColor: color }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white" style={{ backgroundColor: color }}></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">{zone}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <nav className="bg-white/70 backdrop-blur-xl border-b border-gray-100 p-4 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200/50">
              <Archive className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Analytics Archive</h1>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Historical analysis & insights</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => router.push('/user')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
              >
                <ArrowLeft size={16} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => router.push('/user/zones')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
              >
                <Square size={16} />
                <span>Draw Zone</span>
              </button>
              <button
                onClick={() => router.push('/user/videos')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
              >
                <Upload size={16} />
                <span>Upload Video</span>
              </button>
              <button
                onClick={() => router.push('/user/analytics')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
              >
                <Zap size={16} />
                <span>Run Analysis</span>
              </button>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <button
                onClick={() => router.push('/user/account-settings')}
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Account Settings"
              >
                <Settings size={20} />
              </button>
              <div className="hidden lg:block">
                <button
                  onClick={() => router.push('/user/account-settings')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 transition-all active:scale-95"
                >
                  Account Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
            <p className="text-gray-600 mt-6 font-semibold text-lg flex items-center justify-center gap-2">
              <Database size={20} className="text-blue-600" />
              Loading analysis records...
            </p>
          </div>
        ) : (records.length === 0 && liveRecords.length === 0) ? (
          <Card className="p-16 text-center shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <Archive className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-600 text-xl font-semibold mb-2">No analysis records found</p>
            <p className="text-gray-500 text-sm mb-6">Start analyzing videos to see insights here</p>
            <Button onClick={() => router.push('/user/analytics')} className="flex items-center gap-2 mx-auto">
              <Activity size={18} />
              <span>Start Analysis</span>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Video Selector */}
            <Card className="p-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md">
                  <VideoIcon className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 tracking-tight">Select Video Analysis</h2>
                  <p className="text-sm text-gray-500">Choose from live sessions or historical records</p>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                  <Layers size={16} className="text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">{records.length + liveRecords.length} Total</span>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {/* Live sessions first */}
                {liveRecords.map((record) => {
                  const isActive = record.id < 0 && record.id > -1000000000000;
                  return (
                    <button
                      key={record.id}
                      onClick={() => loadRecordDetails(record)}
                      className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all duration-200 min-w-[220px] group ${selectedRecord?.id === record.id
                        ? isActive ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-500 shadow-lg' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 shadow-lg'
                        : isActive ? 'bg-white border-red-300 hover:border-red-400 hover:shadow-md' : 'bg-white border-green-300 hover:border-green-400 hover:shadow-md'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isActive ? (
                          <>
                            <div className="p-1.5 bg-red-500 rounded-full">
                              <Zap size={12} className="text-white" />
                            </div>
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Live</span>
                          </>
                        ) : (
                          <>
                            <div className="p-1.5 bg-green-500 rounded-full">
                              <Activity size={12} className="text-white" />
                            </div>
                            <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Session</span>
                          </>
                        )}
                      </div>
                      <p className="font-bold text-sm text-gray-800 truncate mb-2">
                        {record.video_filename || `Video ${record.video_id}`}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                        <Clock size={12} />
                        <span>{isActive ? 'Processing now...' : 'Completed'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-100 px-2 py-1 rounded-lg">
                        <Users size={12} className="text-blue-600" />
                        <span className="text-xs text-blue-700 font-semibold">{record.total_count} people</span>
                      </div>
                    </button>
                  )
                })}
                {/* DB records */}
                {records.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => loadRecordDetails(record)}
                    className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all duration-200 min-w-[220px] group ${selectedRecord?.id === record.id
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-full ${selectedRecord?.id === record.id
                        ? 'bg-blue-500'
                        : 'bg-gray-200 group-hover:bg-blue-200'
                        }`}>
                        <Database size={12} className={selectedRecord?.id === record.id ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'} />
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Archived</span>
                    </div>
                    <p className="font-bold text-sm text-gray-800 truncate mb-2">
                      {record.video_filename || `Video ${record.video_id}`}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                      <Calendar size={12} />
                      <span>{new Date(record.processed_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-100 px-2 py-1 rounded-lg">
                      <Users size={12} className="text-blue-600" />
                      <span className="text-xs text-blue-700 font-semibold">{record.total_count} people</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {selectedRecord ? (
              <>
                {/* Live Video Picture-in-Picture (Draggable) */}
                {selectedRecord.id < 0 && liveFrame && (
                  <motion.div
                    drag
                    dragConstraints={{ left: -1000, right: 0, top: -1000, bottom: 0 }}
                    dragElastic={0.1}
                    className="fixed bottom-6 right-6 z-50 w-80 shadow-2xl rounded-xl overflow-hidden border-4 border-red-500 cursor-move active:scale-105 active:shadow-red-200/50 transition-transform"
                  >
                    <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 pointer-events-none">
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                        <Zap size={14} />
                        <span className="text-xs font-bold uppercase tracking-wide">Live Processing (Drag me)</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLiveFrame('');
                          setIsPipClosed(true);
                        }}
                        className="text-white hover:text-gray-200 transition-colors p-1"
                      >
                        ✕
                      </button>
                    </div>
                    <img src={`data:image/jpeg;base64,${liveFrame}`} alt="Live" className="w-full pointer-events-none select-none" />
                  </motion.div>
                )}

                {/* Live/Session Indicator */}
                {selectedRecord.id < 0 && selectedRecord.id > -1000000000000 && (
                  <Card className="p-5 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-500 shadow-lg">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2 bg-red-500 rounded-full">
                        <Zap className="text-white animate-pulse" size={20} />
                      </div>
                      <span className="text-red-600 font-bold text-lg tracking-tight">LIVE ANALYSIS - Graphs updating in real-time</span>
                      <div className="p-2 bg-red-500 rounded-full">
                        <Activity className="text-white animate-pulse" size={20} />
                      </div>
                    </div>
                  </Card>
                )}
                {selectedRecord.id < 0 && selectedRecord.id <= -1000000000000 && (
                  <Card className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 shadow-lg">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2 bg-green-500 rounded-full">
                        <Activity className="text-white" size={20} />
                      </div>
                      <span className="text-green-600 font-bold text-lg tracking-tight">SESSION DATA - Available until page refresh</span>
                      <div className="p-2 bg-green-500 rounded-full">
                        <Database className="text-white" size={20} />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Insights Summary */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 tracking-tight">Key Insights</h3>
                  </div>
                  {selectedRecord.frame_data && <InsightsSummary zoneData={selectedRecord.zone_counts} frameData={selectedRecord.frame_data} totalCount={selectedRecord.total_count} />}
                </Card>

                {/* Top Row - Bar Chart and Line Chart */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    {renderBarChart()}
                  </Card>
                  <Card className="p-6">
                    {renderLineChart()}
                  </Card>
                </div>

                {/* Bottom Row - Multi-Line Chart */}
                <Card className="p-6">
                  {renderMultiLineChart()}
                </Card>

                {/* New Charts Row 1 */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    {selectedRecord.frame_data && <PeakHourChart frameData={selectedRecord.frame_data} />}
                  </Card>
                  <Card className="p-6">
                    <ZoneComparisonChart zoneData={selectedRecord.zone_counts} />
                  </Card>
                </div>

                {/* New Charts Row 2 */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <DensityHeatmap zoneData={selectedRecord.zone_counts} />
                  </Card>
                  <Card className="p-6">
                    {selectedRecord.frame_data && <AvgVsPeakChart zoneData={selectedRecord.zone_counts} frameData={selectedRecord.frame_data} />}
                  </Card>
                </div>

                {/* New Charts Row 3 */}
                <Card className="p-6">
                  {selectedRecord.frame_data && <TrendAnalysisChart frameData={selectedRecord.frame_data} />}
                </Card>

                {/* Summary Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                        <Users size={24} className="text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Maximum</p>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">{selectedRecord.total_count}</p>
                    <p className="text-xs text-gray-500 mt-2">Peak crowd count</p>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                        <Layers size={24} className="text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Zones Analyzed</p>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">{selectedRecord.zone_counts.length}</p>
                    <p className="text-xs text-gray-500 mt-2">Detection zones</p>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                        <Calendar size={24} className="text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Processed On</p>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {new Date(selectedRecord.processed_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Analysis timestamp</p>
                  </Card>
                </div>
              </>
            ) : (
              <Card className="p-16 text-center shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-600 text-xl font-semibold mb-2">Select a video to view charts</p>
                <p className="text-gray-500 text-sm">Choose an analysis from the list above to see detailed insights</p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
