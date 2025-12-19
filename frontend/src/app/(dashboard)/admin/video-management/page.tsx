'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, FileVideo, FileText, BarChart3, LogOut, Search, Trash2, ChevronLeft, ChevronRight, X, Upload } from 'lucide-react';

interface Video {
  id: number;
  filename: string;
  status: string;
  filepath: string;
  username: string;
}

export default function VideoManagement() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingVideo, setViewingVideo] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadUsers, setUploadUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysisAvailable, setAnalysisAvailable] = useState<{ [key: number]: boolean }>({});
  const [stats, setStats] = useState({ totalVideos: 0, totalUsers: 0, analyzedVideos: 0 });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAnalyzed, setFilterAnalyzed] = useState('all');
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const user = localStorage.getItem('username');

    if (!token || (userRole !== 'admin' && userRole !== 'superadmin')) {
      router.push('/admin-login');
      return;
    }

    setAdminUsername(user || 'Admin');
    loadVideos();
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/users');
      const users = await response.json();
      setUploadUsers(users);
      setStats(prev => ({ ...prev, totalUsers: users.length }));
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadVideos = async () => {
    try {
      setLoading(true);
      const usersResponse = await fetch('http://127.0.0.1:8000/api/admin/users');
      const users = await usersResponse.json();

      let allVideos: Video[] = [];
      const analysisMap: { [key: number]: boolean } = {};
      let analyzedCount = 0;

      for (const user of users) {
        try {
          const videosResponse = await fetch(`http://127.0.0.1:8000/api/video/list/${user.username}`);
          const userVideos = await videosResponse.json();

          for (const v of userVideos) {
            allVideos.push({ ...v, username: user.username });

            try {
              const analysisRes = await fetch(`http://127.0.0.1:8000/api/analysis/results/${v.id}`);
              const analysisData = await analysisRes.json();
              const hasAnalysis = !!analysisData?.output_video_path;
              analysisMap[v.id] = hasAnalysis;
              if (hasAnalysis) analyzedCount++;
            } catch {
              analysisMap[v.id] = false;
            }
          }
        } catch (err) {
          console.error(`Error fetching videos for ${user.username}:`, err);
        }
      }

      setVideos(allVideos);
      setAnalysisAvailable(analysisMap);
      setStats(prev => ({ ...prev, totalVideos: allVideos.length, analyzedVideos: analyzedCount }));
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !selectedUser) {
      alert('Please select a user and file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('username', selectedUser);
    formData.append('file', uploadFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/video/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        alert('Video uploaded successfully');
        setShowUploadModal(false);
        setUploadFile(null);
        setSelectedUser('');
        loadVideos();
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error('Error uploading video:', err);
      alert('Error uploading video');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/video/delete/${videoId}`, { method: 'DELETE' });
      loadVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const handleViewVideo = async (video: Video, type: 'normal' | 'analyzed') => {
    try {
      if (type === 'normal') {
        setViewingVideo({ ...video, videoUrl: `http://127.0.0.1:8000/api/video/preview/${video.id}`, type: 'normal' });
      } else {
        const result = await fetch(`http://127.0.0.1:8000/api/analysis/results/${video.id}`);
        const analysisData = await result.json();
        if (analysisData?.output_video_path) {
          setViewingVideo({ ...video, videoUrl: `http://127.0.0.1:8000/api/analysis/result/${video.id}?path=${encodeURIComponent(analysisData.output_video_path)}`, type: 'analyzed' });
        } else {
          alert('No analysis video available for this video');
        }
      }
    } catch (err) {
      console.error('Error fetching video:', err);
      alert('Error loading video');
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.filename.toLowerCase().includes(searchQuery.toLowerCase()) || v.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchesAnalyzed = filterAnalyzed === 'all' || (filterAnalyzed === 'analyzed' ? analysisAvailable[v.id] : !analysisAvailable[v.id]);
    return matchesSearch && matchesStatus && matchesAnalyzed;
  });

  const paginatedVideos = filteredVideos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {adminUsername.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h1 className="text-gray-900 text-base font-medium">Admin Panel</h1>
              <p className="text-gray-500 text-sm">Crowd Count Inc.</p>
            </div>
          </div>
        </div>

        <nav className="flex-grow p-4">
          <div className="flex flex-col gap-2">
            <motion.button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <LayoutDashboard size={20} className="text-gray-800" />
              <p className="text-gray-800 text-sm font-medium">Dashboard</p>
            </motion.button>
            <motion.button
              onClick={() => router.push('/admin/user-management')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <Users size={20} className="text-gray-800" />
              <p className="text-gray-800 text-sm font-medium">User Management</p>
            </motion.button>
            <motion.button
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-600"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <FileVideo size={20} className="text-blue-600" />
              <p className="text-blue-600 text-sm font-medium">Video Management</p>
            </motion.button>
            <motion.button
              onClick={() => router.push('/admin/reports')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <FileText size={20} className="text-gray-800" />
              <p className="text-gray-800 text-sm font-medium">Reports</p>
            </motion.button>
            <motion.button
              onClick={() => router.push('/admin/crowd-data')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <BarChart3 size={20} className="text-gray-800" />
              <p className="text-gray-800 text-sm font-medium">Crowd Data</p>
            </motion.button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <motion.button
            onClick={() => {
              localStorage.clear();
              router.push('/');
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 w-full transition-colors"
            whileHover={{ x: 4 }}
            suppressHydrationWarning
          >
            <LogOut size={20} className="text-red-500" />
            <p className="text-red-500 text-sm font-medium">Logout</p>
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center gap-4 mb-6">
            <h1 className="text-gray-900 text-4xl font-black tracking-tight">Video Management</h1>
            <motion.button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              suppressHydrationWarning
            >
              <Upload size={18} />
              Upload Video
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div className="bg-white border border-gray-200 rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} suppressHydrationWarning>
              <p className="text-gray-600 text-sm font-medium">Total Videos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVideos}</p>
            </motion.div>
            <motion.div className="bg-white border border-gray-200 rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} suppressHydrationWarning>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </motion.div>
            <motion.div className="bg-white border border-gray-200 rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} suppressHydrationWarning>
              <p className="text-gray-600 text-sm font-medium">Analyzed Videos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.analyzedVideos}</p>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by filename or username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterAnalyzed}
              onChange={(e) => {
                setFilterAnalyzed(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Videos</option>
              <option value="analyzed">Analyzed</option>
              <option value="not-analyzed">Not Analyzed</option>
            </select>
          </div>

          {/* Videos Table */}
          <motion.div
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            suppressHydrationWarning
          >
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading videos...</div>
            ) : paginatedVideos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No videos found</div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Filename</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVideos.map((video) => (
                      <tr key={video.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{video.filename}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{video.username}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${video.status === 'completed' ? 'bg-green-100 text-green-800' :
                            video.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {video.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <motion.button
                            onClick={() => handleViewVideo(video, 'normal')}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            suppressHydrationWarning
                          >
                            Original
                          </motion.button>
                          <div className="w-20">
                            {analysisAvailable[video.id] && (
                              <motion.button
                                onClick={() => handleViewVideo(video, 'analyzed')}
                                className="px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                suppressHydrationWarning
                              >
                                Analyzed
                              </motion.button>
                            )}
                          </div>
                          <motion.button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            suppressHydrationWarning
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVideos.length)} of {filteredVideos.length}
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronLeft size={18} />
                    </motion.button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <motion.button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronRight size={18} />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowUploadModal(false)}
          suppressHydrationWarning
        >
          <motion.div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            suppressHydrationWarning
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upload Video</h2>
              <motion.button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                whileHover={{ scale: 1.1 }}
                suppressHydrationWarning
              >
                <X size={24} />
              </motion.button>
            </div>
            <form onSubmit={handleUploadVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a user...</option>
                  {uploadUsers.map(user => (
                    <option key={user.id} value={user.username}>{user.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Select Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <motion.button
                type="submit"
                disabled={uploading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                suppressHydrationWarning
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Video Modal */}
      {viewingVideo && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setViewingVideo(null)}
          suppressHydrationWarning
        >
          <motion.div
            className="bg-white rounded-xl p-6 max-w-4xl w-full"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            suppressHydrationWarning
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{viewingVideo.filename} ({viewingVideo.type})</h2>
              <motion.button
                onClick={() => setViewingVideo(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                whileHover={{ scale: 1.1 }}
                suppressHydrationWarning
              >
                <X size={24} />
              </motion.button>
            </div>
            <video
              key={viewingVideo.videoUrl}
              src={viewingVideo.videoUrl}
              controls
              autoPlay
              className="w-full rounded-lg bg-black"
              style={{ maxHeight: '70vh' }}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
