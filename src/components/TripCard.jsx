import React from 'react';
import { Calendar, TrendingUp, ArrowUpRight } from 'lucide-react';

const TripCard = ({ trip }) => {
  const { city, country, image, dateRange, progress, status } = trip;

  return (
    <div className="mb-10">
      <div className="bg-white rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden">
        <div className="relative h-56 rounded-[2.2rem] overflow-hidden">
          <img src={image} className="w-full h-full object-cover" alt={city} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="text-white">
              <span className="bg-[#2563EB] text-[10px] font-bold uppercase px-2 py-1 rounded-lg mb-2 inline-block">
                Próxima Paragem
              </span>
              <h2 className="text-3xl font-bold">
                {city}, {country}
              </h2>
            </div>
            <button className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/30 transition-colors">
              <ArrowUpRight size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Calendar size={16} className="text-[#2563EB]" />
              <span>{dateRange}</span>
            </div>
            <div className="flex items-center gap-2 text-[#22C55E] text-sm font-bold bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp size={14} />
              <span>{status}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span className="uppercase tracking-widest text-[9px]">Preparação</span>
              <span className="text-[#0F172A]">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
