
import React from 'react';
import { storage } from '../services/storage';
import { Sale, PaymentMethod } from '../types';
import { 
  Calendar, 
  Search, 
  Download, 
  TrendingUp, 
  Users, 
  CreditCard,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Reports: React.FC = () => {
  // Fix: Initializing state with empty array as storage.getSales() returns a Promise
  const [allSales, setAllSales] = React.useState<Sale[]>([]);
  const [filter, setFilter] = React.useState('daily');

  // Fix: Loading sales data asynchronously on component mount
  React.useEffect(() => {
    storage.getSales().then(setAllSales);
  }, []);

  const filteredSales = React.useMemo(() => {
    const now = new Date();
    let sales = [...allSales];
    
    if (filter === 'daily') {
      const today = now.toISOString().split('T')[0];
      sales = sales.filter(s => s.date.startsWith(today));
    } else if (filter === 'monthly') {
      const currentMonth = now.toISOString().slice(0, 7);
      sales = sales.filter(s => s.date.startsWith(currentMonth));
    } else if (filter === 'yearly') {
      const currentYear = now.getFullYear().toString();
      sales = sales.filter(s => s.date.startsWith(currentYear));
    }
    return sales;
  }, [allSales, filter]);

  const activeSales = filteredSales.filter(s => s.status !== 'CANCELLED');
  const totalRevenue = activeSales.reduce((acc, s) => acc + s.totalValue, 0);

  // Fix: Updating handleRefund to await asynchronous storage operations
  const handleRefund = async (saleId: string) => {
    if (confirm('Deseja realmente ESTORNAR esta venda? Os itens voltarão ao estoque.')) {
      const success = await storage.cancelSale(saleId);
      if (success) {
        const sales = await storage.getSales();
        setAllSales(sales);
      }
    }
  };

  const handleExportCSV = () => {
    if (filteredSales.length === 0) return alert('Não há vendas no período para exportar.');
    
    let csvContent = "ID Venda;Data;Vendedor;Metodo;Total;Status\n";
    filteredSales.forEach(sale => {
      const date = new Date(sale.date).toLocaleString('pt-BR');
      csvContent += `${sale.id};${date};${sale.vendorCode};${sale.paymentMethod};${sale.totalValue.toFixed(2)};${sale.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_vendas_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paymentData = Object.values(PaymentMethod).map(method => {
    const value = activeSales
      .filter(s => s.paymentMethod === method)
      .reduce((acc, s) => acc + s.totalValue, 0);
    return { name: method, value };
  }).filter(d => d.value > 0);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

  const vendorData = Array.from(new Set(activeSales.map(s => s.vendorCode))).map(code => {
    const value = activeSales
      .filter(s => s.vendorCode === code)
      .reduce((acc, s) => acc + s.totalValue, 0);
    return { name: code, value };
  }).filter(d => d.value > 0);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
          {[
            { id: 'daily', label: 'Hoje' },
            { id: 'monthly', label: 'Mês' },
            { id: 'yearly', label: 'Ano' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                filter === f.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-3 px-8 py-3 bg-emerald-50 text-emerald-600 font-black rounded-2xl hover:bg-emerald-600 hover:text-white transition-all text-xs uppercase tracking-widest border border-emerald-100 shadow-sm active:scale-95"
        >
          <FileSpreadsheet size={18} /> Exportar Excel (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
          <div className="bg-blue-50 p-4 rounded-2xl mb-4 text-blue-600">
            <TrendingUp size={32} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Faturamento Líquido</p>
          <h2 className="text-3xl font-black text-slate-800">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
          <div className="bg-purple-50 p-4 rounded-2xl mb-4 text-purple-600">
            <Users size={32} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Vendas Ativas</p>
          <h2 className="text-3xl font-black text-slate-800">{activeSales.length}</h2>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
          <div className="bg-emerald-50 p-4 rounded-2xl mb-4 text-emerald-600">
            <CreditCard size={32} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Ticket Médio</p>
          <h2 className="text-3xl font-black text-slate-800">R$ {activeSales.length ? (totalRevenue / activeSales.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-8 border-l-4 border-blue-600 pl-4">Metodos de Pagamento</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-8 border-l-4 border-purple-600 pl-4">Top Vendedores (Faturamento)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']} 
                />
                <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Listagem Geral de Movimentação</h3>
          <div className="bg-white px-4 py-2 rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredSales.length} Registros</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Hora</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Operação</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendedor</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.slice().reverse().map((sale) => (
                <tr key={sale.id} className={`hover:bg-slate-50/80 transition-all ${sale.status === 'CANCELLED' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-8 py-5 text-sm font-medium text-slate-600">
                    {new Date(sale.date).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900 tracking-tight">#{sale.id}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">{sale.vendorCode}</td>
                  <td className="px-8 py-5">
                    {sale.status === 'CANCELLED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
                        <AlertTriangle size={12} /> Estornada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
                        Confirmada
                      </span>
                    )}
                  </td>
                  <td className={`px-8 py-5 text-right font-black text-lg ${sale.status === 'CANCELLED' ? 'text-red-400 line-through decoration-2' : 'text-slate-900'}`}>
                    R$ {sale.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5 text-center">
                    {sale.status !== 'CANCELLED' && (
                      <button 
                        onClick={() => handleRefund(sale.id)}
                        className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                        title="Estornar Venda"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <Search size={64} strokeWidth={1} />
                      <p className="font-bold uppercase text-xs tracking-widest">Nenhuma movimentação neste período</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
