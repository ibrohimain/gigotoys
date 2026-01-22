
import React, { useState, useMemo } from 'react';
import { SalesPlan, SaleRecord, AgentStats, User, TransactionType, Transaction, ReportStatus } from '../types';
import { USERS } from '../constants';
import { Plus, TrendingUp, Wallet, ListFilter, Target, Award, Settings, Key, ThumbsUp, ThumbsDown, Star, Gift, BarChart2, Eye, Edit3, Save, X, MessageCircle, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface DirectorViewProps {
  plans: SalesPlan[];
  sales: SaleRecord[];
  onUpdatePlans: (plans: SalesPlan[]) => void;
  onUpdateSales: (sales: SaleRecord[]) => void;
  onUpdateUser: (user: User) => void;
  calculateStats: (id: string) => AgentStats;
  allUsers: User[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
};

const DirectorView: React.FC<DirectorViewProps> = ({ plans, sales, onUpdatePlans, onUpdateSales, onUpdateUser, calculateStats, allUsers }) => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'ROOMS' | 'APPROVALS' | 'TREASURY'>('ANALYTICS');
  const [selectedAgentRoom, setSelectedAgentRoom] = useState<string | null>(null);
  
  const [editingReport, setEditingReport] = useState<SaleRecord | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState<User | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState<TransactionType>('SALARY');
  const [paymentNote, setPaymentNote] = useState('');

  const agents = allUsers.filter(u => u.role === 'AGENT');
  const pendingReports = sales.filter(s => s.status === 'PENDING');

  const analyticsData = useMemo(() => {
    return agents.map(agent => {
      const stats = calculateStats(agent.id);
      return {
        name: agent.name,
        qurt: stats.qurtSales,
        toys: stats.toySales,
        milchofka: stats.milchofkaSales,
        total: stats.totalSales
      };
    });
  }, [agents, sales, calculateStats]);

  const approveReport = (report: SaleRecord) => {
    onUpdateSales(sales.map(s => s.id === report.id ? { ...report, status: 'APPROVED' } : s));
  };

  const rejectReport = (reportId: string) => {
    onUpdateSales(sales.map(s => s.id === reportId ? { ...s, status: 'REJECTED' } : s));
  };

  const handleProcessPayment = () => {
    if (!showPaymentModal || !paymentAmount) return;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(paymentAmount),
      type: paymentType,
      date: new Date().toISOString(),
      note: paymentNote,
      status: 'COMPLETED'
    };
    const updatedUser = { 
      ...showPaymentModal, 
      bonusBalance: (showPaymentModal.bonusBalance || 0) + Number(paymentAmount),
      transactions: [...(showPaymentModal.transactions || []), newTx]
    };
    onUpdateUser(updatedUser);
    setShowPaymentModal(null);
    setPaymentAmount('');
    setPaymentNote('');
    alert("To'lov muvaffaqiyatli amalga oshirildi!");
  };

  if (selectedAgentRoom) {
     const agent = allUsers.find(u => u.id === selectedAgentRoom);
     const stats = calculateStats(selectedAgentRoom);
     const agentSales = sales.filter(s => s.agentId === selectedAgentRoom);

     return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
           <button onClick={() => setSelectedAgentRoom(null)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black uppercase text-xs tracking-widest transition-all">
              <ArrowLeft size={16}/> Orqaga qaytish
           </button>
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-lg">{agent?.name.charAt(0)}</div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{agent?.name}</h3>
                    <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest">Xodim xonasidasiz • {agent?.status || 'Status yo\'q'}</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowPaymentModal(agent || null)} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200">Pul o'tkazish</button>
                 <button className="px-6 py-3 bg-indigo-100 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest">Maqsad berish</button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                 <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Progress</p>
                 <p className="text-3xl font-black text-indigo-600">{stats.progressPercentage.toFixed(1)}%</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                 <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Jami Savdo</p>
                 <p className="text-3xl font-black text-emerald-600">{formatCurrency(stats.totalSales).split(" ")[0]}</p>
              </div>
              <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                 <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Qarzdorlik</p>
                 <p className="text-3xl font-black text-rose-600">{formatCurrency(stats.totalDebt).split(" ")[0]}</p>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 font-black text-xs tracking-widest uppercase">Agent Savdo Tarixi</div>
              <div className="divide-y divide-slate-100">
                 {agentSales.slice().reverse().map(s => (
                    <div key={s.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                       <div>
                          <p className="font-black text-slate-800">{formatCurrency(s.total)}</p>
                          <p className="text-[10px] font-bold text-slate-400">{new Date(s.date).toLocaleDateString()}</p>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {s.status}
                       </span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-px overflow-x-auto">
        <button onClick={() => setActiveTab('ANALYTICS')} className={`px-6 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'ANALYTICS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><BarChart2 size={16}/> Savdo Oqimi</button>
        <button onClick={() => setActiveTab('ROOMS')} className={`px-6 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'ROOMS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Eye size={16}/> Xodimlar Xonalari</button>
        <button onClick={() => setActiveTab('APPROVALS')} className={`px-6 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'APPROVALS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Settings size={16}/> Hisobotlar {pendingReports.length > 0 && <span className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px]">{pendingReports.length}</span>}</button>
        <button onClick={() => setActiveTab('TREASURY')} className={`px-6 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'TREASURY' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Wallet size={16}/> Moliyaviy Xazna</button>
      </div>

      {activeTab === 'ANALYTICS' && (
        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm h-[450px]">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">Maxsulotlar Savdosi (Agentlar kesimida)</h3>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={analyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} hide />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} cursor={{fill: '#f8fafc'}} />
                    <Legend iconType="circle" />
                    <Bar dataKey="qurt" name="Qurt (15%)" fill="#6366f1" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="toys" name="O'yinchoqlar (40%)" fill="#10b981" stackId="a" />
                    <Bar dataKey="milchofka" name="Milchofka (45%)" fill="#f59e0b" stackId="a" radius={[10, 10, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      )}

      {activeTab === 'ROOMS' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => {
               const stats = calculateStats(agent.id);
               return (
                  <div key={agent.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye size={40} className="text-indigo-50" />
                     </div>
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">{agent.name.charAt(0)}</div>
                        <div>
                           <h4 className="font-black text-slate-800 text-lg tracking-tight">{agent.name}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{agent.status || 'Status belgilanmagan'}</p>
                        </div>
                     </div>
                     <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-xs font-black">
                           <span className="text-slate-400">Progress:</span>
                           <span className="text-indigo-600">{stats.progressPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                           <div className="bg-indigo-600 h-full transition-all" style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}></div>
                        </div>
                     </div>
                     <button onClick={() => setSelectedAgentRoom(agent.id)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">Xonasiga kirish</button>
                  </div>
               );
            })}
         </div>
      )}

      {activeTab === 'APPROVALS' && (
         <div className="space-y-4">
            {pendingReports.length === 0 ? (
               <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-200 text-slate-300 italic font-black">Yangi hisobotlar kutilmayapti</div>
            ) : (
               pendingReports.map(report => {
                  const agent = allUsers.find(u => u.id === report.agentId);
                  const isEditingThis = editingReport?.id === report.id;
                  const currentReport = isEditingThis ? editingReport : report;

                  return (
                     <div key={report.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600">{agent?.name.charAt(0)}</div>
                           <div>
                              <p className="font-black text-slate-800">{agent?.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(report.date).toLocaleDateString()}</p>
                           </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
                           <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase">Qurt</label>
                              {isEditingThis ? <input type="number" className="w-full p-2 bg-slate-50 border rounded-lg font-bold text-xs" value={editingReport.qurt} onChange={e => setEditingReport({...editingReport, qurt: Number(e.target.value), total: Number(e.target.value)+editingReport.toys+editingReport.milchofka})} /> : <p className="font-black text-slate-800 text-sm">{formatCurrency(report.qurt).split(" ")[0]}</p>}
                           </div>
                           <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase">O'yinchoq</label>
                              {isEditingThis ? <input type="number" className="w-full p-2 bg-slate-50 border rounded-lg font-bold text-xs" value={editingReport.toys} onChange={e => setEditingReport({...editingReport, toys: Number(e.target.value), total: Number(e.target.value)+editingReport.qurt+editingReport.milchofka})} /> : <p className="font-black text-slate-800 text-sm">{formatCurrency(report.toys).split(" ")[0]}</p>}
                           </div>
                           <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase">Milch</label>
                              {isEditingThis ? <input type="number" className="w-full p-2 bg-slate-50 border rounded-lg font-bold text-xs" value={editingReport.milchofka} onChange={e => setEditingReport({...editingReport, milchofka: Number(e.target.value), total: Number(e.target.value)+editingReport.qurt+editingReport.toys})} /> : <p className="font-black text-slate-800 text-sm">{formatCurrency(report.milchofka).split(" ")[0]}</p>}
                           </div>
                           <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase text-rose-400">Qarz</label>
                              {isEditingThis ? <input type="number" className="w-full p-2 bg-rose-50 border border-rose-100 rounded-lg font-bold text-xs text-rose-600" value={editingReport.debtAmount} onChange={e => setEditingReport({...editingReport, debtAmount: Number(e.target.value)})} /> : <p className="font-black text-rose-500 text-sm">{formatCurrency(report.debtAmount).split(" ")[0]}</p>}
                           </div>
                        </div>

                        <div className="flex gap-2">
                           {isEditingThis ? (
                              <>
                                 <button onClick={() => setEditingReport(null)} className="p-3 bg-slate-100 text-slate-600 rounded-xl"><X size={20}/></button>
                                 <button onClick={() => { approveReport(editingReport); setEditingReport(null); }} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase">Saqlash & Tasdiqlash</button>
                              </>
                           ) : (
                              <>
                                 <button onClick={() => setEditingReport(report)} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><Edit3 size={20}/></button>
                                 <button onClick={() => rejectReport(report.id)} className="p-3 bg-rose-50 text-rose-400 rounded-xl"><ThumbsDown size={20}/></button>
                                 <button onClick={() => approveReport(report)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-200">Tasdiqlash</button>
                              </>
                           )}
                        </div>
                     </div>
                  );
               })
            )}
         </div>
      )}

      {activeTab === 'TREASURY' && (
         <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Xodimlar Balansi va Moliyaviy Holati</h3>
            </div>
            <div className="divide-y divide-slate-100">
               {agents.map(agent => {
                  const txs = agent.transactions || [];
                  const lastTx = txs.length > 0 ? txs[txs.length-1] : null;
                  return (
                     <div key={agent.id} className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-10 hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">{agent.name.charAt(0)}</div>
                           <div>
                              <p className="font-black text-slate-800 text-lg">{agent.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jami To'plangan: {formatCurrency(agent.bonusBalance || 0)}</p>
                           </div>
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-1">So'nggi to'lov</p>
                           {lastTx ? (
                              <div className="flex items-center gap-2">
                                 <span className="text-sm font-black text-emerald-600">+{formatCurrency(lastTx.amount)}</span>
                                 <span className="text-[9px] font-bold text-slate-300 uppercase">({lastTx.type})</span>
                              </div>
                           ) : <p className="text-xs text-slate-300 italic">To'lov qilinmagan</p>}
                        </div>
                        <button onClick={() => setShowPaymentModal(agent)} className="px-8 py-3 bg-indigo-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl">
                           Mablag' o'tkazish
                        </button>
                     </div>
                  );
               })}
            </div>
         </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full animate-in zoom-in duration-300 shadow-2xl">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Xazna To'lovi</h3>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Wallet size={24}/></div>
             </div>
             <div className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black">{showPaymentModal.name.charAt(0)}</div>
                   <div>
                      <p className="font-black text-slate-800">{showPaymentModal.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Balans: {formatCurrency(showPaymentModal.bonusBalance || 0)}</p>
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">To'lov turi</label>
                   <div className="grid grid-cols-2 gap-2">
                      {(['SALARY', 'BONUS', 'REWARD', 'AVANS'] as TransactionType[]).map(type => (
                         <button key={type} onClick={() => setPaymentType(type)} className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${paymentType === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>
                            {type === 'SALARY' ? 'Oylik' : type === 'BONUS' ? 'Bonus' : type === 'REWARD' ? 'Mukofot' : 'Avans'}
                         </button>
                      ))}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Summa (so'm)</label>
                   <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-lg" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Izoh</label>
                   <input value={paymentNote} onChange={e => setPaymentNote(e.target.value)} placeholder="To'lov sababi..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div className="flex gap-4 pt-6">
                   <button onClick={() => setShowPaymentModal(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-[10px] uppercase">Bekor qilish</button>
                   <button onClick={handleProcessPayment} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl text-[10px] uppercase">Yuborish</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorView;
