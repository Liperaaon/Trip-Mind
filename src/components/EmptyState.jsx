import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 mb-10 flex flex-col items-center text-center">
    {Icon && (
      <div className="w-16 h-16 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mb-4">
        <Icon size={32} />
      </div>
    )}
    <h3 className="font-bold text-[#0F172A] text-lg">{title}</h3>
    {description && (
      <p className="text-slate-400 text-sm mt-1 mb-6">{description}</p>
    )}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="bg-[#2563EB] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2"
      >
        <Plus size={20} />
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
