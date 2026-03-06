
import React from 'react';
import { storage } from '../services/storage';
import { Vendor, User, UserRole, StoreInfo } from '../types';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Plus, 
  Database as DbIcon, 
  Download, 
  Upload, 
  AlertTriangle,
  CheckCircle2,
  Building2,
  Save
} from 'lucide-react';

export const Config: React.FC = () => {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [storeInfo, setStoreInfo] = React.useState<StoreInfo | null>(null);
  const [successMsg, setSuccessMsg] = React.useState('');
  const [isSavingStore, setIsSavingStore] = React.useState(false);
  
  const [newVendor, setNewVendor] = React.useState({ code: '', name: '' });
  const [newUser, setNewUser] = React.useState({ username: '', password: '', name: '', role: UserRole.VENDEDOR });

  React.useEffect(() => {
    storage.getVendors().then(setVendors);
    storage.getUsers().then(setUsers);
    storage.getStoreInfo().then(setStoreInfo);
  }, []);

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeInfo) return;
    setIsSavingStore(true);
    await storage.updateStoreInfo(storeInfo);
    setIsSavingStore(false);
    setSuccessMsg('Dados da empresa atualizados com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const addVendor = () => {
    if (!newVendor.code || !newVendor.name) return;
    const updated = [...vendors, newVendor];
    setVendors(updated);
    storage.updateVendors(updated);
    setNewVendor({ code: '', name: '' });
  };

  const removeVendor = (code: string) => {
    const updated = vendors.filter(v => v.code !== code);
    setVendors(updated);
    storage.updateVendors(updated);
  };

  const addUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) return;
    const updated = [...users, { ...newUser, id: crypto.randomUUID() }];
    setUsers(updated);
    storage.updateUsers(updated);
    setNewUser({ username: '', password: '', name: '', role: UserRole.VENDEDOR });
  };

  const removeUser = (id: string) => {
    if (users.length <= 1) return alert('Pelo menos um usuário deve existir.');
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    storage.updateUsers(updated);
  };

  const handleExport = async () => {
    const db = await storage.getDb();
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modern_house_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setSuccessMsg('Backup exportado com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (await storage.importDb(json)) {
          setSuccessMsg('Dados importados com sucesso! Recarregando...');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao processar o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {successMsg && (
        <div className="fixed top-20 right-8 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10">
          <CheckCircle2 size={24} />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Dados da Empresa Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dados da Empresa (Cupom)</h2>
            <p className="text-sm text-slate-500 font-medium">As informações abaixo aparecerão no topo dos seus recibos.</p>
          </div>
        </div>
        <div className="p-8">
          {storeInfo ? (
            <form onSubmit={handleUpdateStore} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia (Loja)</label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  value={storeInfo.name}
                  onChange={e => setStoreInfo({...storeInfo, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  value={storeInfo.razonSocial}
                  onChange={e => setStoreInfo({...storeInfo, razonSocial: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ / CPF</label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  value={storeInfo.cnpj}
                  onChange={e => setStoreInfo({...storeInfo, cnpj: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone de Contato</label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  value={storeInfo.phone}
                  onChange={e => setStoreInfo({...storeInfo, phone: e.target.value})}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço Completo</label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  value={storeInfo.address}
                  onChange={e => setStoreInfo({...storeInfo, address: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit"
                  disabled={isSavingStore}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  <Save size={18} /> {isSavingStore ? 'Salvando...' : 'Salvar Alterações da Empresa'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center p-10 text-slate-400 font-bold">Carregando dados da empresa...</div>
          )}
        </div>
      </section>

      {/* Gestão de Dados Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <DbIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gestão de Dados e Nuvem</h2>
              <p className="text-sm text-slate-500 font-medium">Controle seus backups e exportações do sistema.</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <Download size={24} />
                <h3 className="font-bold">Exportar Banco de Dados</h3>
              </div>
              <p className="text-sm text-slate-600">Baixe todo o seu estoque, histórico de vendas e configurações em um único arquivo de segurança.</p>
              <button 
                onClick={handleExport}
                className="w-full py-4 bg-white border-2 border-blue-100 text-blue-600 font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all uppercase text-xs tracking-widest shadow-sm"
              >
                Gerar Arquivo de Backup (.JSON)
              </button>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <Upload size={24} />
                <h3 className="font-bold">Importar / Restaurar Dados</h3>
              </div>
              <p className="text-sm text-slate-600">Suba um arquivo de backup para restaurar informações ou sincronizar este dispositivo.</p>
              <label className="block w-full py-4 bg-white border-2 border-amber-100 text-amber-600 font-black rounded-2xl hover:bg-amber-600 hover:text-white transition-all uppercase text-xs tracking-widest shadow-sm text-center cursor-pointer">
                Selecionar Arquivo de Backup
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Vendedores Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <Users className="text-blue-600" />
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gerenciar Equipe de Vendas</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Identificador</label>
              <input 
                placeholder="Ex: V001" 
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold"
                value={newVendor.code}
                onChange={e => setNewVendor({...newVendor, code: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Vendedor</label>
              <input 
                placeholder="Nome Completo" 
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold"
                value={newVendor.name}
                onChange={e => setNewVendor({...newVendor, name: e.target.value})}
              />
            </div>
            <div className="pt-5">
              <button 
                onClick={addVendor}
                className="w-full h-[52px] bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-lg shadow-blue-200"
              >
                <Plus size={18} /> Cadastrar
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100 tracking-widest">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Vendedor</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vendors.map(v => (
                  <tr key={v.code} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-black text-blue-600 text-sm">{v.code}</td>
                    <td className="px-6 py-4 text-slate-800 font-bold">{v.name}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => removeVendor(v.code)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Usuários Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <Shield className="text-purple-600" />
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Segurança e Acesso</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <input 
              placeholder="Nome" 
              className="px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-purple-500 font-bold"
              value={newUser.name}
              onChange={e => setNewUser({...newUser, name: e.target.value})}
            />
            <input 
              placeholder="Login" 
              className="px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-purple-500 font-bold"
              value={newUser.username}
              onChange={e => setNewUser({...newUser, username: e.target.value})}
            />
            <input 
              type="password"
              placeholder="Senha" 
              className="px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-purple-500 font-bold"
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
            />
            <select 
              className="px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-purple-500 font-bold"
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
            >
              <option value={UserRole.VENDEDOR}>Vendedor</option>
              <option value={UserRole.ADMIN}>Administrador</option>
            </select>
            <button 
              onClick={addUser}
              className="bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-lg shadow-purple-200"
            >
              Adicionar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100 tracking-widest">
                  <th className="px-6 py-4">Nome Exibição</th>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4 text-center">Nível</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{u.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{u.username}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => removeUser(u.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
