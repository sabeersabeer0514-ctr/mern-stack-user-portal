import { useState, useEffect } from 'react';

export default function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  // Helper function to get Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 1. Fetch Users List
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
    }
  }, [isLoggedIn]);

  // 2. Auth Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.message || 'Authentication failed');
        return;
      }

      if (isRegistering) {
        alert('Registration successful! Please login.');
        setIsRegistering(false);
        setPassword('');
      } else {
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setAuthError('Server error. Please try again.');
    }
  };

  // 3. User CRUD Handlers
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) return;

    if (editId) {
      await fetch(`/api/users/${editId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, email }),
      });
      setEditId(null);
    } else {
      await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, email }),
      });
    }

    setName('');
    setEmail('');
    fetchUsers();
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setName(user.name);
    setEmail(user.email);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // LOGIN / REGISTER VIEW
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', color: '#111827' }}>
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            {isRegistering ? 'Sign up to access the dashboard' : 'Enter details to login'}
          </p>

          {authError && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {isRegistering && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
              {isRegistering ? 'Sign Up' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <span 
              onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
              style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}
            >
              {isRegistering ? 'Login' : 'Sign Up'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD VIEW
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        
        {/* Header with Logout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#111827', fontSize: '26px', fontWeight: '700', margin: 0 }}>MERN User Portal</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Protected Admin Dashboard</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Logout
          </button>
        </div>

        {/* Input Form */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
            {editId ? '✏️ Edit Existing User' : '➕ Add New Directory User'}
          </h3>
          
          <form onSubmit={handleUserSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: editId ? '#f59e0b' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                {editId ? 'Update Record' : 'Save User'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setName(''); setEmail(''); }} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Search Bar & Directory */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#374151', fontSize: '18px' }}>Directory ({filteredUsers.length})</h3>
            <input 
              type="text"
              placeholder="🔍 Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '220px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{user.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{user.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(user)} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(user._id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0', margin: 0 }}>No matching user records found.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}