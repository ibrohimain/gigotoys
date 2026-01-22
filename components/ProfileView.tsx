
import React, { useState } from 'react';
import { User, AgentStats, TransactionType, Transaction } from '../types';
import { User as UserIcon, Edit3, Save, Target, Star, Wallet, History, TrendingUp, Phone, Mail, Award, Rocket, CheckCircle2, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ProfileViewProps {
  user: User;
  stats: AgentStats;
  onUpdateProfile?: (updatedUser: User) => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
};

const getTxTypeStyle = (type: TransactionType) => {
  switch (type) {
    case 'SALARY': return { label: 'Oylik', color: 'text-blue-600', bg: 'bg-blue-50', icon: 'M' };
    case 'BONUS': return { label: 'Bonus', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'B' };
    case 'REWARD': return { label: 'Mukofot', color: 'text-amber-600', bg: 'bg-amber-50', icon: 'W' };
    case 'AVANS': return { label: 'Avans', color: 'text-rose-600', bg: 'bg-rose-50', icon: 'A' };
    default: return { label: 'To\'lov', color: 'text-slate-600', bg: 'bg-slate-50', icon: 'T' };
  }
};

const ProfileView: React.FC<ProfileViewProps> = ({ user, stats, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [activeGoalTab, setActiveGoalTab] = useState<'DAILY' | 'LONG'>('DAILY');

  const handleSave = () => {
    onUpdateProfile?.(editedUser);
    setIsEditing(false);
  };

  const pieData = [
    { name: 'Qurt', value: stats.qurtSales, color: '#6366f1' },
    { name: 'O\'yin', value: stats.toySales, color: '#10b981' },
    { name: 'Milch', value: stats.milchofkaSales, color: '#f59e0b' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Top Banner Profile */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] -mr-40 -mt-40 opacity-70"></div>
        <div className="relative z-10 w-32 h-32 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-xl">
          {user.name.charAt(0)}
        </div>
        <div className="relative z-10 text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{user.name}</h3>
            {user.status && (
              <span className="px-4 py-1.5 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 flex items-center gap-2">
                <Star size={12} fill="currentColor" /> {user.status}
              </span>
            )}
          </div>
          <p className="text-indigo-600 font-bold uppercase text-xs tracking-[0.3em]">Professional Savdo Agenti • ID: {user.id}</p>
          <div className="flex gap-3 mt-6 justify-center md:justify-start">
             <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">
                {isEditing ? 'Bekor qilish' : 'Profilni tahrirlash'}
             </button>
             {isEditing && (
               <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg">Saqlash</button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal Info & Mini Stats */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest"><UserIcon size={16} className="text-indigo-600"/> Shaxsiy Ma'lumotlar</h4>
             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">F.I.SH</label>
                   {isEditing ? <input value={editedUser.name} onChange={e => setEditedUser({...editedUser, name: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold outline-none" /> : <div className="p-3 bg-slate-50 rounded-xl font-bold text-slate-700">{user.name}</div>}
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Telefon</label>
                   {isEditing ? <input value={editedUser.phone || ''} onChange={e => setEditedUser({...editedUser, phone: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold outline-none" /> : <div className="p-3 bg-slate-50 rounded-xl font-bold text-slate-700">{user.phone || 'Kiritilmagan'}</div>}
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Email</label>
                   <div className="p-3 bg-slate-50 rounded-xl font-bold text-slate-400">{user.email}</div>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest"><TrendingUp size={16} className="text-emerald-500"/> Shaxsiy Statistika</h4>
             <div className="h-48 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                      {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase">Jami Savdo</p>
                   <p className="font-black text-indigo-600 text-sm">{formatCurrency(stats.totalSales).split(" ")[0]}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase">Progress</p>
                   <p className="font-black text-emerald-600 text-sm">{stats.progressPercentage.toFixed(1)}%</p>
                </div>
             </div>
          </div>
        </div>

        {/* Center/Right Column: Treasury & Goals */}
        <div className="lg:col-span-8 space-y-8">
          {/* Treasury (Xazna) Card */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10"><Wallet size={120} /></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 text-indigo-400"><Wallet size={20}/></div>
                      <h4 className="font-black uppercase text-xs tracking-widest text-indigo-200">Mening Xaznam (Balans)</h4>
                   </div>
                   <p className="text-5xl font-black tracking-tighter mb-4">{formatCurrency(user.bonusBalance || 0).split(" ")[0]} <span className="text-xl opacity-60">so'm</span></p>
                   <div className="flex gap-4 mt-8">
                      <div className="flex-1 p-4 bg-white/5 rounded-3xl border border-white/10">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Bu Haftada</p>
                         <p className="text-lg font-black text-emerald-400">+{formatCurrency((user.transactions || []).filter(t => new Date(t.date) > new Date(Date.now() - 7*24*60*60*1000)).reduce((a,b)=>a+b.amount,0)).split(" ")[0]}</p>
                      </div>
                      <div className="flex-1 p-4 bg-white/5 rounded-3xl border border-white/10">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-1">O'rtacha Maosh</p>
                         <p className="text-lg font-black text-indigo-300">~{formatCurrency(user.bonusBalance ? user.bonusBalance / 3 : 0).split(" ")[0]}</p>
                      </div>
                   </div>
                </div>
                
                <div className="md:w-72 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col">
                   <div className="p-4 border-b border-white/10 bg-white/5 font-black text-[10px] uppercase tracking-widest text-indigo-300">So'nggi harakatlar</div>
                   <div className="flex-1 divide-y divide-white/5 overflow-y-auto max-h-[220px] custom-scrollbar">
                      {(user.transactions || []).slice().reverse().map(tx => {
                         const style = getTxTypeStyle(tx.type);
                         return (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg ${style.bg} ${style.color} flex items-center justify-center font-black text-[10px]`}>{style.icon}</div>
                                  <div>
                                     <p className="text-[10px] font-black text-white">{style.label}</p>
                                     <p className="text-[8px] font-bold text-slate-500 uppercase">{new Date(tx.date).toLocaleDateString()}</p>
                                  </div>
                               </div>
                               <p className="text-[10px] font-black text-emerald-400">+{tx.amount.toLocaleString()}</p>
                            </div>
                         );
                      })}
                      {(!user.transactions || user.transactions.length === 0) && <div className="p-10 text-center text-xs font-bold text-slate-500 italic">Hali mablag'lar yo'q</div>}
                   </div>
                </div>
             </div>
          </div>

          {/* Goals Section */}
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="flex border-b border-slate-100">
                <button onClick={() => setActiveGoalTab('DAILY')} className={`flex-1 py-6 font-black uppercase text-xs tracking-widest transition-all ${activeGoalTab === 'DAILY' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Kunlik Maqsad</button>
                <button onClick={() => setActiveGoalTab('LONG')} className={`flex-1 py-6 font-black uppercase text-xs tracking-widest transition-all ${activeGoalTab === 'LONG' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Uzoq muddatli Maqsad</button>
             </div>
             <div className="p-10">
                {activeGoalTab === 'DAILY' ? (
                   <div className="space-y-6">
                      <div className="flex items-center gap-4 text-indigo-600 mb-2">
                         <CheckCircle2 size={32} />
                         <div>
                            <h5 className="text-xl font-black tracking-tight">Bugun nimalarga erishasiz?</h5>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Qisqa muddatli reja</p>
                         </div>
                      </div>
                      {isEditing ? (
                         <textarea value={editedUser.dailyGoal || ''} onChange={e => setEditedUser({...editedUser, dailyGoal: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-slate-700 min-h-[150px] outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Bugungi maqsadlaringizni kiriting..." />
                      ) : (
                         <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 italic font-bold text-slate-700 leading-relaxed shadow-inner">
                            "{user.dailyGoal || 'Bugun uchun maqsad belgilanmagan...'}"
                         </div>
                      )}
                   </div>
                ) : (
                  <div className="space-y-6">
                      <div className="flex items-center gap-4 text-amber-500 mb-2">
                         <Rocket size={32} />
                         <div>
                            <h5 className="text-xl font-black tracking-tight">Katta Orzular Tizimi</h5>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Strategik uzoq muddatli reja</p>
                         </div>
                      </div>
                      {isEditing ? (
                         <textarea value={editedUser.longTermGoal || ''} onChange={e => setEditedUser({...editedUser, longTermGoal: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-slate-700 min-h-[150px] outline-none focus:ring-2 focus:ring-amber-500" placeholder="Masalan: Yil yakunigacha avtomobil sotib olish yoki savdo hajmini 2 barobarga oshirish..." />
                      ) : (
                         <div className="p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100 italic font-bold text-slate-700 leading-relaxed shadow-inner">
                            "{user.longTermGoal || 'Uzoq muddatli rejangizni profilni tahrirlash orqali kiriting...'}"
                         </div>
                      )}
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
