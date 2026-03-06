
import React from 'react';
import { Product, StoreInfo } from '../types';
import { storage } from '../services/storage';
import { X, Printer } from 'lucide-react';

interface BarcodeLabelProps {
  product: Product;
  onClose: () => void;
}

export const BarcodeLabel: React.FC<BarcodeLabelProps> = ({ product, onClose }) => {
  const [storeInfo, setStoreInfo] = React.useState<StoreInfo | null>(null);

  React.useEffect(() => {
    storage.getStoreInfo().then(setStoreInfo);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!storeInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Printer size={18} className="text-blue-600" />
            <span>Etiqueta de Preço</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 flex flex-col items-center bg-slate-100/50">
          {/* Visual da Etiqueta Real */}
          <div className="border-2 border-slate-200 p-4 rounded-lg bg-white w-full flex flex-col items-center text-center shadow-xl" id="printable-label">
            <span className="text-[10px] font-black uppercase text-blue-600 mb-1 tracking-tighter">{storeInfo.name}</span>
            <span className="text-sm font-bold text-slate-800 line-clamp-1 mb-0.5">{product.name}</span>
            <span className="text-[10px] text-slate-400 mb-3 uppercase font-bold tracking-widest">{product.brand}</span>
            
            <div className="flex flex-col items-center gap-1 mb-3">
              <div className="flex items-end gap-[1px] h-10 overflow-hidden bg-white px-2">
                {product.barcode.split('').map((char, i) => {
                  const height = ((char.charCodeAt(0) % 5) + 5) * 10 + '%';
                  const width = (char.charCodeAt(0) % 2) + 1 + 'px';
                  return <div key={i} className="bg-black" style={{ height, width }} />;
                })}
              </div>
              <span className="text-[9px] font-mono tracking-[0.2em] font-bold text-slate-900">{product.barcode}</span>
            </div>

            <div className="w-full border-t border-dashed border-slate-300 pt-3 mt-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Preço Unid.</span>
              <span className="text-2xl font-black text-slate-900">R$ {product.salePrice.toFixed(2)}</span>
            </div>
          </div>

          <p className="mt-6 text-[10px] text-slate-400 text-center px-4 font-medium italic">
            Configurada para etiquetas pequenas (50x30mm).
          </p>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
          >
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </div>

      {/* Versão de Impressão (Etiqueta de Gôndola/Produto) */}
      <div className="print-only fixed inset-0 bg-white flex items-center justify-center">
         <div className="border border-black p-2 w-[50mm] h-[30mm] flex flex-col items-center justify-center text-center overflow-hidden">
            <span className="text-[7px] font-bold uppercase block tracking-tighter mb-0.5">{storeInfo.name}</span>
            <span className="text-[8px] font-bold block leading-none truncate w-full">{product.name}</span>
            <div className="flex items-end gap-[0.5px] h-6 my-1">
                {product.barcode.split('').map((char, i) => {
                  const height = ((char.charCodeAt(0) % 5) + 5) * 10 + '%';
                  const width = (char.charCodeAt(0) % 2) + 0.5 + 'px';
                  return <div key={i} className="bg-black" style={{ height, width }} />;
                })}
            </div>
            <span className="text-[6px] font-mono mb-1">{product.barcode}</span>
            <span className="text-[12px] font-black leading-none">R$ {product.salePrice.toFixed(2)}</span>
         </div>
      </div>
    </div>
  );
};
