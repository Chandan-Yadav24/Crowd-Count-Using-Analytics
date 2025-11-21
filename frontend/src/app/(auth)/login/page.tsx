'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', formData.username);
        router.push('/user');
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-gray-50">
      <div className="flex flex-1 justify-center items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Left Side - Image */}
            <div 
              className="hidden lg:flex w-full bg-center bg-no-repeat bg-cover aspect-auto"
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDoubnKIQFWn7I125aNUGrlYXiyqUmNZ60pG4Ib5AB5xfqRIlHR99kssCPgNvPFQG5zVJ_fzXzUhBs0ySX0m-uXfqlFaJwlIbG62Y5Zp7QiKpGliACqfnjNG1LOI9S2XjmceMg-1WA8sXn9fRc8_N8v3wZeWCvNFcNkItH82ouFypDIj3DJzP3WmXhNY6tn60trbMFkd-TBYAAw49a9DlzBChQ5ewxw1X9hXkK5nd1HRsmpNofZp4DIKMkF6E7_7IhEFI4HIt47TEY")'
              }}
            />

            {/* Right Side - Form */}
            <div className="flex flex-col justify-center p-8 sm:p-12 md:p-16 bg-white">
              <div className="w-full max-w-md mx-auto">
                <motion.div 
                  className="flex flex-col gap-3 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-gray-900 text-4xl font-black leading-tight tracking-tight">
                    Sign in to your account
                  </h1>
                  <p className="text-gray-600 text-base font-normal leading-normal">
                    Welcome back! Please enter your details.
                  </p>
                </motion.div>

                <motion.form 
                  onSubmit={handleSubmit} 
                  className="flex flex-col gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {/* Email/Username Field */}
                  <label className="flex flex-col">
                    <p className="text-gray-900 text-base font-medium leading-normal pb-2">
                      Email Address
                    </p>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Enter your email"
                        className="w-full h-14 pl-12 pr-4 py-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-base"
                        required
                      />
                    </div>
                  </label>

                  {/* Password Field */}
                  <label className="flex flex-col">
                    <p className="text-gray-900 text-base font-medium leading-normal pb-2">
                      Password
                    </p>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter your password"
                        className="w-full h-14 pl-12 pr-4 py-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-base"
                        required
                      />
                    </div>
                  </label>

                  {/* Forgot Password */}
                  <p className="text-blue-600 text-sm font-medium leading-normal self-end underline cursor-pointer hover:text-blue-700 transition-colors">
                    Forgot Password?
                  </p>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Login Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-full h-16 px-8 rounded-xl bg-blue-600 text-white text-lg font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/50 transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!loading ? { y: -4 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </motion.button>

                  {/* Register Link */}
                  <p className="text-center text-gray-600 text-sm font-normal">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-semibold text-blue-600 underline hover:text-blue-700 transition-colors">
                      Register Now
                    </Link>
                  </p>
                </motion.form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
