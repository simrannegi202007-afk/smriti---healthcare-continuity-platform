import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import i18n from '../i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smriti_token'));
  const [loading, setLoading] = useState(true);
  const [simpleMode, setSimpleMode] = useState(true);
  const [fontSize, setFontSize] = useState('md'); // 'sm' | 'md' | 'lg'
  
  // Default language is English as requested, remember user's choice in localStorage
  const [language, setLanguage] = useState(localStorage.getItem('smriti_language') || 'en');

  // Apply font size class to html root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    root.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  // Synchronize language with i18n and persist in localStorage
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('smriti_language', lang);
    i18n.changeLanguage(lang);
    if (user?.id) {
      api.updateSettings({ language: lang }).catch(() => {});
    }
  };

  // Check current session or auto-login with demo user for seamless demonstration
  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = localStorage.getItem('smriti_token');
        const activeLang = localStorage.getItem('smriti_language') || 'en';

        if (storedToken) {
          const res = await api.getMe();
          setUser(res.user);
          setProfile(res.user.profile);
          if (res.user.settings?.font_size) setFontSize(res.user.settings.font_size);
          if (res.user.settings?.simple_mode !== undefined) setSimpleMode(res.user.settings.simple_mode);
          changeLanguage(activeLang);
        } else {
          // Auto-login with Demo Patient Mrs. Sunita Sharma (62 yrs, Maharashtra)
          const loginRes = await api.login({ contact: '9820098200', password: 'password123' });
          localStorage.setItem('smriti_token', loginRes.token);
          setToken(loginRes.token);
          setUser(loginRes.user);
          setProfile(loginRes.user.profile);
          if (loginRes.user.settings?.font_size) setFontSize(loginRes.user.settings.font_size);
          if (loginRes.user.settings?.simple_mode !== undefined) setSimpleMode(loginRes.user.settings.simple_mode);
          changeLanguage(activeLang);
        }
      } catch (err) {
        console.warn('Initial session check notice:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (contact, password) => {
    const res = await api.login({ contact, password });
    localStorage.setItem('smriti_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setProfile(res.user.profile);
    const activeLang = localStorage.getItem('smriti_language') || res.user.language || 'en';
    changeLanguage(activeLang);
    return res;
  };

  const register = async (data) => {
    const res = await api.register(data);
    localStorage.setItem('smriti_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setProfile(res.user.profile);
    const activeLang = localStorage.getItem('smriti_language') || data.language || 'en';
    changeLanguage(activeLang);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('smriti_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const toggleSimpleMode = () => {
    setSimpleMode(prev => {
      const next = !prev;
      api.updateSettings({ settings: { simple_mode: next } }).catch(() => {});
      return next;
    });
  };

  const updateFontSize = (size) => {
    setFontSize(size);
    api.updateSettings({ settings: { font_size: size } }).catch(() => {});
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
      setProfile(res.user.profile);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      token,
      isLoggedIn: !!token && !!user,
      loading,
      simpleMode,
      fontSize,
      language,
      login,
      register,
      logout,
      toggleSimpleMode,
      updateFontSize,
      changeLanguage,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
