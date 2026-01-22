
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-orange-200">G</div>
          <h1 className="text-3xl font-bold text-slate-800">Xush kelibsiz!</h1>
          <p className="text-slate-500 mt-2">GIGO TOYS boshqaruv tizimi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email manzilingiz</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <i className="fa-regular fa-envelope"></i>
              </span>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none bg-slate-50"
                placeholder="misol@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Parol</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none bg-slate-50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            Kirish
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-semibold mb-4">Mavjud foydalanuvchilar</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div className="p-2 bg-slate-50 rounded-lg">Director: elyor@gmail.com</div>
            <div className="p-2 bg-slate-50 rounded-lg">Agent: muxlisa@gigo.com</div>
            <div className="p-2 bg-slate-50 rounded-lg">Agent: aziza@gigo.com</div>
            <div className="p-2 bg-slate-50 rounded-lg">Agent: ruxshona@gigo.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
