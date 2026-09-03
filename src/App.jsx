import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  // Auth & UI States
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [serverError, setServerError] = useState('');

  // Editable Profile States
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const API_BASE_URL = "https://mern-stack-user-portal.onrender.com";

  // Load saved session on initial mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setProfilePic(parsed.profilePic || null);
      setFullName(parsed.fullName || 'User');
      setBio(parsed.bio || 'Full-stack MERN enthusiast.');
    }
  }, []);

  // Handle Login & Registration
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');
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
          const userData = { 
            email, 
            token: data.token || 'logged_in', 
            profilePic: null,
            fullName: 'User',
            bio: 'Full-stack MERN enthusiast.'
          };
          setUser(userData);
          setFullName(userData.fullName);
          setBio(userData.bio);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setIsRegister(false);
        }
      } else {
        const errorMsg = data.message || 'Server error. Please try again.';
        setServerError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      const netError = 'Server error. Please try again.';
      setServerError(netError);
      toast.error(netError);
    } finally {
      setLoading(false);
    }
  };

  // Save Edit Profile Details
  const handleSaveProfile = () => {
    const updatedUser = { ...user, fullName, bio };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
    toast.success('Profile details updated!');
  };

  // Profile Picture Upload Handler
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

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProfilePic(null);
    setServerError('');
    setIsEditing(false);
    toast.success('Logged out successfully!');
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-center items-center p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Dark / Light Mode Toggle Button */}
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-6 right-6 p-2.5 rounded-full shadow-sm transition duration-200 ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-600'}`}
      >
        {darkMode ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      <div className={`w-full max-w-md p-8 rounded-2xl shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        {user ? (
          /* User Logged In Screen */
          <div className="flex flex-col items-center space-y-4 w-full text-center">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center ${darkMode ? 'border-indigo-900 bg-gray-700' : 'border-indigo-100 bg-gray-100'}`}>
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
              </div>
              <label 
                htmlFor="profile-upload" 
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {isEditing ? (
              <div className="w-full flex flex-col space-y-3 mt-2 text-left">
                <div>
                  <label className="block text-xs font-bold mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full p-2 text-sm rounded-lg border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Bio</label>
                  <textarea 
                    rows="2"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className={`w-full p-2 text-sm rounded-lg border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <button 
                  onClick={handleSaveProfile}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-lg transition duration-200"
                >
                  Save Profile
                </button>
              </div>
            ) : (
              <div className="w-full space-y-1">
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</p>
                <p className={`text-xs italic mt-2 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>"{bio}"</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
                >
                  Edit Profile Details
                </button>
              </div>
            )}

            <button 
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition duration-200"
            >
              Logout
            </button>
          </div>
        ) : (
          /* Authentication Login / Signup Form */
          <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl font-bold mb-1 text-center">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className={`text-sm mb-5 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {isRegister ? 'Enter details to register' : 'Enter details to login'}
            </p>

            {serverError && (
              <div className="w-full mb-5 py-2.5 px-4 rounded-lg bg-red-100 border border-red-200 text-red-600 text-sm font-medium text-center">
                {serverError}
              </div>
            )}

            <form onSubmit={handleAuth} className="w-full flex flex-col space-y-4">
              <div className="w-full text-left">
                <label className="block text-sm font-bold mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full text-left rounded-lg border p-3 text-sm outline-none transition duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
                  }`}
                  placeholder="user@example.com"
                />
              </div>

              <div className="w-full text-left">
                <label className="block text-sm font-bold mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full text-left rounded-lg border p-3 text-sm outline-none transition duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
                  }`}
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 mt-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition duration-200"
              >
                {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Login')}
              </button>
            </form>

            <div className="mt-6 text-sm text-center">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button 
                onClick={() => {
                  setIsRegister(!isRegister);
                  setServerError('');
                }} 
                className="font-bold text-blue-600 hover:underline"
              >
                {isRegister ? 'Login' : 'Sign Up'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}