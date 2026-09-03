import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "https://mern-stack-user-portal.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Connecting to server...');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success('Welcome back! Login Successful 🎉');
      } else {
        toast.error(data.message || 'Login failed!');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Network error! Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}