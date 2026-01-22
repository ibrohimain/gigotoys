
import React, { useState, useEffect } from 'react';
import { db } from '../App';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, addDoc, limit } from 'firebase/firestore';
import { UserProfile, UserRole, SalesPlan, SaleEntry, AuditLog, Note } from '../types';
import { formatCurrency, calculateProgressSummary, getProgressColor, getProgressBgClass, getActiveReward, createLog, getActionColor } from '../utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface AdminDashboardProps {
  currentUser: UserProfile;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'bonus' | 'notes' | 'audit'>('overview');
  const [agents, setAgents] = useState<UserProfile[]>([]);
  const [plans, setPlans] = useState<SalesPlan[]>([]);
  const [entries, setEntries] = useState<SaleEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // UX: Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [noteTarget, setNoteTarget] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const unsubAgents = onSnapshot(query(collection(db, "users"), where("role", "==", UserRole.AGENT)), (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as UserProfile));
      setAgents(list);
      if (list.length > 0 && !noteTarget) setNoteTarget(list[0].id);
    });

    const unsubPlans = onSnapshot(collection(db, "plans"), (snap) => {
      setPlans(snap.docs.map(d => ({ ...d.data(), id: d.id } as SalesPlan)));
    });

    const unsubSales = onSnapshot(query(collection(db, "sales"), orderBy("createdAt", "desc")), (snap) => {
      setEntries(snap.docs.map(d => ({ ...d.data(), id: d.id } as SaleEntry)));
    });

    const unsubLogs = onSnapshot(query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(100)), (snap) => {
      setLogs(snap.docs.map(d => ({ ...d.data(), id: d.id } as AuditLog)));
    });

    const unsubNotes = onSnapshot(query(collection(db, "notes"), orderBy("timestamp", "desc")), (snap) => {
      setNotes(snap.docs.map(d => ({ ...d.data(), id: d.id } as Note)));
    });

    return () => {
      unsubAgents(); unsubPlans(); unsubSales(); unsubLogs(); unsubNotes();
    };
  }, []);

  const handleApproveSale = async (saleId: string) => {
    const sale = entries.find(e => e.id === saleId);
    if (!sale) return;
    try {
      await updateDoc(doc(db, "sales", saleId), { status: 'approved' });
      const newLog = createLog(currentUser.id, currentUser.name, 'SALE_APPROVED', `${sale.userName}ning ${formatCurrency(sale.total)} savdosi tasdiqlandi`);
      await addDoc(collection(db, "audit_logs"), newLog);
    } catch (err) { console.error(err); }
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteMessage.trim() || !noteTarget) return;
    setIsSending(true);
    try {
      const targetAgent = agents.find(a => a.id === noteTarget);
      await addDoc(collection(db, "notes"), {
        userId: noteTarget, message: noteMessage, senderName: currentUser.name, timestamp: Date.now(), read: false
      });
      const newLog = createLog(currentUser.id, currentUser.name, 'NOTE_SENT', `${targetAgent?.name}ga xabar yuborildi.`);
      await addDoc(collection(db, "audit_logs"), newLog);
      setNoteMessage('');
      alert("Yuborildi! 🚀");
    } catch (err) { console.error(err); } finally { setIsSending(false); }
  };

  const totalPlan = plans.reduce((s, p) => s + p.total3Months, 0);
  const approvedEntries = entries.filter(e => e.status === 'approved');
  const globalApprovedTotal = approvedEntries.reduce((s, e) => s + e.total, 0);
  const globalProgress = (globalApprovedTotal / (totalPlan || 1)) * 100;

  const agentStats = agents.map(agent => {
    const agentEntries = entries.filter(e => e.userId === agent.id);
    const agentPlan = plans.find(p => p.userId === agent.id);
    const summary = calculateProgressSummary(agentEntries, agentPlan || { total3Months: 1 } as any);
    return { ...agent, summary };
  });

  const filteredLogs = logs.filter(l => 
    l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">Direktor Markazi</h2>
          <p className="text-xs font-black text-slate-400 mt-2 uppercase tracking-[0.4em] flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Real-vaqtda savdo nazorati
          </p>
        </div>
        <nav className="bg-white p-2 rounded-[2.5rem] shadow-2xl border border-slate-100 flex overflow-x-auto no-scrollbar scroll-smooth">
          {['overview', 'reports', 'bonus', 'notes', 'audit'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`whitespace-nowrap px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'overview' ? 'DASHBOARD' : tab === 'reports' ? 'HISOBOTLAR' : tab === 'bonus' ? 'BONUSLAR' : tab === 'notes' ? 'XABARLAR' : 'TARIX'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-50 hover:shadow-xl transition-all duration-500 group">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 group-hover:text-indigo-600 transition-colors">Jami Savdo (Tasdiqlangan)</p>
                 <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{formatCurrency(globalApprovedTotal)}</h3>
                 <div className="mt-8 h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(globalProgress, 100)}%` }}></div>
                 </div>
              </div>
              <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Marafonda Jami Progress</p>
                 <h3 className="text-6xl font-black tracking-tighter" style={{ color: getProgressColor(globalProgress) }}>{globalProgress.toFixed(1)}%</h3>
              </div>
              <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-50 flex flex-col justify-between overflow-hidden">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">So'nggi harakat</p>
                 <div className="space-y-2">
                    <p className="text-xs font-black text-slate-800 line-clamp-2">{logs[0]?.details || 'Loglar mavjud emas'}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{logs[0] ? new Date(logs[0].timestamp).toLocaleTimeString() : '--:--'}</p>
                 </div>
              </div>
           </div>
           
           <div className="bg-white p-12 rounded-[4.5rem] border border-slate-50 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Agentlar samaradorligi</h3>
                 <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                 </div>
              </div>
              <div className="h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentStats.map(a => ({ name: a.name, progress: a.summary.percentages.overall }))}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }} />
                       <Bar dataKey="progress" radius={[20, 20, 10, 10]} barSize={60}>
                          {agentStats.map((entry, index) => <Cell key={index} fill={getProgressColor(entry.summary.percentages.overall)} />)}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-[4rem] shadow-sm border border-slate-50 overflow-hidden">
           <div className="p-12 border-b border-slate-50 bg-slate-50/20 flex flex-col md:flex-row gap-8 justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Barcha Harakatlar</h3>
              <input 
                 type="text" 
                 placeholder="Xodim yoki amal bo'yicha qidirish..." 
                 className="w-full md:w-96 px-8 py-4 rounded-2xl bg-white border-none shadow-inner text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                       <th className="px-12 py-8">Vaqt / Sana</th>
                       <th className="px-12 py-8">Xodim</th>
                       <th className="px-12 py-8">Harakat</th>
                       <th className="px-12 py-8">Tafsilot</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="group hover:bg-slate-50/20 transition-all duration-300">
                         <td className="px-12 py-8">
                            <p className="text-xs font-black text-slate-900">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">{new Date(log.timestamp).toLocaleDateString()}</p>
                         </td>
                         <td className="px-12 py-8">
                            <p className="text-sm font-black text-slate-800">{log.userName}</p>
                         </td>
                         <td className="px-12 py-8">
                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                               {log.action.split('_').join(' ')}
                            </span>
                         </td>
                         <td className="px-12 py-8 text-xs font-bold text-slate-500 italic max-w-xs truncate group-hover:whitespace-normal group-hover:max-w-none transition-all">
                            {log.details}
                         </td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                       <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-black uppercase tracking-[0.3em]">Harakatlar topilmadi</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Other tabs follow similar high-end UI patterns... */}
    </div>
  );
};

export default AdminDashboard;
