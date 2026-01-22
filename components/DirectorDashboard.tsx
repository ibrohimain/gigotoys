
import React, { useState } from 'react';
import { SaleReport, AgentPlan, CATEGORY_RATIOS, getDaysBetween } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, Legend } from 'recharts';

interface Props {
  reports: SaleReport[];
  plans: AgentPlan[];
  onUpdatePlan: (agentId: string, updates: Partial<AgentPlan>) => void;
  onApprove: (reportId: string) => void;
  onEditReport: (report: SaleReport) => void;
}

const DirectorDashboard: React.FC<Props> = ({ reports, plans, onUpdatePlan, onApprove, onEditReport }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | 'all'>('all');
  const [viewTab, setViewTab] = useState<'analytics' | 'reports' | 'calendar' | 'plans'>('analytics');

  const filteredReports = selectedAgent === 'all' 
    ? reports 
    : reports.filter(r => r.agentId === selectedAgent);

  const approvedReports = filteredReports.filter(r => r.status === 'approved');

  // Aggregated Category Data for Pie Chart
  const categorySum = approvedReports.reduce((acc, curr) => ({
    qurt: acc.qurt + curr.categories.qurt,
    toys: acc.toys + curr.categories.toys,
    milchofka: acc.milchofka + curr.categories.milchofka,
  }), { qurt: 0, toys: 0, milchofka: 0 });

  const pieData = [
    { name: 'Qurt', value: categorySum.qurt, color: '#f97316' },
    { name: 'O\'yinchoqlar', value: categorySum.toys, color: '#3b82f6' },
    { name: 'Milchofka', value: categorySum.milchofka, color: '#10b981' },
  ].filter(d => d.value > 0);

  // Calendar Data logic
  const getDailySum = (date: string) => {
    return reports
      .filter(r => r.date === date && r.status === 'approved')
      .reduce((sum, r) => sum + r.totalAmount, 0);
  };

  const totalSales = plans.reduce((acc, curr) => acc + curr.currentTotal, 0);
  const totalTarget = plans.reduce((acc, curr) => acc + curr.totalTarget, 0);

  const COLORS = ['#f97316', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl">
          {[
            { id: 'analytics', label: 'Analitika', icon: 'fa-chart-pie' },
            { id: 'reports', label: 'Hisobotlar', icon: 'fa-file-lines' },
            { id: 'calendar', label: 'Kalendar', icon: 'fa-calendar-days' },
            { id: 'plans', label: 'Reja Sozlamalari', icon: 'fa-gears' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setViewTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.label}
              {tab.id === 'reports' && reports.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                  {reports.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtr:</span>
          <select 
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 min-w-[180px]"
          >
            <option value="all">Barcha Agentlar</option>
            {plans.map(p => <option key={p.agentId} value={p.agentId} className="capitalize">{p.agentId}</option>)}
          </select>
        </div>
      </div>

      {viewTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stat Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-orange-500 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Jami Savdo</p>
              <h3 className="text-3xl font-black text-slate-800">{totalSales.toLocaleString()} <span className="text-sm font-medium">so'm</span></h3>
            </div>
            {plans.map(p => (
              <div key={p.agentId} className="bg-white p-8 rounded-[2.5rem] shadow-sm">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-1 capitalize">{p.agentId}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-800">{Math.round((p.currentTotal/p.totalTarget)*100)}%</h3>
                  <p className="text-xs text-slate-400">{p.currentTotal.toLocaleString()} so'm</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pie Chart: Product Mix */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-black text-slate-800 mb-6">Mahsulotlar Ulushi (Summada)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString() + ' so\'m'} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparison Bar Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">Agentlar Solishtirmasi</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plans.map(p => ({ name: p.agentId, Savdo: p.currentTotal, Maqsad: p.totalTarget }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis hide />
                  <Tooltip formatter={(value: number) => value.toLocaleString()} cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="Savdo" fill="#f97316" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="Maqsad" fill="#e2e8f0" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewTab === 'calendar' && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <i className="fa-solid fa-calendar-check text-orange-500"></i>
            Savdo Kalendari
          </h3>
          <div className="grid grid-cols-7 gap-4">
            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Yak'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4">{d}</div>
            ))}
            {/* Simple static calendar generation for the current month */}
            {Array.from({length: 31}).map((_, i) => {
              const day = (i + 1).toString().padStart(2, '0');
              const dateStr = `2024-03-${day}`; // Example date
              const sum = getDailySum(dateStr);
              return (
                <div key={i} className={`p-4 rounded-3xl border transition-all ${sum > 0 ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                  <p className="text-xs font-black text-slate-400 mb-2">{i + 1}</p>
                  <p className={`text-[10px] font-black ${sum > 0 ? 'text-orange-600' : 'text-slate-300'}`}>
                    {sum > 0 ? `${(sum/1000000).toFixed(1)}M` : '0'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewTab === 'reports' && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                <th className="pb-4 text-left">Agent</th>
                <th className="pb-4 text-left">Sana</th>
                <th className="pb-4 text-right">Summa</th>
                <th className="pb-4 text-center">Status</th>
                <th className="pb-4 text-right">Harakat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-5 font-bold text-slate-800 capitalize">{r.agentName}</td>
                  <td className="py-5 text-sm text-slate-500">{r.date}</td>
                  <td className="py-5 text-right font-black text-slate-900">{r.totalAmount.toLocaleString()}</td>
                  <td className="py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${r.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-5 text-right space-x-2">
                    {r.status === 'pending' && (
                      <button onClick={() => onApprove(r.id)} className="bg-green-500 text-white text-[10px] px-4 py-2 rounded-xl font-black">Tasdiqlash</button>
                    )}
                    <button 
                      onClick={() => {
                        const newSum = prompt("Yangi jami summani kiriting:", r.totalAmount.toString());
                        if (newSum) onEditReport({...r, totalAmount: Number(newSum)});
                      }}
                      className="bg-slate-100 text-slate-600 text-[10px] px-4 py-2 rounded-xl font-black"
                    >Tahrirlash</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(p => (
            <div key={p.agentId} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h4 className="text-xl font-black text-slate-800 mb-6 capitalize">{p.agentId} - Reja</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Maqsad Summa</label>
                  <input 
                    type="number" 
                    value={p.totalTarget}
                    onChange={(e) => onUpdatePlan(p.agentId, { totalTarget: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-50 border-none rounded-2xl p-4 font-black text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Boshlanish</label>
                    <input 
                      type="date" 
                      value={p.startDate}
                      onChange={(e) => onUpdatePlan(p.agentId, { startDate: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border-none rounded-xl p-3 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Tugash</label>
                    <input 
                      type="date" 
                      value={p.endDate}
                      onChange={(e) => onUpdatePlan(p.agentId, { endDate: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border-none rounded-xl p-3 text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-400">Muddat: <span className="font-bold text-slate-700">{getDaysBetween(p.startDate, p.endDate)} kun</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectorDashboard;
