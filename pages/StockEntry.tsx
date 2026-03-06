
import React from 'react';
import { storage } from '../services/storage';
import { Product, ProductStatus } from '../types';
import { BARCODE_PREFIX } from '../constants';
import { FileText, Save, Plus, Trash2, CheckCircle, Barcode, AlertCircle } from 'lucide-react';

export const StockEntry: React.FC = () => {
  const [formData, setFormData] = React.useState({
    invoiceNumber: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    status: 'CONCLUÍDO'
  });

  const [items, setItems] = React.useState([{
    name: '',
    brand: '',
    quantity: 1,
    purchasePrice: 0,
    salePrice: 0,
    description: '',
    barcode: ''
  }]);

  const [showSuccess, setShowSuccess] = React.useState(false);

  const addItem = () => {
    setItems([...items, { name: '', brand: '', quantity: 1, purchasePrice: 0, salePrice: 0, description: '', barcode: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentProducts = await storage.getProducts();
    
    const newProducts: Product[] = items.map((item) => {
      let finalBarcode = item.barcode.trim();
      if (!finalBarcode) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        finalBarcode = `${BARCODE_PREFIX}${timestamp}${random}`;
      }
      
      return {
        id: crypto.randomUUID(),
        barcode: finalBarcode,
        name: item.name,
        description: item.description,
        brand: item.brand,
        purchasePrice: Number(item.purchasePrice),
        salePrice: Number(item.salePrice),
        quantity: Number(item.quantity),
        supplier: formData.supplier,
        lastEntryDate: formData.date,
        status: 'ATIVO' as ProductStatus
      };
    });

    await storage.updateProducts([...currentProducts, ...newProducts]);
    setShowSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setShowSuccess(false), 3000);
    
    setItems([{ name: '', brand: '', quantity: 1, purchasePrice: 0, salePrice: 0, description: '', barcode: '' }]);
    setFormData({ invoiceNumber: '', supplier: '', date: new Date().toISOString().split('T')[0], status: 'CONCLUÍDO' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <h2 className="text-2xl font-black text-slate-800 uppercase">Entrada de Nota Fiscal</h2>
      {showSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-4">
          <CheckCircle size={24} className="text-emerald-500" />
          <p className="font-bold">Estoque atualizado!</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
           {/* Form Content */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <input required placeholder="Nº Nota" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none" value={formData.invoiceNumber} onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})} />
              <input required placeholder="Fornecedor" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none" value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} />
              <input required type="date" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="CONCLUÍDO">CONCLUÍDO</option>
                <option value="PENDENTE">PENDENTE</option>
              </select>
           </div>
        </div>
        
        {items.map((item, index) => (
          <div key={index} className="bg-white p-8 rounded-3xl border border-slate-100 relative">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <input placeholder="Código de Barras" className="w-full px-5 py-4 bg-slate-50 rounded-2xl" value={item.barcode} onChange={(e) => updateItem(index, 'barcode', e.target.value)} />
               <input required placeholder="Nome do Produto" className="w-full px-5 py-4 bg-slate-50 rounded-2xl" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} />
               <input required placeholder="Marca" className="w-full px-5 py-4 bg-slate-50 rounded-2xl" value={item.brand} onChange={(e) => updateItem(index, 'brand', e.target.value)} />
               <input required type="number" placeholder="Qtd" className="w-full px-5 py-4 bg-slate-50 rounded-2xl" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
               <input required type="number" step="0.01" placeholder="Preço Custo" className="w-full px-5 py-4 bg-slate-50 rounded-2xl" value={item.purchasePrice || ''} onChange={(e) => updateItem(index, 'purchasePrice', e.target.value)} />
               <input required type="number" step="0.01" placeholder="Preço Venda" className="w-full px-5 py-4 bg-blue-50 rounded-2xl font-bold" value={item.salePrice || ''} onChange={(e) => updateItem(index, 'salePrice', e.target.value)} />
             </div>
             {items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="absolute top-4 right-4 text-red-400"><Trash2/></button>}
          </div>
        ))}
        
        <div className="flex justify-between items-center">
          <button type="button" onClick={addItem} className="px-6 py-3 bg-slate-100 rounded-xl font-bold">+ Adicionar Produto</button>
          <button type="submit" className="px-12 py-5 bg-blue-600 text-white rounded-3xl font-black shadow-xl shadow-blue-200 uppercase">Confirmar Entrada</button>
        </div>
      </form>
    </div>
  );
};
