
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, deleteDoc, where } from 'firebase/firestore';
import { SalesReport, UserProfile, ProductType, SalesPlan, BonusTier } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, AlertCircle, Clock, Target, Gift, Trash2, Filter, Award, Printer, Bell, X, Edit3, LayoutDashboard, ChevronRight, CheckCircle, XCircle,
  Loader2, Star, Sparkles
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
type OverviewMode = 'overall' | 'individual';

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ profile }) => {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [plans, setPlans] = useState<SalesPlan[]>([]);
  const [bonusTiers, setBonusTiers] = useState<BonusTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [overviewMode, setOverviewMode] = useState<OverviewMode>('overall');
  
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
      setBonusTiers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BonusTier)).sort((a,b) => a.threshold - b.threshold));
    });

    return () => { unsubReports(); unsubPlans(); unsubBonuses(); };
  }, []);

  const pendingReports = useMemo(() => reports.filter(r => r.status === 'PENDING'), [reports]);

  const stats = useMemo(() => {
    const approved = reports.filter(r => r.status === 'APPROVED');
    const overallTotalSales = approved.reduce((s, r) => s + r.totalDaySales, 0);
    const overallTotalDebt = approved.reduce((s, r) => s + r.totalDayDebt, 0);

    const filteredReports = selectedAgentEmail ? approved.filter(r => r.agentEmail === selectedAgentEmail) : approved;
    const currentSales = filteredReports.reduce((s, r) => s + r.totalDaySales, 0);
    const currentDebt = filteredReports.reduce((s, r) => s + r.totalDayDebt, 0);

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

    return { overallTotalSales, overallTotalDebt, currentSales, currentDebt, chartData, productPieData, filteredReports };
  }, [reports, selectedAgentEmail]);

  const agentSummaries = useMemo(() => {
    const approved = reports.filter(r => r.status === 'APPROVED');
    return AGENTS_LIST.map(agent => {
      const personalReports = approved.filter(r => r.agentEmail === agent.email);
      const totalSales = personalReports.reduce((s, r) => s + r.totalDaySales, 0);
      const totalDebt = personalReports.reduce((s, r) => s + r.totalDayDebt, 0);
      const activePlan = plans.find(p => p.agentEmail === agent.email);
      
      const reportsInPlan = personalReports.filter(r => activePlan ? (r.date >= activePlan.startDate && r.date <= activePlan.endDate) : false);
      const totalInPlan = reportsInPlan.reduce((s, r) => s + r.totalDaySales, 0);
      const progress = activePlan ? (totalInPlan / activePlan.totalAmount) * 100 : 0;

      // Stats for each product type
      const productStats = {
        QURT: personalReports.reduce((s, r) => s + r.items.QURT.totalPrice, 0),
        OYINCHOQ: personalReports.reduce((s, r) => s + r.items.OYINCHOQ.totalPrice, 0),
        MILICHOFAKA: personalReports.reduce((s, r) => s + r.items.MILICHOFAKA.totalPrice, 0),
      };

      return { ...agent, totalSales, totalDebt, progress, activePlan, totalInPlan, productStats };
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
    } catch (err) { alert('Xato'); }
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
    } catch (err) { alert('Xato'); }
  };

  const deleteBonus = async (id: string) => {
    if (confirm('Bonusni o\'chirmoqchimisiz?')) {
      try { await deleteDoc(doc(db, 'bonuses', id)); } catch (err) { alert('Xato'); }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .card { border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 20px !important; break-inside: avoid; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900">GIGO TOYS Nazorati</h2>
          <div className="flex bg-white mt-4 p-1 rounded-2xl shadow-sm border border-gray-100 w-fit">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Hisobotlar" />
            <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} icon={Target} label="Planlar" />
            <TabButton active={activeTab === 'bonuses'} onClick={() => setActiveTab('bonuses')} icon={Award} label="Bonuslar" />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 relative">
              <Bell className="w-6 h-6 text-indigo-600" />
              {pendingReports.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                  {pendingReports.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-[100] overflow-hidden">
                <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
                  <h4 className="font-black text-xs uppercase tracking-widest">Yangi Hisobotlar</h4>
                  <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4" /></button>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                  {pendingReports.length === 0 ? <div className="p-8 text-center text-gray-400 italic text-sm">Yangi xabarlar yo'q</div> : 
                    pendingReports.map(r => (
                      <div key={r.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div><p className="font-black text-gray-900 text-sm">{r.agentName}</p><p className="text-[10px] text-gray-400 font-bold">{r.date}</p></div>
                          <span className="text-xs font-black text-indigo-600">{r.totalDaySales.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleStatusChange(r.id!, 'APPROVED')} className="flex-1 py-2 bg-green-500 text-white text-[10px] font-black rounded-lg">TASDIQLASH</button>
                          <button onClick={() => handleStatusChange(r.id!, 'REJECTED')} className="flex-1 py-2 bg-red-100 text-red-600 text-[10px] font-black rounded-lg">RAD ETISH</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
          <button onClick={() => window.print()} className="bg-gray-800 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2"><Printer className="w-5 h-5" /></button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="no-print flex items-center gap-4 border-b border-gray-100 pb-4">
            <button onClick={() => {setOverviewMode('overall'); setSelectedAgentEmail(null);}} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${overviewMode === 'overall' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>Umumiy</button>
            <button onClick={() => setOverviewMode('individual')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${overviewMode === 'individual' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>Xodimlar bo'yicha</button>
          </div>

          {overviewMode === 'overall' ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatItem label="Jami Tasdiqlangan Savdo" val={stats.overallTotalSales} icon={TrendingUp} color="blue" />
                <StatItem label="Jami Qarz" val={stats.overallTotalDebt} icon={AlertCircle} color="red" />
                <StatItem label="Naqd Pul" val={stats.overallTotalSales - stats.overallTotalDebt} icon={CheckCircle} color="green" />
                <StatItem label="Hisobotlar" val={reports.filter(r => r.status === 'APPROVED').length} icon={Clock} color="amber" unit="ta" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 card">
                  <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest">Barcha Mahsulotlar Taqsimoti</h3>
                  <div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.productPieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5}>{stats.productPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: any) => v.toLocaleString()} /><Legend /></PieChart></ResponsiveContainer></div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 card">
                  <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest">Umumiy Savdo Dinamikasi</h3>
                  <div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={stats.chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" /><YAxis /><Tooltip /><Area type="monotone" dataKey="sales" name="Savdo" stroke="#4f46e5" fill="#4f46e520" strokeWidth={4} /></AreaChart></ResponsiveContainer></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 no-print">
                {agentSummaries.map(agent => (
                  <button key={agent.email} onClick={() => setSelectedAgentEmail(agent.email)} className={`w-full p-6 rounded-3xl border transition-all text-left flex items-center justify-between ${selectedAgentEmail === agent.email ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl translate-x-2' : 'bg-white border-gray-100 text-gray-900 hover:border-indigo-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedAgentEmail === agent.email ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>{agent.name[0]}</div>
                      <div><p className="font-black text-sm">{agent.name}</p><p className={`text-[10px] ${selectedAgentEmail === agent.email ? 'text-indigo-100' : 'text-gray-400'}`}>Progress: {agent.progress.toFixed(1)}%</p></div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${selectedAgentEmail === agent.email ? 'opacity-100' : 'opacity-20'}`} />
                  </button>
                ))}
              </div>
              <div className="lg:col-span-2 space-y-8">
                {selectedAgentEmail ? (
                  <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StatItem label="Xodim Savdosi" val={stats.currentSales} icon={TrendingUp} color="blue" />
                      <StatItem label="Xodim Qarzi" val={stats.currentDebt} icon={AlertCircle} color="red" />
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 card">
                      <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest">Shaxsiy Mahsulotlar Ulushi</h3>
                      <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.productPieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5}>{stats.productPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: any) => v.toLocaleString()} /><Legend /></PieChart></ResponsiveContainer></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center flex flex-col items-center justify-center h-full">
                    <Filter className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-400 font-bold">Xodimni tanlang</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-gray-900">Xodimlar Planlari</h3>
            <button onClick={() => { setEditingPlanId(null); setShowPlanModal(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold">Yangi Plan +</button>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {agentSummaries.map(agent => (
              <div key={agent.email} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden card">
                <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl">{agent.name[0]}</div>
                    <div><h4 className="font-black text-gray-900">{agent.name}</h4><p className="text-xs text-gray-400 font-bold">{agent.email}</p></div>
                  </div>
                  {agent.activePlan && (
                    <div className="flex gap-2">
                      <button onClick={() => openEditPlan(agent.activePlan!)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleCancelPlan(agent.activePlan!.id!)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                {agent.activePlan ? (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest"><span>Plan Progressi</span><span>{agent.progress.toFixed(1)}%</span></div>
                      <div className="h-4 bg-gray-50 rounded-full overflow-hidden p-0.5"><div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min(agent.progress, 100)}%` }} /></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[8px] font-black text-gray-400 mb-1">MAQSAD</p><p className="text-sm font-black text-gray-900">{agent.activePlan.totalAmount.toLocaleString()}</p></div>
                        <div className="p-3 bg-indigo-50 rounded-xl"><p className="text-[8px] font-black text-indigo-400 mb-1">BAJARILDI</p><p className="text-sm font-black text-indigo-700">{agent.totalInPlan.toLocaleString()}</p></div>
                        <div className="p-3 bg-red-50 rounded-xl"><p className="text-[8px] font-black text-red-400 mb-1">QARZ LIMITI</p><p className="text-sm font-black text-red-700">{agent.activePlan.debtLimitPercent}%</p></div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center border-l border-gray-50 pl-8 space-y-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase">Yutuqlar yo'li</p>
                       <div className="space-y-2">
                          {bonusTiers.map(tier => (
                            <div key={tier.id} className={`flex items-center gap-2 text-xs font-bold ${agent.progress >= tier.threshold ? 'text-green-600' : 'text-gray-300'}`}>
                              {agent.progress >= tier.threshold ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              <span>{tier.threshold}% - {tier.prize}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                ) : <div className="p-10 text-center text-gray-400 italic text-sm">Hozircha plan belgilanmagan</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BONUSES TAB */}
      {activeTab === 'bonuses' && (
        <div className="space-y-12 animate-in fade-in">
          {/* Section: Bonus Management Tools */}
          <div className="flex justify-between items-center no-print">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Sparkles className="text-amber-500 w-6 h-6" /> Bonus Bosqichlari
            </h3>
            <button onClick={() => { setEditingBonusId(null); setBonusForm({threshold: 100, prize: ''}); setShowBonusModal(true); }} className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all">Yangi Bonus +</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
            {bonusTiers.map(tier => (
              <div key={tier.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group relative hover:border-amber-200 transition-all">
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingBonusId(tier.id); setBonusForm({threshold: tier.threshold, prize: tier.prize}); setShowBonusModal(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteBonus(tier.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-3"><Gift className="w-6 h-6" /></div>
                <h4 className="font-black text-gray-900">{tier.prize}</h4>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">{tier.threshold}% Maqsad</p>
              </div>
            ))}
            {bonusTiers.length === 0 && (
               <div className="col-span-full py-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold italic">Hali bonuslar belgilanmagan</div>
            )}
          </div>

          {/* Section: Employee Bonus Status (Enhanced Progress View) */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2 border-t border-gray-100 pt-8">
              <UsersIcon className="text-indigo-500 w-6 h-6" /> Xodimlar Bonus Progressi
            </h3>

            <div className="grid grid-cols-1 gap-8">
              {agentSummaries.map(agent => (
                <div key={agent.email} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500">
                  <div className="p-8 flex flex-col md:flex-row gap-8">
                    {/* Left side: Agent Identity & Sales Stats */}
                    <div className="md:w-1/3 space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-200">{agent.name[0]}</div>
                         <div>
                           <h4 className="text-xl font-black text-gray-900">{agent.name}</h4>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{agent.email}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Jami Savdo</span>
                            <span className="text-sm font-black text-gray-900">{agent.totalSales.toLocaleString()} so'm</span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                            <span className="text-[10px] font-black text-red-400 uppercase">Jami Qarz</span>
                            <span className="text-sm font-black text-red-600">{agent.totalDebt.toLocaleString()} so'm</span>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-gray-50">
                         <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Mahsulot statistikasi</p>
                         <div className="space-y-2">
                           {Object.entries(agent.productStats).map(([key, val]) => (
                             <div key={key} className="flex justify-between text-xs font-bold">
                               <span className="text-gray-500">{key === 'MILICHOFAKA' ? 'Milicho' : key}</span>
                               <span className="text-gray-900">{val.toLocaleString()}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                    </div>

                    {/* Right side: Bonus Roadmap */}
                    <div className="md:w-2/3 flex flex-col justify-center">
                       <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                          <div className="flex justify-between items-end mb-4">
                            <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan Bajarilishi</p>
                               <p className="text-3xl font-black text-indigo-600">{agent.progress.toFixed(1)}%</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Plan Maqsadi</p>
                               <p className="text-sm font-black text-gray-900">{agent.activePlan?.totalAmount.toLocaleString() || 0} so'm</p>
                            </div>
                          </div>

                          {/* Interactive Roadmap */}
                          <div className="relative pt-8 pb-4">
                             {/* Track Background */}
                             <div className="h-4 bg-white rounded-full border border-gray-100 overflow-hidden shadow-inner">
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-100" 
                                  style={{ width: `${Math.min(agent.progress, 100)}%` }}
                                />
                             </div>

                             {/* Milestone Nodes */}
                             {bonusTiers.map((tier, idx) => {
                               const isAchieved = agent.progress >= tier.threshold;
                               const isNext = !isAchieved && (idx === 0 || agent.progress >= bonusTiers[idx-1].threshold);
                               return (
                                 <div 
                                   key={tier.id} 
                                   className="absolute top-0 flex flex-col items-center" 
                                   style={{ left: `${tier.threshold}%`, transform: 'translateX(-50%)' }}
                                 >
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg transition-all duration-500 ${isAchieved ? 'bg-emerald-500 text-white scale-110' : isNext ? 'bg-amber-400 text-white scale-125 animate-pulse' : 'bg-gray-100 text-gray-300'}`}>
                                       {isAchieved ? <CheckCircle className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                                    </div>
                                    <div className={`mt-14 text-center whitespace-nowrap`}>
                                       <p className={`text-[10px] font-black uppercase tracking-tighter ${isAchieved ? 'text-emerald-600' : isNext ? 'text-amber-600' : 'text-gray-400'}`}>{tier.threshold}%</p>
                                       <p className={`text-[9px] font-bold max-w-[80px] leading-tight ${isAchieved ? 'text-gray-600' : 'text-gray-400'}`}>{tier.prize}</p>
                                    </div>
                                 </div>
                               )
                             })}
                          </div>
                       </div>

                       {agent.progress >= 100 && (
                          <div className="mt-6 flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 animate-in zoom-in-95 duration-500">
                             <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Star className="w-6 h-6" /></div>
                             <div>
                                <p className="text-sm font-black text-emerald-800">TABRIKLAYMIZ!</p>
                                <p className="text-xs font-bold text-emerald-600">Xodim barcha bonus bosqichlaridan o'tdi!</p>
                             </div>
                          </div>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center"><h3 className="font-black text-lg">Plan Sozlamalari</h3><button onClick={() => setShowPlanModal(false)}><XCircle /></button></div>
            <form onSubmit={handleSavePlan} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-[10px] font-black text-gray-400 block mb-2">XODIM</label><select className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={planForm.agentEmail} onChange={e => setPlanForm({...planForm, agentEmail: e.target.value})}>{AGENTS_LIST.map(a => <option key={a.email} value={a.email}>{a.name}</option>)}</select></div>
                <div><label className="text-[10px] font-black text-gray-400 block mb-2">SUMMA</label><input type="number" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={planForm.totalAmount} onChange={e => setPlanForm({...planForm, totalAmount: parseInt(e.target.value)})} /></div>
                <div><label className="text-[10px] font-black text-gray-400 block mb-2">QARZ %</label><input type="number" required className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-bold" value={planForm.debtLimitPercent} onChange={e => setPlanForm({...planForm, debtLimitPercent: parseInt(e.target.value)})} /></div>
                <div><label className="text-[10px] font-black text-gray-400 block mb-2">BOSHLANISH</label><input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl" value={planForm.startDate} onChange={e => setPlanForm({...planForm, startDate: e.target.value})} /></div>
                <div><label className="text-[10px] font-black text-gray-400 block mb-2">TUGASH</label><input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl" value={planForm.endDate} onChange={e => setPlanForm({...planForm, endDate: e.target.value})} /></div>
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black">SAQLASH</button>
            </form>
          </div>
        </div>
      )}

      {showBonusModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-amber-500 text-white flex justify-between items-center"><h3 className="font-black text-lg">Bonus Sozlamalari</h3><button onClick={() => setShowBonusModal(false)}><XCircle /></button></div>
            <form onSubmit={handleSaveBonus} className="p-8 space-y-6">
              <div><label className="text-[10px] font-black text-gray-400 block mb-2">FOIZ (%)</label><input type="number" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={bonusForm.threshold} onChange={e => setBonusForm({...bonusForm, threshold: parseInt(e.target.value)})} /></div>
              <div><label className="text-[10px] font-black text-gray-400 block mb-2">MUKOFOT NOMI</label><input type="text" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={bonusForm.prize} onChange={e => setBonusForm({...bonusForm, prize: e.target.value})} /></div>
              <button type="submit" className="w-full py-5 bg-amber-500 text-white rounded-3xl font-black">SAQLASH</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
    <Icon className="w-4 h-4" /><span className="hidden sm:inline uppercase tracking-widest">{label}</span>
  </button>
);

const StatItem = ({ label, val, icon: Icon, color, unit }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 card">
    <div className={`p-4 bg-${color}-50 text-${color}-600 rounded-2xl`}><Icon className="w-6 h-6" /></div>
    <div className="flex-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p><p className="text-xl font-black text-gray-900 leading-tight">{val.toLocaleString()} <span className="text-xs font-bold text-gray-400">{unit || "so'm"}</span></p></div>
  </div>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default DirectorDashboard;
