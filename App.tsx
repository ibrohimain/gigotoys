
import React, { useState, useEffect } from 'react';
import { User, SaleReport, AgentPlan, REWARD_THRESHOLDS } from './types';
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
  where 
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
      
      // If no plans exist yet (first time setup), initialize them
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

  const addOrUpdateReport = async (reportData: Omit<SaleReport, 'status'>) => {
    const isUpdate = !!reportData.id && reports.some(r => r.id === reportData.id);
    
    if (isUpdate) {
      // Update existing report
      const oldReport = reports.find(r => r.id === reportData.id);
      
      // If the report was already approved, we need to subtract its old amount from the plan first
      if (oldReport?.status === 'approved') {
        const plan = plans.find(p => p.agentId === reportData.agentId);
        if (plan) {
          await updateDoc(doc(db, "plans", plan.agentId), {
            currentTotal: plan.currentTotal - oldReport.totalAmount
          });
        }
      }

      await setDoc(doc(db, "reports", reportData.id), {
        ...reportData,
        status: 'pending',
        lastEditedBy: user?.name
      }, { merge: true });
    } else {
      // Add new report
      await addDoc(collection(db, "reports"), {
        ...reportData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }
  };

  const approveReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report && report.status === 'pending') {
      // Update the plan's currentTotal
      const plan = plans.find(p => p.agentId === report.agentId);
      if (plan) {
        await updateDoc(doc(db, "plans", plan.agentId), {
          currentTotal: plan.currentTotal + report.totalAmount
        });
      }
      
      // Update report status
      await updateDoc(doc(db, "reports", reportId), {
        status: 'approved'
      });
    }
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
              onEditReport={addOrUpdateReport}
            />
          ) : (
            <AgentPanel 
              agent={user} 
              reports={reports} 
              plan={plans.find(p => p.agentId === user.id) || { agentId: user.id, totalTarget: 0, currentTotal: 0, startDate: '', endDate: '' }}
              onAddReport={addOrUpdateReport}
            />
          )
        )}
      </main>
    </div>
  );
};

export default App;
