
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { USERS } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('gigo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (email: string) => {
    const foundUser = USERS.find(u => u.email === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('gigo_user', JSON.stringify(foundUser));
    } else {
      alert('Email topilmadi. Iltimos tekshirib qaytadan urinib ko\'ring.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gigo_user');
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-indigo-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
