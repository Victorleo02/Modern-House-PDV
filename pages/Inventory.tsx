
import React from 'react';
import { storage } from '../services/storage';
import { Product } from '../types';
import { Search, Filter, Edit2, Trash2, Package, Tag } from 'lucide-react';
import { BarcodeDisplay } from '../components/BarcodeDisplay';
import { BarcodeLabel } from '../components/BarcodeLabel';

export const Inventory: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    storage.getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  );

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      await storage.updateProducts(updated);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Carregando estoque...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou código..."
            className="w-full pl-12 pr-4 py-3 border-2 border-slate-50 bg-white rounded-xl focus:border-blue-500 outline-none shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-50 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} /> Filtrar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Código de Barras</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Marca</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Estoque</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Preço Venda</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                        <Package size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">{p.name}</div>
                        <div className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{p.description || 'Sem descrição'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5"><BarcodeDisplay value={p.barcode} /></td>
                  <td className="px-6 py-5 text-sm text-slate-600 font-bold uppercase tracking-tighter">{p.brand}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      p.quantity <= 0 ? 'bg-red-100 text-red-600' : p.quantity < 5 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {p.quantity <= 0 ? 'Esgotado' : `${p.quantity} unid.`}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-slate-800 text-base">R$ {p.salePrice.toFixed(2)}</td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => setSelectedProduct(p)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Tag size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && <BarcodeLabel product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
};
