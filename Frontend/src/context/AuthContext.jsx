import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('kca_token');
    const savedUser = localStorage.getItem('kca_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (loginId, password) => {
    try {
      const { data } = await API.post('/auth/login', { loginId, password });
      const { token: newToken, ...userData } = data.user;
      const redirectTo = userData.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      
      localStorage.setItem('kca_token', newToken);
      localStorage.setItem('kca_user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true, data, redirectTo };
    } catch (error) {
      // Axios network errors (e.g. ERR_CONNECTION_REFUSED) do not include response data
      if (!error.response) {
        return {
          success: false,
          message: 'Cannot reach backend at http://localhost:5000. Start backend server and ensure MongoDB is connected.'
        };
      }

      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  // Refresh user data from the server (call after profile updates etc.)
  const refreshUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      localStorage.setItem('kca_user', JSON.stringify(data));
      setUser(data);
    } catch {
      // Silent fail — user just sees stale data
    }
  };

  const logout = () => {
    localStorage.removeItem('kca_token');
    localStorage.removeItem('kca_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
