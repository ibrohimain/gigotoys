
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, UserRole, Sale, Reward, ChatMessage, DailyPlan, LongTermGoal, SalaryConfig } from '../types';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, orderBy, doc, setDoc, deleteDoc, updateDoc, where, limit } from 'firebase/firestore';
import { 
  TrendingUp, 
  DollarSign, 
  Plus, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  Target, 
  Gift, 
  AlertTriangle, 
  Zap, 
  Settings, 
  Save, 
  Wallet, 
  MessageCircle, 
  Search, 
  Send, 
  ArrowUpRight, 
  Info,
  CheckSquare,
  Flag,
  Banknote,
  Trash2,
  Bell,
  BellOff,
  User as UserIcon,
  ChevronRight,
  PlusCircle,
  FileText,
  Users,
  Mail,
  ArrowRight,
  Filter,
  Layers,
  PieChart as PieChartIcon,
  LayoutGrid,
  Calendar,
  Calculator,
  ArrowDownCircle,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// Real employee list
const AGENTS = [
  { uid: 'agent-muxlisa', name: 'Muxlisa', email: 'muxlisa@gmail.com' },
  { uid: 'agent-ruxshona', name: 'Ruxshona', email: 'ruxshona@gmail.com' },
  { uid: 'agent-aziza', name: 'Aziza', email: 'aziza@gmail.com' },
];

const CATEGORIES = ['Qurt', "O'yinchoqlar", 'Milchovka'];
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

interface DashboardProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, activeTab, setActiveTab }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [agentTargets, setAgentTargets] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [goals, setGoals] = useState<LongTermGoal[]>([]);
  const [salaryConfig, setSalaryConfig] = useState<SalaryConfig>({ commissionRate: 3 });
  
  // UI states
  const [reportData, setReportData] = useState({ qurt: 0, toys: 0, milchovka: 0 });
  const [isDebt, setIsDebt] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState<number | ''>('');
  const [tempTargets, setTempTargets] = useState<Record<string, number>>({});
  const [notificationsOn, setNotificationsOn] = useState(user.notificationsEnabled ?? true);
  const [selectedAgentUid, setSelectedAgentUid] = useState<string | 'all'>('all');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isDirector = user.role === UserRole.DIRECTOR;
  const DEFAULT_PLAN = 500000000;

  useEffect(() => {
    const unsubSales = onSnapshot(query(collection(db, "sales"), orderBy("timestamp", "desc")), (snap) => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as Sale)));
    });

    const unsubChat = onSnapshot(query(collection(db, "messages"), orderBy("timestamp", "asc"), limit(100)), (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
      if (activeTab === 'chat') {
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    const unsubPlans = onSnapshot(query(collection(db, "plans"), where("agentId", "==", user.uid), orderBy("timestamp", "desc")), (snap) => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyPlan)));
    });

    const unsubGoals = onSnapshot(query(collection(db, "goals"), where("agentId", "==", user.uid)), (snap) => {
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as LongTermGoal)));
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setSalaryConfig(docSnap.data() as SalaryConfig);
      }
    });

    const unsubTargets = onSnapshot(collection(db, "targets"), (snap) => {
      const targets: Record<string, number> = {};
      snap.docs.forEach(d => { targets[d.id] = d.data().targetAmount; });
      setAgentTargets(targets);
      setTempTargets(targets);
    });

    return () => { 
      unsubSales(); unsubChat(); unsubPlans(); unsubGoals(); unsubSettings(); unsubTargets(); 
    };
  }, [user.uid, activeTab]);

  const agentTarget = agentTargets[user.uid] || DEFAULT_PLAN;
  const dailyTarget = agentTarget / 30;
  
  const activeSales = useMemo(() => {
    if (isDirector) {
      return selectedAgentUid === 'all' ? sales : sales.filter(s => s.agentId === selectedAgentUid);
    }
    return sales.filter(s => s.agentId === user.uid);
  }, [sales, isDirector, user.uid, selectedAgentUid]);

  const stats = useMemo(() => {
    const currentTarget = isDirector && selectedAgentUid === 'all' 
      ? Object.values(agentTargets).reduce((a: number, b: number) => a + b, 0) || (DEFAULT_PLAN * AGENTS.length)
      : (agentTargets[isDirector ? selectedAgentUid : user.uid] || DEFAULT_PLAN);

    const totalAchieved = activeSales.reduce((sum: number, s: Sale) => sum + s.totalPrice, 0);
    const totalDebt = activeSales.reduce((sum: number, s: Sale) => sum + (s.isDebt ? s.totalPrice : 0), 0);
    const totalPaid = totalAchieved - totalDebt;
    const debtPercent = totalAchieved > 0 ? (totalDebt / totalAchieved) * 100 : 0;
    const progressPercent = (totalAchieved / currentTarget) * 100;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = activeSales.filter(s => s.timestamp >= today.getTime());
    const dailyAchieved = todaySales.reduce((sum: number, s: Sale) => sum + s.totalPrice, 0);
    const dailyProgress = (dailyAchieved / (currentTarget / 30)) * 100;

    return { totalAchieved, totalDebt, totalPaid, debtPercent, progressPercent, dailyAchieved, dailyProgress, currentTarget };
  }, [activeSales, agentTargets, isDirector, user.uid, selectedAgentUid]);

  // Comprehensive analytics data for the Director
  const comparisonData = useMemo(() => {
    return AGENTS.map(agent => {
      const agentSales = sales.filter(s => s.agentId === agent.uid);
      const total = agentSales.reduce((sum: number, s: Sale) => sum + s.totalPrice, 0);
      const target = agentTargets[agent.uid] || DEFAULT_PLAN;
      const categories: Record<string, number> = {};
      CATEGORIES.forEach(cat => {
        categories[cat] = agentSales.filter(s => s.category === cat).reduce((sum: number, s: Sale) => sum + s.totalPrice, 0);
      });

      return {
        name: agent.name,
        total,
        target,
        progress: (total / target) * 100,
        ...categories
      };
    });
  }, [sales, agentTargets]);

  const overallCategoryShare = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat,
      value: sales.filter(s => s.category === cat).reduce((sum: number, s: Sale) => sum + s.totalPrice, 0)
    }));
  }, [sales]);

  const individualCategoryShare = useMemo(() => {
    if (selectedAgentUid === 'all') return [];
    return CATEGORIES.map(cat => ({
      name: cat,
      value: activeSales.filter(s => s.category === cat).reduce((sum: number, s: Sale) => sum + s.totalPrice, 0)
    }));
  }, [activeSales, selectedAgentUid]);

  const individualDailyStats = useMemo(() => {
    if (selectedAgentUid === 'all') return [];
    const grouped: Record<string, number> = {};
    activeSales.forEach(s => {
      const day = new Date(s.timestamp).toLocaleDateString();
      grouped[day] = (grouped[day] || 0) + s.totalPrice;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).reverse().slice(0, 14);
  }, [activeSales, selectedAgentUid]);

  // Handlers
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        senderName: user.displayName,
        text: chatMessage,
        timestamp: Date.now()
      });
      setChatMessage('');
    } catch (e) { console.error(e); }
  };

  const handleAddPlan = async () => {
    if (!newPlan.trim()) return;
    try {
      await addDoc(collection(db, "plans"), {
        agentId: user.uid,
        text: newPlan,
        isCompleted: false,
        timestamp: Date.now()
      });
      setNewPlan('');
    } catch (e) { alert('Xato yuz berdi'); }
  };

  const togglePlan = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "plans", id), { isCompleted: !current });
  };

  const deletePlan = async (id: string) => {
    await deleteDoc(doc(db, "plans", id));
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim() || !newGoalAmount) return;
    try {
      await addDoc(collection(db, "goals"), {
        agentId: user.uid,
        title: newGoalTitle,
        targetAmount: newGoalAmount,
        currentAmount: 0,
        icon: '🎯'
      });
      setNewGoalTitle('');
      setNewGoalAmount('');
    } catch (e) { alert('Xato yuz berdi'); }
  };

  const handleAddSaleReport = async () => {
    if (!user.uid) return;
    const items = [
      { cat: 'Qurt', val: reportData.qurt },
      { cat: "O'yinchoqlar", val: reportData.toys },
      { cat: 'Milchovka', val: reportData.milchovka }
    ];
    try {
      for (const item of items) {
        if (item.val > 0) {
          await addDoc(collection(db, "sales"), {
            agentId: user.uid,
            agentName: user.displayName,
            category: item.cat,
            totalPrice: item.val,
            isDebt: isDebt,
            timestamp: Date.now()
          });
        }
      }
      alert('Hisobot yuborildi!');
      setReportData({ qurt: 0, toys: 0, milchovka: 0 });
      setIsDebt(false);
      setActiveTab('home');
    } catch (e) { alert('Xatolik yuz berdi'); }
  };

  const updateCommission = async (val: number) => {
    await setDoc(doc(db, "settings", "global"), { commissionRate: val });
  };

  const handleUpdateTargets = async () => {
    try {
      for (const [agentId, targetAmount] of Object.entries(tempTargets)) {
        await setDoc(doc(db, "targets", agentId), { targetAmount });
      }
      alert('Rejalar saqlandi!');
    } catch (e) { alert('Xatolik yuz berdi'); }
  };

  const updateNotifications = async (val: boolean) => {
    setNotificationsOn(val);
  };

  // Views
  const renderHome = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-indigo-950 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4 tracking-tighter">GIGO TOYS Boshqaruv</h2>
            <p className="text-indigo-400 text-sm font-bold uppercase tracking-[0.2em] mb-10">Oylik Reja Progressi</p>
            <div className="flex justify-between items-end mb-4">
               <div>
                  <p className="text-5xl font-black tracking-tighter">{stats.totalAchieved.toLocaleString()} <span className="text-xs opacity-40 uppercase">UZS</span></p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black text-indigo-400">{stats.progressPercent.toFixed(1)}%</p>
               </div>
            </div>
            <div className="h-4 w-full bg-white/10 rounded-full mb-12 shadow-inner p-1">
               <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${Math.min(stats.progressPercent, 100)}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Bugungi Savdo</p>
                <p className="text-lg font-black">{stats.dailyAchieved.toLocaleString()} <span className="text-[10px]">UZS</span></p>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Qarz Ulushi</p>
                <p className={`text-lg font-black ${stats.debtPercent > 7 ? 'text-rose-400' : 'text-emerald-400'}`}>{stats.debtPercent.toFixed(1)}%</p>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Maosh (Komissiya)</p>
                <p className="text-lg font-black text-indigo-300">{(stats.totalAchieved * (salaryConfig.commissionRate/100)).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center group">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-indigo-600 shadow-inner group-hover:rotate-12 transition-all">
             <Clock size={48} strokeWidth={3} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Kunlik Maqsad</h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Limit: {(stats.currentTarget / 30).toLocaleString()} UZS</p>
          <div className="text-5xl font-black text-indigo-600 mb-4">{stats.dailyProgress.toFixed(0)}%</div>
          <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-600" style={{ width: `${Math.min(stats.dailyProgress, 100)}%` }} />
          </div>
        </div>
      </div>
      
      {isDirector && (
         <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-4"><Settings className="text-indigo-600" /> Director Panel: Rejalarni Boshqarish</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="p-10 bg-indigo-50 rounded-[3rem] border border-indigo-100">
                  <label className="text-[11px] font-black text-indigo-600 uppercase mb-4 block tracking-widest">Global Komissiya Foizi (%)</label>
                  <div className="flex items-center gap-6">
                     <input type="range" min="1" max="15" step="0.5" value={salaryConfig.commissionRate} onChange={e => updateCommission(parseFloat(e.target.value))} className="flex-1 accent-indigo-600" />
                     <span className="text-3xl font-black text-indigo-950">{salaryConfig.commissionRate}%</span>
                  </div>
               </div>
               <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100">
                  <label className="text-[11px] font-black text-emerald-600 uppercase mb-4 block tracking-widest">Agentlar Rejasi (Oylik)</label>
                  <div className="space-y-4">
                     {AGENTS.map(agent => (
                        <div key={agent.uid} className="flex items-center justify-between bg-white/50 p-3 rounded-2xl">
                           <span className="text-xs font-black text-slate-700">{agent.name}</span>
                           <input type="number" value={tempTargets[agent.uid] || DEFAULT_PLAN} onChange={e => setTempTargets({...tempTargets, [agent.uid]: parseInt(e.target.value) || 0})} className="w-32 p-2 bg-white border-2 border-slate-100 rounded-xl text-xs font-black outline-none focus:border-emerald-500" />
                        </div>
                     ))}
                     <button onClick={handleUpdateTargets} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-[10px] shadow-lg shadow-emerald-200 mt-2">Saqlash</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Selection Control Panel */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-50 rounded-[1.5rem] text-indigo-600"><Filter size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Xodimlarni Saralash</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Statistikani ko'rish rejimini tanlang</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => setSelectedAgentUid('all')} className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedAgentUid === 'all' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Barcha Xodimlar</button>
          {AGENTS.map(a => (
            <button key={a.uid} onClick={() => setSelectedAgentUid(a.uid)} className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedAgentUid === a.uid ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{a.name}</button>
          ))}
        </div>
      </div>

      {selectedAgentUid === 'all' ? (
        <div className="space-y-12">
          {/* COMPARISON DASHBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Sales vs Targets Chart */}
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl">
              <h3 className="text-xl font-black mb-10 flex items-center gap-4 text-slate-800"><LayoutGrid className="text-indigo-600" /> Savdo va Rejalar Solishtiruvi</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                    <Bar dataKey="total" name="Haqiqiy Savdo" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                    <Bar dataKey="target" name="Belgilangan Reja" fill="#e2e8f0" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overall Category Distribution */}
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl">
              <h3 className="text-xl font-black mb-10 flex items-center gap-4 text-slate-800"><PieChartIcon className="text-purple-600" /> Umumiy Maxsulot Ulushlari</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={overallCategoryShare} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                      {overallCategoryShare.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950 p-12 rounded-[4rem] text-white shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12"><Layers size={250} /></div>
             <h3 className="text-2xl font-black mb-12 flex items-center gap-4 relative z-10"><Layers className="text-indigo-400" /> Xodimlar va Maxsulotlar Kesimi (%)</h3>
             <div className="h-[450px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#818cf8', fontSize: 10}} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#fff', fontSize: 12, fontWeight: 700}} width={100} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', color: '#000'}} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Qurt" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} barSize={50} />
                    <Bar dataKey="O'yinchoqlar" stackId="a" fill="#a855f7" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Milchovka" stackId="a" fill="#ec4899" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
           <div className="bg-white p-16 rounded-[5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 -mr-20 -mt-20 rounded-full blur-[100px] opacity-10" />
              <div className="flex flex-col lg:flex-row items-center gap-12 mb-16 relative z-10">
                 <div className="w-48 h-48 bg-indigo-900 rounded-[4.5rem] flex items-center justify-center text-white text-7xl font-black shadow-2xl shadow-indigo-200 border-8 border-white">
                   {AGENTS.find(a => a.uid === selectedAgentUid)?.name.charAt(0)}
                 </div>
                 <div className="text-center lg:text-left flex-1">
                    <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">Shaxsiy Statistika Paneli</div>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{AGENTS.find(a => a.uid === selectedAgentUid)?.name}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em] mb-8">{AGENTS.find(a => a.uid === selectedAgentUid)?.email}</p>
                 </div>
                 <div className="w-full lg:w-auto p-8 bg-indigo-50 rounded-[3rem] border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 text-center">Progress Vizualizatsiya</p>
                    <div className="relative w-40 h-40 mx-auto">
                       <svg className="w-full h-full transform -rotate-90">
                          <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.8)" strokeWidth="15" fill="transparent" />
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="15" fill="transparent" strokeDasharray={439.8} strokeDashoffset={439.8 - (439.8 * Math.min(stats.progressPercent, 100)) / 100} strokeLinecap="round" className="text-indigo-600 transition-all duration-1000" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-indigo-900">{stats.progressPercent.toFixed(0)}%</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  const renderPayroll = () => (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="bg-indigo-950 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12"><Calculator size={200} /></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-10 tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20"><Calculator size={28} /></div>
             Oylik Maoshlar Monitoringi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-3">Hozirgi Komissiya</p>
              <p className="text-4xl font-black">{salaryConfig.commissionRate}%</p>
            </div>
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-3">Jami Savdo</p>
              <p className="text-4xl font-black">{sales.reduce((sum: number, s: Sale) => sum + s.totalPrice, 0).toLocaleString()} <span className="text-xs opacity-40 uppercase">UZS</span></p>
            </div>
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
              <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-3">Jami To'lanadigan Maoshlar</p>
              <p className="text-4xl font-black text-emerald-400">{(sales.reduce((sum: number, s: Sale) => sum + s.totalPrice, 0) * (salaryConfig.commissionRate/100)).toLocaleString()} <span className="text-xs opacity-40 uppercase">UZS</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Xodim</th>
              <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Oylik Savdo</th>
              <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Komissiya</th>
              <th className="px-10 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Hisoblangan Maosh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {AGENTS.map(agent => {
              const agentTotal = sales.filter(s => s.agentId === agent.uid).reduce((sum: number, s: Sale) => sum + s.totalPrice, 0);
              const agentSalary = agentTotal * (salaryConfig.commissionRate / 100);
              return (
                <tr key={agent.uid} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">{agent.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{agent.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{agent.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-slate-900">{agentTotal.toLocaleString()} UZS</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black">{salaryConfig.commissionRate}%</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <p className="text-lg font-black text-emerald-600">{agentSalary.toLocaleString()} UZS</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-left-8 duration-500">
      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl">
        <h3 className="text-3xl font-black text-slate-900 mb-10 tracking-tighter flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100"><FileText size={28} strokeWidth={3} /></div>
          Bugungi Savdo Hisoboti
        </h3>
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Qurt Savdosi (Summa)</label>
            <input type="number" value={reportData.qurt} onChange={e => setReportData({...reportData, qurt: parseInt(e.target.value) || 0})} className="w-full p-6 bg-slate-50 border-3 border-transparent focus:border-indigo-500 rounded-[2rem] text-xl font-black outline-none transition-all shadow-inner" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">O'yinchoqlar Savdosi (Summa)</label>
            <input type="number" value={reportData.toys} onChange={e => setReportData({...reportData, toys: parseInt(e.target.value) || 0})} className="w-full p-6 bg-slate-50 border-3 border-transparent focus:border-indigo-500 rounded-[2rem] text-xl font-black outline-none transition-all shadow-inner" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Milchovka Savdosi (Summa)</label>
            <input type="number" value={reportData.milchovka} onChange={e => setReportData({...reportData, milchovka: parseInt(e.target.value) || 0})} className="w-full p-6 bg-slate-50 border-3 border-transparent focus:border-indigo-500 rounded-[2rem] text-xl font-black outline-none transition-all shadow-inner" />
          </div>
          <div className="flex items-center gap-4 p-6 bg-rose-50 rounded-[2rem] border border-rose-100">
             <input type="checkbox" id="debt" checked={isDebt} onChange={e => setIsDebt(e.target.checked)} className="w-6 h-6 accent-rose-500" />
             <label htmlFor="debt" className="text-sm font-black text-rose-700 uppercase tracking-widest cursor-pointer">Bu savdo qarzga (Nasiya) berildi</label>
          </div>
          <button onClick={handleAddSaleReport} className="w-full bg-indigo-600 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-lg shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all">Hisobotni Tasdiqlash</button>
        </div>
      </div>
    </div>
  );

  const renderStats = () => {
    const data = [
      { name: 'Qurt', value: activeSales.filter(s => s.category === 'Qurt').reduce((sum: number, s: Sale) => sum + s.totalPrice, 0) },
      { name: "O'yinchoqlar", value: activeSales.filter(s => s.category === "O'yinchoqlar").reduce((sum: number, s: Sale) => sum + s.totalPrice, 0) },
      { name: 'Milchovka', value: activeSales.filter(s => s.category === 'Milchovka').reduce((sum: number, s: Sale) => sum + s.totalPrice, 0) },
    ];
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-4"><BarChart3 className="text-indigo-600" /> Kategoriya Bo'yicha</h3>
            <div className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">{data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
          </div>
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl">
             <h3 className="text-2xl font-black mb-10 flex items-center gap-4"><TrendingUp className="text-indigo-600" /> Oxirgi Savdolar</h3>
             <div className="space-y-4">
                {activeSales.slice(0, 6).map(s => (
                  <div key={s.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl">
                     <div><p className="text-xs font-black text-slate-800">{s.category}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(s.timestamp).toLocaleDateString()}</p></div>
                     <p className={`font-black ${s.isDebt ? 'text-rose-500' : 'text-emerald-500'}`}>{s.totalPrice.toLocaleString()} UZS</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlans = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl">
        <h3 className="text-3xl font-black text-slate-900 mb-10 tracking-tighter flex items-center gap-4"><div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100"><CheckSquare size={28} strokeWidth={3} /></div>Kunlik Rejalar</h3>
        <div className="flex gap-4 mb-10">
          <input type="text" placeholder="Bugun nima qilmoqchisiz?" value={newPlan} onChange={e => setNewPlan(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddPlan()} className="flex-1 p-6 bg-slate-50 border-3 border-transparent focus:border-indigo-500 rounded-[2rem] text-sm font-black outline-none transition-all shadow-inner" />
          <button onClick={handleAddPlan} className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"><Plus size={28} strokeWidth={3} /></button>
        </div>
        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:shadow-lg transition-all">
              <div className="flex items-center gap-6">
                <button onClick={() => togglePlan(plan.id, plan.isCompleted)} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${plan.isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white border-2 border-slate-200 text-transparent'}`}><CheckCircle2 size={20} strokeWidth={3} /></button>
                <span className={`text-base font-bold tracking-tight ${plan.isCompleted ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{plan.text}</span>
              </div>
              <button onClick={() => deletePlan(plan.id)} className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
            </div>
          ))}
          {plans.length === 0 && <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100"><p className="text-slate-300 font-black uppercase tracking-[0.3em] text-xs">Rejalar yo'q</p></div>}
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="max-w-4xl mx-auto space-y-10 animate-in zoom-in-95 duration-500">
      <div className="bg-indigo-950 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12"><Flag size={200} /></div>
        <h3 className="text-3xl font-black mb-12 tracking-tighter flex items-center gap-5"><div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl shadow-emerald-500/20"><Flag size={28} strokeWidth={3} /></div>Maqsadlar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           {goals.map(goal => (
             <div key={goal.id} className="p-8 bg-white/5 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all group">
                <div className="flex justify-between items-start mb-6"><div className="text-4xl group-hover:scale-125 transition-transform">{goal.icon}</div><div className="text-right"><p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Progress</p><p className="text-xl font-black text-emerald-400">0%</p></div></div>
                <h4 className="text-xl font-black mb-3 tracking-tight">{goal.title}</h4>
                <div className="h-2 w-full bg-white/5 rounded-full mb-4 shadow-inner"><div className="h-full bg-indigo-500 rounded-full" style={{ width: '0%' }} /></div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300"><span>0 UZS</span><span>{goal.targetAmount.toLocaleString()} UZS</span></div>
             </div>
           ))}
        </div>
        <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 backdrop-blur-md">
           <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-indigo-300">Yangi maqsad qo'shish</h4>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input type="text" placeholder="Maqsad nomi" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} className="bg-white/5 border-2 border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-sm" />
              <input type="number" placeholder="Kerakli summa" value={newGoalAmount} onChange={e => setNewGoalAmount(parseInt(e.target.value) || '')} className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-sm pr-12" />
           </div>
           <button onClick={handleAddGoal} className="w-full mt-6 bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Qo'shish</button>
        </div>
      </div>
    </div>
  );

  const renderBonuses = () => (
    <div className="max-w-4xl mx-auto space-y-10 animate-in zoom-in-95 duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { threshold: 100000000, title: 'Bronza Bonus', desc: '100 mln savdo uchun 1 mln so\'m', icon: '🥉' },
            { threshold: 250000000, title: 'Kumush Bonus', desc: '250 mln savdo uchun Smart Watch', icon: '🥈' },
            { threshold: 500000000, title: 'Oltin Bonus', desc: '500 mln savdo uchun iPhone 15 Pro', icon: '🥇' },
            { threshold: 1000000000, title: 'GIGO Super Bonus', desc: '1 mlrd savdo uchun Dubay sayohati', icon: '✈️' },
          ].map((bonus, i) => (
            <div key={i} className={`p-10 rounded-[4rem] border-2 transition-all ${stats.totalAchieved >= bonus.threshold ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 opacity-60'}`}>
               <div className="text-6xl mb-6">{bonus.icon}</div>
               <h4 className="text-2xl font-black mb-2">{bonus.title}</h4>
               <p className="text-sm font-bold text-slate-500 mb-6">{bonus.desc}</p>
               <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${stats.totalAchieved >= bonus.threshold ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min((stats.totalAchieved / bonus.threshold) * 100, 100)}%` }} /></div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderWallet = () => (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
       <div className="bg-rose-600 p-16 rounded-[5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><AlertTriangle size={150} /></div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 text-rose-200">Qarzlar (Nasiya)</p>
          <h3 className="text-6xl font-black tracking-tighter mb-10">{stats.totalDebt.toLocaleString()} <span className="text-xl opacity-50 uppercase">UZS</span></h3>
          <div className="flex items-center gap-4 bg-white/10 p-6 rounded-[2.5rem] border border-white/10"><Info className="text-rose-200" /><p className="text-xs font-bold">Hozirda sizning ko'rsatkichingiz: <span className="font-black text-rose-200">{stats.debtPercent.toFixed(1)}%</span></p></div>
       </div>
       <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl">
          <h4 className="text-xl font-black mb-8 px-4">Nasiya ro'yxati</h4>
          <div className="space-y-4">
             {activeSales.filter(s => s.isDebt).map(s => (
                <div key={s.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl hover:bg-rose-50 transition-colors border border-transparent">
                   <div><p className="text-sm font-black text-slate-800">{s.category}</p><p className="text-[10px] text-slate-400 font-black mt-1">{new Date(s.timestamp).toLocaleDateString()}</p></div>
                   <p className="text-lg font-black text-rose-600">{s.totalPrice.toLocaleString()} UZS</p>
                </div>
             ))}
             {activeSales.filter(s => s.isDebt).length === 0 && <div className="text-center py-20 bg-emerald-50 rounded-[3rem] border border-emerald-100"><CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" /><p className="text-sm font-black text-emerald-700 uppercase tracking-widest">Qarzlar yo'q!</p></div>}
          </div>
       </div>
    </div>
  );

  const renderSalary = () => {
    const calculatedSalary = stats.totalAchieved * (salaryConfig.commissionRate / 100);
    const paidCommission = stats.totalPaid * (salaryConfig.commissionRate / 100);
    const pendingCommission = stats.totalDebt * (salaryConfig.commissionRate / 100);

    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
        <div className="bg-white p-20 rounded-[5rem] border border-slate-100 shadow-2xl text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-4 bg-indigo-600" />
            <div className="w-32 h-32 bg-indigo-50 rounded-[3.5rem] flex items-center justify-center mx-auto mb-10 text-indigo-600 shadow-inner group-hover:rotate-[15deg] transition-transform">
              <Banknote size={64} strokeWidth={2.5} />
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Oylik Hisob-Kitob</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-16">Oylik savdoning {salaryConfig.commissionRate}% miqdoridagi maosh</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
               <div className="p-10 bg-slate-900 rounded-[3.5rem] text-white border border-white/10 shadow-2xl">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Umumiy Hisoblangan Maosh</p>
                  <h4 className="text-5xl font-black tracking-tighter">{calculatedSalary.toLocaleString()} <span className="text-base opacity-40 uppercase">UZS</span></h4>
                  <div className="mt-8 flex items-center justify-center gap-3 py-2 px-4 bg-white/5 rounded-full inline-flex">
                     <TrendingUp size={16} className="text-emerald-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Savdo: {stats.totalAchieved.toLocaleString()}</span>
                  </div>
               </div>
               
               <div className="p-10 bg-emerald-50 rounded-[3.5rem] border border-emerald-100 shadow-lg shadow-emerald-50/50">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Tasdiqlangan To'lov (Naqd)</p>
                  <h4 className="text-5xl font-black text-emerald-900 tracking-tighter">{paidCommission.toLocaleString()} <span className="text-base opacity-40 uppercase">UZS</span></h4>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-6">Faqat naqd savdolardan hisoblangan</p>
               </div>
            </div>

            <div className="bg-rose-50 p-10 rounded-[3.5rem] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center shadow-inner"><TrendingDown size={32} /></div>
                  <div className="text-left">
                     <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Kutilayotgan Komissiya (Nasiya)</p>
                     <p className="text-2xl font-black text-rose-900">{pendingCommission.toLocaleString()} UZS</p>
                  </div>
               </div>
               <div className="bg-white px-6 py-4 rounded-3xl border border-rose-100">
                  <p className="text-[11px] font-bold text-rose-700 leading-relaxed uppercase italic">
                    * Qarzlar yopilgandan so'ng bu summa asosiy maoshingizga qo'shiladi.
                  </p>
               </div>
            </div>

            <div className="mt-16 p-8 bg-indigo-50/50 rounded-[3rem] border border-indigo-100/50">
               <div className="flex items-start gap-4 text-left">
                  <Info className="text-indigo-400 shrink-0 mt-1" size={20} />
                  <p className="text-[11px] font-bold text-indigo-700 leading-relaxed uppercase">
                    Diqqat! Direktor Elyor Saydullayev tomonidan belgilangan oylik ish haqi {salaryConfig.commissionRate}% qilib o'rnatilgan. Ushbu summa 1 oy davomida qancha tovar sotsangiz shu summaning {salaryConfig.commissionRate}% miqdorini tashkil qiladi.
                  </p>
               </div>
            </div>
        </div>
      </div>
    );
  };

  const renderChat = () => (
    <div className="h-[750px] bg-white rounded-[4rem] border border-slate-100 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 relative">
      <div className="px-12 py-10 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-6"><div className="w-20 h-20 bg-indigo-950 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl">G</div><div><h4 className="text-2xl font-black text-slate-800 tracking-tighter">GIGO Umumiy Chat</h4><div className="flex items-center gap-2 mt-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /><p className="text-[11px] text-emerald-500 font-black uppercase tracking-widest">Online Muloqot</p></div></div></div>
        <div className="flex items-center -space-x-4">{AGENTS.concat({uid:'dir', name:'Elyor', email:'elyor@gmail.com'}).map((a, i) => (<div key={i} className={`w-12 h-12 rounded-2xl border-4 border-white flex items-center justify-center font-black text-xs shadow-lg ${i % 2 === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>{a.name.charAt(0)}</div>))}</div>
      </div>
      <div className="flex-1 p-12 overflow-y-auto space-y-8 bg-slate-50/20 custom-scrollbar flex flex-col">
        {messages.map((m, idx) => {
          const isMe = m.senderId === user.uid;
          const showName = idx === 0 || messages[idx-1].senderId !== m.senderId;
          return (
            <div key={m.id} className={`flex gap-4 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
               {!isMe && showName && <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0 mt-1">{m.senderName.charAt(0)}</div>}
               {(!showName && !isMe) && <div className="w-10 h-10" />}
               <div className={`p-6 rounded-[2.5rem] shadow-sm relative group ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}>{showName && <p className={`text-[9px] font-black uppercase mb-1 tracking-widest ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>{m.senderName}</p>}<p className="text-sm font-bold leading-relaxed">{m.text}</p><p className={`text-[8px] font-black uppercase mt-3 opacity-40 text-right ${isMe ? 'text-white' : 'text-slate-400'}`}>{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p></div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
      <div className="p-10 bg-white border-t border-slate-100 flex items-center gap-6">
        <input type="text" placeholder="Xabar yozing..." className="flex-1 p-8 bg-slate-50 border-3 border-transparent focus:border-indigo-500 rounded-[3rem] text-sm font-black outline-none shadow-inner" value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
        <button onClick={handleSendMessage} className="w-20 h-20 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"><Send size={32} strokeWidth={3} /></button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-12 animate-in slide-in-from-left-8 duration-500 max-w-4xl mx-auto">
      <div className="bg-white p-16 rounded-[5rem] border border-slate-100 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-48 bg-indigo-950 -z-10" />
        <div className="w-48 h-48 bg-white p-2.5 rounded-[4rem] shadow-2xl mt-12 mb-10 border-4 border-indigo-600 relative"><div className="w-full h-full bg-slate-100 rounded-[3.5rem] flex items-center justify-center text-indigo-600 font-black text-6xl shadow-inner">{user.displayName.charAt(0)}</div><div className="absolute bottom-4 right-4 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white shadow-xl animate-pulse" /></div>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{user.displayName}</h3>
        <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mt-3 border border-indigo-50 px-6 py-2 rounded-full bg-indigo-50/30">GIGO TOYS {isDirector ? 'DIREKTORI' : 'AGENTI'}</p>
      </div>
      <div className="bg-slate-950 p-16 rounded-[5rem] text-white shadow-2xl">
        <h4 className="text-2xl font-black uppercase tracking-tight mb-12 flex items-center gap-6"><div className="p-3 bg-white/5 rounded-2xl border border-white/5"><Settings size={28} /></div>Shaxsiy Sozlamalar</h4>
        <div className="space-y-6">
          <div onClick={() => updateNotifications(!notificationsOn)} className="flex items-center justify-between p-10 bg-white/5 rounded-[3rem] border border-white/5 group hover:bg-white/10 transition-all cursor-pointer shadow-xl"><div className="flex items-center gap-8"><div className={`p-5 rounded-[1.75rem] transition-all shadow-2xl ${notificationsOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{notificationsOn ? <Bell size={32} /> : <BellOff size={32} />}</div><div><p className="text-xl font-black tracking-tight">Savdo Bildirishnomalari</p><p className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] mt-2">Status: {notificationsOn ? 'YONIQL' : 'O\'CHIRILGAN'}</p></div></div><div className={`w-16 h-8 rounded-full relative transition-all shadow-inner ${notificationsOn ? 'bg-emerald-500' : 'bg-slate-800'}`}><div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all shadow-2xl ${notificationsOn ? 'right-1.5' : 'left-1.5'}`} /></div></div>
          <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-md"><div className="flex items-start gap-5"><Info className="text-indigo-400 shrink-0 mt-1" size={24} /><p className="text-xs font-bold text-slate-400 leading-loose uppercase tracking-widest">* Bildirishnomalar yoqilgan taqdirda direktor Elyor Saydullayev tomonidan yuborilgan xabarlar real vaqt rejimida shaxsiy sahifangizda ko'rinib turadi.</p></div></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700">
      {activeTab === 'home' && renderHome()}
      {activeTab === 'agents' && isDirector && renderAgents()}
      {activeTab === 'payroll' && isDirector && renderPayroll()}
      {activeTab === 'reports' && renderReports()}
      {activeTab === 'stats' && renderStats()}
      {activeTab === 'plans' && renderPlans()}
      {activeTab === 'goals' && renderGoals()}
      {activeTab === 'bonuses' && renderBonuses()}
      {activeTab === 'wallet' && renderWallet()}
      {activeTab === 'salary' && renderSalary()}
      {activeTab === 'chat' && renderChat()}
      {activeTab === 'profile' && renderProfile()}
    </div>
  );
};

export default Dashboard;
