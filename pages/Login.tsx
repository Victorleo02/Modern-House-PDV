
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { LayoutDashboard, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  // Fix: handleLogin must be async to properly await the storage.getUsers() promise
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const users = await storage.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem('mh_logged_user', JSON.stringify(user));
      navigate('/');
    } else {
      setError('Credenciais inválidas. Tente novamente.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-900/20">
            <LayoutDashboard size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Modern House</h1>
          <p className="text-slate-500 mt-2 font-medium italic">Sistema de Gestão Profissional</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuário</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm animate-shake">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
          >
            Acessar Sistema
          </button>
        </form>

        <p className="text-center text-slate-600 mt-8 text-xs">
          Modern House &copy; {new Date().getFullYear()} - Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
