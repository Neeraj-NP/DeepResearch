
import React, { useState, useEffect, useCallback } from 'react';
import { ResearchSession, ResearchStatus } from './types';
import { apiService } from './services/apiService';
import { ResearchCard } from './components/ResearchCard';
import { ResearchDetail } from './components/ResearchDetail';

const App: React.FC = () => {
  const [history, setHistory] = useState<ResearchSession[]>([]);
  const [activeResearchId, setActiveResearchId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [queryInput, setQueryInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  // Load history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      const data = await apiService.getHistory();
      setHistory(data);
      if (data.length > 0) setActiveResearchId(data[0].id);
    };
    fetchHistory();
  }, []);

  const handleStartResearch = async (parentID?: string) => {
    if (!queryInput.trim()) return;
    
    setIsStarting(true);
    const q = queryInput;
    setQueryInput('');
    
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

  const handleContinue = (id: string) => {
    const session = history.find(h => h.id === id);
    if (session) {
      setQueryInput(`Continuing research on "${session.query}": `);
      // Focus the input if possible (UI improvement)
    }
  };

  const handleFileUpload = async (id: string, file: File) => {
    await apiService.uploadFile(id, file);
    // Re-fetch to update UI
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
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Research History</div>
          {history.map(session => (
            <ResearchCard 
              key={session.id} 
              session={session} 
              isActive={activeResearchId === session.id}
              onClick={setActiveResearchId}
            />
          ))}
          {history.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
              <i className="fa-regular fa-folder-open text-2xl mb-2 block"></i>
              No research history yet.
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">DeepResearch v1.0 • Built with Gemini 3</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
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
              Total Spend: ${history.reduce((acc, curr) => acc + curr.cost.estimatedCost, 0).toFixed(4)}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-500">
              <i className="fa-solid fa-user text-sm"></i>
            </div>
          </div>
        </nav>

        {/* Content Area */}
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
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Start New Deep Research</h2>
              <p className="text-slate-500 max-w-md text-lg leading-relaxed">
                Perform multi-step analysis, crawl the web, and generate high-quality structured reports with full attribution.
              </p>
            </div>
          )}

          {/* Prompt Area (Sticky at bottom) */}
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
                placeholder={activeResearchId ? "Add follow-up research topic..." : "Enter research query (e.g. Impact of AI on sustainable energy)..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 py-3 text-lg font-medium"
                disabled={isStarting}
              />
              <button 
                onClick={() => handleStartResearch(activeSession?.id)}
                disabled={isStarting || !queryInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                {isStarting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <i className="fa-solid fa-paper-plane"></i>
                )}
                <span className="hidden md:inline">Research</span>
              </button>
            </div>
            {activeSession && (
              <div className="mt-2 text-[10px] text-center text-slate-400 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1"><i className="fa-solid fa-check-circle text-emerald-500"></i> Context Enabled</span>
                <span className="flex items-center gap-1"><i className="fa-solid fa-check-circle text-emerald-500"></i> Token Tracking Active</span>
                <span className="flex items-center gap-1"><i className="fa-solid fa-check-circle text-emerald-500"></i> Multi-Step Agents Ready</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global styles for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;
