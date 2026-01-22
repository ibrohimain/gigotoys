
import React, { useState } from 'react';
import { SaleReport, AgentPlan } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Props {
  reports: SaleReport[];
  plans: AgentPlan[];
  onUpdatePlan: (agentId: string, updates: Partial<AgentPlan>) => void;
  onApprove: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
}

const DirectorDashboard: React.FC<Props> = ({ reports, plans, onUpdatePlan, onApprove, onDeleteReport }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | 'all'>('all');
  const [viewTab, setViewTab] = useState<'analytics' | 'reports' | 'calendar' | 'plans'>('analytics');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filteredReports = selectedAgent === 'all' 
    ? reports 
    : reports.filter(r => r.agentId === selectedAgent);

  const approvedReports = filteredReports.filter(r => r.status === 'approved');

  const exportToPDF = () => {
    const doc = new jsPDF() as any;
    const title = selectedAgent === 'all' ? "Barcha agentlar hisoboti" : `${selectedAgent.toUpperCase()} hisoboti`;
    const date = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text("GIGO TOYS - Savdo Hisoboti", 14, 20);
    doc.setFontSize(11);
    doc.text(`Turi: ${title}`, 14, 30);
    doc.text(`Sana: ${date}`, 14, 37);

    const tableData = filteredReports.map(r => [
      r.agentName,
      r.date,
      (r.categories?.qurt || 0).toLocaleString(),
      (r.categories?.toys || 0).toLocaleString(),
      (r.categories?.milchofka || 0).toLocaleString(),
      (r.totalAmount || 0).toLocaleString(),
      r.status === 'approved' ? 'Tasdiqlangan' : 'Kutilmoqda'
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Agent', 'Sana', 'Qurt', 'O\'yinchoq', 'Milchofka', 'Jami', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] },
      styles: { fontSize: 8 }
    });

    doc.save(`GigoToys_Hisobot_${date}.pdf`);
  };

  const categorySum = approvedReports.reduce((acc, curr) => ({
    qurt: acc.qurt + (curr.categories?.qurt || 0),
    toys: acc.toys + (curr.categories?.toys || 0),
    milchofka: acc.milchofka + (curr.categories?.milchofka || 0),
  }), { qurt: 0, toys: 0, milchofka: 0 });

  const pieData = [
    { name: 'Qurt', value: categorySum.qurt, color: '#f97316' },
    { name: 'O\'yinchoqlar', value: categorySum.toys, color: '#3b82f6' },
    { name: 'Milchofka', value: categorySum.milchofka, color: '#10b981' },
  ].filter(d => d.value > 0);

  const getDailySum = (date: string) => {
    return reports
      .filter(r => r.date === date && r.status === 'approved')
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  };

  const getDayReports = (date: string) => {
    return reports.filter(r => r.date === date && r.status === 'approved');
  };

  const totalSales = plans.reduce((acc, curr) => acc + (curr.currentTotal || 0), 0);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Daily Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-orange-50">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{selectedDate} kunlik hisoboti</h3>
                <p className="text-orange-600 font-bold">Jami savdo: {getDailySum(selectedDate).toLocaleString()} so'm</p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-all"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getDayReports(selectedDate).length > 0 ? getDayReports(selectedDate).map(r => (
                  <div key={r.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold capitalize">
                        {r.agentId[0]}
                      </div>
                      <h4 className="font-black text-slate-800 capitalize">{r.agentName}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Qurt:</span>
                        <span className="font-bold">{(r.categories?.qurt || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">O'yinchoq:</span>
                        <span className="font-bold">{(r.categories?.toys || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Milchofka:</span>
                        <span className="font-bold">{(r.categories?.milchofka || 0).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between">
                        <span className="text-slate-800 font-black">Jami:</span>
                        <span className="text-orange-600 font-black">{(r.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-10 text-center text-slate-400 font-bold italic">
                    Ushbu kunda tasdiqlangan savdolar mavjud emas.
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
              <button 
                onClick={() => setSelectedDate(null)}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

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
          {viewTab === 'reports' && (
            <button 
              onClick={exportToPDF}
              className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-file-pdf"></i>
              PDF Yuklash
            </button>
          )}
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Agent:</span>
          <select 
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 min-w-[150px]"
          >
            <option value="all">Barchasi</option>
            {plans.map(p => <option key={p.agentId} value={p.agentId} className="capitalize">{p.agentId}</option>)}
          </select>
        </div>
      </div>

      {viewTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-orange-500 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Jami Savdo</p>
              <h3 className="text-3xl font-black text-slate-800">{(totalSales || 0).toLocaleString()} <span className="text-sm font-medium">so'm</span></h3>
            </div>
            {plans.map(p => (
              <div key={p.agentId} className="bg-white p-8 rounded-[2.5rem] shadow-sm">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-1 capitalize">{p.agentId}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-800">{p.totalTarget > 0 ? Math.round(((p.currentTotal || 0)/p.totalTarget)*100) : 0}%</h3>
                  <p className="text-xs text-slate-400">{(p.currentTotal || 0).toLocaleString()} so'm</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center min-h-[450px]">
            <h3 className="text-lg font-black text-slate-800 mb-6 text-center">Mahsulotlar Ulushi</h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => (value || 0).toLocaleString() + ' so\'m'} />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm min-h-[450px]">
            <h3 className="text-lg font-black text-slate-800 mb-6">Agentlar Solishtirmasi</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plans.map(p => ({ name: p.agentId, Savdo: p.currentTotal || 0, Maqsad: p.totalTarget || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis hide />
                  <Tooltip formatter={(value: number) => (value || 0).toLocaleString()} />
                  <Bar dataKey="Savdo" fill="#f97316" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="Maqsad" fill="#e2e8f0" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewTab === 'reports' && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                <th className="pb-4">Agent</th>
                <th className="pb-4">Sana</th>
                <th className="pb-4">Qurt</th>
                <th className="pb-4">O'yinchoq</th>
                <th className="pb-4">Milchofka</th>
                <th className="pb-4 text-right">Jami</th>
                <th className="pb-4 text-center">Status</th>
                <th className="pb-4 text-right">Harakat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-5 font-bold text-slate-800 capitalize">{r.agentName}</td>
                  <td className="py-5 text-sm text-slate-500">{r.date}</td>
                  <td className="py-5 text-sm">{(r.categories?.qurt || 0).toLocaleString()}</td>
                  <td className="py-5 text-sm">{(r.categories?.toys || 0).toLocaleString()}</td>
                  <td className="py-5 text-sm">{(r.categories?.milchofka || 0).toLocaleString()}</td>
                  <td className="py-5 text-right font-black text-slate-900">{(r.totalAmount || 0).toLocaleString()}</td>
                  <td className="py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${r.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {r.status === 'approved' ? 'Tasdiq' : 'Kutilmoqda'}
                    </span>
                  </td>
                  <td className="py-5 text-right space-x-2 whitespace-nowrap">
                    {r.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => onApprove(r.id)} 
                          className="bg-green-500 text-white text-[10px] px-4 py-2 rounded-xl font-black hover:bg-green-600 shadow-sm shadow-green-100 transition-all active:scale-90"
                        >
                          <i className="fa-solid fa-check mr-1"></i> Tasdiqlash
                        </button>
                        <button 
                          onClick={() => onDeleteReport(r.id)} 
                          className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-[10px] px-4 py-2 rounded-xl font-black transition-all active:scale-90"
                          title="Hisobotni rad etish va o'chirish"
                        >
                          <i className="fa-solid fa-xmark mr-1"></i> Rad etish
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => onDeleteReport(r.id)} 
                        className="text-slate-300 hover:text-red-500 text-[10px] px-3 py-1.5 rounded-lg font-black transition-colors"
                        title="Tarixdan o'chirish"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium">Hisobotlar topilmadi</div>
          )}
        </div>
      )}

      {viewTab === 'calendar' && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <i className="fa-solid fa-calendar-check text-orange-500"></i>
              Savdo Kalendari
            </h3>
            <span className="text-xs font-bold text-slate-400 italic">Kunning ustiga bosing (Batafsil ma'lumot uchun)</span>
          </div>
          <div className="grid grid-cols-7 gap-4">
            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Yak'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4">{d}</div>
            ))}
            {Array.from({length: daysInMonth}).map((_, i) => {
              const day = (i + 1).toString().padStart(2, '0');
              const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day}`;
              const sum = getDailySum(dateStr);
              return (
                <button 
                  key={i} 
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-4 rounded-3xl border text-left transition-all hover:scale-105 active:scale-95 ${sum > 0 ? 'bg-orange-50 border-orange-200 cursor-pointer shadow-sm hover:shadow-orange-200' : 'bg-slate-50 border-slate-100 opacity-50 cursor-default'}`}
                >
                  <p className="text-xs font-black text-slate-400 mb-2">{i + 1}</p>
                  <p className={`text-[10px] font-black ${sum > 0 ? 'text-orange-600' : 'text-slate-300'}`}>
                    {sum > 0 ? `${(sum/1000000).toFixed(1)}M` : '0'}
                  </p>
                </button>
              );
            })}
          </div>
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
                    value={p.totalTarget || 0}
                    onChange={(e) => onUpdatePlan(p.agentId, { totalTarget: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-50 border-none rounded-2xl p-4 font-black text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Boshlanish</label>
                    <input 
                      type="date" 
                      value={p.startDate || ''}
                      onChange={(e) => onUpdatePlan(p.agentId, { startDate: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border-none rounded-xl p-3 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Tugash</label>
                    <input 
                      type="date" 
                      value={p.endDate || ''}
                      onChange={(e) => onUpdatePlan(p.agentId, { endDate: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border-none rounded-xl p-3 text-xs font-bold"
                    />
                  </div>
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
