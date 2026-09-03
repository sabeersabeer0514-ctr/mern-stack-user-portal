import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Loader2, LogOut, UserCheck, Camera, User } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  const API_BASE_URL = "https://mern-stack-user-portal.onrender.com";

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setProfilePic(parsed.profilePic || null);
    }
  }, []);

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
        const userData = { email, token: data.token || 'logged_in', profilePic: null };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        const updatedUser = { ...user, profilePic: reader.result };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProfilePic(null);
    toast.success('Logged out successfully!');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50 text-center p-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
        {user ? (
          // Logged-in Dashboard with Profile Image Upload
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 bg-gray-100 flex items-center justify-center">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label 
                htmlFor="profile-upload" 
                className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full cursor-pointer shadow-md transition duration-200"
              >
                <Camera className="w-4 h-4" />
                <input 
                  id="profile-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
            </div>

            <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
            <p className="text-gray-600 font-medium">{user.email}</p>
            
            <button 
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        ) : (
          // Center-aligned Login Form
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your credentials to access your account</p>
            
            <form onSubmit={handleLogin} className="w-full flex flex-col items-center space-y-4">
              <div className="w-full text-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-center rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="name@company.com"
                />
              </div>

              <div className="w-full text-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-center rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 mt-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition duration-200"
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
          </>
        )}
      </div>
    </div>
  );
}