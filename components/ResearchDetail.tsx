
import React, { useState } from 'react';
import { ResearchSession, ResearchStatus } from '../types';

interface ResearchDetailProps {
  session: ResearchSession;
  onContinue: (id: string, query?: string) => void;
  onFileUpload: (id: string, file: File) => void;
}

export const ResearchDetail: React.FC<ResearchDetailProps> = ({ session, onContinue, onFileUpload }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'timeline' | 'sources'>('report');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(session.id, e.target.files[0]);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score > 0.8) return 'text-emerald-500';
    if (score > 0.5) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight line-clamp-1">{session.query}</h1>
            {session.confidence.score > 0 && (
              <div className="group relative">
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full border border-current ${getConfidenceColor(session.confidence.score)}`}>
                  {(session.confidence.score * 100).toFixed(0)}% Reliable
                </div>
                <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl hidden group-hover:block z-50 shadow-xl border border-slate-700">
                  <p className="font-bold mb-1">Confidence Breakdown</p>
                  {session.confidence.explanation}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <i className="fa-regular fa-calendar"></i>
              {new Date(session.createdAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-code-branch"></i>
              Trace: {session.traceId.slice(-6)}
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
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50"
          >
            <i className="fa-solid fa-arrow-turn-up rotate-90"></i>
            Continue
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border-b border-slate-100">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Cost</p>
          <p className="text-lg font-bold text-emerald-600">${session.cost.estimatedCost.toFixed(4)}</p>
          <p className="text-[9px] text-slate-400 mt-1 italic">{session.cost.optimizationTip}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Token Usage</p>
          <p className="text-lg font-bold text-slate-800">
            {((session.cost.inputTokens + session.cost.outputTokens) / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Sources</p>
          <p className="text-lg font-bold text-slate-800">{session.sources.length}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Reasoning Steps</p>
          <p className="text-lg font-bold text-slate-800">{session.timeline.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-6">
        {['report', 'timeline', 'sources'].map((tab) => (
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
              <div className="space-y-12">
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg">
                    {session.report}
                  </div>
                </div>
                
                {/* Follow Ups */}
                {session.followUps.length > 0 && (
                  <div className="pt-10 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-6 flex items-center gap-2">
                      <i className="fa-solid fa-lightbulb text-amber-500"></i>
                      Suggested Follow-up Research
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {session.followUps.map((q, idx) => (
                        <button 
                          key={idx}
                          onClick={() => onContinue(session.id, q)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors text-left border border-blue-100 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-plus-circle opacity-50"></i>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium">Assembling Research Execution Story...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-8">Execution Story</h2>
            <div className="space-y-0">
              {session.timeline.map((step, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                      step.type === 'plan' ? 'bg-blue-500' : 
                      step.type === 'search' ? 'bg-purple-500' : 
                      step.type === 'analyze' ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}>
                      <i className={`fa-solid ${
                        step.type === 'plan' ? 'fa-map' : 
                        step.type === 'search' ? 'fa-magnifying-glass' : 
                        step.type === 'analyze' ? 'fa-vial-circle-check' : 'fa-pen-nib'
                      }`}></i>
                    </div>
                    {idx !== session.timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-2"></div>}
                  </div>
                  <div className="flex-1 pb-10">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-slate-800">{step.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-600 text-sm shadow-sm group-hover:border-blue-200 transition-colors">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Sources Explorer</h2>
            <p className="text-slate-500 text-sm mb-8">Verified data points and their impact on research outcome.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {session.sources.map((source, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-quote-left text-xs"></i>
                        </div>
                        <h4 className="font-bold text-slate-800 line-clamp-1">{source.title}</h4>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        source.credibility === 'High' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                        source.credibility === 'Medium' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                        'text-rose-600 border-rose-200 bg-rose-50'
                      }`}>
                        {source.credibility}
                      </span>
                    </div>
                    <p className="text-xs text-blue-500 truncate mb-3 italic">{source.url}</p>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {source.snippet}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">System Reasoning</p>
                    <p className="text-xs text-slate-700 italic">{source.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Docs Bar */}
      {session.documents.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 flex items-center gap-4 overflow-x-auto whitespace-nowrap">
          <span className="text-xs font-bold text-blue-700 uppercase shrink-0">Context Stack:</span>
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
