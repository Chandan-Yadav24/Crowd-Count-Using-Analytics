'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trash2, UserPlus, LayoutDashboard, Users, BarChart, Settings as SettingsIcon, LogOut, Search, Edit, ChevronLeft, ChevronRight, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';
import { api } from '@/lib/api';
import { User } from '@/types';

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const user = localStorage.getItem('username');

    if (!token || (userRole !== 'admin' && userRole !== 'superadmin')) {
      router.push('/admin-login');
      return;
    }

    setAdminUsername(user || 'Admin');
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      const data = await api.listUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      await api.addUser(formData.username, formData.email, formData.password, formData.role);
      setFormData({ username: '', email: '', password: '', role: 'user' });
      setConfirmPassword('');
      setShowAddForm(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.deleteUser(userToDelete.username);
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
      setShowDeleteModal(false);
    }
  };

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
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-600"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <Users size={20} className="text-blue-600" />
              <p className="text-blue-600 text-sm font-medium">User Management</p>
            </motion.button>
            <motion.button
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <BarChart size={20} className="text-gray-800" />
              <p className="text-gray-800 text-sm font-medium">Crowd Data</p>
            </motion.button>
            <motion.button
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              whileHover={{ x: 4 }}
              suppressHydrationWarning
            >
              <SettingsIcon size={20} className="text-gray-800" />
              <p className="text-gray-800 text-sm font-medium">Settings</p>
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
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h1 className="text-gray-900 text-4xl font-black tracking-tight">User Management</h1>
            <motion.button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              suppressHydrationWarning
            >
              <UserPlus size={18} />
              <span>Add New User</span>
            </motion.button>
          </div>

          {/* Add User Form */}
          {showAddForm && (
            <motion.div
              className="bg-white rounded-xl border border-gray-200 p-8 mb-6 max-w-3xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">Add New User</h3>
                <p className="text-gray-500 text-base mt-1">Create a profile for a new user or administrator.</p>
              </div>
              
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name (Username) */}
                <div className="md:col-span-2">
                  <label className="flex flex-col w-full">
                    <p className="text-gray-900 text-sm font-medium pb-2">Full Name</p>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </label>
                </div>

                {/* Email Address */}
                <div className="md:col-span-2">
                  <label className="flex flex-col w-full">
                    <p className="text-gray-900 text-sm font-medium pb-2">Email Address</p>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </label>
                </div>

                {/* Password */}
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-gray-900 text-sm font-medium pb-2">Password</p>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimum 8 characters"
                        className="w-full h-12 px-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </label>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-gray-900 text-sm font-medium pb-2">Confirm Password</p>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full h-12 px-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </label>
                </div>

                {/* Role Selection */}
                <div className="md:col-span-2">
                  <label className="flex flex-col w-full">
                    <p className="text-gray-900 text-sm font-medium pb-2">Role</p>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="user">Standard User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="md:col-span-2">
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      {error}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ username: '', email: '', password: '', role: 'user' });
                      setConfirmPassword('');
                      setError('');
                    }}
                    className="px-6 py-2.5 text-sm font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add User
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex items-center h-12 w-full max-w-md">
              <div className="flex items-center justify-center pl-4 bg-white border border-gray-300 border-r-0 rounded-l-lg h-full">
                <Search className="text-gray-500" size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="flex-1 h-full px-4 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 text-xs font-medium uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 text-xs font-medium uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 text-xs font-medium uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <td className="px-4 py-3 text-gray-900 text-sm font-medium">{user.username}</td>
                        <td className="px-4 py-3 text-gray-500 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-gray-500 text-sm capitalize">{user.role}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-800 transition-colors">
                              <Edit size={18} />
                            </button>
                            {user.username !== 'superadmin' && (
                              <button
                                onClick={() => {
                                  setUserToDelete(user);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-800">{filteredUsers.length}</span> of <span className="font-medium text-gray-800">{users.length}</span> results
            </p>
            <nav className="flex items-center gap-2">
              <button className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="flex items-center justify-center h-8 w-8 rounded-lg text-sm font-medium bg-blue-600 text-white" suppressHydrationWarning>1</button>
              <button className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100" suppressHydrationWarning>
                <ChevronRight size={18} />
              </button>
            </nav>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <motion.div 
            className="relative flex flex-col w-full max-w-md bg-white rounded-xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowDeleteModal(false);
                setUserToDelete(null);
              }}
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
                <p className="text-sm font-medium text-gray-500">{userToDelete.username}</p>
                <p className="text-sm text-gray-700">{userToDelete.email}</p>
              </div>

              {/* Button Group */}
              <div className="flex w-full flex-col sm:flex-row-reverse gap-3 pt-4">
                <button 
                  onClick={handleDeleteUser}
                  className="flex min-w-[84px] flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-red-600 text-white text-sm font-bold leading-normal tracking-wide hover:bg-red-700 focus:ring-4 focus:ring-red-300"
                >
                  <span className="truncate">Yes, Delete</span>
                </button>
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
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
