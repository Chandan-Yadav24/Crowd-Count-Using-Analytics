'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Users,
  Settings,
  AlertTriangle,
  X,
  Flame,
  Trash2,
  Square,
  Video as VideoIcon,
  Check,
  BarChart,
  Upload,
  Map,
  LayoutDashboard,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Bell,
  BellOff
} from 'lucide-react';
import { api } from '@/lib/api';
import { Video, Zone } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import RealTimeAnalysis from '@/components/RealTimeAnalysis';

interface ZoneCount {
  zone_id: number;
  zone_label: string;
  count: number;
}

interface AnalysisResult {
  id?: number;
  video_id: number;
  status: string;
  total_count: number;
  zone_counts: ZoneCount[];
  output_video: string;
  processed_at: string;
  frame_data_path?: string;
}

interface FrameData {
  time: number;
  counts: { [key: string]: number };
}

export default function Analytics() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [frameData, setFrameData] = useState<FrameData[]>([]);
  const [currentCounts, setCurrentCounts] = useState<{ [key: string]: number }>({});
  const [showSettings, setShowSettings] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [totalThreshold, setTotalThreshold] = useState<number>(10);
  const [zoneThresholds, setZoneThresholds] = useState<{ [key: string]: number }>({});
  const [alerts, setAlerts] = useState<string[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('username');
    if (!token) {
      router.push('/login');
      return;
    }
    setUsername(user || '');
    loadVideos(user || '');
  }, [router]);

  const loadVideos = async (user: string) => {
    try {
      const data = await api.listVideos(user);
      setVideos(data);
    } catch (err) {
      console.error('Failed to load videos');
    }
  };

  const loadZones = async (videoId: number) => {
    try {
      const data = await api.listZones(videoId);
      setZones(data);
    } catch (err) {
      console.error('Failed to load zones');
    }
  };

  const loadExistingResult = async (videoId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analysis/results/${videoId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setResult(data);
          if (data.frame_data_path) {
            loadFrameData(videoId);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load existing result');
    }
  };

  const loadFrameData = async (videoId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analysis/frame-data/${videoId}`);
      if (res.ok) {
        const data = await res.json();
        setFrameData(data);
        if (data.length > 0) {
          const zones = Object.keys(data[0].counts);
          const defaultThresholds: { [key: string]: number } = {};
          zones.forEach(zone => {
            defaultThresholds[zone] = 5;
          });
          setZoneThresholds(defaultThresholds);
          loadZonesForHeatmap(videoId);
        }
      }
    } catch (err) {
      console.error('Failed to load frame data');
    }
  };

  const loadZonesForHeatmap = async (videoId: number) => {
    try {
      const data = await api.listZones(videoId);
      setZones(data);
    } catch (err) {
      console.error('Failed to load zones for heatmap');
    }
  };

  const getHeatmapColor = (count: number, maxCount: number) => {
    if (maxCount === 0) return 'rgba(0, 255, 0, 0.3)';
    const intensity = count / maxCount;
    if (intensity < 0.3) return `rgba(0, 255, 0, ${0.3 + intensity * 0.3})`;
    if (intensity < 0.6) return `rgba(255, 255, 0, ${0.3 + intensity * 0.3})`;
    return `rgba(255, 0, 0, ${0.3 + intensity * 0.4})`;
  };

  const updateLiveCounts = () => {
    if (!videoRef.current || frameData.length === 0) return;
    const currentTime = videoRef.current.currentTime;
    const frame = frameData.reduce((prev, curr) => {
      return Math.abs(curr.time - currentTime) < Math.abs(prev.time - currentTime) ? curr : prev;
    });
    if (frame && Math.abs(frame.time - currentTime) < 0.5) {
      setCurrentCounts(frame.counts);
      checkThresholds(frame.counts);
    }
  };

  const checkThresholds = (counts: { [key: string]: number }) => {
    if (!alertsEnabled) {
      setAlerts([]);
      return;
    }

    const newAlerts: string[] = [];
    const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (totalCount > totalThreshold) {
      newAlerts.push(`Total count (${totalCount}) exceeded threshold (${totalThreshold})`);
    }

    Object.entries(counts).forEach(([zone, count]) => {
      const threshold = zoneThresholds[zone];
      if (threshold && count > threshold) {
        newAlerts.push(`${zone} count (${count}) exceeded threshold (${threshold})`);
      }
    });

    setAlerts(newAlerts);
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setZones([]);
    setResult(null);
    setProcessing(false);
    setFrameData([]);
    setCurrentCounts({});
    setAlerts([]);
    setShowHeatmap(false);
    loadZones(video.id);
    loadExistingResult(video.id);
  };

  const handleDeleteAnalysis = async () => {
    if (!result?.id) return;

    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analysis/results/${result.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setResult(null);
        setFrameData([]);
        setCurrentCounts({});
        setAlerts([]);
        setShowHeatmap(false);
        alert('Analysis deleted successfully');
      }
    } catch (err) {
      console.error('Failed to delete analysis');
      alert('Failed to delete analysis');
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedVideo) return;

    setProcessing(true);
    setResult(null);
    setFrameData([]);
    setCurrentCounts({});
    setAlerts([]);
    setShowHeatmap(false);
    setProcessingTime(0);
    setProgress(0);

    timerRef.current = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);

    progressRef.current = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/analysis/progress/${selectedVideo.id}`);
        const data = await res.json();
        setProgress(data.percentage || 0);
      } catch (err) {
        console.error('Failed to fetch progress');
      }
    }, 500);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/analysis/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: selectedVideo.id,
          username: username
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      if (data.frame_data_path) {
        loadFrameData(selectedVideo.id);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      alert(err.message || 'Analysis failed. Please try again.');
      setResult(null);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-5 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Crowd Analysis</h1>
              <p className="text-sm text-gray-500 font-medium">Real-time and standard video analysis</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => router.push('/user/videos')} className="flex items-center gap-2">
              <Upload size={18} />
              <span>Upload</span>
            </Button>
            <Button onClick={() => router.push('/user/zones')} variant="secondary" className="flex items-center gap-2">
              <Map size={18} />
              <span>Zones</span>
            </Button>
            <Button onClick={() => router.push('/user/analytics-archive')} variant="secondary" className="flex items-center gap-2">
              <Clock size={18} />
              <span>Archive</span>
            </Button>
            <Button onClick={() => router.push('/user')} variant="secondary" className="flex items-center gap-2">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Button>
            {(result || isRealTimeMode) && (
              <>
                <Button onClick={() => setShowSettings(true)} variant="secondary" className="flex items-center gap-2">
                  {alertsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                  <span>Alerts</span>
                </Button>
                <Button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  variant={showHeatmap ? "primary" : "secondary"}
                  className="flex items-center gap-2"
                >
                  <Flame size={18} />
                  <span>{showHeatmap ? 'Hide' : 'Show'} Heatmap</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                <VideoIcon className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">Select Video</h2>
            </div>
            {videos.length === 0 ? (
              <div className="text-center py-8">
                <VideoIcon className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium">No videos available</p>
                <p className="text-sm text-gray-400 mt-1">Upload a video to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group ${selectedVideo?.id === video.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 shadow-md'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 shadow-sm">
                      <video
                        src={`http://127.0.0.1:8000/api/video/preview/${video.id}`}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="text-white" size={20} />
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate text-sm">{video.filename}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-500">Duration: --:--</p>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {selectedVideo?.id === video.id && (
                      <div className="flex-shrink-0">
                        <Check className="text-blue-500" size={20} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="lg:col-span-2 p-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md">
                  <BarChart className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">Analysis</h2>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm">
                <button
                  onClick={() => setIsRealTimeMode(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${isRealTimeMode
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <Zap size={16} />
                  <span>Real-time</span>
                </button>
                <button
                  onClick={() => setIsRealTimeMode(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${!isRealTimeMode
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <Play size={16} />
                  <span>Standard</span>
                </button>
              </div>
            </div>
            {!selectedVideo ? (
              <div className="text-center py-16">
                <Activity className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 font-semibold text-lg">Select a video to start analysis</p>
                <p className="text-sm text-gray-400 mt-2">Choose a video from the list to begin crowd counting</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  ref={videoContainerRef}
                  className={`relative border-2 border-gray-300 rounded-lg overflow-hidden ${processing ? 'hidden' : ''}`}
                  style={{ aspectRatio: '16/9' }}
                >
                  <video
                    ref={videoRef}
                    key={result ? result.output_video : selectedVideo.id}
                    src={result ? `http://127.0.0.1:8000${result.output_video}` : `http://127.0.0.1:8000/api/video/preview/${selectedVideo.id}`}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    loop
                    muted
                    onTimeUpdate={updateLiveCounts}
                  >
                    Your browser does not support video playback.
                  </video>
                  {result && frameData.length > 0 && Object.keys(currentCounts).length > 0 && (
                    <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg space-y-1.5 min-w-[140px]">
                      <h4 className="font-bold text-xs uppercase tracking-wide mb-2 border-b border-white/30 pb-1">Live Count</h4>
                      {Object.entries(currentCounts).map(([zone, count]) => {
                        const threshold = zoneThresholds[zone];
                        const exceeded = threshold && count > threshold;
                        return (
                          <div key={zone} className="flex justify-between items-center gap-3">
                            <span className="text-sm">{zone}</span>
                            <span className={`font-bold text-lg ${exceeded ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {alerts.length > 0 && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white p-3 rounded-lg space-y-1 animate-pulse">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={20} />
                        <h4 className="font-bold text-sm">THRESHOLD EXCEEDED</h4>
                      </div>
                      {alerts.map((alert, idx) => (
                        <p key={idx} className="text-xs">{alert}</p>
                      ))}
                    </div>
                  )}
                  {showHeatmap && result && zones.length > 0 && Object.keys(currentCounts).length > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {zones.map((zone) => {
                        const count = currentCounts[zone.label] || 0;
                        const maxCount = Math.max(...Object.values(currentCounts));
                        const color = getHeatmapColor(count, maxCount);
                        return (
                          <g key={zone.id}>
                            <polygon
                              points={zone.coordinates.map(([x, y]) => {
                                const container = videoContainerRef.current;
                                if (!container) return '0,0';
                                const rect = container.getBoundingClientRect();
                                const px = (x / 640) * rect.width;
                                const py = (y / 360) * rect.height;
                                return `${px},${py}`;
                              }).join(' ')}
                              fill={color}
                              stroke={count > (zoneThresholds[zone.label] || 5) ? '#FF0000' : '#FFFFFF'}
                              strokeWidth="3"
                            />
                            <text
                              x={(zone.coordinates[0][0] / 640) * (videoContainerRef.current?.getBoundingClientRect().width || 640)}
                              y={(zone.coordinates[0][1] / 360) * (videoContainerRef.current?.getBoundingClientRect().height || 360) + 20}
                              fill="#FFFFFF"
                              fontSize="18"
                              fontWeight="bold"
                              stroke="#000000"
                              strokeWidth="1"
                            >
                              {zone.label}: {count}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                  {!result && zones.length > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {zones.map((zone) => (
                        <g key={zone.id}>
                          <polygon
                            points={zone.coordinates.map(([x, y]) => {
                              const container = videoContainerRef.current;
                              if (!container) return '0,0';
                              const rect = container.getBoundingClientRect();
                              const px = (x / 640) * rect.width;
                              const py = (y / 360) * rect.height;
                              return `${px},${py}`;
                            }).join(' ')}
                            fill="rgba(16, 185, 129, 0.3)"
                            stroke="#10B981"
                            strokeWidth="2"
                          />
                          <text
                            x={(zone.coordinates[0][0] / 640) * (videoContainerRef.current?.getBoundingClientRect().width || 640)}
                            y={(zone.coordinates[0][1] / 360) * (videoContainerRef.current?.getBoundingClientRect().height || 360) - 10}
                            fill="#10B981"
                            fontSize="16"
                            fontWeight="bold"
                          >
                            {zone.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  )}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <VideoIcon className="text-blue-600" size={20} />
                    <h3 className="font-bold text-gray-800 text-lg">
                      {result ? 'Processed Video with Detections' : selectedVideo.filename}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-gray-500" />
                    <p>
                      {result ? `Completed: ${new Date(result.processed_at).toLocaleString()}` : `Zones: ${zones.length}`}
                    </p>
                  </div>
                  {showHeatmap && result && (
                    <div className="mt-4 flex items-center gap-4 text-xs bg-white p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Flame size={16} className="text-orange-500" />
                        <span className="font-semibold text-gray-700">Heatmap Legend:</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-green-500 rounded-md shadow-sm"></div>
                        <span className="font-medium">Low</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-yellow-500 rounded-md shadow-sm"></div>
                        <span className="font-medium">Medium</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-red-500 rounded-md shadow-sm"></div>
                        <span className="font-medium">High</span>
                      </div>
                    </div>
                  )}
                </div>

                {zones.length === 0 ? (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-400 rounded-lg">
                        <AlertTriangle className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-yellow-900 font-semibold mb-2">No zones defined for this video</p>
                        <p className="text-yellow-700 text-sm mb-3">Please draw detection zones before starting analysis</p>
                        <Button onClick={() => router.push('/user/zones')} className="flex items-center gap-2">
                          <Map size={18} />
                          <span>Go to Zone Drawing</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {!result && (
                      <>
                        {!result && (
                          <>
                            {isRealTimeMode ? (
                              <RealTimeAnalysis
                                videoId={selectedVideo.id}
                                username={username}
                                zones={zones}
                                onComplete={(data) => {
                                  setResult(data);
                                  if (data.frame_data_path) {
                                    loadFrameData(selectedVideo.id);
                                  }
                                }}
                                onStreamingChange={setProcessing}
                                showHeatmap={showHeatmap}
                                alertsEnabled={alertsEnabled}
                                totalThreshold={totalThreshold}
                                zoneThresholds={zoneThresholds}
                              />
                            ) : (
                              <>
                                <Button
                                  onClick={handleStartAnalysis}
                                  disabled={processing}
                                  className="flex items-center gap-2"
                                  fullWidth
                                >
                                  <Play size={20} />
                                  {processing ? 'Processing...' : 'Start Analysis'}
                                </Button>
                                {processing && (
                                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 p-6 rounded-xl shadow-lg">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                      <div className="w-5 h-5 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                      <p className="text-indigo-900 font-bold text-lg flex items-center gap-2">
                                        <Activity size={20} className="text-indigo-600" />
                                        YOLO Processing Video...
                                      </p>
                                    </div>
                                    <div className="mb-4">
                                      <div className="flex justify-between text-sm text-indigo-700 mb-2">
                                        <span className="font-semibold">Progress</span>
                                        <span className="font-bold text-lg">{progress}%</span>
                                      </div>
                                      <div className="w-full bg-indigo-200 rounded-full h-4 overflow-hidden shadow-inner">
                                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                      </div>
                                    </div>
                                    <div className="text-center bg-white p-4 rounded-lg border border-indigo-200">
                                      <div className="flex items-center justify-center gap-2 mb-1">
                                        <Clock size={20} className="text-indigo-600" />
                                        <p className="text-3xl font-bold text-indigo-600">{Math.floor(processingTime / 60)}:{(processingTime % 60).toString().padStart(2, '0')}</p>
                                      </div>
                                      <p className="text-sm text-indigo-600 font-medium">Elapsed Time</p>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {result && (
                      <div className="space-y-5">

                        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                              <Users size={36} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Maximum Count</p>
                              <p className="text-xs text-gray-500 mt-0.5">Sum of maximum counts across all zones</p>
                              <div className="flex items-baseline gap-2 mt-2">
                                <p className="text-4xl font-bold text-gray-800">{result.total_count}</p>
                                <TrendingUp className="text-green-500" size={24} />
                              </div>
                            </div>
                          </div>
                        </Card>

                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Map className="text-gray-600" size={20} />
                            <h3 className="font-bold text-gray-800 text-lg tracking-tight">Zone-wise Maximum Count</h3>
                          </div>
                          <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                            <Activity size={14} />
                            Maximum number of people detected in each zone throughout the video
                          </p>
                          <div className="grid md:grid-cols-2 gap-4">
                            {result.zone_counts.map((zc) => (
                              <Card key={zc.zone_id} className="p-5 bg-white border-2 border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-sm">
                                    <Users size={16} className="text-white" />
                                  </div>
                                  <p className="text-sm font-semibold text-gray-600">{zc.zone_label}</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{zc.count} <span className="text-lg text-gray-500 font-normal">people</span></p>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => {
                              setResult(null);
                              handleStartAnalysis();
                            }}
                            variant="secondary"
                            className="flex-1 flex items-center justify-center gap-2"
                          >
                            <Play size={18} />
                            <span>Run New Analysis</span>
                          </Button>
                          <Button
                            onClick={handleDeleteAnalysis}
                            variant="secondary"
                            className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 font-semibold"
                          >
                            <Trash2 size={18} />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <Settings className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Alert Threshold Settings</h3>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700 p-1 hover:bg-white rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  {alertsEnabled ? <Bell className="text-blue-600" size={20} /> : <BellOff className="text-gray-400" size={20} />}
                  <div>
                    <label className="block text-sm font-bold text-gray-900">Enable Alerts</label>
                    <p className="text-xs text-gray-500">Turn on to receive threshold alerts</p>
                  </div>
                </div>
                <button
                  onClick={() => setAlertsEnabled(!alertsEnabled)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shadow-inner ${alertsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${alertsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className={alertsEnabled ? '' : 'opacity-50 pointer-events-none'}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Count Threshold
                </label>
                <input
                  type="number"
                  value={totalThreshold}
                  onChange={(e) => setTotalThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when total count across all zones exceeds this value</p>
              </div>

              <div className={`border-t pt-4 ${alertsEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Zone Thresholds</h4>
                <div className="space-y-3">
                  {Object.keys(zoneThresholds).map((zone) => (
                    <div key={zone}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {zone}
                      </label>
                      <input
                        type="number"
                        value={zoneThresholds[zone]}
                        onChange={(e) => setZoneThresholds({
                          ...zoneThresholds,
                          [zone]: Number(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-2xl">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
