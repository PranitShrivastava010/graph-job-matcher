import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, skillAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [demoProfiles, setDemoProfiles] = useState([]);

  useEffect(() => {
    // Load available demo profiles for 1-click evaluator access
    authAPI.getDemoProfiles()
      .then(res => setDemoProfiles(res.data.demoUsers || []))
      .catch(err => console.error('Could not load demo profiles:', err));

    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const loginAsDemo = async (email) => {
    return login(email, 'Password123!');
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserSkills = async (newSkills) => {
    await skillAPI.updateUserSkills(newSkills);
    const meRes = await authAPI.getMe();
    setUser(meRes.data.user);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      demoProfiles,
      login,
      loginAsDemo,
      register,
      logout,
      updateUserSkills,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
