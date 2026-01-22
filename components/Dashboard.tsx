
import React, { useState, useEffect } from 'react';
import { User, SalesPlan, SaleRecord, AgentStats } from '../types';
import { USERS } from '../constants';
import DirectorView from './DirectorView';
import AgentStatsView from './AgentStatsView';
import ReportingView from './ReportingView';
import BonusesView from './BonusesView';
import ProfileView from './ProfileView';
import TreasuryView from './TreasuryView';
import PlansView from './PlansView';
import Chat from './Chat';
import { LogOut, LayoutDashboard, Menu, ClipboardList, Gift, User as UserIcon, MessageSquare, Wallet, Target } from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export type AppTab = 'DASHBOARD' | 'REPORTING' | 'BONUSES' | 'PROFILE' | 'CHAT' | 'DIRECTOR_CONTROL' | 'TREASURY' | 'PLANS';

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(
    currentUser.role === 'DIRECTOR' ? 'DIRECTOR_CONTROL' : 'DASHBOARD'
  );
  const [plans, setPlans] = useState<SalesPlan[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>(USERS);

  useEffect(() => {
    const savedPlans = localStorage.getItem('gigo_plans');
    const savedSales = localStorage.getItem('gigo_sales');
    const savedUsers = localStorage.getItem('gigo_users_data');
    
    if (savedPlans) setPlans(JSON.parse(savedPlans));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedUsers) {
      const parsedUsers: User[] = JSON.parse(savedUsers);
      setAllUsers(parsedUsers);
      const updatedMe = parsedUsers.find(u => u.id === currentUser.id);
      if (updatedMe) setCurrentUser(updatedMe);
    }
  }, [currentUser.id]);

  const updatePlans = (newPlans: SalesPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem('gigo_plans', JSON.stringify(newPlans));
  };

  const updateSales = (newSales: SaleRecord[]) => {
    setSales(newSales);
    localStorage.setItem('gigo_sales', JSON.stringify(newSales));
  };

  const updateUserData = (updatedUser: User) => {
    const newAllUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    setAllUsers(newAllUsers);
    localStorage.setItem('gigo_users_data', JSON.stringify(newAllUsers));
    
    if (updatedUser.id === currentUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('gigo_user', JSON.stringify(updatedUser));
    }
  };

  const calculateAgentStats = (agentId: string): AgentStats => {
    const agent = allUsers.find(u => u.id === agentId);
    const agentSales = sales.filter(s => s.agentId === agentId && s.status === 'APPROVED');
    const plan = plans.find(p => p.agentId === agentId && p.isActive);

    const totalSales = agentSales.reduce((acc, s) => acc + s.total, 0);
    const qurtSales = agentSales.reduce((acc, s) => acc + s.qurt, 0);
    const toySales = agentSales.reduce((acc, s) => acc + s.toys, 0);
    const milchofkaSales = agentSales.reduce((acc, s) => acc + s.milchofka, 0);
    const totalDebt = agentSales.reduce((acc, s) => acc + s.debtAmount, 0);

    const target = plan ? plan.totalTarget : 0;
    const progress = target > 0 ? (totalSales / target) * 100 : 0;

    return {
      agentId,
      agentName: agent?.name || 'Noma\'lum',
      totalSales,
      qurtSales,
      toySales,
      milchofkaSales,
      totalDebt,
      progressPercentage: progress,
      targetReached: progress >= 100
    };
  };

  const NavButton = ({ tab, icon: Icon, label }: { tab: AppTab, icon: any, label: string }) => (
    <button 
      onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`fixed md:static inset-y-0 left-0 w-80 bg-slate-900 text-white z-30 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} border-r border-slate-800 flex flex-col`}>
        <div className="p-8 border-b border-slate-800">
          <h1 className="font-black text-3xl tracking-tighter">GIGO TOY</h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-1">{currentUser.role === 'DIRECTOR' ? 'Director Mode' : 'Agent Office'}</p>
        </div>

        <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar">
          {currentUser.role === 'DIRECTOR' ? (
            <>
              <NavButton tab="DIRECTOR_CONTROL" icon={LayoutDashboard} label="Boshqaruv Markazi" />
              <NavButton tab="CHAT" icon={MessageSquare} label="Kompaniya Chati" />
              <NavButton tab="PROFILE" icon={UserIcon} label="Profilim" />
            </>
          ) : (
            <>
              <NavButton tab="DASHBOARD" icon={LayoutDashboard} label="Savdo Tahlili" />
              <NavButton tab="TREASURY" icon={Wallet} label="Xazna & Chiqim" />
              <NavButton tab="PLANS" icon={Target} label="Reja & Maqsadlar" />
              <NavButton tab="BONUSES" icon={Gift} label="Bonus & Mukofotlar" />
              <NavButton tab="REPORTING" icon={ClipboardList} label="Kunlik Hisobot" />
              <NavButton tab="CHAT" icon={MessageSquare} label="Chat" />
              <NavButton tab="PROFILE" icon={UserIcon} label="Profilim" />
            </>
          )}
        </nav>

        <div className="p-5 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
            <LogOut size={18} /> Chiqish
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 md:hidden"><Menu size={20} /></button>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
               {activeTab === 'DASHBOARD' ? 'Mening Statistikam' : 
                activeTab === 'TREASURY' ? 'Moliya va Xazna' : 
                activeTab === 'PLANS' ? 'Rejalar & Maqsadlar' : 
                activeTab === 'BONUSES' ? 'Muvaffaqiyat Cho\'qqisi' : 
                activeTab === 'REPORTING' ? 'Kunlik Hisobot Topshirish' : 
                activeTab === 'PROFILE' ? 'Shaxsiy Ma\'lumotlar' : 
                activeTab === 'CHAT' ? 'Muloqot Xonasi' : 'Direktor Boshqaruv Markazi'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-right">
                <span className="text-sm font-black text-slate-800 block leading-none">{currentUser.name}</span>
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{currentUser.status || 'Status yo\'q'}</span>
             </div>
             <div className="w-12 h-12 bg-indigo-600 text-white rounded-[1.4rem] flex items-center justify-center font-black border border-indigo-700 shadow-xl">{currentUser.name.charAt(0)}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth custom-scrollbar">
          {activeTab === 'DIRECTOR_CONTROL' && currentUser.role === 'DIRECTOR' ? (
            <DirectorView 
              plans={plans} 
              sales={sales} 
              onUpdatePlans={updatePlans} 
              onUpdateSales={updateSales} 
              onUpdateUser={updateUserData}
              calculateStats={calculateAgentStats}
              allUsers={allUsers}
            />
          ) : activeTab === 'TREASURY' ? (
             <TreasuryView user={currentUser} onUpdateUser={updateUserData} />
          ) : activeTab === 'PLANS' ? (
             <PlansView user={currentUser} onUpdateUser={updateUserData} />
          ) : activeTab === 'CHAT' ? (
             <Chat currentUser={currentUser} />
          ) : activeTab === 'DASHBOARD' ? (
            <AgentStatsView calculateStats={() => calculateAgentStats(currentUser.id)} plan={plans.find(p => p.agentId === currentUser.id && p.isActive)} sales={sales.filter(s => s.agentId === currentUser.id)} />
          ) : activeTab === 'BONUSES' ? (
            <BonusesView stats={calculateAgentStats(currentUser.id)} plan={plans.find(p => p.agentId === currentUser.id && p.isActive)} />
          ) : activeTab === 'REPORTING' ? (
            <ReportingView user={currentUser} sales={sales.filter(s => s.agentId === currentUser.id)} onAddSale={(sale) => updateSales([...sales, sale])} onUpdateSale={(updated) => updateSales(sales.map(s => s.id === updated.id ? updated : s))} stats={calculateAgentStats(currentUser.id)} />
          ) : activeTab === 'PROFILE' ? (
            <ProfileView user={currentUser} stats={calculateAgentStats(currentUser.id)} onUpdateProfile={updateUserData} />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
