import React, { useState, useEffect, useRef } from 'react';
import { FLOWER_THEMES, DEFAULT_AGENTS, DEFAULT_REVIEW_NOTES, TRANSLATIONS, MODEL_CHOICES } from './constants';
import { AppState, AgentOutput, RunMetric } from './types';
import { Sidebar } from './components/Sidebar';
import { StepRibbon } from './components/StepRibbon';
import { generateText, extractTextFromDocument } from './services/llmService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Views ---

const UploadView = ({ state, setState, theme, setSidebarOpen }: any) => {
    const [isOcrRunning, setIsOcrRunning] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Simple validation
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf" || file.type.startsWith("image/")) {
                setSelectedFile(file);
            } else {
                alert("Please upload a PDF or Image file.");
            }
        }
    };

    const handleOcr = async () => {
        if (!selectedFile) return;

        // Nudge user for key if missing
        if (!state.apiKeys.gemini) {
            const confirm = window.confirm("You haven't entered a Gemini API Key. The system will use a simulated mock response. Do you want to enter a key first?");
            if (confirm) {
                setSidebarOpen(true);
                return;
            }
        }

        setIsOcrRunning(true);
        try {
            const text = await extractTextFromDocument(selectedFile, state.apiKeys);
            setState((prev: any) => ({ 
                ...prev, 
                ocrText: text
            }));
        } catch (e) {
            alert("OCR Failed");
        } finally {
            setIsOcrRunning(false);
        }
    };

    return (
        <div className={`p-8 rounded-3xl shadow-xl border backdrop-blur-xl transition-all duration-500 animate-slide-up ${state.darkMode ? 'bg-gray-800/60 border-white/10' : 'bg-white/60 border-white/40'}`}>
            {!state.apiKeys.gemini && (
                <div className="mb-6 p-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 text-sm flex justify-between items-center">
                    <span>⚠️ For real AI analysis, please enter your API Keys.</span>
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="px-3 py-1 bg-white rounded shadow-sm text-xs font-bold hover:bg-amber-50 transition-colors"
                    >
                        Enter Keys
                    </button>
                </div>
            )}

            <div 
                className={`relative text-center py-12 border-2 border-dashed rounded-2xl transition-all duration-300 ${dragActive ? 'scale-[1.02] bg-white/10' : ''}`} 
                style={{ borderColor: dragActive ? theme.primary : theme.accent }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>{theme.icon}</div>
                <h2 className="text-2xl font-bold mb-2">
                    {selectedFile ? "File Selected" : "Upload Document"}
                </h2>
                
                {selectedFile ? (
                    <div className="mb-6 animate-fade-in">
                        <div className="inline-block px-4 py-2 rounded-lg bg-black/5 border border-black/10 text-sm font-mono mb-2">
                            {selectedFile.name}
                        </div>
                        <p className="text-xs opacity-60">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                            className="text-xs text-red-500 hover:underline mt-2"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="mb-6">
                        <p className="opacity-60 mb-2">Drag and drop PDF or Images here</p>
                        <p className="text-xs opacity-40">Supports PDF, PNG, JPG</p>
                    </div>
                )}

                <input 
                    ref={inputRef}
                    type="file" 
                    className="hidden" 
                    id="file-upload" 
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                />
                
                {!selectedFile && (
                    <label 
                        htmlFor="file-upload" 
                        className="cursor-pointer px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all inline-block" 
                        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
                    >
                        Choose File
                    </label>
                )}
            </div>
            
            <div className="mt-8 flex gap-4 justify-center">
                <button 
                    onClick={handleOcr}
                    disabled={isOcrRunning || !selectedFile}
                    className={`w-full max-w-md py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${!selectedFile ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl hover:-translate-y-1'}`}
                    style={{ background: isOcrRunning ? '#ccc' : theme.accent }}
                >
                    {isOcrRunning ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : 'Start Intelligent Extraction'}
                </button>
            </div>
        </div>
    );
};

