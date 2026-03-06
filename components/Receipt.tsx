
import React from 'react';
import { Sale, PaymentMethod, StoreInfo } from '../types';
import { storage } from '../services/storage';
import { Printer, X } from 'lucide-react';

interface ReceiptProps {
  sale: Sale;
  onClose: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ sale, onClose }) => {
  const [storeInfo, setStoreInfo] = React.useState<StoreInfo | null>(null);

  React.useEffect(() => {
    storage.getStoreInfo().then(setStoreInfo);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!storeInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Printer size={18} className="text-blue-600" />
            <span>Visualizar Cupom</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Área do Cupom Simulado */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
          <div className="bg-white p-6 shadow-sm border border-slate-200 mx-auto" id="thermal-receipt" style={{ width: '100%', maxWidth: '300px', fontFamily: 'monospace' }}>
            <div className="text-center mb-6 border-b border-dashed pb-4 border-slate-300">
              <h2 className="text-xl font-black text-slate-900 uppercase leading-none mb-1">{storeInfo.name}</h2>
              <p className="text-[10px] text-slate-600 font-bold leading-tight">{storeInfo.razonSocial}</p>
              <p className="text-[10px] text-slate-600">CNPJ: {storeInfo.cnpj}</p>
              <p className="text-[9px] text-slate-500 mt-1">{storeInfo.address}</p>
              <p className="text-[10px] text-slate-600">Tel: {storeInfo.phone}</p>
            </div>

            <div className="text-[10px] mb-4 space-y-0.5 font-bold uppercase text-slate-700">
              <p className="text-center border-b border-dashed border-slate-200 pb-1 mb-2">*** CUPOM NÃO FISCAL ***</p>
              <p className="flex justify-between"><span>Data:</span> <span>{formatDate(sale.date)}</span></p>
              <p className="flex justify-between"><span>Nº Venda:</span> <span>{sale.id}</span></p>
              <p className="flex justify-between"><span>Vendedor:</span> <span>{sale.vendorCode}</span></p>
            </div>

            <table className="w-full text-[10px] mb-4 border-y border-dashed py-2 border-slate-300">
              <thead>
                <tr className="border-b border-dashed border-slate-200">
                  <th className="text-left py-1">ITEM</th>
                  <th className="text-center py-1">QTD</th>
                  <th className="text-right py-1">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-100">
                {sale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-2">
                      <p className="font-bold text-slate-800 leading-none mb-0.5">{item.name}</p>
                      <p className="text-[9px] text-slate-500">1x R$ {item.unitPrice.toFixed(2)}</p>
                    </td>
                    <td className="text-center py-2 align-top">{item.quantity}</td>
                    <td className="text-right py-2 align-top font-bold">R$ {item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 pt-2 border-t border-slate-200">
              <div className="text-base font-black flex justify-between text-slate-900">
                <span>TOTAL:</span>
                <span>R$ {sale.totalValue.toFixed(2)}</span>
              </div>
              <div className="text-[10px] flex justify-between text-slate-600 font-bold">
                <span>PAGAMENTO:</span>
                <span>{sale.paymentMethod}</span>
              </div>
              
              {sale.paymentMethod === PaymentMethod.CASH && (
                <>
                  <div className="text-[10px] flex justify-between text-slate-500">
                    <span>RECEBIDO:</span>
                    <span>R$ {sale.amountReceived.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] flex justify-between text-slate-900 font-black border-t border-dashed border-slate-300 mt-1 pt-1">
                    <span>TROCO:</span>
                    <span>R$ {sale.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 text-center text-[10px] font-bold text-slate-500 uppercase border-t border-dashed pt-4 border-slate-300">
              <p>Obrigado pela preferência!</p>
              <p>Volte Sempre</p>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
          >
            Fechar
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
          >
            <Printer size={18} /> Imprimir (P)
          </button>
        </div>
      </div>

      {/* Versão de Impressão Limpa (Estilo Térmico 80mm) */}
      <div className="print-only fixed inset-0 bg-white">
        <div className="w-[80mm] mx-auto p-4" style={{ fontFamily: 'monospace' }}>
          <div className="text-center mb-4 border-b border-dashed pb-2 border-black">
            <h2 className="text-lg font-bold uppercase">{storeInfo.name}</h2>
            <p className="text-[10px]">{storeInfo.razonSocial}</p>
            <p className="text-[10px]">CNPJ: {storeInfo.cnpj}</p>
            <p className="text-[9px]">{storeInfo.address}</p>
          </div>

          <div className="text-[10px] mb-4 font-bold uppercase">
            <p className="text-center">*** CUPOM NÃO FISCAL ***</p>
            <p>DATA: {formatDate(sale.date)}</p>
            <p>VENDA: {sale.id}</p>
            <p>VENDEDOR: {sale.vendorCode}</p>
          </div>

          <table className="w-full text-[10px] mb-4 border-y border-dashed py-1 border-black">
            <thead>
              <tr className="border-b border-dashed border-black">
                <th className="text-left">ITEM</th>
                <th className="text-center">QTD</th>
                <th className="text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1">{item.name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">R$ {item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1">
            <div className="text-sm font-bold flex justify-between">
              <span>TOTAL:</span>
              <span>R$ {sale.totalValue.toFixed(2)}</span>
            </div>
            <div className="text-[10px] flex justify-between">
              <span>PAGTO:</span>
              <span>{sale.paymentMethod}</span>
            </div>
            {sale.paymentMethod === PaymentMethod.CASH && (
              <div className="text-[10px] flex justify-between font-bold">
                <span>TROCO:</span>
                <span>R$ {sale.change.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-[10px] uppercase border-t border-dashed pt-2 border-black">
            <p>Volte Sempre!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
