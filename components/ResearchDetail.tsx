
import React, { useState } from 'react';
import { ResearchSession, ResearchStatus } from '../types';

interface ResearchDetailProps {
  session: ResearchSession;
  onContinue: (id: string) => void;
  onFileUpload: (id: string, file: File) => void;
}

export const ResearchDetail: React.FC<ResearchDetailProps> = ({ session, onContinue, onFileUpload }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'reasoning' | 'sources'>('report');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(session.id, e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{session.query}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <i className="fa-regular fa-calendar"></i>
              {new Date(session.createdAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-fingerprint"></i>
              {session.traceId}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition-all">
            <i className="fa-solid fa-cloud-arrow-up text-blue-500"></i>
            Context
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
          <button 
            onClick={() => onContinue(session.id)}
            disabled={session.status !== ResearchStatus.COMPLETED}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-arrow-turn-up rotate-90"></i>
            Continue Research
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border-b border-slate-100">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Tokens</p>
          <p className="text-lg font-bold text-slate-800">
            {(session.cost.inputTokens + session.cost.outputTokens).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Estimated Cost</p>
          <p className="text-lg font-bold text-emerald-600">${session.cost.estimatedCost.toFixed(4)}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Sources</p>
          <p className="text-lg font-bold text-slate-800">{session.sources.length}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${session.status === ResearchStatus.COMPLETED ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            <p className="text-sm font-bold capitalize text-slate-800">{session.status}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-6">
        {['report', 'reasoning', 'sources'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`py-4 px-6 text-sm font-semibold transition-all relative ${
              activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        {activeTab === 'report' && (
          <div className="max-w-4xl mx-auto">
            {session.status === ResearchStatus.COMPLETED ? (
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg">
                  {session.report}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium">Researching and generating report...</p>
                <p className="text-sm">This may take a minute or two.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reasoning' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {session.reasoning.map((step, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${
                    step.type === 'plan' ? 'bg-blue-500' : 
                    step.type === 'search' ? 'bg-purple-500' : 
                    step.type === 'analyze' ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx !== session.reasoning.length - 1 && <div className="w-px flex-1 bg-slate-200 my-2"></div>}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-xs text-slate-400 font-medium mb-1">{new Date(step.timestamp).toLocaleTimeString()}</p>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 leading-relaxed">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
            {session.status !== ResearchStatus.COMPLETED && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                  <div className="h-20 bg-slate-100 rounded-xl"></div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {session.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.url} 
                target="_blank" 
                rel="noreferrer"
                className="block p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-link text-xs"></i>
                  </div>
                  <h4 className="font-bold text-slate-800 line-clamp-1">{source.title}</h4>
                </div>
                <p className="text-xs text-blue-500 truncate mb-3">{source.url}</p>
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                  {source.snippet}
                </p>
              </a>
            ))}
            {session.sources.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400">
                No sources indexed yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Uploaded Documents Context Drawer (Optional/Floating) */}
      {session.documents.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 flex items-center gap-4 overflow-x-auto whitespace-nowrap">
          <span className="text-xs font-bold text-blue-700 uppercase">Context Docs:</span>
          {session.documents.map(doc => (
            <div key={doc.id} className="bg-white px-3 py-1 rounded-full border border-blue-200 text-[10px] font-medium text-blue-600 flex items-center gap-2">
              <i className="fa-regular fa-file-pdf"></i>
              {doc.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
