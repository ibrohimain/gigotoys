
import React, { useMemo } from 'react';
import { AgentStats, SalesPlan, SaleRecord } from '../types';
import { TrendingUp, AlertCircle, BarChart as BarChartIcon, Package, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface AgentStatsViewProps {
  calculateStats: () => AgentStats;
  plan?: SalesPlan;
  sales: SaleRecord[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
};

const AgentStatsView: React.FC<AgentStatsViewProps> = ({ calculateStats, plan, sales }) => {
  const stats = calculateStats();
  const target = plan?.totalTarget || 0;
  
  // Categorical targets based on the 15/40/45 rule
  const qurtTarget = target * 0.15;
  const toyTarget = target * 0.40;
  const milchofkaTarget = target * 0.45;

  const chartData = useMemo(() => {
    return sales
      .filter(s => s.status === 'APPROVED')
      .slice(-10)
      .map(s => ({
        date: new Date(s.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
        total: s.total,
      }));
  }, [sales]);

  const pieData = [
    { name: 'Qurt (15%)', value: stats.qurtSales, color: '#6366f1' },
    { name: 'O\'yinchoq (40%)', value: stats.toySales, color: '#10b981' },
    { name: 'Milchofka (45%)', value: stats.milchofkaSales, color: '#f59e0b' },
  ];

  const debtPercentage = (stats.totalDebt / (stats.totalSales || 1)) * 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 3 Oylik Strategik Reja */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5"><TrendingUp size={150} /></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">3 Oylik Plan Holati</h3>
              <p className="text-slate-500 font-bold mt-1">Umumiy maqsad: <span className="text-indigo-600">{formatCurrency(target)}</span></p>
            </div>
            <div className="text-right">
              <p className="text-6xl font-black text-indigo-600">{stats.progressPercentage.toFixed(1)}%</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Bajarildi</p>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden mb-12 shadow-inner">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Qurt (15%)</p>
              <p className="text-xl font-black text-indigo-900">{formatCurrency(stats.qurtSales)}</p>
              <div className="mt-4 flex justify-between text-[10px] font-bold">
                 <span className="text-indigo-600">Plan: {formatCurrency(qurtTarget).split(" ")[0]}</span>
                 <span className="text-slate-400">Qoldi: {formatCurrency(Math.max(0, qurtTarget - stats.qurtSales)).split(" ")[0]}</span>
              </div>
            </div>
            <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">O'yinchoq (40%)</p>
              <p className="text-xl font-black text-emerald-900">{formatCurrency(stats.toySales)}</p>
              <div className="mt-4 flex justify-between text-[10px] font-bold">
                 <span className="text-emerald-600">Plan: {formatCurrency(toyTarget).split(" ")[0]}</span>
                 <span className="text-slate-400">Qoldi: {formatCurrency(Math.max(0, toyTarget - stats.toySales)).split(" ")[0]}</span>
              </div>
            </div>
            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Milchofka (45%)</p>
              <p className="text-xl font-black text-amber-900">{formatCurrency(stats.milchofkaSales)}</p>
              <div className="mt-4 flex justify-between text-[10px] font-bold">
                 <span className="text-amber-600">Plan: {formatCurrency(milchofkaTarget).split(" ")[0]}</span>
                 <span className="text-slate-400">Qoldi: {formatCurrency(Math.max(0, milchofkaTarget - stats.milchofkaSales)).split(" ")[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm h-[400px]">
           <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest"><BarChartIcon size={18} className="text-indigo-600"/> Savdo Dinamikasi</h4>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="total" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
             </BarChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center">
           <h4 className="font-black text-slate-800 mb-8 flex items-center gap-2 uppercase text-xs tracking-widest w-full"><AlertCircle size={18} className="text-rose-500"/> Qarzdorlik Nazorati</h4>
           <div className="relative flex items-center justify-center w-full">
              <div className="text-center">
                 <p className={`text-8xl font-black tracking-tighter ${debtPercentage > 7 ? 'text-rose-500' : 'text-emerald-500'}`}>{debtPercentage.toFixed(1)}%</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Qarzdorlik Ulushi</p>
              </div>
           </div>
           <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jami Qarz</p>
                 <p className="font-black text-slate-800">{formatCurrency(stats.totalDebt)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruxsat: 7%</p>
                 <p className="font-black text-indigo-600">{formatCurrency(stats.totalSales * 0.07)}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AgentStatsView;
