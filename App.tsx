
import React, { useState } from 'react';
import { User, SaleReport, AgentPlan, REWARD_THRESHOLDS } from './types';
import LoginForm from './components/LoginForm';
import DirectorDashboard from './components/DirectorDashboard';
import AgentPanel from './components/AgentPanel';
import Navbar from './components/Navbar';

const INITIAL_PLANS: AgentPlan[] = [
  { 
    agentId: 'muxlisa', 
    totalTarget: 500000000, 
    currentTotal: 0, 
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
  },
  { 
    agentId: 'aziza', 
    totalTarget: 500000000, 
    currentTotal: 0, 
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
  },
  { 
    agentId: 'ruxshona', 
    totalTarget: 500000000, 
    currentTotal: 0, 
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
  },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<SaleReport[]>([]);
  const [plans, setPlans] = useState<AgentPlan[]>(INITIAL_PLANS);

  const handleLogin = (email: string) => {
    let loggedUser: User;
    if (email === 'elyor@gmail.com') {
      loggedUser = { id: 'elyor', email, name: 'Elyor (Director)', role: 'director' };
    } else if (email === 'muxlisa@gigo.com') {
      loggedUser = { id: 'muxlisa', email, name: 'Muxlisa', role: 'agent' };
    } else if (email === 'aziza@gigo.com') {
      loggedUser = { id: 'aziza', email, name: 'Aziza', role: 'agent' };
    } else if (email === 'ruxshona@gigo.com') {
      loggedUser = { id: 'ruxshona', email, name: 'Ruxshona', role: 'agent' };
    } else {
      alert('Login xato!');
      return;
    }
    setUser(loggedUser);
  };

  const handleLogout = () => setUser(null);

  const addOrUpdateReport = (reportData: Omit<SaleReport, 'status'>) => {
    setReports(prev => {
      const existingIdx = prev.findIndex(r => r.id === reportData.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        // If it was already approved, we need to subtract the old amount from plans
        if (prev[existingIdx].status === 'approved') {
          setPlans(ps => ps.map(p => p.agentId === reportData.agentId ? {...p, currentTotal: p.currentTotal - prev[existingIdx].totalAmount} : p));
        }
        updated[existingIdx] = { ...reportData, status: 'pending', lastEditedBy: user?.name };
        return updated;
      }
      return [{ ...reportData, status: 'pending' }, ...prev];
    });
  };

  const approveReport = (reportId: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId && r.status === 'pending') {
        setPlans(prevPlans => prevPlans.map(p => 
          p.agentId === r.agentId 
            ? { ...p, currentTotal: p.currentTotal + r.totalAmount } 
            : p
        ));
        return { ...r, status: 'approved' };
      }
      return r;
    }));
  };

  const updatePlanConfig = (agentId: string, updates: Partial<AgentPlan>) => {
    setPlans(prev => prev.map(p => 
      p.agentId === agentId ? { ...p, ...updates } : p
    ));
  };

  if (!user) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="max-w-[1500px] mx-auto px-4 py-8">
        {user.role === 'director' ? (
          <DirectorDashboard 
            reports={reports} 
            plans={plans} 
            onUpdatePlan={updatePlanConfig} 
            onApprove={approveReport}
            onEditReport={addOrUpdateReport}
          />
        ) : (
          <AgentPanel 
            agent={user} 
            reports={reports.filter(r => r.agentId === user.id)} 
            plan={plans.find(p => p.agentId === user.id)!}
            onAddReport={addOrUpdateReport}
          />
        )}
      </main>
    </div>
  );
};

export default App;
