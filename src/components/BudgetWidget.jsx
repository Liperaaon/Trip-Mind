import React from 'react';
import { Wallet } from 'lucide-react';

const BudgetWidget = ({ balance, spentToday, currency = '€', onDetails }) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2563EB]">
        <Wallet size={24} />
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Saldo Restante</p>
        <p className="text-xl font-bold text-[#0F172A]">
          {currency}{balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
    <div className="h-10 w-[2px] bg-slate-100" />
    <div className="text-right">
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Gasto Hoje</p>
      <p className="text-lg font-bold text-[#EF4444]">
        - {currency}{spentToday.toFixed(2)}
      </p>
    </div>
  </div>
);

export default BudgetWidget;
