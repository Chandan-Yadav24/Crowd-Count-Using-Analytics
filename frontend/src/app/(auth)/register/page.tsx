'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.register(formData.username, formData.email, formData.password);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-gray-50">
      <main className="flex min-h-screen w-full items-center justify-center">
        <div className="flex w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
          {/* Left Side - Branding */}
          <div className="relative hidden w-2/5 flex-col items-start justify-end bg-slate-900 p-12 lg:flex">
            <div className="absolute inset-0 z-0">
              <div 
                className="h-full w-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDV7Cy7vDwU-nssR2HMjIQ2N5xE4zspvT2J0RVLh3WpGxOq-GXRDC9a17gtk66HbM-Y__UqJmRpcApyzzBVEFcKeXO2rKP4To9dXqhgbuGcTCMhLqOfpxS4K2_4CwJe4RyGKKIN-Hz4SykBF3V7d3JlDAbhB_A_I7eABR3i2LqLjZ_PJ9JaarAnuMZMdkVFrz0oIhzhu27UalIIu2LYWEXhWO_LaroWvn3_MYsX77pTAErMmTo6JcBQ4a_pj959TN8uFksnP1tEYHs')"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-blue-900/80 to-blue-500/70" />
            </div>
            <div className="z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Users className="text-white" size={36} />
                <p className="text-2xl font-bold text-white">CrowdCount</p>
              </div>
              <h1 className="text-3xl font-black leading-tight text-white">Intelligent Crowd Insights</h1>
              <p className="text-base font-normal text-white/80">Unlock powerful analytics and manage crowds with precision and ease.</p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex w-full flex-col items-center justify-center bg-white p-8 sm:p-12 lg:w-3/5">
            <div className="flex w-full max-w-md flex-col gap-8">
              <motion.div 
                className="flex flex-col gap-2 text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-gray-900 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                  Get Started
                </h2>
                <p className="text-gray-600 text-base font-normal leading-normal">
                  Enter your details to create a new account.
                </p>
              </motion.div>

              <motion.form 
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {/* Username Field */}
                <label className="flex flex-col w-full">
                  <p className="text-gray-900 text-base font-medium leading-normal pb-2">Username</p>
                  <div className="relative flex w-full items-center">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter your username"
                      className="flex w-full h-12 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 p-3 pl-11 text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      required
                    />
                    <User className="absolute left-3 text-gray-400" size={20} />
                  </div>
                </label>

                {/* Email Field */}
                <label className="flex flex-col w-full">
                  <p className="text-gray-900 text-base font-medium leading-normal pb-2">Email</p>
                  <div className="relative flex w-full items-center">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email address"
                      className="flex w-full h-12 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 p-3 pl-11 text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      required
                    />
                    <Mail className="absolute left-3 text-gray-400" size={20} />
                  </div>
                </label>

                {/* Password Field */}
                <label className="flex flex-col w-full">
                  <p className="text-gray-900 text-base font-medium leading-normal pb-2">Password</p>
                  <div className="relative flex w-full items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="flex w-full h-12 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 p-3 pl-11 pr-11 text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      required
                    />
                    <Lock className="absolute left-3 text-gray-400" size={20} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </label>

                {/* Confirm Password Field */}
                <label className="flex flex-col w-full">
                  <p className="text-gray-900 text-base font-medium leading-normal pb-2">Confirm Password</p>
                  <div className="relative flex w-full items-center">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-enter your password"
                      className="flex w-full h-12 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 p-3 pl-11 pr-11 text-base font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      required
                    />
                    <Lock className="absolute left-3 text-gray-400" size={20} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {error && error === 'Passwords do not match' && (
                    <p className="text-red-600 text-sm font-normal mt-1">Passwords do not match.</p>
                  )}
                </label>

                {/* Error Message */}
                {error && error !== 'Passwords do not match' && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Register Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!loading ? { y: -2 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </motion.button>
              </motion.form>

              <p className="text-center text-sm font-normal text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
