'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function TestConnection() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setStatus('Testing backend connection...');

    try {
      const response = await fetch('http://127.0.0.1:8000/');
      const data = await response.json();
      
      if (response.ok) {
        setStatus(`✓ Backend Connected: ${data.message}`);
      } else {
        setStatus('✗ Backend responded with error');
      }
    } catch (error) {
      setStatus('✗ Cannot connect to backend. Make sure it\'s running on port 8000');
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setStatus('Testing login endpoint...');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'test123' }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        setStatus(`✓ Login Successful! Role: ${data.role}`);
      } else {
        setStatus(`✗ Login Failed: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      setStatus('✗ Login test failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Backend Connection Test</h1>
        
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-700 mb-2">Backend URL:</h2>
            <code className="text-sm text-blue-600">http://127.0.0.1:8000</code>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-700 mb-2">Test Credentials:</h2>
            <code className="text-sm text-blue-600">Username: testuser | Password: test123</code>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <Button onClick={testBackend} disabled={loading} fullWidth>
            Test Backend Connection
          </Button>
          
          <Button onClick={testLogin} disabled={loading} fullWidth variant="secondary">
            Test Login Endpoint
          </Button>
        </div>

        {status && (
          <div className={`p-4 rounded-lg ${
            status.startsWith('✓') 
              ? 'bg-green-500/20 border border-green-500 text-green-700' 
              : status.startsWith('✗')
              ? 'bg-red-500/20 border border-red-500 text-red-700'
              : 'bg-blue-500/20 border border-blue-500 text-blue-700'
          }`}>
            {status}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Setup Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Ensure MySQL is running with crowd_db database</li>
            <li>Start backend: <code className="bg-gray-100 px-2 py-1 rounded">uvicorn backend.main:app --reload</code></li>
            <li>Run test script: <code className="bg-gray-100 px-2 py-1 rounded">python test_backend.py</code></li>
            <li>Test connection using buttons above</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
