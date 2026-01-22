
import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, onSnapshot, query, where, orderBy, addDoc, doc, updateDoc } from 'firebase/firestore';
import { UserProfile, SalesPlan, SaleEntry, REWARDS, Note, AuditLog } from '../types';
import { formatCurrency, getActiveReward, calculateDaysRemaining, calculateProgressSummary, getProgressColor, getProgressBgClass, createLog, getActionColor } from '../utils';

interface AgentDashboardProps {
  currentUser: UserProfile;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'dash' | 'sales' | 'notes' | 'audit'>('dash');
  const [currentPlan, setCurrentPlan] = useState<SalesPlan | null>(null);
  const [entries, setEntries] = useState<SaleEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // UX: Form validation and state
  const [formData, setFormData] = useState({ qurt: '', toy: '', milichovka: '', date: new Date().toISOString().split('T')[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubPlan = onSnapshot(query(collection(db, "plans"), where("userId", "==", currentUser.id)), (snap) => {
      if (!snap.empty) setCurrentPlan({ ...snap.docs[0].data(), id: snap.docs[0].id } as SalesPlan);
    });

    const unsubSales = onSnapshot(query(collection(db, "sales"), where("userId", "==", currentUser.id), orderBy("createdAt", "desc")), (snap) => {
      setEntries(snap.docs.map(d => ({ ...d.data(), id: d.id } as SaleEntry)));
    });

    const unsubNotes = onSnapshot(query(collection(db, "notes"), where("userId", "==", currentUser.id), orderBy("timestamp", "desc")), (snap) => {
      setNotes(snap.docs.map(d => ({ ...d.data(), id: d.id } as Note)));
    });

    const unsubLogs = onSnapshot(query(collection(db, "audit_logs"), where("userId", "==", currentUser.id), orderBy("timestamp", "desc")), (snap) => {
      setLogs(snap.docs.map(d => ({ ...d.data(), id: d.id } as AuditLog)));
    });

    return () => { unsubPlan(); unsubSales(); unsubNotes(); unsubLogs(); };
  }, [currentUser.id]);

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(formData.qurt);
    const t = Number(formData.toy);
    const m = Number(formData.milichovka);
    const total = q + t + m;

    if (total <= 0) {
      alert("Iltimos, kamida bitta mahsulot summasini kiriting!");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "sales"), {
        userId: currentUser.id, userName: currentUser.name, date: formData.date,
        qurt: q, toy: t, milichovka: m, total, status: 'pending', createdAt: Date.now()
      });
      await addDoc(collection(db, "audit_logs"), createLog(currentUser.id, currentUser.name, 'SALE_SUBMITTED', `${formatCurrency(total)} savdo kiritildi.`));
      setFormData({ qurt: '', toy: '', milichovka: '', date: new Date().toISOString().split('T')[0] });
      alert("Hisobot qabul qilindi! ✅");
      setActiveTab('dash');
    } catch (err) { alert("Xatolik yuz berdi."); } finally { setIsSubmitting(false); }
  };

  const handleMarkAsRead = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note && !note.read) {
      try { await updateDoc(doc(db, "notes", id), { read: true }); } catch (err) {}
    }
  };

  const summary = calculateProgressSummary(entries, currentPlan || { total3Months: 1 } as any);
  const daysLeft = currentPlan ? calculateDaysRemaining(currentPlan.startDate) : 90;
  const rewardInfo = getActiveReward(summary.percentages.overall, currentPlan?.total3Months || 0);
  const unreadCount = notes.filter(n => !n.read).length;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Salom, {currentUser.name}!</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2 flex items-center gap-2">
             GIGO MARAFON • <span className="text-indigo-600">{daysLeft} kun qoldi</span>
          </p>
        </div>
        <nav className="bg-white p-1.5 rounded-[2.5rem] shadow-2xl border border-slate-100 flex overflow-x-auto no-scrollbar scroll-smooth">
          {['dash', 'sales', 'notes', 'audit'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`whitespace-nowrap px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'dash' ? 'ASOSIY' : tab === 'sales' ? 'SAVDO' : tab === 'notes' ? 'XABARLAR' : 'FAOLIYAT'}
              {tab === 'notes' && unreadCount > 0 && (
                 <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow-lg animate-bounce">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'dash' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white p-14 rounded-[5rem] shadow-sm border border-slate-50 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl transition-all duration-1000 group-hover:bg-indigo-100/50"></div>
             <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
                <div>
                   <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Umumiy Savdo Rejasi</h3>
                   <p className="text-9xl font-black tracking-tighter leading-none transition-colors duration-1000" style={{ color: getProgressColor(summary.percentages.overall) }}>{summary.percentages.overall.toFixed(1)}<span className="text-4xl ml-2">%</span></p>
                </div>
                <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center min-w-[200px]">
                   <span className="text-4xl mb-4">🚀</span>
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Jami Savdo</p>
                   <p className="text-xl font-black mt-2">{formatCurrency(summary.totals.overall)}</p>
                </div>
             </div>
             
             {/* Dynamic Progress Bar */}
             <div className="relative py-14">
                <div className="w-full bg-slate-50 h-16 rounded-[2rem] overflow-hidden border border-slate-100 p-2 shadow-inner">
                   <div 
                      className={`h-full rounded-[1.5rem] transition-all duration-[2500ms] ease-out shadow-2xl relative ${getProgressBgClass(summary.percentages.overall)}`}
                      style={{ width: `${Math.min(summary.percentages.overall, 100)}%` }}
                   >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                   </div>
                </div>
                {/* Reward Icons Overlay */}
                <div className="absolute inset-0 flex justify-between px-10 pointer-events-none">
                   {REWARDS.map(reward => (
                     <div key={reward.threshold} className="relative flex flex-col items-center" style={{ left: `${reward.threshold}%`, position: 'absolute', transform: 'translateX(-50%)' }}>
                        <div className={`text-6xl mb-6 transition-all duration-1000 ${summary.percentages.overall >= reward.threshold ? 'scale-125 drop-shadow-2xl rotate-12' : 'grayscale opacity-5 scale-75'}`}>
                           {reward.icon}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${summary.percentages.overall >= reward.threshold ? 'text-indigo-600' : 'text-slate-200'}`}>{reward.threshold}%</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-indigo-50/50 p-10 rounded-[3.5rem] border border-indigo-100 flex items-center justify-between group cursor-pointer hover:bg-indigo-100 transition-all duration-300" onClick={() => setActiveTab('notes')}>
                   <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-white rounded-[1.75rem] flex items-center justify-center text-3xl shadow-sm group-hover:rotate-12 transition-transform">📧</div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Xabarlar Markazi</p>
                         <p className="text-md font-black text-indigo-700">{unreadCount > 0 ? `${unreadCount}ta yangi ko'rsatma` : 'Yangiliklar yo\'q'}</p>
                      </div>
                   </div>
                </div>
                <div className="bg-emerald-50/50 p-10 rounded-[3.5rem] border border-emerald-100 flex items-center justify-between">
                   <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-white rounded-[1.75rem] flex items-center justify-center text-3xl shadow-sm">🎁</div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Navbatdagi Sovg'a</p>
                         <p className="text-md font-black text-emerald-700">{rewardInfo.next?.name || 'Marafonda g'alaba!'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
           <div className="bg-white rounded-[5rem] p-16 shadow-2xl border border-slate-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-12 text-center">Savdo Hisoboti</h3>
              <form onSubmit={handleSaleSubmit} className="space-y-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Sana</label>
                    <input type="date" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full p-8 rounded-[2.5rem] bg-slate-50 border-none font-black text-slate-900 text-xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Qurt Mahsulotlari</label>
                       <input type="number" placeholder="Summani kiriting..." value={formData.qurt} onChange={e=>setFormData({...formData, qurt: e.target.value})} className="w-full p-8 rounded-[2.5rem] bg-indigo-50/50 border-none font-black text-indigo-900 text-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-4">O'yinchoqlar</label>
                       <input type="number" placeholder="Summani kiriting..." value={formData.toy} onChange={e=>setFormData({...formData, toy: e.target.value})} className="w-full p-8 rounded-[2.5rem] bg-purple-50/50 border-none font-black text-purple-900 text-2xl outline-none focus:ring-4 focus:ring-purple-100 transition-all" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest ml-4">Milichovka Mahsulotlari</label>
                    <input type="number" placeholder="Summani kiriting..." value={formData.milichovka} onChange={e=>setFormData({...formData, milichovka: e.target.value})} className="w-full p-8 rounded-[2.5rem] bg-pink-50/50 border-none font-black text-pink-900 text-2xl outline-none focus:ring-4 focus:ring-pink-100 transition-all" />
                 </div>
                 <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-10 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-lg shadow-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
                    {isSubmitting ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : 'HISOBOTNI YUBORISH'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Audit and Notes follow similar high-end UI patterns... */}
    </div>
  );
};

export default AgentDashboard;
