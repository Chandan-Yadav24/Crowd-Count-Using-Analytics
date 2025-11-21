'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Settings, Video, LogOut, Edit, Lock, Trash2, Save, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function AccountSettings() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('username');
    const email = localStorage.getItem('email') || `${user}@example.com`;
    if (!token) {
      router.push('/login');
      return;
    }
    setUsername(user || '');
    setNewUsername(user || '');
    setUserEmail(email);
  }, [router]);

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.changeUsername(username, newUsername);
      localStorage.setItem('username', newUsername);
      setUsername(newUsername);
      setSuccess('Username updated successfully');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await api.changePassword(username, oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount(username);
      localStorage.clear();
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-bold text-gray-900">User Dashboard</h1>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.button
                onClick={() => router.push('/user')}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </motion.button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-6">
              <motion.button
                className="group inline-flex items-center py-4 px-1 border-b-2 font-semibold text-sm text-blue-600 border-blue-600"
                whileHover={{ y: -2 }}
              >
                <Settings className="mr-2" size={20} />
                <span>Account Settings</span>
              </motion.button>
              <motion.button
                onClick={() => router.push('/user/videos')}
                className="group inline-flex items-center py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
                whileHover={{ y: -2 }}
              >
                <Video className="mr-2" size={20} />
                <span>Feed Management</span>
              </motion.button>
              <motion.button
                onClick={() => {
                  localStorage.clear();
                  router.push('/');
                }}
                className="group inline-flex items-center py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
                whileHover={{ y: -2 }}
              >
                <LogOut className="mr-2" size={20} />
                <span>Logout</span>
              </motion.button>
            </nav>
          </div>

          {/* Page Title */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Manage Your Account</h2>
            <p className="mt-2 text-gray-600">Update profile details, reset credentials, or close your account.</p>
          </motion.div>

          {/* Alerts */}
          {error && (
            <motion.div 
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {success}
            </motion.div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Change Username Card */}
            <motion.div 
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg text-blue-600">
                    <Edit size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Change Username</h3>
                    <p className="text-sm text-gray-600">Pick a fresh display name for your account.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={handleChangeUsername} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                      className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder:text-gray-400"
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-right rounded-b-lg">
                <motion.button
                  onClick={handleChangeUsername}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="mr-2" size={18} />
                  Save New Username
                </motion.button>
              </div>
            </motion.div>

            {/* Change Password Card */}
            <motion.div 
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg text-blue-600">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-600">Use a strong password containing letters, numbers, and symbols.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Old Password</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder:text-gray-400 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder:text-gray-400 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-right rounded-b-lg">
                <motion.button
                  onClick={handleChangePassword}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Lock className="mr-2" size={18} />
                  Update Password
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Delete Account Section */}
          <motion.div 
            className="mt-12 bg-transparent border border-red-300 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg text-red-600">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Account (Permanent)</h3>
                  <p className="text-sm text-gray-600">Once you delete your account, there is no going back. Please be certain.</p>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      type="checkbox"
                      checked={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600 bg-gray-100"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label className="font-medium text-gray-900">I understand this will permanently delete my account.</label>
                    <p className="text-gray-600">This action cannot be undone. All your data will be removed.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end rounded-b-lg">
              <motion.button
                onClick={() => setShowDeleteModal(true)}
                disabled={!deleteConfirm}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                whileHover={deleteConfirm ? { scale: 1.05 } : {}}
                whileTap={deleteConfirm ? { scale: 0.95 } : {}}
              >
                Delete My Account
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <motion.div 
            className="relative flex flex-col w-full max-w-md bg-white rounded-xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-transparent text-gray-500 hover:bg-gray-100"
            >
              <X size={24} />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col items-center p-6 sm:p-8 text-center">
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                <AlertTriangle size={28} />
              </div>

              {/* Headline */}
              <h1 className="text-gray-900 tracking-tight text-2xl font-bold leading-tight pb-2">
                Delete User?
              </h1>

              {/* Body Text */}
              <p className="text-gray-600 text-base font-normal leading-normal pb-4">
                Are you sure you want to permanently delete this user? This action cannot be undone.
              </p>

              {/* User Identifier */}
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
                <p className="text-sm font-medium text-gray-500">{username}</p>
                <p className="text-sm text-gray-700">{userEmail}</p>
              </div>

              {/* Button Group */}
              <div className="flex w-full flex-col sm:flex-row-reverse gap-3 pt-4">
                <button 
                  onClick={handleDeleteAccount}
                  className="flex min-w-[84px] flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-red-600 text-white text-sm font-bold leading-normal tracking-wide hover:bg-red-700 focus:ring-4 focus:ring-red-300"
                >
                  <span className="truncate">Yes, Delete</span>
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex min-w-[84px] flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 text-gray-900 text-sm font-bold leading-normal tracking-wide hover:bg-gray-300 focus:ring-4 focus:ring-gray-500/20"
                >
                  <span className="truncate">Cancel</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
