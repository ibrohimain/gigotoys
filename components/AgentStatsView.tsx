
import React, { useMemo } from 'react';
import { AgentStats, SalesPlan, SaleRecord } from '../types';
import { ShoppingBag, TrendingUp, AlertCircle, PieChart, BarChart as BarChartIcon, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

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
  
  // Plan breakdowns
  const qurtTarget = target * 0.15;
  const toyTarget = target * 0.40;
  const milchofkaTarget = target * 0.45;

  const chartData = useMemo(() => {
    // Last 7 approved reports for visualization
    return sales
      .filter(s => s.status === 'APPROVED')
      .slice(-7)
      .map(s => ({
        date: new Date(s.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
        total: s.total,
        qurt: s.qurt,
        toys: s.toys,
        milchofka: s.milchofka
      }));
  }, [sales]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 3 Oylik Plan Holati */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <TrendingUp size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">3 Oylik Reja Holati</h3>
              <p className="text-slate-500 font-medium">Umumiy maqsad: <span className="text-indigo-600 font-bold">{formatCurrency(target)}</span></p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-indigo-600">{stats.progressPercentage.toFixed(1)}%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bajarildi</p>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-8">
            <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Qurt (15%)</p>
              <p className="text-lg font-black text-blue-900">{formatCurrency(stats.qurtSales)}</p>
              <div className="flex justify-between mt-2 text-[10px] font-bold">
                 <span className="text-blue-600">Plan: {formatCurrency(qurtTarget)}</span>
                 <span className="text-slate-400">Qoldi: {formatCurrency(Math.max(0, qurtTarget - stats.qurtSales))}</span>
              </div>
            </div>
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">O'yinchoq (40%)</p>
              <p className="text-lg font-black text-emerald-900">{formatCurrency(stats.toySales)}</p>
              <div className="flex justify-between mt-2 text-[10px] font-bold">
                 <span className="text-emerald-600">Plan: {formatCurrency(toyTarget)}</span>
                 <span className="text-slate-400">Qoldi: {formatCurrency(Math.max(0, toyTarget - stats.toySales))}</span>
              </div>
            </div>
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Milchofka (45%)</p>
              <p className="text-lg font-black text-amber-900">{formatCurrency(stats.milchofkaSales)}</p>
              <div className="flex justify-between mt-2 text-[10px] font-bold">
                 <span className="text-amber-600">Plan: {formatCurrency(milchofkaTarget)}</span>
                 <span className="text-slate-400">Qoldi: {formatCurrency(Math.max(0, milchofkaTarget - stats.milchofkaSales))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Davriy Savdo Diagrammasi */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2"><BarChartIcon size={18} className="text-indigo-600"/> Savdo Dinamikasi</h4>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Qarzdorlik Tahlili */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
           <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2"><AlertCircle size={18} className="text-rose-500"/> Qarzdorlik Nazorati</h4>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Limit 7% dan oshmasligi shart</p>
           
           <div className="flex items-end gap-4 mb-4">
              <span className={`text-6xl font-black tracking-tighter ${ (stats.totalDebt / (stats.totalSales || 1) * 100) > 7 ? 'text-rose-500' : 'text-emerald-500' }`}>
                {((stats.totalDebt / (stats.totalSales || 1)) * 100).toFixed(1)}%
              </span>
           </div>
           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jami qarz summasi</p>
              <p className="text-xl font-black text-slate-800">{formatCurrency(stats.totalDebt)}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AgentStatsView;
