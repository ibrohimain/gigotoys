
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { UserRole, UserProfile } from './types';
import LoginForm from './components/LoginForm';
import DirectorDashboard from './components/DirectorDashboard';
import AgentDashboard from './components/AgentDashboard';
import Navbar from './components/Navbar';
import { Loader2 } from 'lucide-react';

const USERS_MAP: Record<string, UserProfile> = {
  'elyor@gmail.com': { email: 'elyor@gmail.com', name: 'Elyor (Direktor)', role: UserRole.DIRECTOR },
  'ruxshona@gmail.com': { email: 'ruxshona@gmail.com', name: 'Ruxshona', role: UserRole.AGENT },
  'muxlisa@gmail.com': { email: 'muxlisa@gmail.com', name: 'Muxlisa', role: UserRole.AGENT },
  'aziza@gmail.com': { email: 'aziza@gmail.com', name: 'Aziza', role: UserRole.AGENT },
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        setProfile(USERS_MAP[currentUser.email.toLowerCase()] || null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar profile={profile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {profile.role === UserRole.DIRECTOR ? (
          <DirectorDashboard profile={profile} />
        ) : (
          <AgentDashboard profile={profile} />
        )}
      </main>
    </div>
  );
};

export default App;
