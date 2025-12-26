
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
        setQueryInput(`Continuing research on "${session.query}": `);
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
      {/* Sidebar */}
      <aside className={`transition-all duration-300 border-r border-slate-200 bg-white flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <i className="fa-solid fa-microscope"></i>
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">DeepResearch</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <div className="flex justify-between items-center px-2 py-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Research History</div>
            {activeResearchId && (
              <span className="text-[9px] text-blue-500 font-bold uppercase cursor-default">Select to Compare</span>
            )}
          </div>
          {history.map(session => (
            <div key={session.id} className="relative group">
              <ResearchCard 
                session={session} 
                isActive={activeResearchId === session.id}
                onClick={setActiveResearchId}
              />
              {activeResearchId && activeResearchId !== session.id && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCompare(session.id); }}
                  className="absolute right-2 top-2 hidden group-hover:flex w-6 h-6 bg-blue-600 text-white rounded-full items-center justify-center shadow-lg transition-all"
                  title="Compare with Active"
                >
                  <i className="fa-solid fa-arrows-left-right text-[10px]"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <nav className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <i className={`fa-solid ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'}`}></i>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
              <i className="fa-solid fa-wallet"></i>
              Session Cost: ${activeSession?.cost.estimatedCost.toFixed(4) || '0.0000'}
            </div>
          </div>
        </nav>

        {/* Comparison Alert */}
        {comparison && (
          <div className="mx-6 mt-6 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <i className="fa-solid fa-code-compare"></i>
                  Research Evolution Diff
                </h3>
                <button onClick={() => setComparison(null)} className="opacity-50 hover:opacity-100">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <p className="text-sm opacity-90 mb-6 italic">{comparison.result.semanticSummary}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] font-bold uppercase mb-2 tracking-widest">New Findings</p>
                  <ul className="text-sm space-y-2">
                    {comparison.result.addedFindings.map((f, i) => <li key={i} className="flex gap-2"><i className="fa-solid fa-plus-circle text-emerald-400 mt-1"></i> {f}</li>)}
                  </ul>
                </div>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] font-bold uppercase mb-2 tracking-widest">Contradictions</p>
                  <ul className="text-sm space-y-2">
                    {comparison.result.contradictions.map((f, i) => <li key={i} className="flex gap-2"><i className="fa-solid fa-triangle-exclamation text-amber-400 mt-1"></i> {f}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
          {activeSession ? (
            <ResearchDetail 
              session={activeSession} 
              onContinue={handleContinue}
              onFileUpload={handleFileUpload}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 text-3xl">
                <i className="fa-solid fa-brain"></i>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Start Deep Research Session</h2>
              <p className="text-slate-500 max-w-md text-lg">
                Activate the deep research engine to perform multi-step analysis and discover verifiable truths.
              </p>
            </div>
          )}

          {/* Prompt Area */}
          <div className="max-w-4xl w-full mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-1000"></div>
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl p-2 flex items-center gap-2">
              <div className="pl-4 text-slate-400">
                {activeSession?.parentResearchId ? <i className="fa-solid fa-code-branch text-blue-500"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
              </div>
              <input 
                type="text" 
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartResearch(activeSession?.id)}
                placeholder={activeResearchId ? "Add follow-up research topic..." : "Enter research query..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 py-3 text-lg font-medium"
                disabled={isStarting}
              />
              <button 
                onClick={() => handleStartResearch(activeSession?.id)}
                disabled={isStarting || !queryInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
              >
                {isStarting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <i className="fa-solid fa-paper-plane"></i>
                )}
                <span className="hidden md:inline">Research</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
