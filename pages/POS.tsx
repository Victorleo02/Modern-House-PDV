
import React from 'react';
import { storage } from '../services/storage';
import { Product, SaleItem, PaymentMethod, Sale, Vendor } from '../types';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Smartphone, 
  AlertCircle, 
  Package, 
  Plus, 
  Minus,
  CheckCircle2,
  User
} from 'lucide-react';
import { Receipt } from '../components/Receipt';

export const POS: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [cart, setCart] = React.useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [vendorCode, setVendorCode] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.CASH);
  const [amountReceived, setAmountReceived] = React.useState<string>('');
  const [showReceipt, setShowReceipt] = React.useState<Sale | null>(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const load = async () => {
      const [p, v] = await Promise.all([storage.getProducts(), storage.getVendors()]);
      setProducts(p);
      setVendors(v);
      setLoading(false);
    };
    load();
    // Focar no campo de busca ao carregar
    setTimeout(() => searchInputRef.current?.focus(), 500);
  }, []);

  React.useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.barcode.includes(searchTerm)
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, products]);

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      showError(`Produto ${product.name} sem estoque disponível.`);
      return;
    }

    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        showError(`Quantidade máxima em estoque atingida (${product.quantity}).`);
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        unitPrice: product.salePrice, 
        totalPrice: product.salePrice 
      }]);
    }
    setSearchTerm('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && newQty > product.quantity) {
          showError("Estoque insuficiente.");
          return item;
        }
        return { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  const total = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const change = Number(amountReceived) > total ? Number(amountReceived) - total : 0;

  const handleFinalize = async () => {
    if (cart.length === 0) return showError('O carrinho está vazio.');
    if (!vendorCode) return showError('Por favor, selecione um vendedor.');
    
    if (paymentMethod === PaymentMethod.CASH) {
      if (!amountReceived || Number(amountReceived) < total) {
        return showError('Valor recebido é insuficiente para o total da venda.');
      }
    }

    const now = new Date();
    const saleId = `V${now.getTime().toString().slice(-8)}`;

    const newSale: Sale = {
      id: saleId,
      date: now.toISOString(),
      items: cart,
      totalValue: total,
      amountReceived: paymentMethod === PaymentMethod.CASH ? Number(amountReceived) : total,
      change: paymentMethod === PaymentMethod.CASH ? change : 0,
      paymentMethod,
      vendorCode,
      status: 'COMPLETED'
    };

    try {
      const allProducts = await storage.getProducts();
      const updatedProducts = allProducts.map(p => {
        const sold = cart.find(item => item.productId === p.id);
        return sold ? { ...p, quantity: p.quantity - sold.quantity } : p;
      });

      await storage.updateProducts(updatedProducts);
      await storage.addSale(newSale);

      setProducts(updatedProducts);
      setSuccess(true);
      setShowReceipt(newSale);
      
      // Limpar formulário
      setCart([]);
      setAmountReceived('');
      setVendorCode('');
      setSearchTerm('');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      showError('Erro ao processar a venda. Tente novamente.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-slate-400">Iniciando Terminal de Vendas...</p>
    </div>
  );

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px] no-print">
      {/* Lado Esquerdo: Carrinho e Busca */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="relative">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="pl-4 text-slate-400"><Search size={22} /></div>
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="F7 - Buscar por Nome ou Código de Barras..."
              className="flex-1 py-4 text-lg font-medium outline-none placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                const exactMatch = products.find(p => p.barcode === e.target.value);
                if (exactMatch) addToCart(exactMatch);
              }}
            />
          </div>

          {/* Resultados da Busca (Dropdown) */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {searchResults.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <Package size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.brand} | {product.barcode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600">R$ {product.salePrice.toFixed(2)}</p>
                    <p className={`text-[10px] font-bold uppercase ${product.quantity < 5 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {product.quantity} em estoque
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listagem do Carrinho */}
        <div className="bg-white rounded-3xl border border-slate-100 flex-1 flex flex-col overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter">
              <ShoppingCart size={20} className="text-blue-600" />
              Itens no Carrinho ({cart.length})
            </div>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                className="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
              >
                <Trash2 size={14} /> Limpar Tudo
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                <ShoppingCart size={80} strokeWidth={1} />
                <p className="font-bold uppercase tracking-widest text-sm mt-4">Carrinho Vazio</p>
                <p className="text-xs">Passe o leitor ou busque um produto acima</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={item.productId} className="group flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                  <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-xs font-black text-slate-400 shadow-sm border border-slate-100">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 font-bold">UN: R$ {item.unitPrice.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-black text-slate-800 min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <p className="font-black text-slate-900">R$ {item.totalPrice.toFixed(2)}</p>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lado Direito: Checkout e Pagamento */}
      <div className="w-full xl:w-[420px] flex flex-col gap-4">
        <div className="bg-slate-900 text-white rounded-[40px] p-8 shadow-2xl flex flex-col gap-8 h-full">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Total da Venda</span>
            <div className="text-6xl font-black tracking-tighter flex items-start gap-2">
              <span className="text-2xl mt-2 text-blue-500">R$</span>
              {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <User size={12} /> Vendedor Responsável
              </label>
              <select 
                className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all text-white appearance-none"
                value={vendorCode}
                onChange={e => setVendorCode(e.target.value)}
              >
                <option value="">Selecione o Vendedor...</option>
                {vendors.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Método de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: PaymentMethod.CASH, icon: Banknote, label: 'Dinheiro' },
                  { id: PaymentMethod.DEBIT, icon: Smartphone, label: 'Débito' },
                  { id: PaymentMethod.CREDIT, icon: CreditCard, label: 'Crédito' },
                  { id: PaymentMethod.PIX, icon: QrCode, label: 'PIX' }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold ${
                      paymentMethod === method.id 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <method.icon size={20} />
                    <span className="text-xs">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === PaymentMethod.CASH && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recebido</label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-xl text-white"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Troco</label>
                  <div className={`w-full p-4 rounded-2xl font-black text-xl flex items-center justify-center border-2 ${change > 0 ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
                    R$ {change.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                Venda finalizada com sucesso!
              </div>
            )}

            <button 
              onClick={handleFinalize}
              disabled={cart.length === 0}
              className={`w-full py-6 rounded-[28px] font-black text-lg tracking-widest uppercase transition-all shadow-xl active:scale-95 ${
                cart.length > 0 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 cursor-pointer' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              Finalizar Venda
            </button>
            <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Atalho: F9 para confirmar
            </p>
          </div>
        </div>
      </div>

      {showReceipt && <Receipt sale={showReceipt} onClose={() => setShowReceipt(null)} />}
    </div>
  );
};
