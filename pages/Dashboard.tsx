
import React from 'react';
import { storage } from '../services/storage';
import { Product, Sale } from '../types';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [allSales, setAllSales] = React.useState<Sale[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      const [s, p] = await Promise.all([storage.getSales(), storage.getProducts()]);
      setAllSales(s);
      setProducts(p);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Carregando painel...</div>;

  const activeSales = allSales.filter(s => s.status !== 'CANCELLED');
  const totalRevenue = activeSales.reduce((acc, sale) => acc + sale.totalValue, 0);
  const totalSalesCount = activeSales.length;
  const lowStockCount = products.filter(p => p.quantity < 5).length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const daySales = activeSales.filter(s => s.date.startsWith(dateStr));
    return {
      name: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      value: daySales.reduce((acc, s) => acc + s.totalValue, 0)
    };
  }).reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Faturamento Líquido" value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<TrendingUp className="text-blue-600" />} trend="+12.5%" isPositive={true} />
        <StatCard title="Vendas Ativas" value={totalSalesCount.toString()} icon={<ShoppingCart className="text-purple-600" />} trend="+5.2%" isPositive={true} />
        <StatCard title="Produtos em Estoque" value={products.length.toString()} icon={<Package className="text-green-600" />} trend={`Total: ${products.reduce((acc, p) => acc + p.quantity, 0)}`} isPositive={true} />
        <StatCard title="Estoque Baixo" value={lowStockCount.toString()} icon={<AlertCircle className="text-red-600" />} trend="Itens críticos" isPositive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Faturamento Semanal</h3>
            <span className="text-xs text-slate-400">Últimos 7 dias</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']} />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Vendas Recentes</h3>
          <div className="space-y-4">
            {activeSales.slice(-5).reverse().map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-800">{sale.id}</p>
                    <p className="text-xs text-slate-400">{new Date(sale.date).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-sm">R$ {sale.totalValue.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, isPositive }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-xl">{React.cloneElement(icon, { size: 24 })}</div>
      <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{trend}</div>
    </div>
    <span className="text-slate-500 text-sm font-medium">{title}</span>
    <span className="text-2xl font-bold text-slate-900 mt-1">{value}</span>
  </div>
);
