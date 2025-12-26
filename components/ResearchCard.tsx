
import React from 'react';
import { ResearchSession, ResearchStatus } from '../types';

interface ResearchCardProps {
  session: ResearchSession;
  isActive: boolean;
  onClick: (id: string) => void;
}

export const ResearchCard: React.FC<ResearchCardProps> = ({ session, isActive, onClick }) => {
  const getStatusColor = (status: ResearchStatus) => {
    switch (status) {
      case ResearchStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case ResearchStatus.FAILED: return 'bg-rose-100 text-rose-700';
      case ResearchStatus.IDLE: return 'bg-slate-100 text-slate-700';
      default: return 'bg-amber-100 text-amber-700 animate-pulse';
    }
  };

  return (
    <div 
      onClick={() => onClick(session.id)}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(session.status)}`}>
          {session.status}
        </span>
        <span className="text-[10px] text-slate-400">
          {new Date(session.createdAt).toLocaleDateString()}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1">
        {session.query}
      </h3>
      <p className="text-xs text-slate-500 line-clamp-1 italic">
        {session.summary || 'Processing research...'}
      </p>
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-code-branch"></i>
          <span>{session.parentResearchId ? 'Extended' : 'Primary'}</span>
        </div>
        <span>${session.cost.estimatedCost.toFixed(4)}</span>
      </div>
    </div>
  );
};
