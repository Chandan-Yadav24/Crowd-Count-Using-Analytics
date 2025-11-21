'use client';

import Link from 'next/link';
import { ArrowRight, Video, Users, BarChart3, Shield, Sparkles, TrendingUp, Eye, Bell, FileText, Lock, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import FeatureCard from '@/components/landing/FeatureCard';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden relative">
      {/* Navigation Header */}
      <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              C
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CrowdCount</span>
          </motion.div>
          
          <motion.div 
            className="hidden md:flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/login">
              <motion.button
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                User Login
              </motion.button>
            </Link>
            <Link href="/admin-login">
              <motion.button
                className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md transition-all"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(67, 97, 238, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                Admin Login
              </motion.button>
            </Link>
          </motion.div>
          
          <button className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <Menu size={24} />
          </button>
        </nav>
      </header>

      <div className="bg-gradient-to-b from-gray-50 to-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.2, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 sm:py-24 lg:py-32 relative z-10">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="text-yellow-500" size={20} />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Analytics Platform
              </span>
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-gray-900"
          >
            AI-Powered Crowd Analytics
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 font-normal leading-relaxed max-w-3xl mx-auto"
          >
            Leverage advanced AI to monitor, count, and analyze crowd behavior in real-time. Gain actionable insights to optimize safety, flow, and resource allocation.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(67, 97, 238, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started <ArrowRight size={20} />
              </motion.button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-lg border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
          >
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              whileHover={{ y: -5, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="text-4xl font-bold text-blue-600">99.9%</div>
              <div className="text-sm text-gray-600 mt-2">Accuracy</div>
            </motion.div>
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              whileHover={{ y: -5, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="text-4xl font-bold text-blue-600">Real-time</div>
              <div className="text-sm text-gray-600 mt-2">Processing</div>
            </motion.div>
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              whileHover={{ y: -5, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="text-4xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600 mt-2">Monitoring</div>
            </motion.div>
          </motion.div>
        </motion.div>
        </section>
      </div>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 sm:py-24 lg:py-32 relative z-10 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Core Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need for comprehensive crowd management and analysis.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Users size={48} className="text-blue-600" />}
              title="Real-Time Counting"
              description="Accurately count individuals in any environment, from sparse gatherings to dense crowds, with our cutting-edge AI models."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<BarChart3 size={48} className="text-blue-600" />}
              title="Behavioral Analytics"
              description="Understand crowd dynamics with heatmaps, flow analysis, and density estimation to predict and manage movement."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Bell size={48} className="text-blue-600" />}
              title="Instant Alerts"
              description="Receive automated alerts for overcrowding, unusual activity, or security breaches to enable rapid response."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Video size={48} className="text-blue-600" />}
              title="Multi-Feed Integration"
              description="Seamlessly connect and manage multiple video streams from various sources for comprehensive area coverage."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<FileText size={48} className="text-blue-600" />}
              title="Custom Reports"
              description="Generate detailed, customizable reports with key metrics and data visualizations to inform decision-making."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureCard
              icon={<Lock size={48} className="text-blue-600" />}
              title="Secure & Scalable"
              description="Built on a secure, cloud-native architecture that scales with your needs, ensuring data privacy and reliability."
            />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 sm:py-24 lg:py-32 relative z-10 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Video className="text-white" size={40} />
            </motion.div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">1. Upload Video</h3>
            <p className="text-gray-600">Upload your video footage to our secure platform</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Eye className="text-white" size={40} />
            </motion.div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">2. Define Zones</h3>
            <p className="text-gray-600">Draw zones on your video to monitor specific areas</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <TrendingUp className="text-white" size={40} />
            </motion.div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">3. Get Insights</h3>
            <p className="text-gray-600">Receive real-time analytics and crowd insights</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full mt-auto border-t border-gray-200 bg-white">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-gray-600">
              © 2025 CrowdCount Analytics. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
