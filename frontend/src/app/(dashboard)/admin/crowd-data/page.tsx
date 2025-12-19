'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, FileVideo, FileText, BarChart3, LogOut, Download } from 'lucide-react';

export default function CrowdData() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [adminUsername, setAdminUsername] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const user = localStorage.getItem('username');

    if (!token || (userRole !== 'admin' && userRole !== 'superadmin')) {
      router.push('/admin-login');
      return;
    }

    setAdminUsername(user || 'Admin');
    loadAllData();
  }, [router]);

  const loadAllData = async () => {
    try {
      const usersRes = await fetch('http://127.0.0.1:8000/api/admin/users');
      const usersList = await usersRes.json();
      setUsers(usersList);

      let allVideos: any[] = [];
      for (const user of usersList) {
        try {
          const videosRes = await fetch(`http://127.0.0.1:8000/api/video/list/${user.username}`);
          const userVideos = await videosRes.json();
          allVideos = [...allVideos, ...userVideos.map((v: any) => ({ ...v, username: user.username }))];
        } catch (err) {
          console.error(`Error fetching videos for ${user.username}:`, err);
        }
      }
      setVideos(allVideos);

      let allZones: any[] = [];
      for (const video of allVideos) {
        try {
          const zonesRes = await fetch(`http://127.0.0.1:8000/api/zone/list/${video.id}`);
          const videoZones = await zonesRes.json();
          allZones = [...allZones, ...videoZones.map((z: any) => ({ ...z, video_filename: video.filename }))];
        } catch (err) {
          console.error(`Error fetching zones for video ${video.id}:`, err);
        }
      }
      setZones(allZones);

      let allAnalysis: any[] = [];
      for (const user of usersList) {
        try {
          const analysisRes = await fetch(`http://127.0.0.1:8000/api/analysis/all/${user.username}`);
          const userAnalysis = await analysisRes.json();
          allAnalysis = [...allAnalysis, ...userAnalysis.map((a: any) => ({ ...a, username: user.username }))];
        } catch (err) {
          console.error(`Error fetching analysis for ${user.username}:`, err);
        }
      }
      setAnalysisResults(allAnalysis);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleExport = (data: any[], filename: string, format: 'csv' | 'pdf' | 'docx') => {
    if (format === 'csv') {
      if (data.length === 0) return;
      const headers = Object.keys(data[0]);
      const csv = [headers.join(','), ...data.map(row =>
        headers.map(h => {
          const val = row[h];
          if (typeof val === 'object') return `"${JSON.stringify(val)}"`;
          return `"${val}"`;
        }).join(',')
      )].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      handleExportDocument(data, filename, format);
    }
  };

  const handleExportDocument = async (data: any[], filename: string, format: 'pdf' | 'docx') => {
    try {
      const endpoint = format === 'pdf' ? '/api/export/crowd-data/pdf' : '/api/export/crowd-data/docx';
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: data, filename })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading database...</p>
        </div>
      </div>
    );
  }

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
              onClick={() => router.push('/admin/video-management')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <FileVideo size={20} className="text-gray-800" />
              <p className="text-gray-800 text-sm font-medium">Video Management</p>
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-600"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <BarChart3 size={20} className="text-blue-600" />
              <p className="text-blue-600 text-sm font-medium">Crowd Data</p>
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
          <h1 className="text-gray-900 text-4xl font-black tracking-tight mb-6">Database Viewer</h1>
          <div className="flex space-x-4 mb-6 border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'users', label: 'Users', count: users.length },
              { id: 'videos', label: 'Videos', count: videos.length },
              { id: 'zones', label: 'Zones', count: zones.length },
              { id: 'analysis', label: 'Analysis Results', count: analysisResults.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {activeTab === 'users' && (
              <TableSection
                data={users}
                onExport={(format) => handleExport(users, 'users', format)}
              />
            )}

            {activeTab === 'videos' && (
              <TableSection
                data={videos}
                onExport={(format) => handleExport(videos, 'videos', format)}
              />
            )}

            {activeTab === 'zones' && (
              <TableSection
                data={zones}
                onExport={(format) => handleExport(zones, 'zones', format)}
              />
            )}

            {activeTab === 'analysis' && (
              <TableSection
                data={analysisResults}
                onExport={(format) => handleExport(analysisResults, 'analysis-results', format)}
              />
            )}

            <div className="text-sm text-gray-600">
              {activeTab === 'users' && `Total: ${users.length} users`}
              {activeTab === 'videos' && `Total: ${videos.length} videos`}
              {activeTab === 'zones' && `Total: ${zones.length} zones`}
              {activeTab === 'analysis' && `Total: ${analysisResults.length} analysis results`}
            </div>
          </motion.div>
        </div>
      </main >
    </div >
  );
}

function TableSection({ data, onExport }: { data: any[], onExport: (format: 'csv' | 'pdf' | 'docx') => void }) {
  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-600">No data available</div>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex justify-end p-4 border-b border-gray-200 space-x-2">
        <motion.button
          onClick={() => onExport('csv')}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={16} />
          <span>CSV</span>
        </motion.button>
        <motion.button
          onClick={() => onExport('pdf')}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={16} />
          <span>PDF</span>
        </motion.button>
        <motion.button
          onClick={() => onExport('docx')}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={16} />
          <span>DOCX</span>
        </motion.button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col} className="px-6 py-4 text-sm text-gray-900">
                    {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
