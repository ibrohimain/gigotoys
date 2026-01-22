
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, pass: string) => void;
  error: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Artificial delay to simulate real auth request
    setTimeout(() => {
      onLogin(email, password);
      setIsSubmitting(false);
    }, 800);
  };

  const demoAccounts = [
    { email: 'elyor@gmail.com', label: 'Elyor aka (Direktor)', role: 'admin' },
    { email: 'aziza@gmail.com', label: 'Aziza (Agent)', role: 'agent' },
    { email: 'muxlisa@gmail.com', label: 'Muxlisa (Agent)', role: 'agent' },
    { email: 'ruxshona@gmail.com', label: 'Ruxshona (Agent)', role: 'agent' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-50 rounded-full blur-[100px] opacity-40"></div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-2xl shadow-indigo-200 animate-in zoom-in-50 duration-500">G</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">GIGO TOYS</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Savdo Nazorati Tizimi</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-8 h-8 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <p className="text-xs font-black text-red-600 uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Manzil</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parol</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={showPass ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"} /></svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-100 uppercase tracking-[0.2em] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Tizimga Kirish
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-[1px] bg-slate-100"></div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Tezkor Kirish</p>
              <div className="flex-1 h-[1px] bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword('password123'); }}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-slate-100 transition-all group"
                >
                  <p className="text-[10px] font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{acc.label}</p>
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{acc.role === 'admin' ? 'Direktor' : 'Agent'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center mt-10 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
          Texnik yordam: +998 (90) 123-45-67
        </p>
      </div>
    </div>
  );
};

export default Login;
