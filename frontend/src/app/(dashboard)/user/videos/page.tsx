'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, Play, Video as VideoIcon, Home, BarChart3, X, CloudUpload } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Video } from '@/types';

export default function VideoManagement() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

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
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await api.uploadVideo(username, selectedFile);
      setSelectedFile(null);
      loadVideos(username);
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (videoId: number) => {
    if (!confirm('Delete this video?')) return;
    try {
      await api.deleteVideo(videoId);
      loadVideos(username);
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 w-full px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded-lg">
              <VideoIcon className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Video Management</h1>
              <p className="text-sm text-gray-500">Manage your video history</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => router.push('/user')}
              className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Home size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => router.push('/user/zones')}
              className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              Draw Zones
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - My Videos */}
          <div className="lg:col-span-1">
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Videos</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <p className="text-gray-500 text-sm">Loading...</p>
                ) : videos.length === 0 ? (
                  <p className="text-gray-500 text-sm">No videos yet</p>
                ) : (
                  videos.map((video, index) => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideoIndex(index)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedVideoIndex === index
                          ? 'bg-blue-50 border-blue-600'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-800 truncate">{video.filename}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${
                          video.status === 'completed' ? 'bg-green-500' :
                          video.status === 'processing' ? 'bg-yellow-400' :
                          'bg-red-500'
                        }`}></span>
                        <p className={`text-sm ${
                          video.status === 'completed' ? 'text-green-600' :
                          video.status === 'processing' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {video.status === 'completed' ? 'Completed' :
                           video.status === 'processing' ? 'Processing' : 'Failed'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewVideo(video);
                          }}
                          disabled={video.status !== 'completed'}
                          className="flex items-center space-x-1 text-sm text-blue-600 hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <Play size={16} />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(video.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Side - Upload and Preview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                  <Upload size={32} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Upload Video</h2>
                <p className="text-gray-500 mt-1 mb-6">Select a video file to upload and analyze</p>
                <div className="w-full max-w-lg">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors bg-gray-50">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CloudUpload className="text-gray-400" size={48} />
                        <p className="text-gray-600">
                          <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-gray-400">MP4, AVI, MOV (max. 500MB)</p>
                      </div>
                    </div>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                  {selectedFile && (
                    <div className="mt-4 p-3 border border-gray-200 rounded-lg flex items-center justify-between bg-white">
                      <div className="flex items-center space-x-3">
                        <VideoIcon className="text-blue-600" size={24} />
                        <div>
                          <p className="font-medium text-sm text-gray-800">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="bg-blue-600 text-white font-medium py-1.5 px-4 text-sm rounded-md shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Video Preview Section */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Video Preview</h2>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {selectedFile ? (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={URL.createObjectURL(selectedFile)}
                  >
                    Your browser does not support video playback.
                  </video>
                ) : videos.length > 0 && videos[selectedVideoIndex] ? (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={`http://127.0.0.1:8000/api/video/preview/${videos[selectedVideoIndex].id}`}
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <VideoIcon size={48} className="mx-auto mb-2" />
                      <p>No video selected</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-5xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{previewVideo.filename}</h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <video
              controls
              autoPlay
              className="w-full rounded-xl shadow-lg"
              src={`http://127.0.0.1:8000/api/video/preview/${previewVideo.id}`}
            >
              Your browser does not support video playback.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
