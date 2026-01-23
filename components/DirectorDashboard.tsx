
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, deleteDoc, where } from 'firebase/firestore';
import { SalesReport, UserProfile, ProductType, SalesPlan, BonusTier } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, AlertCircle, Calendar, ChevronRight, Loader2, 
  CheckCircle, XCircle, Clock, Target, Gift, User, Trash2, Filter, ChevronDown, Award, Printer, Download
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

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ profile }) => {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [plans, setPlans] = useState<SalesPlan[]>([]);
  const [bonusTiers, setBonusTiers] = useState<BonusTier[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedAgentEmail, setSelectedAgentEmail] = useState<string | null>(null);

  const [newPlan, setNewPlan] = useState({
    agentEmail: AGENTS_LIST[0].email,
    totalAmount: 0,
    debtLimitPercent: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    qurt: 15, toys: 40, mili: 45
  });

  const [newBonus, setNewBonus] = useState({ threshold: 100, prize: '' });

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

  const stats = useMemo(() => {
    const approved = reports.filter(r => r.status === 'APPROVED');
    const filteredReports = selectedAgentEmail ? approved.filter(r => r.agentEmail === selectedAgentEmail) : approved;

    const totalSales = filteredReports.reduce((s, r) => s + r.totalDaySales, 0);
    const totalDebt = filteredReports.reduce((s, r) => s + r.totalDayDebt, 0);
    const pendingCount = reports.filter(r => r.status === 'PENDING').length;

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

    return { totalSales, totalDebt, pendingCount, chartData, productPieData, debtPieData, filteredReports };
  }, [reports, selectedAgentEmail]);

  const handleStatusChange = async (reportId: string, status: 'APPROVED' | 'REJECTED') => {
    try { await updateDoc(doc(db, 'reports', reportId), { status }); } catch (err) { alert('Xato'); }
  };

  const handleCancelPlan = async (planId: string) => {
    if (confirm('Planni bekor qilmoqchimisiz?')) {
      try { await updateDoc(doc(db, 'plans', planId), { active: false }); } catch (err) { alert('Xato'); }
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'plans'), {
        ...newPlan,
        distribution: { QURT: newPlan.qurt, OYINCHOQ: newPlan.toys, MILICHOFAKA: newPlan.mili },
        active: true,
        createdAt: Date.now()
      });
      setShowPlanModal(false);
    } catch (err) { alert('Xato'); }
  };

  const handleAddBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'bonuses'), newBonus);
      setShowBonusModal(false);
      setNewBonus({ threshold: 100, prize: '' });
    } catch (err) { alert('Xato'); }
  };

  const deleteBonus = async (id: string) => {
    try { await deleteDoc(doc(db, 'bonuses', id)); } catch (err) { alert('Xato'); }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>;

  const currentAgentName = selectedAgentEmail ? AGENTS_LIST.find(a => a.email === selectedAgentEmail)?.name : 'Barcha xodimlar';

  return (
    <div className="space-y-10 pb-20">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .card { border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 20px !important; break-inside: avoid; }
          .container { max-width: 100% !important; padding: 0 !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Direktor Nazorati</h2>
          <p className="text-gray-500 font-medium italic">GIGO TOYS savdo va bonus boshqaruvi</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handlePrint} className="bg-gray-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-gray-700 transition-all">
            <Printer className="w-5 h-5" /> PDF/Chiqarish
          </button>
          <button onClick={() => setShowPlanModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
            <Target className="w-5 h-5" /> Plan Berish
          </button>
          <button onClick={() => setShowBonusModal(true)} className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-amber-400 transition-all">
            <Award className="w-5 h-5" /> Bonus Qo'shish
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="print-only text-center mb-10">
        <h1 className="text-3xl font-black">GIGO TOYS - SAVDO HISOBOTI</h1>
        <p className="text-xl font-bold text-gray-600 mt-2">{currentAgentName} bo'yicha hisobot</p>
        <p className="text-sm text-gray-400">Sana: {new Date().toLocaleDateString('uz-UZ')}</p>
      </div>

      {/* Filter Selection */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 no-print">
        <Filter className="w-5 h-5 text-gray-400" />
        <button 
          onClick={() => setSelectedAgentEmail(null)}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedAgentEmail === null ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
        >
          Barcha Xodimlar
        </button>
        {AGENTS_LIST.map(a => (
          <button 
            key={a.email}
            onClick={() => setSelectedAgentEmail(a.email)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedAgentEmail === a.email ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Main Stats Card for Print and View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 card p-4">
        <StatItem label="Jami Savdo" val={stats.totalSales} icon={TrendingUp} color="blue" />
        <StatItem label="Jami Qarz" val={stats.totalDebt} icon={AlertCircle} color="red" />
        <StatItem label="Hisobotlar" val={stats.filteredReports.length} icon={Clock} color="amber" unit="ta" />
        <StatItem label="Sotilgan Maxsulotlar" val={stats.productPieData.reduce((a, b) => a + b.value, 0)} icon={Target} color="emerald" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Distribution Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 card">
          <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" /> Mahsulotlar Taqsimoti
          </h3>
          <div className="h-72 flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.productPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5}>
                  {stats.productPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString() + " so'm"} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 md:mt-0 md:ml-6 space-y-2 w-full md:w-48">
              {stats.productPieData.map((item, i) => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 font-bold text-gray-500">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                    {item.name}
                  </span>
                  <span className="font-black text-gray-900">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales vs Debt Pie Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 card">
          <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" /> Savdo va Qarzdorlik
          </h3>
          <div className="h-72 flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.debtPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2}>
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString() + " so'm"} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 md:mt-0 md:ml-6 space-y-2 w-full md:w-48">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 font-bold text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Naqd
                </span>
                <span className="font-black text-gray-900">{(stats.totalSales - stats.totalDebt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 font-bold text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Qarz
                </span>
                <span className="font-black text-red-600">{stats.totalDebt.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-50 flex justify-between items-center text-xs">
                <span className="font-bold text-gray-400">Qarz Ulushi:</span>
                <span className="font-black text-red-600">{(stats.totalSales > 0 ? (stats.totalDebt / stats.totalSales * 100).toFixed(1) : 0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table - Good for Printing */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 card overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-black text-gray-800 uppercase text-sm tracking-widest">Batafsil Hisobotlar Jadvali</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Sana</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Xodim</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Qurt</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">O'yinchoq</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Mili</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Jami</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Qarz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.filteredReports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-500">{r.date}</td>
                  <td className="px-6 py-4 text-sm font-black text-gray-900">{r.agentName}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium">{r.items.QURT.totalPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium">{r.items.OYINCHOQ.totalPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium">{r.items.MILICHOFAKA.totalPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-right font-black text-indigo-600">{r.totalDaySales.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-right font-black text-red-500">{r.totalDayDebt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Queue - no-print */}
      <div className="no-print">
        {reports.filter(r => r.status === 'PENDING').length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border-2 border-amber-100 overflow-hidden">
             <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
               <Clock className="text-amber-600 w-5 h-5" />
               <h3 className="font-black text-amber-800 uppercase text-xs tracking-widest">Tasdiqlash Kutilmoqda</h3>
             </div>
             <div className="divide-y divide-gray-50">
               {reports.filter(r => r.status === 'PENDING').map(report => (
                 <div key={report.id} className="p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-gray-50 transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">{report.agentName[0]}</div>
                      <div>
                        <p className="font-black text-gray-900">{report.agentName}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{report.date}</p>
                      </div>
                   </div>
                   <div className="flex gap-6">
                      <MiniValue label="Jami" val={report.totalDaySales} />
                      <MiniValue label="Qarz" val={report.totalDayDebt} isRed />
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => handleStatusChange(report.id!, 'APPROVED')} className="p-3 bg-green-100 text-green-700 rounded-xl hover:scale-110 transition-transform"><CheckCircle /></button>
                     <button onClick={() => handleStatusChange(report.id!, 'REJECTED')} className="p-3 bg-red-100 text-red-700 rounded-xl hover:scale-110 transition-transform"><XCircle /></button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Plan and Bonus Modal Forms (Existing Logic Kept) */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-black text-xl flex items-center gap-2"><Target /> Yangi Plan Belgilash</h3>
              <button onClick={() => setShowPlanModal(false)}><XCircle /></button>
            </div>
            <form onSubmit={handleCreatePlan} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Xodim</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={newPlan.agentEmail} onChange={e => setNewPlan({...newPlan, agentEmail: e.target.value})}>
                    {AGENTS_LIST.map(a => <option key={a.email} value={a.email}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Jami Summa (so'm)</label>
                  <input type="number" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold" onChange={e => setNewPlan({...newPlan, totalAmount: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Qarz Limiti (%)</label>
                  <input type="number" required value={newPlan.debtLimitPercent} className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-bold" onChange={e => setNewPlan({...newPlan, debtLimitPercent: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Boshlanish</label>
                  <input type="date" required value={newPlan.startDate} className="w-full p-4 bg-gray-50 rounded-2xl" onChange={e => setNewPlan({...newPlan, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Tugash</label>
                  <input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl" onChange={e => setNewPlan({...newPlan, endDate: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl hover:bg-indigo-700 transition-all">TASDIQLASH</button>
            </form>
          </div>
        </div>
      )}

      {showBonusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-amber-500 text-white flex justify-between items-center">
              <h3 className="font-black text-xl flex items-center gap-2"><Award /> Yangi Bonus</h3>
              <button onClick={() => setShowBonusModal(false)}><XCircle /></button>
            </div>
            <form onSubmit={handleAddBonus} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Bajarilish Foizi (%)</label>
                <input type="number" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={newBonus.threshold} onChange={e => setNewBonus({...newBonus, threshold: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase">Mukofot Nomi</label>
                <input type="text" required placeholder="Masalan: Konditsioner" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={newBonus.prize} onChange={e => setNewBonus({...newBonus, prize: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-5 bg-amber-500 text-white rounded-3xl font-black shadow-2xl hover:bg-amber-600 transition-all">BONUSNI SAQLASH</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ label, val, icon: Icon, color, unit }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-4 bg-${color}-50 text-${color}-600 rounded-2xl`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-gray-900 leading-tight">
        {val.toLocaleString()} <span className="text-xs font-bold text-gray-400">{unit || "so'm"}</span>
      </p>
    </div>
  </div>
);

const MiniValue = ({ label, val, isRed }: any) => (
  <div className="text-center">
    <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
    <p className={`text-xs font-black ${isRed ? 'text-red-500' : 'text-gray-900'}`}>{val.toLocaleString()}</p>
  </div>
);

const BarChart3 = ({ className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
);

export default DirectorDashboard;
