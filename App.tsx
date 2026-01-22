
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile, UserRole } from './types';
import Login from './views/Login';
import AdminDashboard from './views/AdminDashboard';
import AgentDashboard from './views/AgentDashboard';

const firebaseConfig = {
  apiKey: "AIzaSyBLcK9KLfL_TIFwT_o7_eE4Gu-8DLnxWRQ",
  authDomain: "gigotoys-5468e.firebaseapp.com",
  projectId: "gigotoys-5468e",
  storageBucket: "gigotoys-5468e.firebasestorage.app",
  messagingSenderId: "600078721224",
  appId: "1:600078721224:web:210d3278974edf4f54c5fd",
  measurementId: "G-QELMWWJD5Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Role mapping simulator for demo persistence
const MOCK_ROLES: Record<string, any> = {
  'elyor@gmail.com': { name: 'Elyor aka', role: UserRole.ADMIN },
  'aziza@gmail.com': { name: 'Aziza', role: UserRole.AGENT },
  'muxlisa@gmail.com': { name: 'Muxlisa', role: UserRole.AGENT },
  'ruxshona@gmail.com': { name: 'Ruxshona', role: UserRole.AGENT },
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUser(userSnap.data() as UserProfile);
          } else {
            // If user doesn't exist in Firestore yet (first login in demo), create from mock
            const mockData = MOCK_ROLES[firebaseUser.email || ''];
            if (mockData) {
              const newProfile: UserProfile = {
                id: firebaseUser.uid,
                name: mockData.name,
                email: firebaseUser.email || '',
                role: mockData.role,
                active: true,
                createdAt: Date.now()
              };
              await setDoc(userRef, newProfile);
              setUser(newProfile);
            } else {
              setAuthError("Sizning profilingiz tizimda ruxsat etilmagan.");
              setUser(null);
            }
          }
        } catch (err) {
          console.error("User fetch error:", err);
          setAuthError("Ma'lumotlarni yuklashda xatolik.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setAuthError("Email yoki parol noto'g'ri.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">GIGO TOYS • Bog'lanmoqda</p>
      </div>
    </div>
  );

  if (!user) return <Login onLogin={handleLogin} error={authError} />;

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 selection:bg-indigo-100 font-sans">
      <header className="bg-white/80 backdrop-blur-2xl sticky top-0 z-[100] border-b border-slate-100 shadow-sm shadow-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100 group-hover:rotate-3 transition-transform">G</div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">GIGO TOYS</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Savdo Boshqaruv Tizimi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-black text-slate-800">{user.name}</p>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full animate-pulse ${user.role === UserRole.ADMIN ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${user.role === UserRole.ADMIN ? 'text-indigo-600' : 'text-emerald-600'}`}>
                  {user.role === UserRole.ADMIN ? 'Direktor (Admin)' : 'Savdo Agenti'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="w-12 h-12 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all border border-slate-100 hover:border-red-100 group shadow-sm"
              title="Tizimdan chiqish"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 min-h-[calc(100vh-80px-100px)]">
        {user.role === UserRole.ADMIN ? (
          <AdminDashboard currentUser={user} />
        ) : (
          <AgentDashboard currentUser={user} />
        )}
      </main>

      <footer className="py-12 border-t border-slate-100 text-center bg-white/50">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">G</div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">GIGO TOYS • Real-time Cloud Platform</p>
        </div>
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Barcha huquqlar himoyalangan © 2024</p>
      </footer>
    </div>
  );
};

export default App;
