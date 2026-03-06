
import React from 'react';

interface BarcodeDisplayProps {
  value: string;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ value }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-[1px] h-8 overflow-hidden bg-white px-2">
        {value.split('').map((char, i) => {
          const height = ((char.charCodeAt(0) % 5) + 5) * 10 + '%';
          const width = (char.charCodeAt(0) % 3) + 1 + 'px';
          return <div key={i} className="bg-black" style={{ height, width }} />;
        })}
      </div>
      <span className="text-[10px] font-mono tracking-widest mt-1 uppercase">{value}</span>
    </div>
  );
};
