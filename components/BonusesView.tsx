
import React from 'react';
import { AgentStats, SalesPlan } from '../types';
import { DEFAULT_REWARDS } from '../constants';
import { Check, Gift, Key, Award, Sparkles, ArrowRight } from 'lucide-react';

interface BonusesViewProps {
  stats: AgentStats;
  plan?: SalesPlan;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
};

const BonusesView: React.FC<BonusesViewProps> = ({ stats, plan }) => {
  const target = plan?.totalTarget || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
               <h3 className="text-3xl font-black tracking-tight mb-2">Muvaffaqiyat Cho'qqisi</h3>
               <p className="text-indigo-100 font-medium">Rejani bajarib, orzu qilingan sovg'alarga ega bo'ling!</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center min-w-[160px]">
               <p className="text-5xl font-black">{stats.progressPercentage.toFixed(0)}%</p>
               <p className="text-[10px] font-black uppercase tracking-widest mt-1">Jami Progress</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {DEFAULT_REWARDS.map((reward, idx) => {
          const isReached = stats.progressPercentage >= reward.percentage;
          const remainingPercent = Math.max(0, reward.percentage - stats.progressPercentage);
          const remainingAmount = Math.max(0, (target * (reward.percentage / 100)) - stats.totalSales);

          return (
            <div key={reward.id} className={`bg-white p-6 rounded-3xl border transition-all duration-500 ${isReached ? 'border-emerald-200 shadow-lg shadow-emerald-500/5' : 'border-slate-200 shadow-sm'}`}>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 ${isReached ? 'bg-emerald-500 text-white animate-bounce' : 'bg-slate-50 text-slate-300'}`}>
                       {isReached ? <Check size={32} strokeWidth={3} /> : <Gift size={32} />}
                    </div>
                    <div>
                       <h4 className={`text-xl font-black tracking-tight ${isReached ? 'text-slate-800' : 'text-slate-400'}`}>{reward.name}</h4>
                       <p className="text-xs font-bold text-indigo-500">{reward.percentage}% Savdo Marrasi</p>
                    </div>
                  </div>
                  
                  {!isReached ? (
                    <div className="flex-1 md:max-w-xs">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                          <span className="text-slate-400">Yana {remainingPercent.toFixed(1)}% kerak</span>
                          <span className="text-indigo-600">{formatCurrency(remainingAmount)}</span>
                       </div>
                       <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-400 h-full" style={{ width: `${(stats.progressPercentage / reward.percentage) * 100}%` }}></div>
                       </div>
                    </div>
                  ) : (
                    <div className="px-6 py-2 bg-emerald-100 text-emerald-600 font-black rounded-xl text-xs uppercase tracking-widest flex items-center gap-2">
                       <Sparkles size={14} /> Qo'lga kiritildi
                    </div>
                  )}
               </div>
            </div>
          );
        })}

        {/* Secret Key with animation */}
        <div className={`p-10 rounded-[2.5rem] border-4 border-dashed transition-all duration-1000 ${stats.progressPercentage >= 100 ? 'bg-amber-50 border-amber-300 shadow-xl' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
           <div className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-1000 ${stats.progressPercentage >= 100 ? 'bg-amber-500 text-white animate-spin-slow shadow-2xl shadow-amber-500/30' : 'bg-slate-200 text-slate-400'}`}>
                 <Key size={48} />
              </div>
              <h3 className={`text-2xl font-black tracking-tighter uppercase ${stats.progressPercentage >= 100 ? 'text-amber-600' : 'text-slate-400'}`}>Maxfiy Sovg'a Kaliti</h3>
              <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">100% marraga yetganingizdan so'ng direktor ushbu kalitni faollashtiradi va siz maxsus mukofotga ega bo'lasiz!</p>
              
              {plan?.isDirectorSigned && (
                <div className="mt-6 px-8 py-3 bg-emerald-500 text-white font-black rounded-2xl shadow-lg flex items-center gap-2">
                   <Award size={20} /> Kalit Faol
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BonusesView;
