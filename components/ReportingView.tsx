
import React, { useState } from 'react';
import { User, SaleRecord, AgentStats } from '../types';
import { ClipboardCheck, History, Calendar, Banknote, Edit3, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ReportingViewProps {
  user: User;
  sales: SaleRecord[];
  onAddSale: (sale: SaleRecord) => void;
  onUpdateSale: (sale: SaleRecord) => void;
  stats: AgentStats;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
};

const ReportingView: React.FC<ReportingViewProps> = ({ user, sales, onAddSale, onUpdateSale, stats }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    qurt: '',
    toys: '',
    milchofka: '',
    debt: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saleData = {
      qurt: Number(formData.qurt),
      toys: Number(formData.toys),
      milchofka: Number(formData.milchofka),
      total: Number(formData.qurt) + Number(formData.toys) + Number(formData.milchofka),
      debtAmount: Number(formData.debt),
      date: new Date(formData.date).toISOString(),
    };

    if (isEditing) {
      const existing = sales.find(s => s.id === isEditing);
      if (existing) {
        onUpdateSale({ ...existing, ...saleData, status: 'PENDING' });
      }
      setIsEditing(null);
    } else {
      const newSale: SaleRecord = {
        id: Math.random().toString(36).substr(2, 9),
        agentId: user.id,
        ...saleData,
        status: 'PENDING'
      };
      onAddSale(newSale);
    }
    
    setFormData({ qurt: '', toys: '', milchofka: '', debt: '', date: new Date().toISOString().split('T')[0] });
    alert(isEditing ? "Hisobot yangilandi va qayta ko'rib chiqishga yuborildi!" : "Hisobot yuborildi! Direktor tasdiqlashini kuting.");
  };

  const startEdit = (sale: SaleRecord) => {
    if (sale.status === 'APPROVED') {
      alert("Tasdiqlangan hisobotni tahrirlab bo'lmaydi!");
      return;
    }
    setIsEditing(sale.id);
    setFormData({
      qurt: sale.qurt.toString(),
      toys: sale.toys.toString(),
      milchofka: sale.milchofka.toString(),
      debt: sale.debtAmount.toString(),
      date: new Date(sale.date).toISOString().split('T')[0]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-fit sticky top-24">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          {isEditing ? <Edit3 size={20} className="text-amber-500"/> : <ClipboardCheck size={20} className="text-indigo-600"/>}
          {isEditing ? 'Hisobotni Tahrirlash' : 'Yangi Hisobot Topshirish'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sana</label>
            <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Qurt (so'm)</label>
              <input type="number" required placeholder="0" value={formData.qurt} onChange={(e) => setFormData({...formData, qurt: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">O'yinchoq (so'm)</label>
              <input type="number" required placeholder="0" value={formData.toys} onChange={(e) => setFormData({...formData, toys: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Milchofka (so'm)</label>
            <input type="number" required placeholder="0" value={formData.milchofka} onChange={(e) => setFormData({...formData, milchofka: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Qarzdorlik (so'm)</label>
            <input type="number" placeholder="0" value={formData.debt} onChange={(e) => setFormData({...formData, debt: e.target.value})} className="w-full px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-bold text-rose-600" />
          </div>
          <div className="flex gap-3 mt-6">
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(null); setFormData({ qurt: '', toys: '', milchofka: '', debt: '', date: new Date().toISOString().split('T')[0] }); }} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl">Bekor qilish</button>
            )}
            <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-2xl shadow-lg transition-all ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {isEditing ? 'Yangilash' : 'Yuborish'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-fit">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h4 className="font-black text-slate-800 flex items-center gap-2 uppercase text-sm tracking-widest"><History size={18} className="text-indigo-600"/> Tarix</h4>
          <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full text-slate-400 shadow-sm">{sales.length} JAMI</span>
        </div>
        <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto custom-scrollbar">
          {sales.slice().reverse().map((sale) => (
            <div key={sale.id} className="p-6 hover:bg-slate-50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sale.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : sale.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                       {sale.status === 'APPROVED' ? <CheckCircle size={20}/> : sale.status === 'REJECTED' ? <XCircle size={20}/> : <Clock size={20}/>}
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(sale.date).toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                       <p className="text-lg font-black text-slate-800">{formatCurrency(sale.total)}</p>
                    </div>
                 </div>
                 {sale.status !== 'APPROVED' && (
                    <button onClick={() => startEdit(sale)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                       <Edit3 size={18} />
                    </button>
                 )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                 <div className="text-[9px] font-bold text-slate-400 p-2 bg-slate-100 rounded-lg text-center">Qurt: <span className="text-slate-700">{formatCurrency(sale.qurt).split(" ")[0]}</span></div>
                 <div className="text-[9px] font-bold text-slate-400 p-2 bg-slate-100 rounded-lg text-center">O'yinchoq: <span className="text-slate-700">{formatCurrency(sale.toys).split(" ")[0]}</span></div>
                 <div className="text-[9px] font-bold text-slate-400 p-2 bg-slate-100 rounded-lg text-center">Milch: <span className="text-slate-700">{formatCurrency(sale.milchofka).split(" ")[0]}</span></div>
              </div>
              {sale.debtAmount > 0 && (
                <div className="mt-3 px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-100 flex justify-between items-center">
                   <span className="text-[10px] font-black text-rose-500 uppercase">Qarzdorlik:</span>
                   <span className="text-xs font-black text-rose-600">{formatCurrency(sale.debtAmount)}</span>
                </div>
              )}
            </div>
          ))}
          {sales.length === 0 && <div className="p-20 text-center text-slate-300 font-bold italic">Hisobotlar mavjud emas</div>}
        </div>
      </div>
    </div>
  );
};

export default ReportingView;
