'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Video, Zone } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function ZoneManagement() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<number[] | null>(null);
  const [currentRect, setCurrentRect] = useState<number[] | null>(null);
  const [zoneName, setZoneName] = useState('');
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editingCoordinates, setEditingCoordinates] = useState(false);

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
    setStartPoint(null);
    setCurrentRect(null);
    setDrawing(false);
    loadZones(video.id);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawing || !videoContainerRef.current) return;
    
    const rect = videoContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const normalizedX = Math.round((x / rect.width) * 640);
    const normalizedY = Math.round((y / rect.height) * 360);
    
    setStartPoint([normalizedX, normalizedY]);
    setCurrentRect([normalizedX, normalizedY, 0, 0]);
    setIsMouseDown(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawing || !isMouseDown || !startPoint || !videoContainerRef.current) return;
    
    const rect = videoContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const normalizedX = Math.round((x / rect.width) * 640);
    const normalizedY = Math.round((y / rect.height) * 360);
    
    const width = normalizedX - startPoint[0];
    const height = normalizedY - startPoint[1];
    
    setCurrentRect([startPoint[0], startPoint[1], width, height]);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };



  const handleSaveZone = async () => {
    if (!selectedVideo || !currentRect || !zoneName) {
      alert('Please draw a rectangle and enter a zone name');
      return;
    }

    const [x, y, w, h] = currentRect;
    const coordinates = [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h]
    ];

    try {
      await api.createZone(username, selectedVideo.id, zoneName, coordinates);
      setStartPoint(null);
      setCurrentRect(null);
      setZoneName('');
      setDrawing(false);
      loadZones(selectedVideo.id);
    } catch (err) {
      alert('Failed to save zone');
    }
  };

  const handleDeleteZone = async (zoneId: number) => {
    if (!confirm('Delete this zone?')) return;
    try {
      await api.deleteZone(zoneId);
      if (selectedVideo) loadZones(selectedVideo.id);
    } catch (err) {
      alert('Failed to delete zone');
    }
  };

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone);
    setEditLabel(zone.label);
  };

  const handleEditCoordinates = (zone: Zone) => {
    setEditingZone(zone);
    setEditLabel(zone.label);
    setEditingCoordinates(true);
    setDrawing(true);
    setStartPoint(null);
    setCurrentRect(null);
  };

  const handleUpdateLabel = async (zoneId: number) => {
    if (!editLabel.trim()) {
      alert('Zone name cannot be empty');
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/zone/${zoneId}?label=${encodeURIComponent(editLabel)}`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to update');
      setEditingZone(null);
      setEditLabel('');
      if (selectedVideo) loadZones(selectedVideo.id);
    } catch (err) {
      alert('Failed to update zone label');
    }
  };

  const handleUpdateZone = async () => {
    if (!editingZone || !currentRect || !editLabel.trim()) {
      alert('Please draw a rectangle and enter a zone name');
      return;
    }

    const [x, y, w, h] = currentRect;
    const coordinates = [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h]
    ];

    try {
      // Delete old zone
      await api.deleteZone(editingZone.id);
      // Create new zone with updated coordinates
      await api.createZone(username, selectedVideo!.id, editLabel, coordinates);
      
      setEditingZone(null);
      setEditingCoordinates(false);
      setStartPoint(null);
      setCurrentRect(null);
      setEditLabel('');
      setDrawing(false);
      if (selectedVideo) loadZones(selectedVideo.id);
    } catch (err) {
      alert('Failed to update zone');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Zone Management</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/user/analytics')}>
              View Analytics
            </Button>
            <Button onClick={() => router.push('/user/videos')} variant="secondary">
              Upload Video
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">Draw Zones</h2>
            {!selectedVideo ? (
              <p className="text-gray-600">Select a video to start drawing zones</p>
            ) : (
              <div className="space-y-4">
                <div 
                  ref={videoContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="relative border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair"
                  style={{ aspectRatio: '16/9' }}
                >
                  <video
                    src={`http://127.0.0.1:8000/api/video/preview/${selectedVideo.id}`}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Draw existing zones */}
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
                    {/* Draw current rectangle */}
                    {currentRect && (() => {
                      const container = videoContainerRef.current;
                      if (!container) return null;
                      const rect = container.getBoundingClientRect();
                      const [x, y, w, h] = currentRect;
                      const px = (x / 640) * rect.width;
                      const py = (y / 360) * rect.height;
                      const pw = (w / 640) * rect.width;
                      const ph = (h / 360) * rect.height;
                      return (
                        <rect
                          x={px}
                          y={py}
                          width={pw}
                          height={ph}
                          fill="rgba(59, 130, 246, 0.3)"
                          stroke="#3B82F6"
                          strokeWidth="3"
                        />
                      );
                    })()}
                  </svg>
                </div>

                <div className="flex gap-2">
                  {!drawing ? (
                    <Button onClick={() => { setDrawing(true); setStartPoint(null); setCurrentRect(null); setEditingZone(null); setEditingCoordinates(false); }}>
                      Start Drawing Zone
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => { setDrawing(false); setStartPoint(null); setCurrentRect(null); setEditingZone(null); setEditingCoordinates(false); }} variant="danger">
                        Cancel
                      </Button>
                      <Button onClick={() => { setStartPoint(null); setCurrentRect(null); }} variant="secondary">
                        Clear
                      </Button>
                    </>
                  )}
                </div>
                {drawing && (
                  <p className="text-sm text-gray-600">
                    {editingCoordinates ? 'Redraw the zone rectangle.' : 'Click and drag on the video to draw a rectangular zone.'}
                  </p>
                )}

                {drawing && currentRect && (
                  <div className="space-y-2">
                    <Input
                      label="Zone Name"
                      value={editingCoordinates ? editLabel : zoneName}
                      onChange={(e) => editingCoordinates ? setEditLabel(e.target.value) : setZoneName(e.target.value)}
                      placeholder="Enter zone name"
                    />
                    <Button onClick={editingCoordinates ? handleUpdateZone : handleSaveZone}>
                      {editingCoordinates ? 'Update Zone' : 'Save Zone'}
                    </Button>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-bold text-gray-800 mb-2">Zones for this video:</h3>
                  {zones.length === 0 ? (
                    <p className="text-gray-600">No zones created yet</p>
                  ) : (
                    <div className="space-y-2">
                      {zones.map((zone) => (
                        <div key={zone.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          {editingZone?.id === zone.id && !editingCoordinates ? (
                            <div className="flex gap-2 flex-1">
                              <input
                                type="text"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded"
                              />
                              <button onClick={() => handleUpdateLabel(zone.id)} className="text-green-600 hover:text-green-800 px-2">
                                Save
                              </button>
                              <button onClick={() => setEditingZone(null)} className="text-gray-600 hover:text-gray-800 px-2">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-gray-800">{zone.label}</span>
                              <div className="flex gap-2">
                                <button onClick={() => handleEditZone(zone)} className="text-blue-600 hover:text-blue-800 text-sm">
                                  Edit Name
                                </button>
                                <button onClick={() => handleEditCoordinates(zone)} className="text-purple-600 hover:text-purple-800 text-sm">
                                  Edit Zone
                                </button>
                                <button onClick={() => handleDeleteZone(zone.id)} className="text-red-600 hover:text-red-800">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
