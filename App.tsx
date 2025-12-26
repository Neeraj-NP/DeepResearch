
import React, { useState, useEffect } from 'react';
import { ResearchSession, ResearchStatus, ComparisonResult } from './types';
import { apiService } from './services/apiService';
import { ResearchCard } from './components/ResearchCard';
import { ResearchDetail } from './components/ResearchDetail';

const App: React.FC = () => {
  const [history, setHistory] = useState<ResearchSession[]>([]);
  const [activeResearchId, setActiveResearchId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [queryInput, setQueryInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [comparison, setComparison] = useState<{result: ComparisonResult, with: string} | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await apiService.getHistory();
      setHistory(data);
      if (data.length > 0) setActiveResearchId(data[0].id);
    };
    fetchHistory();
  }, []);

  const handleStartResearch = async (parentID?: string, customQuery?: string) => {
    const q = customQuery || queryInput;
    if (!q.trim()) return;
    
    setIsStarting(true);
    setQueryInput('');
    setComparison(null);
    
    await apiService.startResearch(q, parentID, (updatedSession) => {
      setHistory(prev => {
        const index = prev.findIndex(h => h.id === updatedSession.id);
        if (index !== -1) {
          const newHistory = [...prev];
          newHistory[index] = updatedSession;
          return newHistory;
        } else {
          return [updatedSession, ...prev];
        }
      });
      setActiveResearchId(updatedSession.id);
    });
    setIsStarting(false);
  };

  const handleContinue = (id: string, query?: string) => {
    if (query) {
      handleStartResearch(id, query);
    } else {
      const session = history.find(h => h.id === id);
      if (session) {
        setQueryInput(`Build upon findings for: "${session.query}" with `);
      }
    }
  };

  const handleCompare = async (targetId: string) => {
    if (!activeResearchId || activeResearchId === targetId) return;
    const result = await apiService.compare(activeResearchId, targetId);
    if (result) {
      setComparison({ result, with: targetId });
    }
  };

  const handleFileUpload = async (id: string, file: File) => {
    await apiService.uploadFile(id, file);
    const updated = await apiService.getResearchDetails(id);
    if (updated) {
      setHistory(prev => prev.map(h => h.id === id ? updated : h));
    }
  };

  const activeSession = history.find(h => h.id === activeResearchId);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar: Glass Sidebar */}
      <aside className={`transition-all duration-500 bg-slate-100/50 backdrop-blur-xl border-r border-slate-200/60 flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <i className="fa-solid fa-microscope text-lg"></i>
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-xl tracking-tighter text-slate-900 leading-none">DeepResearch</h1>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500 mt-1">Intelligence Hub</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className="flex justify-between items-center px-4 mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Research Stack</span>
            {activeResearchId && (
              <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              </div>
            )}
          </div>
          {history.map(session => (
            <div key={session.id} className="relative group px-1">
              <ResearchCard 
                session={session} 
                isActive={activeResearchId === session.id}
                onClick={setActiveResearchId}
              />
              {activeResearchId && activeResearchId !== session.id && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCompare(session.id); }}
                  className="absolute -right-1 top-4 hidden group-hover:flex w-8 h-8 bg-slate-900 text-white rounded-xl items-center justify-center shadow-2xl transition-all hover:scale-110 z-10"
                  title="Cross-reference"
                >
                  <i className="fa-solid fa-arrows-left-right text-[10px]"></i>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-200/60">
           <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">JS</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Operator</p>
                <p className="text-xs font-bold text-slate-800">Research Terminal 01</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <nav className="h-20 bg-white/50 backdrop-blur-md px-8 flex items-center justify-between z-10 border-b border-slate-200/40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm text-slate-600"
            >
              <i className={`fa-solid ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'}`}></i>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isStarting ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                {isStarting ? 'Engaging Deep Inference' : 'System Ready'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Session Cost</span>
              <span className="text-sm font-black text-emerald-600 tracking-tighter">${activeSession?.cost.estimatedCost.toFixed(4) || '0.0000'}</span>
            </div>
          </div>
        </nav>

        {/* Global Comparison Modal overlay */}
        {comparison && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.3)] flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-10 bg-indigo-900 text-white flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                    <i className="fa-solid fa-code-compare text-indigo-400"></i>
                    Evolutionary Diff Analysis
                  </h3>
                  <p className="mt-2 text-indigo-200 font-medium max-w-2xl italic leading-relaxed">{comparison.result.semanticSummary}</p>
                </div>
                <button onClick={() => setComparison(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-xl">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><i className="fa-solid fa-plus-circle"></i></div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">New Evidence Findings</h4>
                    </div>
                    <ul className="space-y-4">
                      {comparison.result.addedFindings.map((f, i) => (
                        <li key={i} className="flex gap-4 p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-bold text-slate-700 leading-relaxed">
                          <i className="fa-solid fa-circle text-[6px] mt-2.5 text-emerald-400"></i>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><i className="fa-solid fa-triangle-exclamation"></i></div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Contradictory Logic Points</h4>
                    </div>
                    <ul className="space-y-4">
                      {comparison.result.contradictions.map((f, i) => (
                        <li key={i} className="flex gap-4 p-4 bg-rose-50/30 border border-rose-100 rounded-2xl text-sm font-bold text-slate-700 leading-relaxed">
                          <i className="fa-solid fa-circle text-[6px] mt-2.5 text-rose-400"></i>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-white border-t border-slate-100 text-center">
                <button onClick={() => setComparison(null)} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Close Analytical Comparison</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-8 lg:p-12 overflow-hidden flex flex-col">
          {activeSession ? (
            <ResearchDetail 
              session={activeSession} 
              onContinue={handleContinue}
              onFileUpload={handleFileUpload}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="relative mb-12">
                <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] rounded-full"></div>
                <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-5xl text-indigo-600 relative border border-slate-200/50">
                  <i className="fa-solid fa-microscope"></i>
                </div>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Initialize Research Terminal</h2>
              <p className="text-slate-500 max-w-lg text-lg font-medium leading-relaxed">
                Connect to the intelligence grid. Input a primary research vector to begin multi-step evidence synthesis.
              </p>
            </div>
          )}

          {/* Prompt: Systematic Interface */}
          <div className="max-w-5xl w-full mx-auto mt-12 relative group">
            <div className="absolute -inset-2 bg-indigo-600/20 blur-2xl rounded-[2.5rem] opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative bg-white border border-slate-200/80 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-3 flex items-center gap-3 ring-1 ring-slate-100">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 transition-colors group-focus-within:text-indigo-600">
                <i className="fa-solid fa-magnifying-glass text-xl"></i>
              </div>
              <input 
                type="text" 
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartResearch(activeSession?.id)}
                placeholder={activeResearchId ? "Add a specific follow-up vector..." : "What complex topic shall we analyze today?"}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 py-4 text-xl font-bold tracking-tight placeholder:text-slate-300"
                disabled={isStarting}
              />
              <button 
                onClick={() => handleStartResearch(activeSession?.id)}
                disabled={isStarting || !queryInput.trim()}
                className="h-14 bg-slate-900 hover:bg-indigo-600 disabled:opacity-20 text-white px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 flex items-center gap-4 group/btn"
              >
                {isStarting ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Initialize
                    <i className="fa-solid fa-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
                  </>
                )}
              </button>
            </div>
            
            {/* Context Hints */}
            {!activeResearchId && (
              <div className="mt-6 flex justify-center gap-4">
                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Suggested VECTORS:</span>
                {['Future of Quantum NLP', 'Impact of Deepfakes on Law', 'Battery Tech 2030'].map(t => (
                  <button key={t} onClick={() => setQueryInput(t)} className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">#{t.toUpperCase()}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
