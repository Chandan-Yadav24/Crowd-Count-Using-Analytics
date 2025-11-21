'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface LoginFormProps {
  redirectTo: string;
  requireAdmin?: boolean;
}

export default function LoginForm({ redirectTo, requireAdmin = false }: LoginFormProps) {
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
        if (requireAdmin && data.role !== 'admin' && data.role !== 'superadmin') {
          setError('Access denied. Admin credentials required.');
          return;
        }

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', formData.username);
        router.push(redirectTo);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Username"
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        required
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} fullWidth>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
