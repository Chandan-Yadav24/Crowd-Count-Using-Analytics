import { useState, useRef, useEffect } from 'react';
import { Play, Square, AlertTriangle } from 'lucide-react';
import Button from './ui/Button';
import { streamingService } from '@/lib/streamingService';

interface ZoneCount {
  [key: string]: number;
}

interface StreamData {
  frame?: string;
  counts?: ZoneCount;
  progress?: number;
  frame_number?: number;
  total_frames?: number;
  complete?: boolean;
  total_count?: number;
  zone_counts?: Array<{ zone_id: number; zone_label: string; count: number }>;
  output_video_path?: string;
  frame_data_path?: string;
  error?: string;
}

interface Props {
  videoId: number;
  username: string;
  zones: Array<{ id: number; label: string; coordinates: number[][] }>;
  onComplete?: (result: any) => void;
  onStreamingChange?: (isStreaming: boolean) => void;
  showHeatmap?: boolean;
  alertsEnabled?: boolean;
  totalThreshold?: number;
  zoneThresholds?: { [key: string]: number };
}

export default function RealTimeAnalysis({
  videoId,
  username,
  zones,
  onComplete,
  onStreamingChange,
  showHeatmap = false,
  alertsEnabled = false,
  totalThreshold = 10,
  zoneThresholds = {}
}: Props) {
  const [streaming, setStreaming] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string>('');
  const [liveCounts, setLiveCounts] = useState<ZoneCount>({});
  const [progress, setProgress] = useState(0);
  const [frameInfo, setFrameInfo] = useState({ current: 0, total: 0 });
  const [maxCounts, setMaxCounts] = useState<ZoneCount>({});
  const [lastFrame, setLastFrame] = useState<string>('');
  const [alerts, setAlerts] = useState<string[]>([]);
  const [accumulatedFrameData, setAccumulatedFrameData] = useState<Array<{ time: number; counts: ZoneCount }>>([]);
  const [videoFilename, setVideoFilename] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVideoName = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/video/preview/${videoId}`);
        if (res.ok) {
          setVideoFilename(`Video ${videoId}`);
        }
      } catch (err) {
        setVideoFilename(`Video ${videoId}`);
      }
    };
    fetchVideoName();

    // Check if stream is already running
    const key = `live_stream_${videoId}`;
    const data = localStorage.getItem(key);
    if (data) {
      const liveData = JSON.parse(data);
      if (Date.now() - liveData.timestamp < 5000) {
        setStreaming(true);
        if (onStreamingChange) onStreamingChange(true);
      }
    }
  }, [videoId, onStreamingChange]);

  // Update localStorage whenever streaming data changes
  useEffect(() => {
    if (streaming) {
      const liveData = {
        videoId,
        video_filename: videoFilename,
        username,
        status: 'active',
        progress,
        liveCounts,
        maxCounts,
        currentFrame: currentFrame || lastFrame,
        frame_data: accumulatedFrameData,
        zone_counts: Object.entries(maxCounts).map(([label, count]) => ({
          zone_id: zones.find(z => z.label === label)?.id || 0,
          zone_label: label,
          count
        })),
        total_count: Object.values(maxCounts).reduce((sum, count) => sum + count, 0),
        timestamp: Date.now()
      };
      localStorage.setItem(`live_stream_${videoId}`, JSON.stringify(liveData));
    }
  }, [streaming, progress, liveCounts, maxCounts, accumulatedFrameData, currentFrame, lastFrame, videoId, videoFilename, username, zones]);

  // Check thresholds whenever live counts change
  useEffect(() => {
    if (!alertsEnabled) {
      setAlerts([]);
      return;
    }

    const newAlerts: string[] = [];
    const totalCount = Object.values(liveCounts).reduce((sum, count) => sum + count, 0);

    if (totalCount > totalThreshold) {
      newAlerts.push(`Total count (${totalCount}) exceeded threshold (${totalThreshold})`);
    }

    Object.entries(liveCounts).forEach(([zone, count]) => {
      const threshold = zoneThresholds[zone];
      if (threshold && count > threshold) {
        newAlerts.push(`${zone} count (${count}) exceeded threshold (${threshold})`);
      }
    });

    setAlerts(newAlerts);
  }, [liveCounts, alertsEnabled, totalThreshold, zoneThresholds]);

  const getHeatmapColor = (count: number, maxCount: number) => {
    if (maxCount === 0) return 'rgba(0, 255, 0, 0.3)';
    const intensity = count / maxCount;
    if (intensity < 0.3) return `rgba(0, 255, 0, ${0.3 + intensity * 0.3})`;
    if (intensity < 0.6) return `rgba(255, 255, 0, ${0.3 + intensity * 0.3})`;
    return `rgba(255, 0, 0, ${0.3 + intensity * 0.4})`;
  };

  const startStreaming = async () => {
    if (zones.length === 0) {
      alert('No zones defined for this video');
      return;
    }

    if (streamingService.isStreaming(videoId)) {
      setStreaming(true);
      if (onStreamingChange) onStreamingChange(true);
      return;
    }

    setStreaming(true);
    setProgress(0);
    setLiveCounts({});
    setMaxCounts({});
    setCurrentFrame('');
    setLastFrame('');
    setAccumulatedFrameData([]);
    if (onStreamingChange) onStreamingChange(true);

    streamingService.startStream(videoId, username, zones);

    const pollInterval = setInterval(() => {
      const key = `live_stream_${videoId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const liveData = JSON.parse(data);
        if (Date.now() - liveData.timestamp < 5000) {
          setCurrentFrame(liveData.currentFrame || '');
          setLastFrame(liveData.currentFrame || lastFrame);
          setLiveCounts(liveData.liveCounts || {});
          setMaxCounts(liveData.maxCounts || {});
          setProgress(liveData.progress || 0);
          setAccumulatedFrameData(liveData.frame_data || []);
        } else {
          setStreaming(false);
          clearInterval(pollInterval);
          if (onStreamingChange) onStreamingChange(false);
        }
      } else {
        const sessionKey = `session_analysis_${videoId}`;
        const sessionData = localStorage.getItem(sessionKey);
        if (sessionData) {
          const completed = JSON.parse(sessionData);
          if (onComplete) {
            onComplete(completed);
          }
        }
        setStreaming(false);
        clearInterval(pollInterval);
        if (onStreamingChange) onStreamingChange(false);
      }
    }, 300);
  };

  const stopStreaming = () => {
    streamingService.stopStream(videoId);
    setStreaming(false);
    if (onStreamingChange) onStreamingChange(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {!streaming ? (
          <Button onClick={startStreaming} className="flex items-center gap-2" fullWidth>
            <Play size={20} />
            Start Real-Time Analysis
          </Button>
        ) : (
          <Button onClick={stopStreaming} variant="secondary" className="flex items-center gap-2" fullWidth>
            <Square size={20} />
            Stop
          </Button>
        )}
      </div>

      {streaming && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
            <div className="flex justify-between text-sm text-indigo-700 mb-2">
              <span className="font-semibold">🎬 Analyzing Video...</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-indigo-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-indigo-600 mt-2 text-center">Processing in background - Navigate freely!</p>
          </div>

          {(currentFrame || lastFrame) && (
            <div ref={containerRef} className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
              <img
                src={`data:image/jpeg;base64,${currentFrame || lastFrame}`}
                alt="Live Analysis"
                className="w-full h-auto"
              />
              {!streaming && lastFrame && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg">
                  ✓ Analysis Complete
                </div>
              )}

              <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg space-y-1.5 min-w-[140px]">
                <h4 className="font-bold text-xs uppercase tracking-wide mb-2 border-b border-white/30 pb-1">
                  Live Count
                </h4>
                {Object.entries(liveCounts).map(([zone, count]) => {
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

              <div className="absolute top-4 left-4 bg-blue-600/90 text-white p-3 rounded-lg space-y-1.5 min-w-[140px]">
                <h4 className="font-bold text-xs uppercase tracking-wide mb-2 border-b border-white/30 pb-1">
                  Max Count
                </h4>
                {Object.entries(maxCounts).map(([zone, count]) => (
                  <div key={zone} className="flex justify-between items-center gap-3">
                    <span className="text-sm">{zone}</span>
                    <span className="font-bold text-lg">{count}</span>
                  </div>
                ))}
              </div>

              {alerts.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-600/90 text-white p-3 rounded-lg space-y-1 animate-pulse z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} />
                    <h4 className="font-bold text-sm">THRESHOLD EXCEEDED</h4>
                  </div>
                  {alerts.map((alert, idx) => (
                    <p key={idx} className="text-xs">{alert}</p>
                  ))}
                </div>
              )}

              {showHeatmap && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {zones.map((zone) => {
                    const count = liveCounts[zone.label] || 0;
                    const maxCount = Math.max(...Object.values(liveCounts), 1); // Avoid div by zero
                    const color = getHeatmapColor(count, maxCount);
                    return (
                      <g key={zone.id}>
                        <polygon
                          points={zone.coordinates.map(([x, y]) => {
                            const container = containerRef.current;
                            if (!container) return '0,0';
                            const rect = container.getBoundingClientRect();
                            const px = (x / 640) * rect.width;
                            const py = (y / 360) * rect.height;
                            return `${px},${py}`;
                          }).join(' ')}
                          fill={color}
                          stroke={count > (zoneThresholds[zone.label] || 5) ? '#FF0000' : 'rgba(255,255,255,0.5)'}
                          strokeWidth="2"
                        />
                        <text
                          x={(zone.coordinates[0][0] / 640) * (containerRef.current?.getBoundingClientRect().width || 640)}
                          y={(zone.coordinates[0][1] / 360) * (containerRef.current?.getBoundingClientRect().height || 360) + 20}
                          fill="#FFFFFF"
                          fontSize="14"
                          fontWeight="bold"
                          stroke="#000000"
                          strokeWidth="0.5"
                        >
                          {zone.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
