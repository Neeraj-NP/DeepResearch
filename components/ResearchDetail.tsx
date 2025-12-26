
import React, { useState, useRef } from 'react';
import { ResearchSession, ResearchStatus, UploadedDocument } from '../types';

interface ResearchDetailProps {
  session: ResearchSession;
  onContinue: (id: string, query?: string) => void;
  onFileUpload: (id: string, file: File) => void;
}

export const ResearchDetail: React.FC<ResearchDetailProps> = ({ session, onContinue, onFileUpload }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'strategy' | 'sources' | 'timeline'>('report');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getConfidenceLevel = (score: number = 0) => {
    if (score > 85) return { label: 'Exceptional', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score > 60) return { label: 'Reliable', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    return { label: 'Provisional', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await onFileUpload(session.id, file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const score = session.confidence?.score || 0;
  const confidence = getConfidenceLevel(score);

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
      {/* Session Header */}
      <header className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{session.query}</h1>
            <div className={`px-3 py-1 rounded-full border ${confidence.border} ${confidence.bg} ${confidence.color} text-[10px] font-black tracking-widest uppercase`}>
              {confidence.label} {score}%
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-2"><i className="fa-regular fa-calendar"></i> {new Date(session.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><i className="fa-solid fa-layer-group"></i> {(session.sources || []).length} SOURCES</span>
            <span className="flex items-center gap-2"><i className="fa-solid fa-file-lines"></i> {(session.documents || []).length} CONTEXT FILES</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.pdf" onChange={handleFileChange} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-sm flex items-center gap-3 disabled:opacity-50"
          >
            {isUploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paperclip"></i>}
            Add Context
          </button>
          <button 
            onClick={() => onContinue(session.id)}
            disabled={session.status !== ResearchStatus.COMPLETED}
            className="group px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-xl shadow-slate-200 disabled:opacity-30 flex items-center gap-3"
          >
            Branch Research
            <i className="fa-solid fa-code-branch rotate-90 group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 divide-x divide-slate-100 bg-white">
        {[
          { label: 'Token Efficiency', value: `${(((session.cost?.inputTokens || 0) + (session.cost?.outputTokens || 0)) / 1000).toFixed(1)}k`, sub: `$${(session.cost?.estimatedCost || 0).toFixed(4)}`, icon: 'fa-bolt-lightning', color: 'text-amber-500' },
          { label: 'Evidence density', value: (session.sources || []).length, sub: 'Indexed Entries', icon: 'fa-database', color: 'text-indigo-500' },
          { label: 'Logic Integrity', value: `${session.analytics?.atomicClaims?.length || 0}`, sub: 'Claims Mapped', icon: 'fa-shield-halved', color: 'text-emerald-500' },
          { label: 'Research Depth', value: (session.timeline || []).length, sub: 'Iterations', icon: 'fa-brain', color: 'text-purple-500' }
        ].map((stat, i) => (
          <div key={i} className="p-5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
            <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color} shadow-inner`}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-800 tracking-tighter">{stat.value}</span>
                <span className="text-[10px] font-bold text-slate-400">{stat.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <nav className="flex px-8 border-b border-slate-100 bg-white sticky top-0 z-10">
        {[
          { id: 'report', label: 'Synthesis Report', icon: 'fa-file-lines' },
          { id: 'strategy', label: 'Strategic Intelligence', icon: 'fa-chess' },
          { id: 'sources', label: 'Source Explorer', icon: 'fa-magnifying-glass-chart' },
          { id: 'timeline', label: 'System Process', icon: 'fa-microchip' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-5 px-6 text-[11px] font-black tracking-widest uppercase flex items-center gap-3 transition-all relative ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`fa-solid ${tab.icon} opacity-70`}></i>
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-6 right-6 h-1 bg-indigo-600 rounded-t-full"></div>}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
        <div className="max-w-7xl mx-auto p-8 lg:p-12">
          
          {activeTab === 'report' && (
            <div className="max-w-4xl mx-auto space-y-12">
              {(session.documents || []).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(session.documents || []).map(doc => (
                    <div key={doc.id} className="p-5 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex gap-4 hover:border-indigo-300 transition-all">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-file-lines text-xl"></i>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{(doc.size / 1024).toFixed(1)} KB • Injection Active</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {session.status === ResearchStatus.COMPLETED ? (
                <div className="space-y-12">
                  <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-200/50 prose-report">
                    {(session.report || '').split('\n').map((line, i) => {
                      if (line.startsWith('# ')) return <h1 key={i}>{line.replace('# ', '')}</h1>;
                      if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-40">
                  <div className="relative mb-10">
                    <div className="w-24 h-24 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-600 text-xl font-black">
                      <i className="fa-solid fa-brain"></i>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-800 tracking-tight mb-2">Analyzing Information Graph</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              {/* Atomic Claims Matrix */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  Atomic Claims Index
                  <div className="h-px flex-1 bg-slate-200"></div>
                </h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {(session.analytics?.atomicClaims || []).map((claim, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex gap-6">
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg ${
                          claim.strength === 'Strong' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}>
                          <i className={`fa-solid ${claim.strength === 'Strong' ? 'fa-shield-check' : 'fa-vial'}`}></i>
                        </div>
                        <div className="mt-3 text-[9px] font-black uppercase tracking-widest text-slate-400">{claim.strength}</div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-2 leading-tight">{claim.text}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">{claim.verificationLogic}</p>
                        <div className="flex gap-4">
                          <div className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full">{claim.supportingSources} Supporting</div>
                          {claim.conflictingSources > 0 && (
                            <div className="text-[10px] font-black text-rose-600 uppercase bg-rose-50 px-3 py-1 rounded-full">{claim.conflictingSources} Contradictions</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Assumption Tracker */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  Epistemic Assumptions
                  <div className="h-px flex-1 bg-slate-200"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(session.analytics?.assumptions || []).map((asn, i) => (
                    <div key={i} className="p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col justify-between">
                      <div className="mb-6">
                        <div className={`text-[10px] font-black uppercase tracking-widest mb-3 ${
                          asn.impact === 'High' ? 'text-rose-400' : 'text-indigo-400'
                        }`}>{asn.impact} Impact</div>
                        <p className="font-bold leading-relaxed">"{asn.statement}"</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl text-xs text-slate-400 border border-white/10 italic">
                        Risk: {asn.risk}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Decision Matrix */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  Strategic Decision Matrix
                  <div className="h-px flex-1 bg-slate-200"></div>
                </h3>
                <div className="space-y-6">
                  {(session.analytics?.decisionMatrix || []).map((opt, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-sm">
                      <div className="p-8 bg-slate-50 border-r border-slate-100 md:w-80 shrink-0">
                        <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight">{opt.title}</h4>
                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          opt.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' : 
                          opt.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>{opt.riskLevel} Risk Profile</div>
                      </div>
                      <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase mb-3">Strategic Advantages</p>
                          <ul className="space-y-2">
                            {opt.pros.map((p, j) => <li key={j} className="text-sm font-bold text-slate-700 flex gap-3"><i className="fa-solid fa-plus-circle text-emerald-400 mt-0.5"></i> {p}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-rose-600 uppercase mb-3">Identified Friction</p>
                          <ul className="space-y-2">
                            {opt.cons.map((c, j) => <li key={j} className="text-sm font-bold text-slate-700 flex gap-3"><i className="fa-solid fa-minus-circle text-rose-400 mt-0.5"></i> {c}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {(session.sources || []).map((source, i) => (
                <div key={i} className="bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden shadow-sm flex flex-col hover:border-indigo-200 transition-all">
                  <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex gap-5 items-start">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 text-lg">
                        <i className="fa-solid fa-file-contract"></i>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 leading-tight mb-1">{source.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          <span>{source.type}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{source.year}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-4 flex-1">
                    <p className="text-sm text-slate-600 italic leading-relaxed">"{source.snippet}"</p>
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-bold text-slate-800">
                      <p className="text-[9px] text-emerald-600 uppercase mb-1">Claim Supported</p>
                      {source.supportsClaim}
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-slate-900 text-[10px] font-medium text-slate-300">
                    {source.reasoning}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {(session.timeline || []).map((step, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg"><i className="fa-solid fa-microchip"></i></div>
                    {i !== session.timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>}
                  </div>
                  <div className="flex-1 pb-10">
                    <h4 className="font-black text-slate-900">{step.title}</h4>
                    <p className="text-xs text-slate-400 mb-2">{new Date(step.timestamp).toLocaleTimeString()}</p>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
