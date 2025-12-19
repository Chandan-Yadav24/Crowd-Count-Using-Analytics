'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Video, BarChart3, Settings, TrendingUp, TrendingDown, CheckCircle, UserCog, FileVideo, FileText, ArrowRight, LogOut, BarChart, Activity } from 'lucide-react';
import Chatbot from '@/components/Chatbot';

export default function AdminDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalZones: 0
  });
  const [analysesCount, setAnalysesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const user = localStorage.getItem('username');

    if (!token || (userRole !== 'admin' && userRole !== 'superadmin')) {
      router.push('/admin-login');
      return;
    }

    setUsername(user || 'Admin');
    setRole(userRole || '');
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch users count
      const usersResponse = await fetch('http://127.0.0.1:8000/api/admin/users');
      const users = await usersResponse.json();
      
      // Count total videos from all users
      let totalVideos = 0;
      let totalZones = 0;
      
      for (const user of users) {
        try {
          const videosResponse = await fetch(`http://127.0.0.1:8000/api/video/list/${user.username}`);
          const videos = await videosResponse.json();
          totalVideos += videos.length;
          
          // Count zones for each video
          for (const video of videos) {
            try {
              const zonesResponse = await fetch(`http://127.0.0.1:8000/api/zone/list/${video.id}`);
              const zones = await zonesResponse.json();
              totalZones += zones.length;
            } catch (err) {
              console.error('Error fetching zones:', err);
            }
          }
        } catch (err) {
          console.error('Error fetching videos:', err);
        }
      }
      
      const analysesResponse = await fetch('http://127.0.0.1:8000/api/analysis/count/total');
      const analysesData = await analysesResponse.json();
      
      setStats({
        totalUsers: users.length,
        totalVideos,
        totalZones
      });
      setAnalysesCount(analysesData.total);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <BarChart className="text-blue-600" size={32} />
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Welcome, {username}</p>
                <p className="text-xs text-gray-600">Crowd Count Analytics</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
              <motion.button
                onClick={() => {
                  localStorage.clear();
                  router.push('/');
                }}
                className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="mr-2" size={16} />
                Logout
              </motion.button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <motion.h2 
          className="text-3xl font-extrabold text-gray-900 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Admin Dashboard
        </motion.h2>
        
        {/* KPI Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <KPICard 
              icon={<Users size={32} />}
              title="Total Users"
              value={loading ? '...' : stats.totalUsers.toString()}
              trend="Registered users"
              trendUp={null}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard 
              icon={<Video size={32} />}
              title="Videos Uploaded"
              value={loading ? '...' : stats.totalVideos.toString()}
              trend="Total videos"
              trendUp={null}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard 
              icon={<BarChart3 size={32} />}
              title="Analyses Run"
              value={loading ? '...' : analysesCount.toString()}
              trend="Total analyses"
              trendUp={null}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard 
              icon={<Settings size={32} />}
              title="Active Zones"
              value={loading ? '...' : stats.totalZones.toString()}
              trend="Configured zones"
              trendUp={null}
            />
          </motion.div>
        </motion.div>

        {/* Management Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <ManagementCard
              icon={<UserCog size={32} />}
              title="User Management"
              description="Manage user accounts and permissions"
              onClick={() => router.push('/admin/user-management')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ManagementCard
              icon={<FileVideo size={32} />}
              title="Video Management"
              description="Monitor all uploaded videos and archives"
              onClick={() => router.push('/admin/video-management')}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ManagementCard
              icon={<FileText size={32} />}
              title="Reports"
              description="Generate and view detailed performance reports"
              onClick={() => router.push('/admin/reports')}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ManagementCard
              icon={<BarChart3 size={32} />}
              title="Crowd Data"
              description="View all crowd count data and analytics"
              onClick={() => router.push('/admin/crowd-data')}
            />
          </motion.div>
        </motion.div>
      </main>
      
      {/* Chatbot - Fixed positioning */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Chatbot />
      </div>
    </div>
  );
}

function KPICard({ icon, title, value, trend, trendUp }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string;
  trend: string;
  trendUp: boolean | null;
}) {
  return (
    <motion.div 
      className="relative bg-white border border-gray-200 p-6 rounded-xl shadow-sm overflow-hidden"
      whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          <span className="text-4xl font-bold text-gray-900 mt-1">{value}</span>
          <span className="flex items-center text-sm mt-2">
            {trendUp === true && (
              <>
                <TrendingUp className="text-green-500 mr-1" size={16} />
                <span className="text-green-500">{trend}</span>
              </>
            )}
            {trendUp === false && (
              <>
                <TrendingDown className="text-red-500 mr-1" size={16} />
                <span className="text-red-500">{trend}</span>
              </>
            )}
            {trendUp === null && (
              <>
                <CheckCircle className="text-green-500 mr-1" size={16} />
                <span className="text-gray-600">{trend}</span>
              </>
            )}
          </span>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <div className="text-blue-600">{icon}</div>
        </div>
      </div>
      {/* Sparkline Effect */}
      <svg className="absolute bottom-0 left-0 right-0 w-full h-20 opacity-5" preserveAspectRatio="none" viewBox="0 0 300 100">
        <polyline fill="none" points="0,80 50,60 100,70 150,50 200,65 250,45 300,55" stroke="#3B82F6" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}

function ManagementCard({ icon, title, description, onClick }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      className="group bg-white border border-gray-200 p-6 rounded-xl flex items-center space-x-6 cursor-pointer"
      whileHover={{ y: -4, backgroundColor: '#F8FAFC' }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-blue-100 p-4 rounded-lg">
        <div className="text-blue-600">{icon}</div>
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <motion.div
        className="text-gray-400"
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ArrowRight size={24} />
      </motion.div>
    </motion.div>
  );
}
