
import React, { useState, useMemo } from 'react';
import { User, SalesPlan, SaleRecord, AgentStats, Timeframe } from '../types';
import { DEFAULT_REWARDS } from '../constants';
import { Trophy, Award, Key, Calendar, TrendingUp, Sparkles, Star, ChevronRight, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AgentViewProps {
  user: User;
  plan?: SalesPlan;
  sales: SaleRecord[];
  onAddSale: (sale: SaleRecord) => void;
  calculateStats: () => AgentStats;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
};

const AgentView: React.FC<AgentViewProps> = ({ user, plan, sales, calculateStats }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('QUARTERLY');
  const stats = calculateStats();
  
  const filteredStats = useMemo(() => {
    const now = new Date();
    const filtered = sales.filter(s => {
      const saleDate = new Date(s.date);
      if (selectedTimeframe === 'DAILY') return saleDate.toDateString() === now.toDateString();
      if (selectedTimeframe === 'WEEKLY') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return saleDate >= weekAgo;
      }
      if (selectedTimeframe === 'MONTHLY') return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      if (selectedTimeframe === 'YEARLY') return saleDate.getFullYear() === now.getFullYear();
      return true;
    });

    const total = filtered.reduce((acc, s) => acc + s.total, 0);
    return { total, count: filtered.length };
  }, [sales, selectedTimeframe]);

  const pieData = [
    { name: 'Qurt', value: stats.qurtSales, color: '#6366f1' },
    { name: 'O\'yinchoqlar', value: stats.toySales, color: '#10b981' },
    { name: 'Milchofka', value: stats.milchofkaSales, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                Savdo Balansi
                <Sparkles className="text-amber-400" size={24} />
              </h3>
              <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 mt-4 w-fit">
                {(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-5 py-2 rounded-[0.8rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${selectedTimeframe === tf ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {tf === 'DAILY' ? 'Kun' : tf === 'WEEKLY' ? 'Hafta' : tf === 'MONTHLY' ? 'Oy' : 'Plan'}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-right p-6 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-600/30 min-w-[200px]">
              <p className="text-4xl font-black tracking-tighter">{formatCurrency(filteredStats.total).split(" ")[0]}<span className="text-lg opacity-80 font-bold ml-1">so'm</span></p>
              <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em] mt-1">Jami Savdo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 relative z-10">
            <div className="h-72 w-full relative">
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <p className="text-4xl font-black text-slate-900">{stats.progressPercentage.toFixed(0)}%</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
               </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={120}
                    stroke="none"
                    paddingAngle={10}
                    dataKey="value"
                    cornerRadius={15}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-5">
              {pieData.map((item) => (
                <div key={item.name} className="group p-5 rounded-[1.8rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 4px 12px ${item.color}40` }}></div>
                      <span className="text-sm font-black text-slate-800 uppercase tracking-wider">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-400">{((item.value / (stats.totalSales || 1)) * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 leading-none">{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-600/30 flex flex-col relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 mb-10 flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black tracking-tight leading-none mb-2">Qarzdorlik</h3>
               <p className="text-xs text-indigo-100/70 font-bold uppercase tracking-widest">Limit: 7% gacha</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center relative z-10">
            <div className="flex items-baseline gap-2 mb-4">
              <span className={`text-7xl font-black tracking-tighter ${stats.totalDebt / (stats.totalSales || 1) * 100 > 7 ? 'text-rose-300' : 'text-emerald-300'}`}>
                {((stats.totalDebt / (stats.totalSales || 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-indigo-100 font-bold mb-8">Sizning hozirgi jami qarzdorligingiz savdoga nisbatan</p>
            
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-indigo-200">Pulda hisoblanganda</p>
              <p className="text-2xl font-black">{formatCurrency(stats.totalDebt)}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-8">
         <div className="flex items-center justify-between px-4">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Muvaffaqiyat Yo'li</h3>
              <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Olg'a qadam tashlang va yutuqlarni qo'lga kiriting!</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-200 font-black text-indigo-600 text-sm">
              <Star size={18} className="fill-indigo-600" /> {stats.progressPercentage.toFixed(0)} Ball
            </div>
         </div>

         <div className="bg-white rounded-[3rem] p-12 shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[800px] relative px-10 py-6">
              <div className="absolute top-1/2 left-0 right-0 h-4 bg-slate-100 rounded-full -translate-y-1/2 z-0 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
                ></div>
              </div>

              {DEFAULT_REWARDS.map((reward, index) => {
                const isReached = stats.progressPercentage >= reward.percentage;
                return (
                  <div key={reward.id} className="relative z-10 flex flex-col items-center group">
                    <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center border-4 transition-all duration-500 ${isReached ? 'bg-indigo-600 border-indigo-200 text-white shadow-[0_15px_30px_rgba(79,70,229,0.3)] scale-110' : 'bg-white border-slate-200 text-slate-300'}`}>
                      {isReached ? <Check size={32} strokeWidth={4} /> : <span className="text-xl font-black">{reward.percentage}%</span>}
                    </div>
                    <div className={`mt-6 text-center transition-all duration-500 ${isReached ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'}`}>
                       <p className="text-sm font-black text-slate-900 whitespace-nowrap uppercase tracking-tighter">{reward.name}</p>
                       <p className="text-[10px] font-bold text-indigo-500 mt-1">{reward.percentage}% ga erishildi</p>
                    </div>
                  </div>
                );
              })}

              <div className="relative z-10 flex flex-col items-center group">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border-4 transition-all duration-700 ${stats.progressPercentage >= 100 ? 'bg-gradient-to-tr from-amber-400 to-yellow-600 border-amber-200 text-white shadow-[0_20px_40px_rgba(245,158,11,0.4)] scale-125 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                   <Key size={40} strokeWidth={2.5} />
                </div>
                <div className={`mt-8 text-center transition-all duration-700 ${stats.progressPercentage >= 100 ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4'}`}>
                   <p className="text-md font-black text-amber-600 whitespace-nowrap uppercase italic tracking-widest">MAXFIY KALIT</p>
                   {plan?.isDirectorSigned ? (
                     <div className="mt-2 px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-lg inline-block">TASDIQLANGAN</div>
                   ) : (
                     <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">100% da ochiladi</p>
                   )}
                </div>
              </div>
            </div>
         </div>
      </section>

      <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="md:w-1/3 relative z-10">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mb-6 border border-white/20 shadow-inner">
               <Trophy size={60} className="text-amber-400 drop-shadow-lg" />
            </div>
            <h3 className="text-3xl font-black tracking-tight leading-none mb-4">GIGO CHEMPIONI!</h3>
            <p className="text-indigo-100/80 font-medium">Siz nafaqat savdo qilyapsiz, balki brendimizni yangi cho'qqilarga olib chiqyapsiz.</p>
         </div>
         <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 text-center">
               <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-1">Kunlik</p>
               <p className="text-xl font-black">{formatCurrency(sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((acc, s) => acc + s.total, 0)).split(" ")[0]}</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 text-center">
               <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-1">Agent Rank</p>
               <p className="text-xl font-black">#1</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 text-center">
               <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-1">Bonus</p>
               <p className="text-xl font-black">Mavjud</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 text-center">
               <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-1">Hisobotlar</p>
               <p className="text-xl font-black">{sales.length}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AgentView;
