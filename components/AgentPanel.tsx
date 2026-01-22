
import React, { useState } from 'react';
import { User, SaleReport, AgentPlan, CATEGORY_RATIOS, REWARD_THRESHOLDS, getDaysBetween } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  agent: User;
  reports: SaleReport[];
  plan: AgentPlan;
  onAddReport: (report: Omit<SaleReport, 'status'>) => void;
}

const AgentPanel: React.FC<Props> = ({ agent, reports, plan, onAddReport }) => {
  const [qurt, setQurt] = useState('');
  const [toys, setToys] = useState('');
  const [milchofka, setMilchofka] = useState('');
  const [debt, setDebt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvedReports = reports.filter(r => r.status === 'approved');
  const progress = Math.round((plan.currentTotal / plan.totalTarget) * 100);
  const daysLeft = getDaysBetween(new Date().toISOString().split('T')[0], plan.endDate);

  // Category sum for the agent's own pie chart
  const myCategorySum = approvedReports.reduce((acc, curr) => ({
    qurt: acc.qurt + curr.categories.qurt,
    toys: acc.toys + curr.categories.toys,
    milchofka: acc.milchofka + curr.categories.milchofka,
  }), { qurt: 0, toys: 0, milchofka: 0 });

  const pieData = [
    { name: 'Qurt', value: myCategorySum.qurt, color: '#f97316' },
    { name: 'O\'yinchoqlar', value: myCategorySum.toys, color: '#3b82f6' },
    { name: 'Milchofka', value: myCategorySum.milchofka, color: '#10b981' },
  ].filter(d => d.value > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = Number(qurt) + Number(toys) + Number(milchofka);
    if (sum <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAddReport({
        id: Math.random().toString(36).substr(2, 9),
        agentId: agent.id,
        agentName: agent.name,
        date: new Date().toISOString().split('T')[0],
        categories: { qurt: Number(qurt), toys: Number(toys), milchofka: Number(milchofka) },
        debt: Number(debt) || 0,
        totalAmount: sum
      });
      setQurt(''); setToys(''); setMilchofka(''); setDebt('');
      setIsSubmitting(false);
      alert('Hisobot yuborildi!');
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Plan Progress Header */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-3xl font-black text-slate-800">Sizning Progressingiz</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Maqsad: {plan.totalTarget.toLocaleString()} so'm</p>
            </div>
            <span className="text-4xl font-black text-orange-500">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border border-slate-50">
            <div className="bg-orange-500 h-full shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Boshlanish: {plan.startDate}</span>
            <span className="text-orange-600">Tugashga {daysLeft} kun qoldi</span>
            <span>Tugash: {plan.endDate}</span>
          </div>
        </div>
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex flex-col justify-center text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Eng yaxshi natija</p>
          <div className="flex items-center justify-center gap-2 text-2xl font-black">
            <i className="fa-solid fa-trophy text-orange-500"></i>
            <span>{REWARD_THRESHOLDS.filter(r => progress >= r.threshold).pop()?.prize || 'Hali yo\'q'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <i className="fa-solid fa-cash-register text-orange-500"></i>
            Yangi Savdo Hisoboti
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Qurt (15%)</label>
                <input type="number" value={qurt} onChange={e => setQurt(e.target.value)} className="w-full bg-slate-50 p-5 rounded-3xl border-none focus:ring-4 focus:ring-orange-100 font-black text-slate-800 text-lg" placeholder="0" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">O'yinchoqlar (40%)</label>
                <input type="number" value={toys} onChange={e => setToys(e.target.value)} className="w-full bg-slate-50 p-5 rounded-3xl border-none focus:ring-4 focus:ring-blue-100 font-black text-slate-800 text-lg" placeholder="0" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-green-500 uppercase tracking-widest">Milchofka (45%)</label>
                <input type="number" value={milchofka} onChange={e => setMilchofka(e.target.value)} className="w-full bg-slate-50 p-5 rounded-3xl border-none focus:ring-4 focus:ring-green-100 font-black text-slate-800 text-lg" placeholder="0" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Qarzga berilgan (Summa)</label>
              <input type="number" value={debt} onChange={e => setDebt(e.target.value)} className="w-full bg-red-50 p-5 rounded-3xl border-none focus:ring-4 focus:ring-red-100 font-black text-red-900 text-lg" placeholder="0" />
            </div>
            <button disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-xl">
              {isSubmitting ? 'Yuborilmoqda...' : 'Hisobotni Jo\'natish'}
            </button>
          </form>
        </div>

        {/* My Product Mix Pie Chart */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-black text-slate-800 mb-6">Sotuv Ulushingiz</h3>
          <div className="h-[300px] w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={10} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 italic text-sm">Hali savdo yo'q</div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400 italic">Qaysi mahsulotdan eng ko'p foyda qilyapsiz?</p>
          </div>
        </div>
      </div>

      {/* Reward Progress */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white">
        <h3 className="text-xl font-black mb-10">Sovg'alar Sari Yo'l</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REWARD_THRESHOLDS.map(r => (
            <div key={r.threshold} className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center ${progress >= r.threshold ? 'bg-orange-500 border-orange-400 shadow-xl shadow-orange-500/20 scale-105' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
              <i className={`fa-solid ${r.icon} text-3xl mb-4`}></i>
              <h4 className="text-lg font-black">{r.prize}</h4>
              <p className="text-xs font-bold text-orange-200 mt-2 uppercase tracking-widest">{r.threshold}% Natija</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentPanel;
