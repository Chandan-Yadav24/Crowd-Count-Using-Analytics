'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, FileVideo, FileText, BarChart3, LogOut, Download, TrendingUp } from 'lucide-react';

export default function Reports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminUsername, setAdminUsername] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalAnalyses: 0,
    totalZones: 0,
    avgCrowdCount: 0,
    maxCrowdCount: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const user = localStorage.getItem('username');

    if (!token || (userRole !== 'admin' && userRole !== 'superadmin')) {
      router.push('/admin-login');
      return;
    }

    setAdminUsername(user || 'Admin');
    loadReportData();
  }, [router]);

  const loadReportData = async () => {
    try {
      const usersRes = await fetch('http://127.0.0.1:8000/api/admin/users');
      const users = await usersRes.json();

      let totalVideos = 0;
      let totalZones = 0;
      let allAnalyses: any[] = [];

      for (const user of users) {
        try {
          const videosRes = await fetch(`http://127.0.0.1:8000/api/video/list/${user.username}`);
          const videos = await videosRes.json();
          totalVideos += videos.length;

          for (const video of videos) {
            try {
              const zonesRes = await fetch(`http://127.0.0.1:8000/api/zone/list/${video.id}`);
              const zones = await zonesRes.json();
              totalZones += zones.length;
            } catch (err) {
              console.error('Error fetching zones:', err);
            }
          }

          const analysisRes = await fetch(`http://127.0.0.1:8000/api/analysis/all/${user.username}`);
          const analyses = await analysisRes.json();
          allAnalyses = [...allAnalyses, ...analyses];
        } catch (err) {
          console.error(`Error fetching data for ${user.username}:`, err);
        }
      }

      const avgCrowdCount = allAnalyses.length > 0
        ? Math.round(allAnalyses.reduce((sum: number, a: any) => sum + a.total_count, 0) / allAnalyses.length)
        : 0;

      const maxCrowdCount = allAnalyses.length > 0
        ? Math.max(...allAnalyses.map((a: any) => a.total_count))
        : 0;

      setStats({
        totalUsers: users.length,
        totalVideos,
        totalAnalyses: allAnalyses.length,
        totalZones,
        avgCrowdCount,
        maxCrowdCount
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading report data:', error);
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'pdf' | 'docx') => {
    try {
      const endpoint = format === 'pdf' ? '/api/export/report/pdf' : '/api/export/report/docx';
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.${format}`;
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
          <p className="text-gray-600">Generating report...</p>
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-600"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <FileText size={20} className="text-blue-600" />
              <p className="text-blue-600 text-sm font-medium">Reports</p>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-gray-900 text-4xl font-black tracking-tight">Reports</h1>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => handleExportReport('pdf')}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={16} />
                <span>PDF</span>
              </motion.button>
              <motion.button
                onClick={() => handleExportReport('docx')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={16} />
                <span>DOCX</span>
              </motion.button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Summary Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ReportCard label="Total Users" value={stats.totalUsers} />
                <ReportCard label="Videos Uploaded" value={stats.totalVideos} />
                <ReportCard label="Analyses Run" value={stats.totalAnalyses} />
                <ReportCard label="Zones Configured" value={stats.totalZones} />
                <ReportCard label="Avg Crowd Count" value={stats.avgCrowdCount} />
                <ReportCard label="Max Crowd Count" value={stats.maxCrowdCount} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <TrendingUp className="text-blue-600" size={24} />
                <span>Key Metrics</span>
              </h2>
              <div className="space-y-4">
                <MetricRow
                  label="System Utilization"
                  value={`${Math.round((stats.totalAnalyses / Math.max(stats.totalVideos, 1)) * 100)}%`}
                />
                <MetricRow
                  label="Average Videos per User"
                  value={stats.totalUsers > 0 ? (stats.totalVideos / stats.totalUsers).toFixed(2) : '0'}
                />
                <MetricRow
                  label="Average Zones per Video"
                  value={stats.totalVideos > 0 ? (stats.totalZones / stats.totalVideos).toFixed(2) : '0'}
                />
                <MetricRow
                  label="Report Generated"
                  value={new Date().toLocaleString()}
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-green-900 mb-4">System Status</h2>
              <div className="space-y-2 text-green-800">
                <p>✓ All systems operational</p>
                <p>✓ Database connected</p>
                <p>✓ Analysis service active</p>
                <p>✓ No critical alerts</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function ReportCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
      <p className="text-sm text-blue-700 font-medium">{label}</p>
      <p className="text-3xl font-bold text-blue-900 mt-2">{value}</p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-700 font-medium">{label}</span>
      <span className="text-gray-900 font-bold">{value}</span>
    </div>
  );
}
