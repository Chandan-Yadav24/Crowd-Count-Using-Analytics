'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Upload, PenTool, BarChart3, ArrowRight, LogOut, Settings, LineChart } from 'lucide-react';
import UserChatbot from '@/components/UserChatbot';

export default function UserDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('username');

    if (!token || role === 'admin' || role === 'superadmin') {
      router.push('/login');
      return;
    }

    setUsername(user || 'User');
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const cards = [
    {
      icon: Upload,
      title: 'Upload Video',
      description: 'Upload videos for crowd analysis and get detailed reports.',
      action: 'Get Started',
      path: '/user/videos',
      color: 'blue'
    },
    {
      icon: PenTool,
      title: 'Draw Zones',
      description: 'Define specific zones on your video feeds for targeted monitoring.',
      action: 'Configure Zones',
      path: '/user/zones',
      color: 'blue'
    },
    {
      icon: BarChart3,
      title: 'View Analytics',
      description: 'See real-time and historical crowd counting results and insights.',
      action: 'View Dashboard',
      path: '/user/analytics',
      color: 'blue'
    },
    {
      icon: LineChart,
      title: 'Analytics Archive',
      description: 'View live & archived analytics with charts and detailed insights.',
      action: 'View Archive',
      path: '/user/analytics-archive',
      color: 'blue'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 shadow-sm sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Users className="text-blue-600" size={32} />
              <h1 className="text-xl font-bold tracking-tight text-gray-900">Crowd Count AI</h1>
            </motion.div>

            <motion.nav
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="hidden sm:inline text-sm text-gray-600">Welcome, {username}</span>
              <motion.button
                onClick={() => router.push('/user/account-settings')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings size={16} />
                Account Settings
              </motion.button>
              <motion.button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={16} />
                Logout
              </motion.button>
            </motion.nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <motion.h2
            className="text-4xl font-bold tracking-tight text-gray-900 mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            User Dashboard
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
                  onClick={() => router.push(card.path)}
                  className="group block p-8 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col h-full">
                    <motion.div
                      className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-lg mb-6 group-hover:bg-blue-600 transition-colors duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="text-blue-600 group-hover:text-white transition-colors duration-300" size={32} />
                    </motion.div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-gray-600 mb-4 flex-grow">{card.description}</p>

                    <div className="mt-auto pt-4">
                      <span className="font-medium text-blue-600 flex items-center group-hover:text-blue-700">
                        {card.action}
                        <motion.span
                          className="ml-1"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight size={20} />
                        </motion.span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600">
            © 2025 Crowd Count AI. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Chatbot */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <UserChatbot />
      </div>
    </div>
  );
}
