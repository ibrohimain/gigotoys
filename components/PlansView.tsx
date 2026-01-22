
import React, { useState } from 'react';
import { User, DailyPlan, LongTermGoal } from '../types';
import { Calendar, Rocket, Plus, CheckCircle2, Circle, Clock, Target, Trash2, Edit3, ChevronRight } from 'lucide-react';

interface PlansViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const PlansView: React.FC<PlansViewProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'DAILY' | 'LONG'>('DAILY');
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showLongModal, setShowLongModal] = useState(false);

  const [dailyData, setDailyData] = useState({ title: '', time: '' });
  const [longData, setLongData] = useState({ title: '', description: '', targetDate: '' });

  const handleAddDaily = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: DailyPlan = {
      id: Math.random().toString(36).substr(2, 9),
      agentId: user.id,
      title: dailyData.title,
      time: dailyData.time,
      date: new Date().toISOString(),
      isCompleted: false
    };
    onUpdateUser({ ...user, dailyPlans: [...(user.dailyPlans || []), newPlan] });
    setShowDailyModal(false);
    setDailyData({ title: '', time: '' });
  };

  const handleAddLong = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: LongTermGoal = {
      id: Math.random().toString(36).substr(2, 9),
      agentId: user.id,
      title: longData.title,
      description: longData.description,
      targetDate: longData.targetDate,
      progress: 0
    };
    onUpdateUser({ ...user, longTermGoals: [...(user.longTermGoals || []), newGoal] });
    setShowLongModal(false);
    setLongData({ title: '', description: '', targetDate: '' });
  };

  const toggleDaily = (id: string) => {
    const updated = (user.dailyPlans || []).map(p => p.id === id ? { ...p, isCompleted: !p.isCompleted } : p);
    onUpdateUser({ ...user, dailyPlans: updated });
  };

  const deleteDaily = (id: string) => {
    onUpdateUser({ ...user, dailyPlans: (user.dailyPlans || []).filter(p => p.id !== id) });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex gap-4 border-b border-slate-200 pb-px">
        <button onClick={() => setActiveTab('DAILY')} className={`px-6 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'DAILY' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Calendar size={18}/> Kunlik Rejalar</button>
        <button onClick={() => setActiveTab('LONG')} className={`px-6 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'LONG' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Rocket size={18}/> Uzoq Muddatli Maqsadlar</button>
      </div>

      {activeTab === 'DAILY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-black text-slate-800">Bugungi Vazifalar</h3>
                 <button onClick={() => setShowDailyModal(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-200"><Plus size={14}/> Yangi vazifa</button>
              </div>
              {(user.dailyPlans || []).length > 0 ? (user.dailyPlans || []).map(plan => (
                <div key={plan.id} className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${plan.isCompleted ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                   <div className="flex items-center gap-4">
                      <button onClick={() => toggleDaily(plan.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${plan.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-slate-200 hover:border-indigo-600'}`}>
                         {plan.isCompleted ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                      </button>
                      <div>
                         <p className={`font-black ${plan.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{plan.title}</p>
                         <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><Clock size={12}/> {plan.time}</p>
                      </div>
                   </div>
                   <button onClick={() => deleteDaily(plan.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                </div>
              )) : (
                <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-200 text-slate-300 italic font-bold">Bugun uchun vazifalar belgilanmagan</div>
              )}
           </div>
           <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
              <Target size={40} className="text-indigo-400 mb-6" />
              <h4 className="text-2xl font-black tracking-tight mb-2">Kunlik Samaradorlik</h4>
              <p className="text-indigo-200 text-sm font-medium mb-8">Vazifalarni o'z vaqtida bajarish sizni orzularingizga yaqinlashtiradi!</p>
              <div className="p-6 bg-white/10 rounded-3xl border border-white/10">
                 <p className="text-[10px] font-black uppercase text-indigo-300 mb-2">Progress</p>
                 <p className="text-4xl font-black">{(user.dailyPlans || []).filter(p => p.isCompleted).length} / {(user.dailyPlans || []).length}</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'LONG' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(user.longTermGoals || []).map(goal => (
               <div key={goal.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center"><Target size={24}/></div>
                     <button className="text-slate-300 hover:text-indigo-600"><Edit3 size={18}/></button>
                  </div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight mb-2">{goal.title}</h4>
                  <p className="text-xs text-slate-400 font-medium mb-6 line-clamp-2">{goal.description}</p>
                  <div className="space-y-4">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Progress:</span>
                        <span className="text-indigo-600">{goal.progress}%</span>
                     </div>
                     <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full transition-all" style={{ width: `${goal.progress}%` }}></div>
                     </div>
                     <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Muddat:</span>
                        <span className="text-[10px] font-black text-slate-700 uppercase">{new Date(goal.targetDate).toLocaleDateString()}</span>
                     </div>
                  </div>
               </div>
            ))}
            <button 
              onClick={() => setShowLongModal(true)}
              className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all group"
            >
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all"><Plus size={32}/></div>
               <span className="font-black text-xs uppercase tracking-widest">Yangi Maqsad</span>
            </button>
         </div>
      )}

      {/* Daily Modal */}
      {showDailyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full animate-in zoom-in duration-300 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-800 mb-6">Kunlik Vazifa</h3>
              <form onSubmit={handleAddDaily} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Vazifa nomi</label>
                    <input required value={dailyData.title} onChange={e => setDailyData({...dailyData, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="Masalan: Yangi savdo nuqtasi..." />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Vaqti</label>
                    <input type="time" required value={dailyData.time} onChange={e => setDailyData({...dailyData, time: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black" />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setShowDailyModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-[10px] uppercase">Bekor qilish</button>
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 text-[10px] uppercase">Saqlash</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Long Modal */}
      {showLongModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full animate-in zoom-in duration-300 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-800 mb-6">Strategik Maqsad</h3>
              <form onSubmit={handleAddLong} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Maqsad nomi</label>
                    <input required value={longData.title} onChange={e => setLongData({...longData, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Batafsil</label>
                    <textarea value={longData.description} onChange={e => setLongData({...longData, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold min-h-[100px]" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Tugash sanasi</label>
                    <input type="date" required value={longData.targetDate} onChange={e => setLongData({...longData, targetDate: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black" />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setShowLongModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-[10px] uppercase">Bekor qilish</button>
                    <button type="submit" className="flex-1 py-4 bg-amber-500 text-white font-black rounded-2xl shadow-xl shadow-amber-200 text-[10px] uppercase">Saqlash</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PlansView;
