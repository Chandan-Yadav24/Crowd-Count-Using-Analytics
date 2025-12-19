'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Video as VideoIcon,
  Map,
  Plus,
  Edit,
  Save,
  X,
  Pencil,
  Check,
  MapPin,
  BarChart,
  Upload,
  LayoutDashboard,
  Play,
  Clock
} from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-5 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Map className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Zone Management</h1>
              <p className="text-sm text-gray-500 font-medium">Define and manage detection zones</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/user/analytics')} className="flex items-center gap-2">
              <BarChart size={18} />
              <span>Analytics</span>
            </Button>
            <Button onClick={() => router.push('/user/videos')} variant="secondary" className="flex items-center gap-2">
              <Upload size={18} />
              <span>Upload</span>
            </Button>
            <Button onClick={() => router.push('/user')} variant="secondary" className="flex items-center gap-2">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Button>
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
                        <Play size={20} className="text-white" />
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
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md">
                <MapPin className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">Draw Zones</h2>
            </div>
            {!selectedVideo ? (
              <div className="text-center py-16">
                <Map className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 font-semibold text-lg">Select a video to start drawing zones</p>
                <p className="text-sm text-gray-400 mt-2">Choose a video from the list to define detection zones</p>
              </div>
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

                <div className="flex gap-3">
                  {!drawing ? (
                    <Button onClick={() => { setDrawing(true); setStartPoint(null); setCurrentRect(null); setEditingZone(null); setEditingCoordinates(false); }} className="flex items-center gap-2">
                      <Plus size={18} />
                      <span>Start Drawing Zone</span>
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => { setDrawing(false); setStartPoint(null); setCurrentRect(null); setEditingZone(null); setEditingCoordinates(false); }} variant="danger" className="flex items-center gap-2">
                        <X size={18} />
                        <span>Cancel</span>
                      </Button>
                      <Button onClick={() => { setStartPoint(null); setCurrentRect(null); }} variant="secondary" className="flex items-center gap-2">
                        <Trash2 size={18} />
                        <span>Clear</span>
                      </Button>
                    </>
                  )}
                </div>
                {drawing && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      {editingCoordinates ? 'Redraw the zone rectangle on the video above.' : 'Click and drag on the video to draw a rectangular zone.'}
                    </p>
                  </div>
                )}

                {drawing && currentRect && (
                  <div className="space-y-3 bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                    <Input
                      label="Zone Name"
                      value={editingCoordinates ? editLabel : zoneName}
                      onChange={(e) => editingCoordinates ? setEditLabel(e.target.value) : setZoneName(e.target.value)}
                      placeholder="Enter zone name"
                    />
                    <Button onClick={editingCoordinates ? handleUpdateZone : handleSaveZone} className="flex items-center gap-2">
                      <Save size={18} />
                      <span>{editingCoordinates ? 'Update Zone' : 'Save Zone'}</span>
                    </Button>
                  </div>
                )}

                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="text-gray-600" size={20} />
                    <h3 className="font-bold text-gray-800 text-lg tracking-tight">Zones for this video</h3>
                    <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {zones.length} {zones.length === 1 ? 'Zone' : 'Zones'}
                    </span>
                  </div>
                  {zones.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Map className="mx-auto text-gray-300 mb-3" size={40} />
                      <p className="text-gray-500 font-medium">No zones created yet</p>
                      <p className="text-sm text-gray-400 mt-1">Draw your first zone to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {zones.map((zone) => (
                        <div key={zone.id} className="flex justify-between items-center bg-white border-2 border-gray-200 p-4 rounded-xl hover:shadow-md transition-all duration-200 group">
                          {editingZone?.id === zone.id && !editingCoordinates ? (
                            <div className="flex gap-3 flex-1 items-center">
                              <Pencil className="text-blue-500" size={18} />
                              <input
                                type="text"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                              />
                              <button
                                onClick={() => handleUpdateLabel(zone.id)}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                              >
                                <Check size={16} />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => setEditingZone(null)}
                                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                              >
                                <X size={16} />
                                <span>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-sm">
                                  <MapPin className="text-white" size={16} />
                                </div>
                                <span className="text-gray-800 font-semibold">{zone.label}</span>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditZone(zone)}
                                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                                >
                                  <Pencil size={14} />
                                  <span>Edit Name</span>
                                </button>
                                <button
                                  onClick={() => handleEditCoordinates(zone)}
                                  className="flex items-center gap-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                                >
                                  <Edit size={14} />
                                  <span>Edit Zone</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteZone(zone.id)}
                                  className="flex items-center gap-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
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
