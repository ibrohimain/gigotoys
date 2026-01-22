
import React, { useState } from 'react';
import { Layout, LogIn, Store } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all hover:shadow-indigo-500/20">
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 shadow-inner">
              <Store size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">GIGO TOY</h1>
            <p className="text-slate-500 mt-2 font-medium">Boshqaruv tizimiga xush kelibsiz</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email manzil</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="director@gmail.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Kirish
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Muammo yuzaga kelsa texnik yordamga murojaat qiling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
