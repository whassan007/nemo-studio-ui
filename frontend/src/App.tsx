import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import InteractiveCanvas from './components/canvas/InteractiveCanvas';
import { COMPONENTS, SKILL_WEIGHTS, type Stage } from './data/componentsLibrary';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'guide' | 'config'>('pipeline');
  const [showEvalWarning, setShowEvalWarning] = useState(true);
  const [showSynGenRec, setShowSynGenRec] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [topTab, setTopTab] = useState<'templates' | 'build' | 'simulate' | 'review'>('build');
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Auto-switch to config tab when a node is selected
  React.useEffect(() => {
    if (selectedNode) setActiveTab('config');
  }, [selectedNode]);

  const filteredComponents = COMPONENTS.filter(c => {
    // 1. Skill Level Check
    if (SKILL_WEIGHTS[c.skillLevel] > SKILL_WEIGHTS[skillLevel]) return false;
    // 2. Search Check
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.description.toLowerCase().includes(searchQuery.toLowerCase()) && !c.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stages: Stage[] = ['1. Dataset', '2. Preprocessing', '3. Synthetic Gen', '4. Training', '5. Evaluation', '6. Export'];

  const onExportSlides = () => {
    alert("Exporting workflow to PowerPoint slides (.pptx)...");
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen w-screen bg-[#0f1115] text-slate-50 overflow-hidden font-sans">
        
        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="w-full max-w-4xl bg-[#1a1d24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="p-8 text-center border-b border-white/5">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🧠</div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Knowledge LLM Studio</h2>
                <p className="text-slate-400 max-w-lg mx-auto">Select your experience level to customize your workspace. You can always change this later from the top navigation bar.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5 bg-[#14161b]">
                <button onClick={() => { setSkillLevel('beginner'); setShowOnboarding(false); }} className="p-8 text-left hover:bg-white/5 transition-colors group cursor-pointer">
                  <div className="text-emerald-400 font-bold tracking-wider text-xs mb-3 uppercase flex items-center gap-2">🟢 Beginner</div>
                  <h3 className="text-white font-medium mb-2 group-hover:text-emerald-300 transition-colors">The Domain Expert</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">I have domain knowledge but limited ML background. Guide me with plain-language explanations, safeguards, and simple workflows.</p>
                </button>
                <button onClick={() => { setSkillLevel('intermediate'); setShowOnboarding(false); }} className="p-8 text-left hover:bg-white/5 transition-colors group cursor-pointer">
                  <div className="text-yellow-400 font-bold tracking-wider text-xs mb-3 uppercase flex items-center gap-2">🟡 Intermediate</div>
                  <h3 className="text-white font-medium mb-2 group-hover:text-yellow-300 transition-colors">The ML Practitioner</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">I understand ML pipelines. I want sensible defaults, standard forms, and benchmark comparisons, but no raw YAML typing.</p>
                </button>
                <button onClick={() => { setSkillLevel('advanced'); setShowOnboarding(false); }} className="p-8 text-left hover:bg-white/5 transition-colors group cursor-pointer">
                  <div className="text-rose-400 font-bold tracking-wider text-xs mb-3 uppercase flex items-center gap-2">🔴 Advanced</div>
                  <h3 className="text-white font-medium mb-2 group-hover:text-rose-300 transition-colors">The MLOps Engineer</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">I want total control over the DAG. Give me all 147 backend components, raw YAML execution, param sweeping, and hardware stats.</p>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Top Navbar */}
        <header className="h-14 bg-[#0f1115]/95 border-b border-white/10 flex items-center justify-between px-4 lg:px-6 z-10 w-full shrink-0">
          
          {/* Left: Branding & Skill Toggle */}
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-3 cursor-default">
              <span className="text-xl">🧠</span>
              <span className="font-bold text-lg tracking-tight hidden md:block">NeMo Studio UI</span>
            </div>
            
            {/* Skill Toggle */}
            <div className="flex items-center bg-black/40 rounded-lg border border-white/5 p-0.5" title="Persona Skill Level">
              {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                <button 
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${skillLevel === level ? (level === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' : level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-rose-500/20 text-rose-400') : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          {/* Center: Top Tabs */}
          <nav className="hidden lg:flex items-center justify-center p-1 bg-white/5 rounded-lg border border-white/10">
            {(['templates', 'build', 'simulate', 'review'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setTopTab(tab)}
                className={`px-5 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${topTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10 rounded-md hidden sm:block">Save Draft</button>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10 rounded-md hidden sm:block">Share</button>
            <button onClick={onExportSlides} className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10 rounded-md hidden xl:block">Export Slides</button>
            <button className="px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Validate
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Left Panel: Component Library */}
          <aside className="w-72 flex-shrink-0 glass-panel flex flex-col z-10 border-r border-white/10">
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search components..." 
                  className="w-full bg-black/20 border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {stages.map(stage => {
                const stageComponents = filteredComponents.filter(c => c.stage === stage);
                if (stageComponents.length === 0) return null;
                
                return (
                  <div key={stage}>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                      {stage.substring(3)}
                      {stage === '1. Dataset' && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Required</span>}
                    </h4>
                    <div className="space-y-2">
                      {stageComponents.map(c => (
                        <div key={c.id} className="group border border-white/10 bg-white/5 p-3 rounded-lg cursor-grab hover:bg-white/10 hover:border-white/20 transition-all flex items-start gap-3 backdrop-blur-sm shadow-sm relative overflow-hidden" draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: c.type, label: c.name }))}>
                          
                          {/* Skill Badge */}
                          <div className="absolute top-0 right-0 px-1.5 py-0.5 rounded-bl-lg text-[8px] font-bold uppercase tracking-widest bg-black/40 border-b border-l border-white/10" title={`Requires ${c.skillLevel} level`}>
                            {c.skillLevel === 'beginner' ? '🟢' : c.skillLevel === 'intermediate' ? '🟡' : '🔴'} {c.skillLevel}
                          </div>

                          <div className={`w-8 h-8 shrink-0 rounded flex items-center justify-center border ${c.stage.includes('Dataset') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : c.stage.includes('Preprocess') ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : c.stage.includes('Synth') ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : c.stage.includes('Train') ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : c.stage.includes('Eval') ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                            <span className="text-lg">{c.icon}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-2 pt-0.5">
                            <div className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{c.name}</div>
                            <div className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed group-hover:line-clamp-none transition-all duration-300">{c.description}</div>
                            
                            {/* Hover Expansion Area */}
                            <div className="h-0 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden flex items-center justify-between" style={{ height: 'auto', maxHeight: '0px' }} ref={(el) => { if (el) { el.style.maxHeight = el.parentElement?.parentElement?.matches(':hover') ? '40px' : '0px'; el.style.marginTop = el.parentElement?.parentElement?.matches(':hover') ? '12px' : '0px'; } }}>
                              <span className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer underline">Learn More</span>
                              <button className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors cursor-pointer border border-white/10 shadow hover:border-white/20" onClick={() => window.dispatchEvent(new CustomEvent('insertNode', { detail: { type: c.type, label: c.name } }))}>+ Add</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
            </div>
          </aside>

          {/* Center Canvas */}
          <main className="flex-1 relative bg-[#0f1115] overflow-y-auto w-full">
            {topTab === 'build' ? (
              <Routes>
                <Route path="/" element={
                  <ReactFlowProvider>
                    <InteractiveCanvas onNodeSelect={setSelectedNode} />
                  </ReactFlowProvider>
                } />
              </Routes>
            ) : topTab === 'simulate' ? (
              <div className="p-12 animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col justify-center items-center w-full">
                 <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 relative">
                    <svg className="w-10 h-10 absolute animate-ping opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Simulation Engine</h2>
                 <p className="text-slate-400 text-center max-w-md">Dry-run your pipeline to estimate total compute cost, memory requirements, and token allocations before launching a full cluster run.</p>
                 <button className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg shadow-lg font-medium transition-all" onClick={() => alert("Simulating pipeline execution...")}>Start Local Dry-run</button>
              </div>
            ) : topTab === 'review' ? (
              <div className="p-12 animate-in fade-in duration-300 h-full flex flex-col justify-center items-center w-full">
                 <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Pipeline Review Ready</h2>
                 <p className="text-slate-400 text-center max-w-md mb-8">All required stages are connected. You can export this pipeline structure to a team report or deploy it directly to NeMo Framework.</p>
                 <div className="flex gap-4">
                   <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-lg border border-white/10 shadow-lg font-medium transition-all" onClick={onExportSlides}>Export PowerPoint Slides</button>
                   <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg shadow-lg font-medium transition-all" onClick={() => alert("Downloading config.yaml...")}>Export NeMo YAML Config</button>
                 </div>
              </div>
            ) : (
               <div className="p-12 animate-in fade-in duration-300 h-full flex flex-col justify-center items-center w-full">
                 <h2 className="text-2xl font-bold text-white mb-2">Pipeline Templates</h2>
                 <p className="text-slate-400 mb-8 max-w-md text-center">Load a pre-configured architecture based on your specific use case.</p>
                 
                 <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
                    <button className="text-left bg-black/40 border border-white/5 p-4 rounded-xl hover:bg-white/5 hover:border-white/10 transition-colors cursor-pointer group block" onClick={() => {setTopTab('build'); alert("Loaded Beginner Template!");}}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-white group-hover:text-blue-400">Basic Domain Fine-Tune</div>
                        <div className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">🟢 Beginner</div>
                      </div>
                      <p className="text-xs text-slate-500">Classic linear pipeline from clean data to LoRA fine-tuning.</p>
                    </button>
                    
                    <button className="text-left bg-black/40 border border-white/5 p-4 rounded-xl hover:bg-white/5 hover:border-white/10 transition-colors cursor-pointer group block" onClick={() => {setTopTab('build'); alert("Loaded RAG Eval Template!");}}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-white group-hover:text-blue-400">RAG Alignment Eval</div>
                        <div className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">🟡 Intermediate</div>
                      </div>
                      <p className="text-xs text-slate-500">Focuses purely on synthetic generation and LLM-as-a-judge capabilities.</p>
                    </button>
                    
                    <button className="text-left bg-black/40 border border-white/5 p-4 rounded-xl hover:bg-white/5 hover:border-white/10 transition-colors cursor-pointer group block" onClick={() => {setTopTab('build'); alert("Loaded Advanced Template!");}}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-white group-hover:text-blue-400">Sovereign LLM Production</div>
                        <div className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">🔴 Advanced</div>
                      </div>
                      <p className="text-xs text-slate-500">All 6 stages with complex multi-node orchestration and sweeps.</p>
                    </button>
                 </div>
              </div>
            )}
          </main>

          {/* Right Panel: Contextual Inspector */}
          <aside className="w-80 flex-shrink-0 glass-panel border-l border-white/10 flex flex-col z-10">
            {/* Context/Validation Tabs */}
            <div className="flex border-b border-white/10 bg-black/20">
              <button 
                className={`flex-1 py-3 text-[10px] font-medium border-b-2 cursor-pointer transition-colors ${activeTab === 'pipeline' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                onClick={() => setActiveTab('pipeline')}
              >
                Pipeline State
              </button>
              <button 
                className={`flex-1 py-3 text-[10px] font-medium border-b-2 cursor-pointer transition-colors ${activeTab === 'config' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                onClick={() => setActiveTab('config')}
              >
                Component Config
              </button>
              <button 
                className={`flex-1 py-3 text-[10px] font-medium border-b-2 cursor-pointer transition-colors ${activeTab === 'guide' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                onClick={() => setActiveTab('guide')}
              >
                Educator Guide
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
              {activeTab === 'pipeline' ? (
                <>
                  {/* Validation Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Validation Summary</h3>
                <div className="space-y-3">
                  {showEvalWarning && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-3 items-start animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-red-400 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                      <div className="text-sm text-red-100 font-medium">Missing Evaluation</div>
                      <div className="text-xs text-red-300/80 mt-1">
                        {skillLevel === 'beginner' 
                          ? "Your pipeline is missing a final check step. Without it, you won't know if your model actually improved. Click 'Auto-fix' to add one automatically."
                          : skillLevel === 'intermediate'
                          ? "Missing downstream Evaluation block after Train Model. Add Rule-based Eval or LLM-as-a-Judge to gate model updates."
                          : "Pipeline contains Model block without downstream Evaluation. Updating a model without a proper evaluation gate is extremely risky. Add Rule-based Eval, MMLU benchmark, or custom eval endpoint."}
                      </div>
                      <button className="mt-2 text-xs text-red-400 font-medium hover:text-red-300 hover:underline" onClick={() => {
                        window.dispatchEvent(new CustomEvent('insertNode', { detail: { type: 'EVALUATION', label: 'Rule-based Eval' } }));
                        setShowEvalWarning(false);
                      }}>Auto-fix: Add Rule-based Eval</button>
                    </div>
                  </div>
                  )}
                  
                  {showSynGenRec && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 items-start animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-blue-400 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <div className="text-sm text-blue-100 font-medium">Recommended Next Step</div>
                      <div className="text-xs text-blue-300/80 mt-1">Add a Synthetic Generation block to evaluate model resilience against hallucinations.</div>
                      <button className="mt-2 text-xs text-blue-400 font-medium hover:text-blue-300 hover:underline" onClick={() => {
                        window.dispatchEvent(new CustomEvent('insertNode', { detail: { type: 'SYNTHETIC_GEN', label: 'Synthetic Gen' } }));
                        setShowSynGenRec(false);
                      }}>Auto-fix: Insert Synthetic Gen block</button>
                    </div>
                  </div>
                  )}
                  
                  {!showEvalWarning && !showSynGenRec && (
                    <div className="text-sm text-emerald-400 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      All validations passed!
                    </div>
                  )}
                </div>
              </div>

              {/* Required Checklist */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Required Stages</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2 text-slate-300"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Dataset Provided</li>
                  <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-slate-600 rounded-full"></div> Preprocessing Strategy</li>
                  <li className="flex items-center gap-2 text-slate-300"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Model Configuration</li>
                  {showEvalWarning ? (
                    <li className="flex items-center gap-2 text-red-400"><div className="w-4 h-4 border-2 border-red-500 rounded-full flex-shrink-0"></div> Rule-based Eval (Missing)</li>
                  ) : (
                    <li className="flex items-center gap-2 text-slate-300"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Rule-based Eval</li>
                  )}
                </ul>
              </div>
                </>
              ) : activeTab === 'config' ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {!selectedNode ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                      <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                      <p className="text-sm">Select a node on the canvas to configure its parameters.</p>
                    </div>
                  ) : (
                    <>
                      <div className="pb-3 border-b border-white/5">
                        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">{selectedNode.data.type.replace('_', ' ')}</div>
                        <h2 className="text-lg font-bold text-white leading-tight">{selectedNode.data.label}</h2>
                      </div>
                      
                      {skillLevel === 'beginner' && (
                        <div className="space-y-4 pt-1">
                          <p className="text-xs text-slate-400">Tweak these simple settings to customize how this step behaves.</p>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300">Processing Speed vs Quality</label>
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                              <button className="flex-1 py-1.5 text-xs rounded border border-white/10 bg-white/10 text-white shadow-sm">Fast</button>
                              <button className="flex-1 py-1.5 text-xs rounded text-slate-400 hover:text-slate-200">Balanced</button>
                              <button className="flex-1 py-1.5 text-xs rounded text-slate-400 hover:text-slate-200">High Quality</button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300">Dataset Limit (Rows)</label>
                            <input type="range" className="w-full accent-blue-500 outline-none" min="1000" max="100000" defaultValue="10000" />
                            <div className="flex justify-between text-[10px] text-slate-500"><span>1k</span><span>100k</span></div>
                          </div>
                        </div>
                      )}

                      {skillLevel === 'intermediate' && (
                        <div className="space-y-4 pt-1">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Size</label>
                              <input type="number" className="w-full bg-black/40 border border-white/10 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500" defaultValue={32} />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1">Learning Rate</label>
                              <select className="w-full bg-black/40 border border-white/10 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500">
                                <option>5e-5</option>
                                <option>1e-4</option>
                                <option>3e-4</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-4">
                            <div className="flex items-center gap-2 text-blue-400 mb-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              <span className="text-xs font-bold uppercase tracking-wider">Compute Impact</span>
                            </div>
                            <div className="text-xs text-blue-200/80">Increasing batch size to 32 requires ~24GB VRAM. Estimated epoch duration: 12 minutes.</div>
                          </div>
                        </div>
                      )}

                      {skillLevel === 'advanced' && (
                        <div className="space-y-4 pt-1">
                          <div className="flex justify-end mb-2">
                            <button className="text-[10px] px-2 py-1 bg-white/10 rounded font-mono text-slate-300 hover:text-white">Copy as YAML</button>
                          </div>
                          <div className="bg-[#1e1e1e] border border-white/10 rounded-lg overflow-hidden relative">
                            <div className="absolute top-0 right-0 left-0 bg-black/40 px-3 py-1 text-[10px] font-mono text-slate-500 border-b border-white/5">config.yaml</div>
                            <textarea 
                              className="w-full h-48 bg-transparent text-xs font-mono text-green-400 p-3 pt-8 outline-none resize-none"
                              defaultValue={`model:\n  name: ${selectedNode.data.label.replace(' ', '_').toLowerCase()}\n  framework: nemo\n  quantization: 4bit\ntraining:\n  batch_size: 16\n  micro_batch_size: 1\n  epochs: 3\n  learning_rate: 2e-5\n  peft:\n    type: lora\n    r: 16\n    alpha: 32\n    target_modules: ['q_proj', 'v_proj']`}
                              spellCheck="false"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <button className="py-2 border border-slate-700 bg-slate-800 rounded font-medium hover:bg-slate-700">Multi-run Sweep</button>
                            <button className="py-2 border border-blue-500/30 bg-blue-500/20 text-blue-400 rounded font-medium hover:bg-blue-500/30">Force HW Profiler</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-white">Workshop Learning Goals</h3>
                    <div className="bg-white/5 rounded-lg p-3 text-xs text-slate-300 space-y-3 border border-white/5">
                      <p><strong className="text-slate-100 block mb-1">Objective:</strong> Teach users the importance of curated data before applying Synthetic LLM Augmentation.</p>
                      <p><strong className="text-slate-100 block mb-1">Discussion Prompt:</strong> Ask the class what bias risks emerge when training on synthetic outputs directly without validation gates.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-white">Relevant Notebooks</h3>
                    <ul className="text-xs text-slate-400 space-y-2">
                      <li className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors"><span className="text-amber-400">📄</span> 00_Workshop_Navigation.ipynb</li>
                      <li className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors"><span className="text-amber-400">📄</span> 01_basics_curation.ipynb</li>
                      <li className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors"><span className="text-amber-400">📄</span> 05_synthetic_math.ipynb</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
