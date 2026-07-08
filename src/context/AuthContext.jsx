import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync state with localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Listen for cross-component logout (e.g. from api.js on 401 error)
    const handleAuthChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (!updatedUser) {
        setUser(null);
      } else {
        setUser(JSON.parse(updatedUser));
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const login = async (email, senha) => {
    try {
      const data = await api.auth.login(email, senha);
      // data contains: token, nome, cargo
      localStorage.setItem('token', data.token);
      
      const userData = { nome: data.nome, cargo: data.cargo, email };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (nome, email, senha) => {
    try {
      const data = await api.auth.cadastro(nome, email, senha);
      localStorage.setItem('token', data.token);
      
      const userData = { nome: data.nome, cargo: data.cargo, email };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    return user && user.cargo === 'ADMIN';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
