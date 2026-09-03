import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Loader2, LogOut, Camera, User, Sun, Moon } from 'lucide-react';

export default function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const API_BASE_URL = "https://mern-stack-user-portal.onrender.com";

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setProfilePic(parsed.profilePic || null);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const loadingToast = toast.loading(isRegister ? 'Creating account...' : 'Connecting to server...');

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success(isRegister ? 'Account created! Please Sign In 🎉' : 'Welcome back! Login Successful 🎉');
        if (!isRegister) {
          const userData = { email, token: data.token || 'logged_in', profilePic: null };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setIsRegister(false);
        }
      } else {
        toast.error(data.message || 'Authentication failed!');
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
    <div className={`min-h-screen w-full flex flex-col justify-center items-center text-center p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Dark / Light Mode Switcher */}
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-6 right-6 p-2.5 rounded-full shadow-md transition duration-200 ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className={`w-full max-w-md p-8 rounded-xl shadow-lg border flex flex-col items-center transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        {user ? (
          /* Profile Dashboard */
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center ${darkMode ? 'border-indigo-900 bg-gray-700' : 'border-indigo-100 bg-gray-100'}`}>
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className={`w-12 h-12 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
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

            <h2 className="text-2xl font-bold">User Profile</h2>
            <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</p>
            
            <button 
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        ) : (
          /* Auth Form */
          <>
            <h2 className="text-2xl font-bold mb-2">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {isRegister ? 'Sign up to get started' : 'Enter your credentials to access your account'}
            </p>
            
            <form onSubmit={handleAuth} className="w-full flex flex-col items-center space-y-4">
              <div className="w-full text-center">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full text-center rounded-lg border p-2.5 shadow-sm outline-none transition duration-200 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' : 'bg-white border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                  placeholder="name@company.com"
                />
              </div>

              <div className="w-full text-center">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full text-center rounded-lg border p-2.5 shadow-sm outline-none transition duration-200 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' : 'bg-white border-gray-300 text-gray-800 focus:border-indigo-500'}`}
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                  </span>
                ) : (
                  isRegister ? 'Sign Up' : 'Sign In'
                )}
              </button>
            </form>

            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className={`mt-4 text-xs font-medium hover:underline ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}