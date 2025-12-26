
import React from 'react';
import { ResearchSession, ResearchStatus } from '../types';

interface ResearchCardProps {
  session: ResearchSession;
  isActive: boolean;
  onClick: (id: string) => void;
}

export const ResearchCard: React.FC<ResearchCardProps> = ({ session, isActive, onClick }) => {
  const getStatusIcon = (status: ResearchStatus) => {
    switch (status) {
      case ResearchStatus.COMPLETED: return <i className="fa-solid fa-check-circle text-emerald-500"></i>;
      case ResearchStatus.FAILED: return <i className="fa-solid fa-circle-exclamation text-rose-500"></i>;
      default: return <i className="fa-solid fa-spinner fa-spin text-amber-500"></i>;
    }
  };

  return (
    <div 
      onClick={() => onClick(session.id)}
      className={`group p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
        isActive 
          ? 'bg-white border-indigo-500 shadow-lg ring-1 ring-indigo-500/20 translate-x-1' 
          : 'bg-white/50 border-slate-200 hover:border-slate-300 hover:bg-white'
      }`}
    >
      {/* Lineage Tab */}
      {session.parentResearchId && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-200 group-hover:bg-indigo-400 transition-colors"></div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(session.status)}
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            {session.status}
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-400">
          {new Date(session.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h3 className={`text-sm font-bold leading-snug line-clamp-2 mb-1 ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
        {session.query}
      </h3>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
             {(session.analytics?.credibilityBreakdown || []).slice(0, 3).map((c, i) => (
               <div key={i} className={`w-2 h-2 rounded-full border border-white ${
                 c.label === 'High' ? 'bg-emerald-400' : c.label === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'
               }`}></div>
             ))}
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase">
            {(session.sources || []).length} Sources
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600">
          <span className="opacity-50">$</span>
          {(session.cost?.estimatedCost || 0).toFixed(4)}
        </div>
      </div>
    </div>
  );
};