const PreviewView = ({ state, setState, theme }: any) => {
    const [keywords, setKeywords] = useState("藥品,適應症");

    const highlightText = (text: string) => {
        if (!keywords) return text;
        const keys = keywords.split(',').map(k => k.trim()).filter(k => k);
        let html = text;
        keys.forEach(k => {
            // Simple highlight regex replacement, cautious of HTML injection in real apps
            const regex = new RegExp(`(${k})`, 'gi');
            html = html.replace(regex, `<span style="background:${theme.primary}40; color:${theme.accent}; font-weight:bold; padding:0 4px; border-radius:4px;">$1</span>`);
        });
        return html;
    };

    return (
        <div className={`h-[70vh] flex flex-col rounded-3xl shadow-xl border backdrop-blur-xl overflow-hidden animate-fade-in ${state.darkMode ? 'bg-gray-800/60 border-white/10' : 'bg-white/60 border-white/40'}`}>
            <div className="p-4 border-b flex gap-4 items-center" style={{ borderColor: state.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                <span className="font-bold">🔍 Highlighter:</span>
                <input 
                    value={keywords} 
                    onChange={(e) => setKeywords(e.target.value)}
                    className={`flex-1 bg-transparent border rounded-lg px-3 py-1 ${state.darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                    placeholder="Comma separated keywords..."
                />
            </div>
            <div className="flex-1 p-6 overflow-auto font-mono text-sm leading-relaxed">
                {state.ocrText ? (
                    <div dangerouslySetInnerHTML={{ __html: highlightText(state.ocrText.replace(/\n/g, '<br/>')) }} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <span className="text-4xl mb-4">📄</span>
                        <span className="italic">No text extracted yet. Go to Step 1 to upload a document.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const ConfigView = ({ state, setState, theme }: any) => {
    const modelOptions = Object.entries(MODEL_CHOICES);

    const handleAgentChange = (index: number, field: string, value: any) => {
        const newAgents = [...state.agents];
        newAgents[index] = { ...newAgents[index], [field]: value };
        setState((prev: any) => ({ ...prev, agents: newAgents }));
    };

    const addAgent = () => {
        const newAgent = {
            name: `New Agent ${state.agents.length + 1}`,
            description: "Custom analysis agent",
            system_prompt: "You are a helpful specialized assistant.",
            user_prompt: "Analyze the following text:",
            model: "gpt-4o-mini",
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1000
        };
        setState((prev: any) => ({ ...prev, agents: [...prev.agents, newAgent] }));
    };

    const removeAgent = (index: number) => {
        const newAgents = state.agents.filter((_: any, i: number) => i !== index);
        setState((prev: any) => ({ ...prev, agents: newAgents }));
    };

    return (
        <div className="space-y-6 animate-slide-up pb-12">
            {state.agents.map((agent: any, idx: number) => (
                <div key={idx} className={`rounded-2xl shadow-lg border p-6 backdrop-blur-lg transition-all relative group ${state.darkMode ? 'bg-gray-800/50 border-white/10' : 'bg-white/70 border-white/40'}`}>
                    <button 
                        onClick={() => removeAgent(idx)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1"
                        title="Remove Agent"
                    >
                        ✕
                    </button>
                    
                    {/* Header inputs */}
                    <div className="flex items-start gap-4 mb-6 border-b pb-4" style={{ borderColor: state.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white shadow-md text-lg" style={{ background: theme.accent }}>{idx + 1}</div>
                        <div className="flex-1 space-y-2">
                             <input 
                                className={`font-bold text-xl bg-transparent border-b-2 border-transparent focus:border-current focus:ring-0 w-full p-1 transition-all ${state.darkMode ? 'text-white' : 'text-gray-800'}`}
                                style={{ color: theme.accent }}
                                value={agent.name}
                                onChange={(e) => handleAgentChange(idx, 'name', e.target.value)}
                                placeholder="Agent Name"
                             />
                             <input 
                                className={`text-sm opacity-70 bg-transparent border-b border-transparent focus:border-current focus:ring-0 w-full p-1 transition-all ${state.darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                                value={agent.description}
                                onChange={(e) => handleAgentChange(idx, 'description', e.target.value)}
                                placeholder="Description"
                             />
                        </div>
                    </div>

                    {/* Config Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Prompts */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase opacity-50 flex items-center gap-2">
                                    <span>System Prompt (Persona)</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/10">Who the AI is</span>
                                </label>
                                <textarea 
                                    className={`w-full h-32 rounded-xl p-3 text-sm font-mono border focus:ring-2 outline-none transition-all resize-none ${state.darkMode ? 'bg-black/20 border-white/10 focus:ring-white/20' : 'bg-white/50 border-gray-200'}`}
                                    value={agent.system_prompt}
                                    onChange={(e) => handleAgentChange(idx, 'system_prompt', e.target.value)}
                                    style={{ '--tw-ring-color': theme.accent } as React.CSSProperties}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase opacity-50 flex items-center gap-2">
                                    <span>User Prompt (Instruction)</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/10">What to do</span>
                                </label>
                                <textarea 
                                    className={`w-full h-24 rounded-xl p-3 text-sm font-mono border focus:ring-2 outline-none transition-all resize-none ${state.darkMode ? 'bg-black/20 border-white/10 focus:ring-white/20' : 'bg-white/50 border-gray-200'}`}
                                    value={agent.user_prompt}
                                    onChange={(e) => handleAgentChange(idx, 'user_prompt', e.target.value)}
                                    style={{ '--tw-ring-color': theme.accent } as React.CSSProperties}
                                />
                            </div>
                        </div>

                        {/* Right Column: Parameters */}
                        <div className="space-y-6 bg-black/5 rounded-xl p-4 border border-black/5">
                             <div className="space-y-2">
                                <label className="text-xs font-bold uppercase opacity-50">Model Selection</label>
                                <div className="relative">
                                    <select 
                                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 appearance-none ${state.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                                        value={agent.model}
                                        onChange={(e) => handleAgentChange(idx, 'model', e.target.value)}
                                        style={{ '--tw-ring-color': theme.accent } as React.CSSProperties}
                                    >
                                        {modelOptions.map(([model, provider]) => (
                                            <option key={model} value={model}>
                                                {provider.toUpperCase()} - {model}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none opacity-50">▼</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-2 opacity-70">
                                        <label className="font-bold uppercase">Temperature</label>
                                        <span>{agent.temperature}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="2" step="0.1"
                                        value={agent.temperature}
                                        onChange={(e) => handleAgentChange(idx, 'temperature', parseFloat(e.target.value))}
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                        style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }}
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-2 opacity-70">
                                        <label className="font-bold uppercase">Max Tokens</label>
                                        <span>{agent.max_tokens}</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        min="100" max="32000" step="100"
                                        value={agent.max_tokens}
                                        onChange={(e) => handleAgentChange(idx, 'max_tokens', parseInt(e.target.value))}
                                        className={`w-full p-2 rounded-lg border text-sm ${state.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
             
             <div className="flex justify-center pt-4">
                <button 
                    onClick={addAgent}
                    className="px-8 py-4 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
                    style={{ background: theme.accent }}
                >
                    <span className="text-xl">+</span> Add New Agent
                </button>
             </div>
        </div>
    );
};

const ExecuteView = ({ state, setState, theme, setSidebarOpen }: any) => {
    const [runningIndex, setRunningIndex] = useState<number | null>(null);

    const executeAgent = async (index: number) => {
        const agent = state.agents[index];
        const provider = MODEL_CHOICES[agent.model as keyof typeof MODEL_CHOICES] || 'openai';
        
        // Warn if key is missing
        if (!state.apiKeys[provider]) {
            const confirm = window.confirm(`Missing API Key for ${provider}. This agent might fail or use mock data. Open settings?`);
            if (confirm) {
                setSidebarOpen(true);
                return;
            }
        }

        setRunningIndex(index);
        const input = state.outputs[index]?.input || state.ocrText; // Default to OCR if no input
        
        const start = Date.now();
        const result = await generateText(agent.model, agent.system_prompt, `${agent.user_prompt}\n\n${input}`, state.apiKeys);
        const end = Date.now();

        setState((prev: AppState) => {
            const newOutputs = [...prev.outputs];
            newOutputs[index] = {
                ...newOutputs[index],
                output: result.text,
                time: (end - start) / 1000,
                tokens: result.tokens,
                provider: result.provider,
                model: agent.model
            };
            
            // Pass output to next agent input automatically
            if (index < prev.agents.length - 1) {
                 if (!newOutputs[index + 1]) newOutputs[index + 1] = { input: "", output: "", time: 0, tokens: 0, provider: "", model: "" };
                 newOutputs[index + 1].input = result.text;
            }

            return {
                ...prev,
                outputs: newOutputs,
                metrics: [...prev.metrics, {
                    agent: agent.name,
                    latency: (end - start) / 1000,
                    tokens: result.tokens,
                    provider: result.provider,
                    timestamp: new Date().toISOString()
                }]
            };
        });
        setRunningIndex(null);
    };

    return (
        <div className="space-y-6 animate-slide-up pb-12">
            {state.agents.map((agent: any, idx: number) => (
                <div key={idx} className={`rounded-2xl shadow-lg border p-6 backdrop-blur-lg transition-all ${state.darkMode ? 'bg-gray-800/50 border-white/10' : 'bg-white/70 border-white/40 hover:bg-white/90'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md" style={{ background: theme.accent }}>{idx + 1}</div>
                            <div>
                                <h3 className="font-bold text-lg" style={{ color: theme.accent }}>{agent.name}</h3>
                                <p className="text-xs opacity-60">{agent.model} • {agent.description}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => executeAgent(idx)}
                            disabled={runningIndex !== null}
                            className="px-4 py-2 rounded-lg text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                        >
                            {runningIndex === idx ? 'Running...' : '▶ Run Agent'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase opacity-50">Input Context</label>
                            <textarea 
                                className={`w-full h-32 rounded-xl p-3 text-xs font-mono border focus:ring-2 outline-none transition-all ${state.darkMode ? 'bg-black/20 border-white/10' : 'bg-white/50 border-gray-200'}`}
                                value={state.outputs[idx]?.input || (idx === 0 ? state.ocrText : '')}
                                onChange={(e) => {
                                    const newOutputs = [...state.outputs];
                                    if(!newOutputs[idx]) newOutputs[idx] = { input: "", output: "", time: 0, tokens: 0, provider: "", model: "" };
                                    newOutputs[idx].input = e.target.value;
                                    setState((prev: any) => ({ ...prev, outputs: newOutputs }));
                                }}
                                placeholder={idx === 0 ? "Waiting for OCR text..." : "Waiting for previous step..."}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase opacity-50 flex justify-between">
                                <span>Output Result</span>
                                {state.outputs[idx]?.time > 0 && (
                                    <span className="text-green-500">{state.outputs[idx].time.toFixed(2)}s | {state.outputs[idx].tokens} tok</span>
                                )}
                            </label>
                            <div className={`w-full h-32 rounded-xl p-3 text-xs font-mono border overflow-auto ${state.darkMode ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                {state.outputs[idx]?.output || <span className="opacity-30 italic">Waiting for execution...</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const DashboardView = ({ state, theme }: any) => {
    const data = state.metrics.map((m: any) => ({ name: m.agent, latency: m.latency, tokens: m.tokens }));
    const providerData = Object.entries(state.metrics.reduce((acc: any, curr: any) => {
        acc[curr.provider] = (acc[curr.provider] || 0) + 1;
        return acc;
    }, {})).map(([name, value]) => ({ name, value }));

    const COLORS = [theme.accent, theme.primary, theme.secondary, '#8884d8'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
             <div className={`p-6 rounded-3xl shadow-lg border backdrop-blur-xl ${state.darkMode ? 'bg-gray-800/60 border-white/10' : 'bg-white/60 border-white/40'}`}>
                <h3 className="font-bold mb-4 text-center opacity-80">Latency by Agent</h3>
                <div className="h-64">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="name" hide />
                                <YAxis />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        backgroundColor: state.darkMode ? '#1f2937' : '#fff',
                                        color: state.darkMode ? '#fff' : '#000'
                                    }} 
                                />
                                <Bar dataKey="latency" fill={theme.accent} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-40">No data available</div>
                    )}
                </div>
             </div>
             
             <div className={`p-6 rounded-3xl shadow-lg border backdrop-blur-xl ${state.darkMode ? 'bg-gray-800/60 border-white/10' : 'bg-white/60 border-white/40'}`}>
                <h3 className="font-bold mb-4 text-center opacity-80">Provider Distribution</h3>
                <div className="h-64">
                    {providerData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={providerData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {providerData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        backgroundColor: state.darkMode ? '#1f2937' : '#fff',
                                        color: state.darkMode ? '#fff' : '#000'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="h-full flex items-center justify-center opacity-40">No data available</div>
                    )}
                </div>
             </div>
        </div>
    );
}

const NotesView = ({ state, setState, theme }: any) => {
    return (
        <div className={`h-[75vh] rounded-3xl shadow-xl border backdrop-blur-xl overflow-hidden flex flex-col animate-slide-up ${state.darkMode ? 'bg-gray-800/60 border-white/10' : 'bg-white/60 border-white/40'}`}>
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: state.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                 <span className="font-bold flex items-center gap-2">📓 Review Notes</span>
                 <button className="px-4 py-1 rounded-full text-xs font-bold text-white shadow-md hover:shadow-lg transition-all" style={{ background: theme.accent }}>Generate Follow-up Questions</button>
            </div>
            <textarea 
                className={`flex-1 p-6 bg-transparent border-none resize-none focus:ring-0 outline-none font-mono leading-relaxed ${state.darkMode ? 'text-gray-200' : 'text-gray-700'}`}
                value={state.reviewNotes}
                onChange={(e) => setState((prev: any) => ({ ...prev, reviewNotes: e.target.value }))}
                placeholder="Enter your review notes here..."
            />
        </div>
    );
}

// --- Main App Component ---

const App: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    
    const [state, setState] = useState<AppState>(() => {
        const defaultState = {
            theme: "櫻花 Cherry Blossom",
            darkMode: false,
            language: "zh_TW" as const,
            ocrText: "",
            agents: DEFAULT_AGENTS,
            outputs: [],
            metrics: [],
            reviewNotes: DEFAULT_REVIEW_NOTES,
            apiKeys: { openai: "", gemini: "", grok: "", anthropic: "" }
        };
        
        try {
            const savedKeys = localStorage.getItem('tfda_api_keys');
            if (savedKeys) {
                 const parsed = JSON.parse(savedKeys);
                 defaultState.apiKeys = { ...defaultState.apiKeys, ...parsed };
            }
        } catch(e) {
            console.error("Failed to load API keys from local storage", e);
        }
        
        return defaultState;
    });

    const theme = FLOWER_THEMES[state.theme];

    // Save API keys to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('tfda_api_keys', JSON.stringify(state.apiKeys));
    }, [state.apiKeys]);

    useEffect(() => {
        // Pre-populate outputs array based on agents
        setState(prev => {
            if (prev.outputs.length === prev.agents.length) return prev;
            return {
                ...prev,
                outputs: new Array(prev.agents.length).fill(null).map(() => ({ input: "", output: "", time: 0, tokens: 0, provider: "", model: "" }))
            };
        });
    }, []);

    return (
        <div 
            className={`min-h-screen transition-colors duration-500 ${state.darkMode ? 'text-white' : 'text-gray-800'}`}
            style={{ background: state.darkMode ? theme.bg_dark : theme.bg_light }}
        >
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)}></div>
            )}
            <Sidebar state={state} setState={setState} isOpen={isSidebarOpen} />

            {/* Main Content */}
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'}`}>
                <header className="p-6 flex justify-between items-center sticky top-0 z-30 glass border-b-0 rounded-b-3xl mx-4 mt-2 shadow-sm" style={{ backdropFilter: 'blur(20px)' }}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-xl hover:bg-black/5 transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <span className="text-3xl">{theme.icon}</span>
                                <span style={{ color: theme.accent }}>TFDA Agentic AI</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {['openai', 'gemini', 'anthropic'].map(p => (
                            <div key={p} className={`w-3 h-3 rounded-full transition-all duration-500 ${state.apiKeys[p as keyof typeof state.apiKeys] ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] scale-110' : 'bg-red-300'}`} title={p}></div>
                        ))}
                    </div>
                </header>

                <main className="max-w-7xl mx-auto p-6">
                    <StepRibbon currentStep={currentStep} setStep={setCurrentStep} state={state} theme={theme} />
                    
                    <div className="min-h-[600px]">
                        {currentStep === 0 && <UploadView state={state} setState={setState} theme={theme} setSidebarOpen={setSidebarOpen} />}
                        {currentStep === 1 && <PreviewView state={state} setState={setState} theme={theme} />}
                        {currentStep === 2 && <ConfigView state={state} setState={setState} theme={theme} />}
                        {currentStep === 3 && <ExecuteView state={state} setState={setState} theme={theme} setSidebarOpen={setSidebarOpen} />}
                        {currentStep === 4 && <DashboardView state={state} theme={theme} />}
                        {currentStep === 5 && <NotesView state={state} setState={setState} theme={theme} />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;