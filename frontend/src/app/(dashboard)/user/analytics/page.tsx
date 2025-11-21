'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { Video, Zone } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ZoneCount {
  zone_id: number;
  zone_label: string;
  count: number;
}

interface AnalysisResult {
  video_id: number;
  status: string;
  total_count: number;
  zone_counts: ZoneCount[];
  output_video: string;
  processed_at: string;
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
  const videoContainerRef = useRef<HTMLDivElement>(null);
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

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setZones([]);
    setResult(null);
    setProcessing(false);
    loadZones(video.id);
  };

  const handleStartAnalysis = async () => {
    if (!selectedVideo) return;
    
    setProcessing(true);
    setResult(null);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Crowd Analysis</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/user/videos')}>
              Upload Video
            </Button>
            <Button onClick={() => router.push('/user/zones')} variant="secondary">
              Draw Zones
            </Button>
            <Button onClick={() => router.push('/user')} variant="secondary">
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Video</h2>
            {videos.length === 0 ? (
              <p className="text-gray-600">No videos available</p>
            ) : (
              <div className="space-y-2">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className={`w-full text-left p-3 rounded-lg border ${
                      selectedVideo?.id === video.id
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-semibold text-gray-800 truncate">{video.filename}</p>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis</h2>
            {!selectedVideo ? (
              <p className="text-gray-600">Select a video to start analysis</p>
            ) : (
              <div className="space-y-4">
                <div 
                  ref={videoContainerRef}
                  className="relative border-2 border-gray-300 rounded-lg overflow-hidden"
                  style={{ aspectRatio: '16/9' }}
                >
                  <video
                    key={result ? result.output_video : selectedVideo.id}
                    src={result ? `http://127.0.0.1:8000${result.output_video}` : `http://127.0.0.1:8000/api/video/preview/${selectedVideo.id}`}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    loop
                    muted
                  >
                    Your browser does not support video playback.
                  </video>
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

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {result ? 'Processed Video with Detections' : `Video: ${selectedVideo.filename}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {result ? `Analysis completed at ${new Date(result.processed_at).toLocaleString()}` : `Zones detected: ${zones.length}`}
                  </p>
                </div>

                {zones.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-yellow-800">No zones defined for this video. Please draw zones first.</p>
                    <Button onClick={() => router.push('/user/zones')} className="mt-2">
                      Go to Zone Drawing
                    </Button>
                  </div>
                ) : (
                  <>
                    {!result && (
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
                          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-indigo-800 font-semibold">YOLO Processing Video...</p>
                            </div>
                            <div className="mb-3">
                              <div className="flex justify-between text-sm text-indigo-700 mb-1">
                                <span>Progress</span>
                                <span className="font-bold">{progress}%</span>
                              </div>
                              <div className="w-full bg-indigo-200 rounded-full h-3 overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-indigo-600">{Math.floor(processingTime / 60)}:{(processingTime % 60).toString().padStart(2, '0')}</p>
                              <p className="text-sm text-indigo-600 mt-1">Elapsed Time</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {result && (
                      <div className="space-y-4">

                        <Card className="p-4 bg-blue-50">
                          <div className="flex items-center gap-3">
                            <Users size={32} className="text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-600">Total People Count</p>
                              <p className="text-3xl font-bold text-gray-800">{result.total_count}</p>
                            </div>
                          </div>
                        </Card>

                        <div>
                          <h3 className="font-bold text-gray-800 mb-3">Zone-wise Count</h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {result.zone_counts.map((zc) => (
                              <Card key={zc.zone_id} className="p-4">
                                <p className="text-sm text-gray-600 mb-1">{zc.zone_label}</p>
                                <p className="text-2xl font-bold text-gray-800">{zc.count} people</p>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <Button onClick={() => setResult(null)} variant="secondary" fullWidth>
                          Run New Analysis
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
