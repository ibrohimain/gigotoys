
import React, { useState, useEffect } from 'react';
import { User, SaleReport, AgentPlan } from './types';
import LoginForm from './components/LoginForm';
import DirectorDashboard from './components/DirectorDashboard';
import AgentPanel from './components/AgentPanel';
import Navbar from './components/Navbar';
import { db } from './firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc, 
  addDoc, 
  query, 
  where,
  deleteDoc
} from "firebase/firestore";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<SaleReport[]>([]);
  const [plans, setPlans] = useState<AgentPlan[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync Reports and Plans
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Listen to Reports
    const reportsQuery = user.role === 'director' 
      ? collection(db, "reports")
      : query(collection(db, "reports"), where("agentId", "==", user.id));

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SaleReport[];
      // Sort by date descending
      setReports(reportsData.sort((a, b) => b.date.localeCompare(a.date)));
      setLoading(false);
    });

    // Listen to Plans
    const unsubPlans = onSnapshot(collection(db, "plans"), (snapshot) => {
      const plansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgentPlan[];
      
      // If no plans exist yet
      if (plansData.length === 0 && user.role === 'director') {
        const initialIds = ['muxlisa', 'aziza', 'ruxshona'];
        initialIds.forEach(async (id) => {
          await setDoc(doc(db, "plans", id), {
            agentId: id,
            totalTarget: 500000000,
            currentTotal: 0,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
          });
        });
      }
      setPlans(plansData);
    });

    return () => {
      unsubReports();
      unsubPlans();
    };
  }, [user]);

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

  const addReport = async (reportData: Omit<SaleReport, 'status' | 'id'>) => {
    await addDoc(collection(db, "reports"), {
      ...reportData,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  };

  const approveReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report && report.status === 'pending') {
      const plan = plans.find(p => p.agentId === report.agentId);
      if (plan) {
        await updateDoc(doc(db, "plans", plan.agentId), {
          currentTotal: plan.currentTotal + report.totalAmount
        });
      }
      await updateDoc(doc(db, "reports", reportId), {
        status: 'approved'
      });
    }
  };

  const deleteReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const confirmDelete = window.confirm(
      report.status === 'pending' 
        ? "Haqiqatdan ham ushbu hisobotni rad etmoqchimisiz?" 
        : "Haqiqatdan ham ushbu tasdiqlangan hisobotni o'chirmoqchimisiz?"
    );
    if (!confirmDelete) return;

    if (report.status === 'approved') {
      const plan = plans.find(p => p.agentId === report.agentId);
      if (plan) {
        await updateDoc(doc(db, "plans", plan.agentId), {
          currentTotal: Math.max(0, plan.currentTotal - report.totalAmount)
        });
      }
    }
    await deleteDoc(doc(db, "reports", reportId));
  };

  const updatePlanConfig = async (agentId: string, updates: Partial<AgentPlan>) => {
    await updateDoc(doc(db, "plans", agentId), updates);
  };

  if (!user) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="max-w-[1500px] mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl mb-4"></div>
            <p className="text-slate-500 font-bold">Yuklanmoqda...</p>
          </div>
        ) : (
          user.role === 'director' ? (
            <DirectorDashboard 
              reports={reports} 
              plans={plans} 
              onUpdatePlan={updatePlanConfig} 
              onApprove={approveReport}
              onDeleteReport={deleteReport}
            />
          ) : (
            <AgentPanel 
              agent={user} 
              reports={reports} 
              plan={plans.find(p => p.agentId === user.id) || { agentId: user.id, totalTarget: 0, currentTotal: 0, startDate: '', endDate: '' }}
              onAddReport={addReport}
            />
          )
        )}
      </main>
    </div>
  );
};

export default App;
