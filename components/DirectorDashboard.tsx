
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, deleteDoc, where } from 'firebase/firestore';
import { SalesReport, UserProfile, ProductType, SalesPlan, BonusTier } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, AlertCircle, Calendar, ChevronRight, Loader2, 
  CheckCircle, XCircle, Clock, Target, Gift, User, Trash2, Filter, Award, Printer, Bell, X, Edit3, LayoutDashboard, ListChecks
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const AGENTS_LIST = [
  { email: 'ruxshona@gmail.com', name: 'Ruxshona' },
  { email: 'muxlisa@gmail.com', name: 'Muxlisa' },
  { email: 'aziza@gmail.com', name: 'Aziza' },
];

interface DirectorDashboardProps {
  profile: UserProfile;
}

type TabType = 'overview' | 'plans' | 'bonuses';

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ profile }) => {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [plans, setPlans] = useState<SalesPlan[]>([]);
  const [bonusTiers, setBonusTiers] = useState<BonusTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Modals & Editing State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [editingBonusId, setEditingBonusId] = useState<string | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAgentEmail, setSelectedAgentEmail] = useState<string | null>(null);

  const [planForm, setPlanForm] = useState({
    agentEmail: AGENTS_LIST[0].email,
    totalAmount: 0,
    debtLimitPercent: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    qurt: 15, toys: 40, mili: 45
  });

  const [bonusForm, setBonusForm] = useState({ threshold: 100, prize: '' });

  useEffect(() => {
    const unsubReports = onSnapshot(query(collection(db, 'reports'), orderBy('timestamp', 'desc')), (snap) => {
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesReport)));
      setLoading(false);
    });

    const unsubPlans = onSnapshot(query(collection(db, 'plans'), where('active', '==', true), orderBy('createdAt', 'desc')), (snap) => {
      setPlans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesPlan)));
    });

    const unsubBonuses = onSnapshot(collection(db, 'bonuses'), (snap) => {
      setBonusTiers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BonusTier)).sort((a,b) => b.threshold - a.threshold));
    });

    return () => { unsubReports(); unsubPlans(); unsubBonuses(); };
  }, []);

  const pendingReports = useMemo(() => reports.filter(r => r.status === 'PENDING'), [reports]);

  const stats = useMemo(() => {
    const approved = reports.filter(r => r.status === 'APPROVED');
    const filteredReports = selectedAgentEmail ? approved.filter(r => r.agentEmail === selectedAgentEmail) : approved;

    const totalSales = filteredReports.reduce((s, r) => s + r.totalDaySales, 0);
    const totalDebt = filteredReports.reduce((s, r) => s + r.totalDayDebt, 0);

    const chartData = Object.values(filteredReports.reduce((acc, r) => {
      if (!acc[r.date]) acc[r.date] = { date: r.date, sales: 0, debt: 0 };
      acc[r.date].sales += r.totalDaySales;
      acc[r.date].debt += r.totalDayDebt;
      return acc;
    }, {} as Record<string, any>)).sort((a: any, b: any) => a.date.localeCompare(b.date));

    const productPieData = [
      { name: 'Qurt', value: filteredReports.reduce((s, r) => s + r.items.QURT.totalPrice, 0) },
      { name: 'O\'yinchoq', value: filteredReports.reduce((s, r) => s + r.items.OYINCHOQ.totalPrice, 0) },
      { name: 'Mili', value: filteredReports.reduce((s, r) => s + r.items.MILICHOFAKA.totalPrice, 0) },
    ];

    const debtPieData = [
      { name: 'Naqd', value: totalSales - totalDebt },
      { name: 'Qarz', value: totalDebt },
    ];

    return { totalSales, totalDebt, chartData, productPieData, debtPieData, filteredReports };
  }, [reports, selectedAgentEmail]);

  const agentProgress = useMemo(() => {
    const approved = reports.filter(r => r.status === 'APPROVED');
    return AGENTS_LIST.map(agent => {
      const activePlan = plans.find(p => p.agentEmail === agent.email);
      const reportsInPlan = approved.filter(r => r.agentEmail === agent.email && (activePlan ? (r.date >= activePlan.startDate && r.date <= activePlan.endDate) : false));
      const totalInPlan = reportsInPlan.reduce((s, r) => s + r.totalDaySales, 0);
      const progress = activePlan ? (totalInPlan / activePlan.totalAmount) * 100 : 0;
      
      // Breakdown for statistics within plan view
      const breakdown = {
        QURT: reportsInPlan.reduce((s, r) => s + r.items.QURT.totalPrice, 0),
        OYINCHOQ: reportsInPlan.reduce((s, r) => s + r.items.OYINCHOQ.totalPrice, 0),
        MILICHOFAKA: reportsInPlan.reduce((s, r) => s + r.items.MILICHOFAKA.totalPrice, 0),
      };

      return {
        ...agent,
        progress,
        total: totalInPlan,
        plan: activePlan,
        breakdown
      };
    });
  }, [reports, plans]);

  const handleStatusChange = async (reportId: string, status: 'APPROVED' | 'REJECTED') => {
    try { await updateDoc(doc(db, 'reports', reportId), { status }); } catch (err) { alert('Xato'); }
  };

  const handleCancelPlan = async (planId: string) => {
    if (confirm('Planni bekor qilmoqchimisiz?')) {
      try { await updateDoc(doc(db, 'plans', planId), { active: false }); } catch (err) { alert('Xato'); }
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...planForm,
        distribution: { QURT: planForm.qurt, OYINCHOQ: planForm.toys, MILICHOFAKA: planForm.mili },
        active: true,
      };

      if (editingPlanId) {
        await updateDoc(doc(db, 'plans', editingPlanId), data);
      } else {
        await addDoc(collection(db, 'plans'), { ...data, createdAt: Date.now() });
      }
      setShowPlanModal(false);
      setEditingPlanId(null);
    } catch (err) { alert('Plan saqlashda xato'); }
  };

  const openEditPlan = (plan: SalesPlan) => {
    setEditingPlanId(plan.id!);
    setPlanForm({
      agentEmail: plan.agentEmail,
      totalAmount: plan.totalAmount,
      debtLimitPercent: plan.debtLimitPercent,
      startDate: plan.startDate,
      endDate: plan.endDate,
      qurt: plan.distribution.QURT,
      toys: plan.distribution.OYINCHOQ,
      mili: plan.distribution.MILICHOFAKA
    });
    setShowPlanModal(true);
  };

  const handleSaveBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBonusId) {
        await updateDoc(doc(db, 'bonuses', editingBonusId), bonusForm);
      } else {
        await addDoc(collection(db, 'bonuses'), bonusForm);
      }
      setShowBonusModal(false);
      setEditingBonusId(null);
      setBonusForm({ threshold: 100, prize: '' });
    } catch (err) { alert('Bonus saqlashda xato'); }
  };

  const openEditBonus = (bonus: BonusTier) => {
    setEditingBonusId(bonus.id);
    setBonusForm({ threshold: bonus.threshold, prize: bonus.prize });
    setShowBonusModal(true);
  };

  const deleteBonus = async (id: string) => {
    if (confirm('Bonusni o\'chirmoqchimisiz?')) {
      try { await deleteDoc(doc(db, 'bonuses', id)); } catch (err) { alert('Xato'); }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-10 pb-20">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .card { border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 20px !important; break-inside: avoid; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Top Header & Navigation Tabs */}
      <div className="no-print space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Direktor Nazorati</h2>
            <p className="text-gray-500 font-medium italic">GIGO TOYS savdo boshqaruvi</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all relative"
              >
                <Bell className="w-6 h-6 text-indigo-600" />
                {pendingReports.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {pendingReports.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
                    <h4 className="font-black text-sm uppercase tracking-widest">Yangi Hisobotlar</h4>
                    <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                    {pendingReports.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 italic text-sm">Yangi xabarlar yo'q</div>
                    ) : (
                      pendingReports.map(r => (
                        <div key={r.id} className="p-4 hover:bg-gray-50 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-black text-gray-900 text-sm">{r.agentName}</p>
                              <p className="text-[10px] text-gray-400 font-bold">{r.date}</p>
                            </div>
                            <span className="text-xs font-black text-indigo-600">{r.totalDaySales.toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => handleStatusChange(r.id!, 'APPROVED')} className="flex-1 py-2 bg-green-500 text-white text-[10px] font-black rounded-xl">TASDIQLASH</button>
                            <button onClick={() => handleStatusChange(r.id!, 'REJECTED')} className="flex-1 py-2 bg-red-100 text-red-600 text-[10px] font-black rounded-xl">BEKOR QILISH</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => window.print()} className="bg-gray-800 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg"><Printer className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 w-fit">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Umumiy Ko'rinish" />
          <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} icon={Target} label="Planlar va Xodimlar" />
          <TabButton active={activeTab === 'bonuses'} onClick={() => setActiveTab('bonuses')} icon={Gift} label="Bonus Tizimi" />
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
            <StatItem label="Jami Savdo" val={stats.totalSales} icon={TrendingUp} color="blue" />
            <StatItem label="Jami Qarz" val={stats.totalDebt} icon={AlertCircle} color="red" />
            <StatItem label="Hisobotlar" val={stats.filteredReports.length} icon={Clock} color="amber" unit="ta" />
            <StatItem label="Mahsulotlar" val={stats.productPieData.reduce((a, b) => a + b.value, 0)} icon={Target} color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 card">
              <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest">Mahsulotlar Taqsimoti</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.productPieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5}>
                      {stats.productPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 card">
              <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest">Naqd va Qarz</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.debtPieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2}>
                      <Cell fill="#10b981" /><Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 card">
             <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest">Savdo Dinamikasi</h3>
             <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stats.chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="date" />
                   <YAxis />
                   <Tooltip />
                   <Area type="monotone" dataKey="sales" name="Savdo" stroke="#4f46e5" fill="#4f46e520" strokeWidth={4} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}

      {/* 2. PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="space-y-10 animate-in fade-in">
          <div className="flex justify-between items-center no-print">
            <h3 className="text-2xl font-black text-gray-900">Xodimlar Planlari</h3>
            <button 
              onClick={() => { setEditingPlanId(null); setPlanForm({...planForm, totalAmount: 0}); setShowPlanModal(true); }} 
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100"
            >
              Yangi Plan +
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {agentProgress.map(agent => (
              <div key={agent.email} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden card">
                <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-inner">
                      {agent.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900">{agent.name}</h4>
                      <p className="text-sm text-gray-400 font-bold">{agent.email}</p>
                    </div>
                  </div>
                  
                  {agent.plan ? (
                    <div className="flex items-center gap-3 no-print">
                      <button onClick={() => openEditPlan(agent.plan!)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"><Edit3 className="w-5 h-5" /></button>
                      <button onClick={() => handleCancelPlan(agent.plan!.id!)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-black uppercase no-print">
                      Hozircha plan yo'q
                    </div>
                  )}
                </div>

                <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Plan Progressi</p>
                      <span className="text-2xl font-black text-indigo-600">{agent.progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-6 bg-gray-50 rounded-full overflow-hidden p-1 border border-gray-100">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-100" 
                        style={{ width: `${Math.min(agent.progress, 100)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Maqsad</p>
                        <p className="font-black text-gray-900">{agent.plan?.totalAmount.toLocaleString() || 0} so'm</p>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-2xl">
                        <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Bajarildi</p>
                        <p className="font-black text-indigo-700">{agent.total.toLocaleString()} so'm</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <ProgressMini type="Qurt" current={agent.breakdown.QURT} target={agent.plan ? (agent.plan.totalAmount * agent.plan.distribution.QURT / 100) : 0} />
                    <ProgressMini type="O'yinchoq" current={agent.breakdown.OYINCHOQ} target={agent.plan ? (agent.plan.totalAmount * agent.plan.distribution.OYINCHOQ / 100) : 0} />
                    <ProgressMini type="Mili" current={agent.breakdown.MILICHOFAKA} target={agent.plan ? (agent.plan.totalAmount * agent.plan.distribution.MILICHOFAKA / 100) : 0} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BONUSES TAB */}
      {activeTab === 'bonuses' && (
        <div className="space-y-10 animate-in fade-in">
          <div className="flex justify-between items-center no-print">
            <h3 className="text-2xl font-black text-gray-900">Bonus Tizimi Boshqaruvi</h3>
            <button 
              onClick={() => { setEditingBonusId(null); setBonusForm({ threshold: 100, prize: '' }); setShowBonusModal(true); }} 
              className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-amber-100"
            >
              Yangi Bonus +
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {bonusTiers.map(tier => (
              <div key={tier.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative group card">
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                   <button onClick={() => openEditBonus(tier)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit3 className="w-4 h-4" /></button>
                   <button onClick={() => deleteBonus(tier.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <Gift className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-2">{tier.prize}</h4>
                <div className="flex items-center gap-2">
                   <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-widest">{tier.threshold}% MAQSAD</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-black text-xl flex items-center gap-2">
                <Target /> {editingPlanId ? 'Planni Tahrirlash' : 'Yangi Plan Belgilash'}
              </h3>
              <button onClick={() => setShowPlanModal(false)}><XCircle /></button>
            </div>
            <form onSubmit={handleSavePlan} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Xodim</label>
                  <select 
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" 
                    value={planForm.agentEmail} 
                    onChange={e => setPlanForm({...planForm, agentEmail: e.target.value})}
                  >
                    {AGENTS_LIST.map(a => <option key={a.email} value={a.email}>{a.name}</option>)}
                  </select>
                </div>
                <div><label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Summa</label><input type="number" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={planForm.totalAmount} onChange={e => setPlanForm({...planForm, totalAmount: parseInt(e.target.value)})} /></div>
                <div><label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Qarz %</label><input type="number" required className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-bold" value={planForm.debtLimitPercent} onChange={e => setPlanForm({...planForm, debtLimitPercent: parseInt(e.target.value)})} /></div>
                <div><label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Boshlanish</label><input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl" value={planForm.startDate} onChange={e => setPlanForm({...planForm, startDate: e.target.value})} /></div>
                <div><label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Tugash</label><input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl" value={planForm.endDate} onChange={e => setPlanForm({...planForm, endDate: e.target.value})} /></div>
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl hover:bg-indigo-700 transition-all">
                {editingPlanId ? 'SAQLASH' : 'TASDIQLASH'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showBonusModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-amber-500 text-white flex justify-between items-center">
              <h3 className="font-black text-xl flex items-center gap-2">
                <Award /> {editingBonusId ? 'Bonusni Tahrirlash' : 'Yangi Bonus'}
              </h3>
              <button onClick={() => setShowBonusModal(false)}><XCircle /></button>
            </div>
            <form onSubmit={handleSaveBonus} className="p-8 space-y-6">
              <div><label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Bajarilish %</label><input type="number" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={bonusForm.threshold} onChange={e => setBonusForm({...bonusForm, threshold: parseInt(e.target.value)})} /></div>
              <div><label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Mukofot</label><input type="text" required placeholder="Masalan: Konditsioner" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={bonusForm.prize} onChange={e => setBonusForm({...bonusForm, prize: e.target.value})} /></div>
              <button type="submit" className="w-full py-5 bg-amber-500 text-white rounded-3xl font-black shadow-2xl hover:bg-amber-600 transition-all">
                {editingBonusId ? 'SAQLASH' : 'BONUSNI QO\'SHISH'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline uppercase tracking-widest">{label}</span>
  </button>
);

const StatItem = ({ label, val, icon: Icon, color, unit }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 card">
    <div className={`p-4 bg-${color}-50 text-${color}-600 rounded-2xl`}><Icon className="w-6 h-6" /></div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-gray-900 leading-tight">{val.toLocaleString()} <span className="text-xs font-bold text-gray-400">{unit || "so'm"}</span></p>
    </div>
  </div>
);

const ProgressMini = ({ type, current, target }: any) => (
  <div className="bg-gray-50 p-6 rounded-3xl flex flex-col justify-between h-full border border-gray-100">
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-2">{type}</p>
      <p className="text-sm font-black text-gray-900">{current.toLocaleString()} so'm</p>
    </div>
    <div className="mt-4">
      <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase mb-1">
         <span>Target: {target.toLocaleString()}</span>
         <span>{target > 0 ? (current/target*100).toFixed(0) : 0}%</span>
      </div>
      <div className="h-1.5 bg-white rounded-full overflow-hidden border border-gray-100">
        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.min((current/target)*100 || 0, 100)}%` }} />
      </div>
    </div>
  </div>
);

const MiniValue = ({ label, val, isRed }: any) => (
  <div className="text-center">
    <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
    <p className={`text-xs font-black ${isRed ? 'text-red-500' : 'text-gray-900'}`}>{val.toLocaleString()}</p>
  </div>
);

export default DirectorDashboard;
