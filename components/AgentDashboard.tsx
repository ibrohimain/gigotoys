
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, getDocs } from 'firebase/firestore';
import { UserProfile, ProductType, ProductSale, SalesReport, SalesPlan, BonusTier } from '../types';
import { Send, CheckCircle2, Package, ShoppingBag, Box, Target, Calendar, TrendingUp, Clock, AlertTriangle, Gift, Trophy, BarChart3 } from 'lucide-react';

interface AgentDashboardProps {
  profile: UserProfile;
}

const INITIAL_SALE: ProductSale = { quantity: 0, totalPrice: 0, debtAmount: 0 };

const AgentDashboard: React.FC<AgentDashboardProps> = ({ profile }) => {
  const [sales, setSales] = useState<Record<ProductType, ProductSale>>({
    QURT: { ...INITIAL_SALE },
    OYINCHOQ: { ...INITIAL_SALE },
    MILICHOFAKA: { ...INITIAL_SALE },
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activePlan, setActivePlan] = useState<SalesPlan | null>(null);
  const [bonusTiers, setBonusTiers] = useState<BonusTier[]>([]);
  const [myReports, setMyReports] = useState<SalesReport[]>([]);

  useEffect(() => {
    // Listen for active plan
    const plansQ = query(
      collection(db, 'plans'), 
      where('agentEmail', '==', profile.email),
      where('active', '==', true)
    );
    const unsubPlans = onSnapshot(plansQ, (snap) => {
      const plans = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesPlan));
      const latest = plans.sort((a, b) => b.createdAt - a.createdAt)[0];
      setActivePlan(latest || null);
    });

    // Listen for bonus tiers
    const unsubBonuses = onSnapshot(collection(db, 'bonuses'), (snap) => {
      setBonusTiers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BonusTier)).sort((a, b) => b.threshold - a.threshold));
    });

    // Listen for all personal reports
    const reportsQ = query(
      collection(db, 'reports'), 
      where('agentEmail', '==', profile.email),
      orderBy('timestamp', 'desc')
    );
    const unsubReports = onSnapshot(reportsQ, (snap) => {
      setMyReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesReport)));
    });

    return () => { unsubPlans(); unsubBonuses(); unsubReports(); };
  }, [profile.email]);

  const personalStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const monthStr = todayStr.substring(0, 7);

    const approved = myReports.filter(r => r.status === 'APPROVED');
    
    const todaySales = approved.filter(r => r.date === todayStr).reduce((s, r) => s + r.totalDaySales, 0);
    const monthSales = approved.filter(r => r.date.startsWith(monthStr)).reduce((s, r) => s + r.totalDaySales, 0);
    
    // Plan Progress logic
    let planProgress = 0;
    let planBreakdown = { QURT: 0, OYINCHOQ: 0, MILICHOFAKA: 0 };
    
    if (activePlan) {
      const reportsInPlan = approved.filter(r => r.date >= activePlan.startDate && r.date <= activePlan.endDate);
      const totalInPlan = reportsInPlan.reduce((s, r) => s + r.totalDaySales, 0);
      planProgress = (totalInPlan / activePlan.totalAmount) * 100;
      
      planBreakdown = {
        QURT: reportsInPlan.reduce((s, r) => s + r.items.QURT.totalPrice, 0),
        OYINCHOQ: reportsInPlan.reduce((s, r) => s + r.items.OYINCHOQ.totalPrice, 0),
        MILICHOFAKA: reportsInPlan.reduce((s, r) => s + r.items.MILICHOFAKA.totalPrice, 0),
      };
    }

    return { todaySales, monthSales, planProgress, planBreakdown };
  }, [myReports, activePlan]);

  const handleInputChange = (product: ProductType, field: keyof ProductSale, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSales(prev => ({ ...prev, [product]: { ...prev[product], [field]: numValue } }));
  };

  const totalCurrentSales = Object.values(sales).reduce((a, b) => a + b.totalPrice, 0);
  const totalCurrentDebt = Object.values(sales).reduce((a, b) => a + b.debtAmount, 0);
  const currentDebtPercent = totalCurrentSales > 0 ? (totalCurrentDebt / totalCurrentSales) * 100 : 0;
  const isDebtOverLimit = activePlan && currentDebtPercent > activePlan.debtLimitPercent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const report: SalesReport = {
      agentEmail: profile.email,
      agentName: profile.name,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      status: 'PENDING',
      items: sales,
      totalDaySales: totalCurrentSales,
      totalDayDebt: totalCurrentDebt
    };

    try {
      await addDoc(collection(db, 'reports'), report);
      setSuccess(true);
      setSales({
        QURT: { ...INITIAL_SALE },
        OYINCHOQ: { ...INITIAL_SALE },
        MILICHOFAKA: { ...INITIAL_SALE },
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert('Xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* 1. Quick Stats & Personal results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bugungi Savdo</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-xl font-black text-gray-900">{personalStats.todaySales.toLocaleString()} so'm</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Oylik Savdo</p>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-black text-gray-900">{personalStats.monthSales.toLocaleString()} so'm</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan Bajarilishi</p>
            <span className="text-2xl font-black text-indigo-600">{personalStats.planProgress.toFixed(1)}%</span>
          </div>
          <div className="flex -space-x-2">
             {bonusTiers.map((tier, i) => (
               <div key={tier.id} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm ${personalStats.planProgress >= tier.threshold ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`} title={`${tier.threshold}% - ${tier.prize}`}>
                 {tier.threshold}%
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* 2. Plan & Rewards Visualization */}
      {activePlan && (
        <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy className="w-40 h-40" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2"><Target /> Faol Plan: {activePlan.totalAmount.toLocaleString()} so'm</h3>
            <p className="text-indigo-200 text-sm mb-6">{activePlan.startDate} dan {activePlan.endDate} gacha</p>
            
            {/* Progress Bar with Steps */}
            <div className="relative pt-6 pb-2">
              <div className="h-4 bg-white/20 rounded-full w-full mb-8">
                <div 
                  className="h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(52,211,153,0.5)]" 
                  style={{ width: `${Math.min(personalStats.planProgress, 100)}%` }} 
                />
              </div>
              
              {/* Bonus Markers */}
              {bonusTiers.map(tier => (
                <div 
                  key={tier.id} 
                  className="absolute top-0 flex flex-col items-center group" 
                  style={{ left: `${tier.threshold}%`, transform: 'translateX(-50%)' }}
                >
                  <div className={`w-3 h-3 rounded-full mb-1 border-2 border-white ${personalStats.planProgress >= tier.threshold ? 'bg-green-400' : 'bg-white/40'}`} />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-white text-indigo-900 px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-opacity shadow-lg">
                    {tier.threshold}%: {tier.prize}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <ProgressMini type="Qurt" current={personalStats.planBreakdown.QURT} target={(activePlan.totalAmount * activePlan.distribution.QURT) / 100} />
              <ProgressMini type="O'yinchoq" current={personalStats.planBreakdown.OYINCHOQ} target={(activePlan.totalAmount * activePlan.distribution.OYINCHOQ) / 100} />
              <ProgressMini type="Mili" current={personalStats.planBreakdown.MILICHOFAKA} target={(activePlan.totalAmount * activePlan.distribution.MILICHOFAKA) / 100} />
            </div>
          </div>
        </div>
      )}

      {/* 3. New Report Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-gray-900">Yangi Hisobot</h3>
          {isDebtOverLimit && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold animate-bounce">
              <AlertTriangle className="w-4 h-4" /> Qarz limiti oshib ketdi! ({currentDebtPercent.toFixed(1)}%)
            </div>
          )}
        </div>

        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center gap-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-6 h-6" />
            <p className="font-bold">Hisobot tasdiqlash uchun yuborildi.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProductCard type="QURT" label="Qurt Mahsuloti" icon={Package} color="amber" val={sales.QURT} onChange={handleInputChange} />
            <ProductCard type="OYINCHOQ" label="O'yinchoqlar" icon={ShoppingBag} color="blue" val={sales.OYINCHOQ} onChange={handleInputChange} />
            <ProductCard type="MILICHOFAKA" label="Milichofaka" icon={Box} color="indigo" val={sales.MILICHOFAKA} onChange={handleInputChange} />
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase">Yuborilayotgan summa</p>
              <p className="text-2xl font-black text-gray-900">{totalCurrentSales.toLocaleString()} so'm</p>
              <p className="text-xs font-bold text-red-500">Qarz: {totalCurrentDebt.toLocaleString()} so'm</p>
            </div>
            <button
              type="submit"
              disabled={loading || totalCurrentSales === 0}
              className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Clock className="animate-spin" /> : 'Direktorga Jo\'natish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProgressMini = ({ type, current, target }: any) => (
  <div className="bg-white/10 p-4 rounded-2xl">
    <p className="text-[10px] font-bold text-indigo-200 uppercase mb-1">{type}</p>
    <p className="text-sm font-black">{current.toLocaleString()} / {target.toLocaleString()}</p>
    <div className="h-1 bg-white/10 rounded-full mt-2">
      <div className="h-1 bg-white rounded-full" style={{ width: `${Math.min((current/target)*100 || 0, 100)}%` }} />
    </div>
  </div>
);

const ProductCard = ({ type, label, icon: Icon, color, val, onChange }: any) => (
  <div className={`p-6 rounded-3xl bg-white border border-gray-100 hover:border-${color}-400 transition-all space-y-4`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-${color}-50 text-${color}-600 rounded-xl`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-black text-gray-800">{label}</span>
    </div>
    <div className="space-y-3">
       <input 
         type="number" placeholder="Sotilgan summa" 
         className="w-full p-3 bg-gray-50 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500"
         value={val.totalPrice || ''} onChange={(e) => onChange(type, 'totalPrice', e.target.value)}
       />
       <input 
         type="number" placeholder="Shundan qarz" 
         className="w-full p-3 bg-red-50 rounded-xl font-bold outline-none text-red-600 focus:ring-2 ring-red-500"
         value={val.debtAmount || ''} onChange={(e) => onChange(type, 'debtAmount', e.target.value)}
       />
       <input 
         type="number" placeholder="Soni (dona/kg)" 
         className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none"
         value={val.quantity || ''} onChange={(e) => onChange(type, 'quantity', e.target.value)}
       />
    </div>
  </div>
);

export default AgentDashboard;
