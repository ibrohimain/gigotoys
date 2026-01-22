
import React, { useState } from 'react';
import { User, Transaction, TransactionType } from '../types';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History, Filter, FileText, Banknote, CreditCard, Receipt } from 'lucide-react';

interface TreasuryViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
};

const getTxTypeStyle = (type: TransactionType) => {
  switch (type) {
    case 'SALARY': return { label: 'Oylik', color: 'text-blue-600', bg: 'bg-blue-50', icon: Banknote };
    case 'BONUS': return { label: 'Bonus', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CreditCard };
    case 'AVANS': return { label: 'Avans', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Receipt };
    case 'REWARD': return { label: 'Mukofot', color: 'text-amber-600', bg: 'bg-amber-50', icon: Wallet };
    case 'EXPENSE': return { label: 'Chiqim', color: 'text-rose-600', bg: 'bg-rose-50', icon: ArrowUpRight };
    default: return { label: 'O\'tkazma', color: 'text-slate-600', bg: 'bg-slate-50', icon: History };
  }
};

const TreasuryView: React.FC<TreasuryViewProps> = ({ user, onUpdateUser }) => {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseData, setExpenseData] = useState({ amount: '', note: '' });

  const transactions = user.transactions || [];
  const totalIncome = transactions.filter(t => t.type !== 'EXPENSE').reduce((a, b) => a + b.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseData.amount) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(expenseData.amount),
      type: 'EXPENSE',
      date: new Date().toISOString(),
      note: expenseData.note,
      status: 'COMPLETED'
    };

    const updatedUser = {
      ...user,
      bonusBalance: (user.bonusBalance || 0) - Number(expenseData.amount),
      transactions: [...(user.transactions || []), newTx]
    };

    onUpdateUser(updatedUser);
    setShowExpenseModal(false);
    setExpenseData({ amount: '', note: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-10 opacity-10"><Wallet size={120} /></div>
           <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Umumiy Balans</h4>
              <p className="text-5xl font-black tracking-tighter mb-2">{formatCurrency(balance).split(" ")[0]}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joriy mablag'ingiz</p>
           </div>
           <button 
             onClick={() => setShowExpenseModal(true)}
             className="relative z-10 mt-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
           >
             <Plus size={16}/> Chiqim Kiritish
           </button>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-center gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><ArrowDownLeft size={24}/></div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jami Kirim</p>
                 <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalIncome)}</p>
              </div>
           </div>
           <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><ArrowUpRight size={24}/></div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jami Chiqim</p>
                 <p className="text-2xl font-black text-rose-600">{formatCurrency(totalExpenses)}</p>
              </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
           <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest"><Filter size={16} className="text-indigo-600"/> Tezkor Tahlil</h4>
           <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                 <span className="text-xs font-bold text-slate-500">Bu oydagi oylik:</span>
                 <span className="text-xs font-black text-slate-800">{formatCurrency(transactions.filter(t => t.type === 'SALARY').reduce((a,b)=>a+b.amount, 0))}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                 <span className="text-xs font-bold text-slate-500">Bonuslar:</span>
                 <span className="text-xs font-black text-emerald-600">+{formatCurrency(transactions.filter(t => t.type === 'BONUS').reduce((a,b)=>a+b.amount, 0))}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                 <span className="text-xs font-bold text-slate-500">Avans:</span>
                 <span className="text-xs font-black text-indigo-600">{formatCurrency(transactions.filter(t => t.type === 'AVANS').reduce((a,b)=>a+b.amount, 0))}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest"><History size={18} className="text-indigo-600"/> Tranzaksiyalar Tarixi</h4>
         </div>
         <div className="divide-y divide-slate-100">
            {[...transactions].reverse().map(tx => {
               const style = getTxTypeStyle(tx.type);
               const Icon = style.icon;
               return (
                  <div key={tx.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-all">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${style.bg} ${style.color} flex items-center justify-center`}><Icon size={24}/></div>
                        <div>
                           <p className="font-black text-slate-800">{style.label}</p>
                           <p className="text-[10px] font-bold text-slate-400">{new Date(tx.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                     </div>
                     <div className="flex flex-col md:items-end">
                        <p className={`text-lg font-black ${tx.type === 'EXPENSE' ? 'text-rose-600' : 'text-emerald-600'}`}>
                           {tx.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </p>
                        {tx.note && <p className="text-[10px] font-bold text-slate-400 max-w-xs md:text-right">{tx.note}</p>}
                     </div>
                  </div>
               );
            })}
            {transactions.length === 0 && <div className="p-20 text-center text-slate-300 font-bold italic">Hali operatsiyalar amalga oshirilmagan</div>}
         </div>
      </div>

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full animate-in zoom-in duration-300 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-800 mb-6">Chiqim Kiritish</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Summa (so'm)</label>
                    <input type="number" required value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-black" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Izoh / Sabab</label>
                    <textarea value={expenseData.note} onChange={e => setExpenseData({...expenseData, note: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold min-h-[100px]" />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-[10px] uppercase">Bekor qilish</button>
                    <button type="submit" className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-xl shadow-rose-200 text-[10px] uppercase">Tasdiqlash</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default TreasuryView;
