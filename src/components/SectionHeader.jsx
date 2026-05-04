import React from 'react';

const SectionHeader = ({ title, actionLabel, onAction, icon: Icon }) => (
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center gap-2">
      <h3 className="font-bold text-lg text-[#0F172A]">{title}</h3>
      {Icon && <Icon size={16} className="text-[#2563EB]" />}
    </div>
    {actionLabel && (
      <button
        onClick={onAction}
        className="text-[#2563EB] text-xs font-bold uppercase tracking-wider"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default SectionHeader;
