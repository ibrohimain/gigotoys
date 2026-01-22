
import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Package, 
  Home, 
  FileText, 
  BarChart3, 
  Trophy, 
  Wallet, 
  MessageCircle, 
  User as UserIcon,
  CheckSquare,
  Flag,
  Banknote,
  Calculator,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';

interface LayoutProps {
  user: UserProfile;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDirector = user.role === UserRole.DIRECTOR;

  const agentNavItems = [
    { id: 'home', label: 'Bosh sahifa', icon: <Home size={18} /> },
    { id: 'reports', label: 'Xisobotlar', icon: <FileText size={18} /> },
    { id: 'stats', label: 'Statistika', icon: <BarChart3 size={18} /> },
    { id: 'plans', label: 'Rejalar', icon: <CheckSquare size={18} /> },
    { id: 'goals', label: 'Maqsadlar', icon: <Flag size={18} /> },
    { id: 'bonuses', label: 'Bonuslar', icon: <Trophy size={18} /> },
    { id: 'wallet', label: 'Xamyon', icon: <Wallet size={18} /> },
    { id: 'salary', label: 'Oylik (Ish haqi)', icon: <Banknote size={18} /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={18} /> },
    { id: 'profile', label: 'Profil', icon: <UserIcon size={18} /> },
  ];

  const directorNavItems = [
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'agents', label: 'Agentlar Analitikasi', icon: <Users size={18} /> },
    { id: 'payroll', label: 'Maoshlar (Payroll)', icon: <Calculator size={18} /> },
    { id: 'warehouse', label: 'Omborxona', icon: <Package size={18} /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={18} /> },
    { id: 'profile', label: 'Profil', icon: <UserIcon size={18} /> },
  ];

  const navItems = isDirector ? directorNavItems : agentNavItems;

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 overflow-x-hidden">
      {/* Mobile Menu Overlay / Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop fixed, Mobile sliding */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-[100] h-screen bg-indigo-950 text-white flex-shrink-0 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px] lg:translate-x-0 lg:w-72'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div>
            <h1 className="brand-font text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <div className="bg-indigo-500 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <Package size={20} />
              </div>
              GIGO TOYS
            </h1>
            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3 ml-1">Elyor Saydullayev</p>
          </div>
          <button 
            className="lg:hidden p-2 text-indigo-300 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-10">
          <p className="px-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 mt-2">Asosiy Menyular</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                  : 'text-indigo-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`${activeTab === item.id ? 'text-white' : 'text-indigo-400 group-hover:text-white'} transition-colors`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-indigo-950/50 backdrop-blur-sm">
          <div 
            className="flex items-center gap-4 mb-6 p-2 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer" 
            onClick={() => handleTabSelect('profile')}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-50 group-hover:text-indigo-900 transition-all shrink-0">
              {user.displayName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-white truncate">{user.displayName}</p>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-3 text-indigo-300 hover:text-rose-400 transition-all w-full py-4 rounded-2xl border border-white/5 hover:bg-rose-500/10 font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header / Desktop Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>
            <div>
              <h2 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {navItems.find(n => n.id === activeTab)?.label || 'Boshqaruv Paneli'}
              </h2>
              <p className="hidden xs:block text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                GIGO TOYS • {isDirector ? 'Rahbar' : 'Agent'} Rejimi
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
               <p className="text-sm font-black text-slate-700">
                 {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
               </p>
               <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date().toLocaleDateString('uz-UZ', { weekday: 'long' })}</p>
            </div>
            {/* Small avatar as home button in mobile header */}
            <button 
              onClick={() => handleTabSelect('profile')}
              className="lg:hidden w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs"
            >
              {user.displayName.charAt(0)}
            </button>
          </div>
        </header>

        {/* Content Section */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-10 bg-slate-50/50 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Layout;
