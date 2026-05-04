import React from 'react';
import { Search, Sparkles } from 'lucide-react';

const SearchBar = ({ placeholder = 'Pesquisar...', onSearch, showAI = false }) => (
  <div className="px-6 mb-8">
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <Search size={20} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-16 shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all text-sm font-medium"
      />
      {showAI && (
        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2563EB] text-white p-2.5 rounded-xl shadow-md active:scale-95 transition-all">
          <Sparkles size={18} />
        </button>
      )}
    </div>
  </div>
);

export default SearchBar;
