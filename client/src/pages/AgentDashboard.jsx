import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Activity, Database, Shield, Zap, FileText, Search, Brain, Rss, AlertTriangle, Newspaper, Terminal, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MemoryGraph from '../components/MemoryGraph';

const PHASES = {
  idle: { icon: Zap, label: 'Awaiting Signals', color: '#888' },
  scanning: { icon: Search, label: 'Scanning Web', color: '#3b82f6' },
  reading: { icon: FileText, label: 'Reading Papers', color: '#8b5cf6' },
  analyzing: { icon: Brain, label: 'Cross-referencing', color: '#f59e0b' },
  deciding: { icon: Rss, label: 'Forming Decision', color: '#10b981' },
};

const FAKE_PAPERS = [
  'arxiv:2401.12345 — Adversarial attacks on RLHF pipelines',
  'arxiv:2312.10997 — Prompt injection in RAG architectures',
  'arxiv:2302.04588 — Supply chain attacks via model serialization',
  'arxiv:2403.08971 — Jailbreaking safety guardrails via multi-hop reasoning',
  'arxiv:2405.12221 — Exfiltration through CoT chain manipulation',
  'arxiv:2311.07919 — Membership inference in fine-tuned LLMs'
];

// ─── HACKER TERMINAL (EMERGENT UI) ──────────────────────────────────────────
function HackerTerminal({ logs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="relative rounded-3xl bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-3xl p-5 mt-6 h-56 overflow-hidden flex flex-col shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] group">
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-white/60 uppercase tracking-[0.2em] font-bold">Autonomous Core Terminal</span>
        </div>
        <div className="flex gap-1.5">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
      </div>

      <div ref={containerRef} className="relative z-10 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 font-mono text-[11px] leading-relaxed">
        {logs.length === 0 && <span className="text-white/30 italic">Awaiting secure connection...</span>}
        <AnimatePresence initial={false}>
          {logs.map((log, i) => {
            const isPublish = log.includes('[PUBLISH]');
            const isReject = log.includes('[REJECT]');
            const isSys = log.includes('[SYS]');
            const isDiscover = log.includes('[DISCOVERED]');
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`${isPublish ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]' : isReject ? 'text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.4)]' : isDiscover ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]' : isSys ? 'text-indigo-400' : 'text-white/70'}`}
              >
                <span className="text-white/30 mr-3 select-none">{new Date().toISOString().split('T')[1].slice(0, 8)}</span>
                {log}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── BIG RESULT MODAL ──────────────────────────────────────────────────────
function ResultModal({ result, onClose }) {
  const isPublished = result?.type === 'published';

  useEffect(() => {
    if (result) {
      const timer = setTimeout(onClose, 15000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          key={result.id ?? result.type}
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 40, opacity: 0, rotateX: 10 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0, rotateX: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-white/20 bg-white/10 backdrop-blur-3xl"
          >
            <div className={`absolute inset-0 bg-white/90 backdrop-blur-3xl`} />
            <div className={`relative h-2 w-full ${isPublished ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-pink-500'}`} />

            <div className="relative p-10">
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15, type: 'spring' }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest mb-6 ${
                  isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isPublished ? <Newspaper size={14} /> : <AlertTriangle size={14} />}
                {isPublished ? 'Ada verified: Publish' : 'Ada rejected: Discard'}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-heading font-extrabold text-black leading-snug mb-5"
              >
                {isPublished ? result.title : result.topic || 'Evaluation Complete'}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-black/75 leading-relaxed mb-8 font-medium"
              >
                {result.rationale || result.reason}
              </motion.p>

              {result.sources?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-2 mb-8"
                >
                  {result.sources.map((p, i) => (
                    <span key={i} className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-black/5 text-black/60 border border-black/10 flex items-center shadow-inner">
                      🔗 {p.replace('https://', '')}
                    </span>
                  ))}
                </motion.div>
              )}

              <div className="flex items-center justify-between mt-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[10px] font-mono text-black/40 tracking-widest uppercase"
                >
                  Auto-closing in 15s
                </motion.div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors border border-black/5"
                >
                  <X size={16} className="text-black/60" />
                </button>
              </div>

              <motion.div
                className={`absolute bottom-0 left-0 h-1 ${isPublished ? 'bg-emerald-500' : 'bg-rose-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 15, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── STATE VISUALIZER (EMERGENT ORB) ────────────────────────────────────────
function AgentStatusPanel({ phase, topic, isInitialized }) {
  const isActive = phase !== 'idle' && isInitialized;

  // Determine orb styling based on phase
  let orbGlow = 'rgba(100,100,100,0.2)';
  let orbColor = 'bg-gray-500';
  let orbAnim = {};
  
  if (isInitialized) {
    if (phase === 'idle') {
      orbGlow = 'rgba(52,211,153,0.2)'; // Emerald slow breathe
      orbColor = 'bg-emerald-500';
      orbAnim = { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } };
    } else if (phase === 'scanning' || phase === 'reading') {
      orbGlow = 'rgba(59,130,246,0.4)'; // Blue fast pulse
      orbColor = 'bg-blue-500';
      orbAnim = { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } };
    } else if (phase === 'analyzing' || phase === 'deciding') {
      orbGlow = 'rgba(245,158,11,0.5)'; // Amber intense pulse
      orbColor = 'bg-amber-500';
      orbAnim = { scale: [1, 1.3, 1], rotate: [0, 180, 360], opacity: [0.9, 1, 0.9], transition: { duration: 0.8, repeat: Infinity, ease: 'linear' } };
    }
  }

  return (
    <div className="rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl p-7 mt-8 relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] group">
      
      {/* Emergent Background Mesh */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(255,255,255,0.2) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col gap-4 font-mono text-[11px] tracking-[0.15em] text-black/70 uppercase font-semibold">
          <div className="flex items-center gap-3">
            <Activity size={14} className={isInitialized ? "text-emerald-600" : "text-black/40"} />
            <span>Status:</span>
            <span className={isInitialized ? 'text-black' : 'text-black/40'}>
              {isInitialized ? 'Autonomous Engine Active' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Shield size={14} />
            <span>Domain:</span>
            <span className="text-black">AI Security</span>
          </div>
          <div className="flex items-center gap-3">
            <Database size={14} />
            <span>Memory:</span>
            <span className={isInitialized ? 'text-emerald-700' : 'text-black/60'}>
              {isInitialized ? (
                <MemorySyncState />
              ) : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* The Emergent Orb */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div 
            animate={orbAnim}
            className={`absolute inset-0 rounded-full blur-xl`}
            style={{ backgroundColor: orbGlow }}
          />
          <motion.div 
            animate={orbAnim}
            className={`relative w-6 h-6 rounded-full shadow-inner ${orbColor} border border-white/20`}
            style={{ boxShadow: `0 0 20px ${orbGlow}` }}
          />
        </div>
      </div>

      {/* Phase indicator details */}
      <div className={`relative z-10 mt-8 rounded-2xl p-5 transition-all duration-700 ease-out ${isActive ? 'bg-black/5 border border-black/10 backdrop-blur-md shadow-inner' : 'bg-transparent border border-transparent'}`}>
        <AnimatePresence mode="wait">
          {!isActive ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 text-black/50 font-mono text-xs font-bold uppercase tracking-widest">
              <Zap size={16} /> Awaiting Signal Discovery
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div animate={phase === 'scanning' ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  {PHASES[phase]?.icon && React.createElement(PHASES[phase].icon, { size: 16, color: PHASES[phase].color })}
                </motion.div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: PHASES[phase]?.color }}>
                  {PHASES[phase]?.label}
                  {phase === 'scanning' && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>...</motion.span>}
                </span>
              </div>

              {topic && (
                <p className="text-[11px] text-black/90 font-mono mb-4 truncate font-bold border-l-2 border-blue-500 pl-3 bg-white/20 py-2 rounded-r-md">
                  TARGET: <span className="text-black/60 font-normal">{topic}</span>
                </p>
              )}

              {(phase === 'reading' || phase === 'scanning') && (
                <div className="rounded-xl bg-black/80 p-4 space-y-2 mt-2 shadow-inner">
                  {FAKE_PAPERS.slice(0, 4).map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: [0, 1, 0.7, 0] }}
                      transition={{ duration: 2.5, delay: i * 0.4, ease: 'easeInOut' }}
                      className="text-[10px] font-mono text-emerald-400/80 truncate"
                    >
                      ⟩ {p}
                    </motion.div>
                  ))}
                </div>
              )}

              {phase === 'analyzing' && (
                <div className="mt-4">
                  <div className="h-2 rounded-full bg-black/10 overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'linear' }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-black/50 mt-2 tracking-widest uppercase">Cross-referencing threat intel...</p>
                </div>
              )}

              {phase === 'deciding' && (
                <div className="flex items-center gap-2 mt-4 bg-white/30 p-3 rounded-xl border border-white/20">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-black/70 ml-2 tracking-widest uppercase font-bold">Ada is forming judgment...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MemorySyncState() {
  const [syncState, setSyncState] = useState('Syncing...');
  useEffect(() => {
    const t = setTimeout(() => setSyncState('Synced'), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <span className="flex items-center gap-1.5">
      {syncState}
      {syncState === 'Syncing...' && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>...</motion.span>}
    </span>
  );
}

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [expandedPost, setExpandedPost] = useState(null);
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [agentId, setAgentId] = useState(null);
  const [fallbackSessionId] = useState(`ada-secure-${Math.random().toString(16).slice(2,8)}`);
  const [posts, setPosts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // UI State
  const [currentPhase, setCurrentPhase] = useState('idle');
  const [currentTopic, setCurrentTopic] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [modalResult, setModalResult] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [manualTopic, setManualTopic] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  
  // Interrogate state
  const [interrogateText, setInterrogateText] = useState({});
  const [interrogateResponse, setInterrogateResponse] = useState({});
  const [isInterrogating, setIsInterrogating] = useState({});

  const handleInterrogate = async (postId, e) => {
    e.preventDefault();
    const q = interrogateText[postId];
    if (!q) return;
    
    setIsInterrogating(prev => ({ ...prev, [postId]: true }));
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/agent/interrogate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, question: q })
      });
      const data = await res.json();
      setInterrogateResponse(prev => ({ ...prev, [postId]: data.answer }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsInterrogating(prev => ({ ...prev, [postId]: false }));
    }
  };
  
  const eventSourceRef = useRef(null);
  const videoRef = useRef(null);
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const prevXRef = useRef(null);

  // Mouse scrub logic for background
  useEffect(() => {
    const handleMouseMove = (e) => {
      const video = videoRef.current;
      if (!video || isNaN(video.duration)) return;
      const delta = e.clientX - (prevXRef.current ?? e.clientX);
      prevXRef.current = e.clientX;
      let newTarget = targetTimeRef.current + (delta / window.innerWidth) * 0.8 * video.duration;
      newTarget = Math.max(0, Math.min(newTarget, video.duration));
      targetTimeRef.current = newTarget;
      if (!isSeekingRef.current) { isSeekingRef.current = true; video.currentTime = newTarget; }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.05) {
      video.currentTime = targetTimeRef.current;
    } else { isSeekingRef.current = false; }
  }, []);

  const fetchState = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/internal/state`);
      const data = await res.json();
      setIsInitialized(data.isInitialized);
      setPosts(data.posts || []);
      setTimeline(data.timeline || []);
    } catch (e) { console.error("State fetch failed:", e); }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // SSE connection
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const es = new EventSource(`${API_URL}/api/stream`);
    eventSourceRef.current = es;

    es.addEventListener('phase', (e) => {
      const data = JSON.parse(e.data);
      setCurrentPhase(data.phase);
      setCurrentTopic(data.topic || '');
      if (data.phase === 'idle') {
        setTimeout(fetchState, 500);
      }
    });
    
    es.addEventListener('published', (e) => {
      const data = JSON.parse(e.data);
      const result = { type: 'published', ...data.post };
      setLastResult(result);
      setModalResult(result);
      setPosts(prev => [data.post, ...prev]);
    });
    
    es.addEventListener('rejected', (e) => {
      const data = JSON.parse(e.data);
      const result = { type: 'rejected', topic: currentTopic, reason: data.reason, rationale: data.reason };
      setLastResult(result);
      setModalResult(result);
    });
    
    es.addEventListener('log', (e) => {
      const data = JSON.parse(e.data);
      setLogs(prev => [...prev, data.text].slice(-60));
    });

    return () => es.close();
  }, [currentTopic]);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/agent/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: { name: "Ada", domain: "AI Security" } })
      });
      const data = await res.json();
      setAgentId(data.agentId);
      setIsInitialized(true);
    } catch (e) { console.error("Init failed:", e); }
    setIsInitializing(false);
  };

  const submitManualTopic = async (e) => {
    e.preventDefault();
    if (!manualTopic.trim()) return;
    setIsSubmittingManual(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${API_URL}/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: manualTopic })
      });
      setManualTopic('');
    } catch (e) { console.error("Manual submission failed", e); }
    setIsSubmittingManual(false);
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4 }} className="relative w-screen h-screen overflow-hidden text-black font-body flex items-center justify-center bg-[#eaeaea]">
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
        muted playsInline preload="auto" onSeeked={handleSeeked}
        className="fixed inset-0 z-0 object-cover w-full h-full opacity-60 mix-blend-multiply"
        style={{ objectPosition: '70% center' }}
      />
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-[1]" />

      <ResultModal result={modalResult} onClose={() => setModalResult(null)} />

      <div className="relative z-10 w-full h-full max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 md:grid-cols-[450px_1fr] gap-10 overflow-y-auto">
        
        {/* ─── LEFT COLUMN ─────────────────────────────────── */}
        <div className="flex flex-col justify-start pt-10">
          <button onClick={() => navigate('/')} className="mb-8 text-xs font-mono tracking-widest text-black/60 hover:text-black flex items-center gap-2 transition-colors uppercase font-bold w-fit">
            ← Main Menu
          </button>
          
          <div className="flex items-start gap-6">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-7xl font-heading font-black tracking-tighter leading-[0.85] text-black">
                Ada.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-black/70 to-black/30">Sovereign.</span><br />
                <span className="text-black/20">Unyielding.</span>
              </motion.h1>
              
              {/* Heartbeat Pulse */}
              {isInitialized && (
                <div className="mt-4 flex flex-col items-center">
                    <motion.div 
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ 
                            duration: currentPhase === 'deciding' ? 0.2 : (currentPhase === 'idle' ? 1.5 : 0.6), 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`w-4 h-4 rounded-full ${currentPhase === 'deciding' ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.9)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]'}`}
                    />
                    <span className="text-[9px] font-mono mt-1 text-black/40 font-bold uppercase tracking-widest">
                        {currentPhase === 'deciding' ? 'Peak' : 'Nominal'}
                    </span>
                </div>
              )}
          </div>

          <div className="mt-10">
            {!isInitialized ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInitialize}
                disabled={isInitializing}
                className="group relative w-full flex items-center justify-center gap-3 py-5 px-8 rounded-[2rem] bg-black text-white text-sm font-bold tracking-widest uppercase hover:bg-black/90 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
                <span className="relative z-10 flex items-center gap-3">
                  {isInitializing ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Activity size={18} /></motion.div>
                  ) : (
                    <Zap size={18} className="text-blue-400" />
                  )}
                  {isInitializing ? 'Booting Core Engine...' : 'Initialize Autonomous Agent'}
                </span>
              </motion.button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/40 backdrop-blur-md text-emerald-900 text-xs font-mono border border-white/50 shadow-sm font-bold tracking-widest"
              >
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                Session ID: {agentId || fallbackSessionId}
              </motion.div>
            )}
          </div>

          <AgentStatusPanel phase={currentPhase} topic={currentTopic} isInitialized={isInitialized} />
          
          {isInitialized && (
            <form onSubmit={submitManualTopic} className="mt-4 w-full relative">
              <input 
                type="text" 
                value={manualTopic}
                onChange={(e) => setManualTopic(e.target.value)}
                placeholder="Simulate signal discovery (e.g. 'prompt injection exploit...')"
                className="w-full bg-white/40 border border-white/50 backdrop-blur-md rounded-2xl py-3 px-5 text-sm font-mono text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
              />
              <button 
                type="submit" 
                disabled={isSubmittingManual || !manualTopic.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-black text-white text-[10px] font-mono font-bold tracking-widest uppercase hover:bg-black/80 disabled:opacity-50 transition-colors"
              >
                Inject Signal
              </button>
            </form>
          )}

          <HackerTerminal logs={logs} />
          
          {isInitialized && (
            <div className="mt-8 h-80 relative">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 font-mono text-[10px] text-white/50 tracking-[0.2em] uppercase font-bold">
                <Database size={14} className="text-indigo-400" />
                Live Memory Graph
              </div>
              <MemoryGraph posts={posts} />
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN ────────────────────────────────── */}
        <div className="flex flex-col pt-10 gap-8 h-full overflow-hidden">

          {/* Timeline (Emergent Design) */}
          <div className="w-full overflow-x-auto pb-4 min-h-[130px] custom-scrollbar">
            <div className="flex gap-4 min-w-max px-2">
              <AnimatePresence>
                {timeline.map((item, i) => (
                  <motion.div key={item.id ?? i}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: -30, rotateY: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`relative flex flex-col justify-between p-5 rounded-[1.5rem] backdrop-blur-xl min-w-[240px] max-w-[280px] h-[110px] shadow-lg border overflow-hidden ${item.status === 'published' ? 'bg-white/60 border-white/60' : 'bg-black/10 border-white/10'}`}
                  >
                    {item.status === 'published' && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full blur-xl" />}
                    {item.status === 'rejected' && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full blur-xl" />}
                    
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] font-extrabold z-10">
                      {item.status === 'published' && <span className="text-emerald-600 flex items-center gap-1"><Check size={12}/> Published</span>}
                      {item.status === 'rejected' && <span className="text-rose-600 flex items-center gap-1"><X size={12}/> Rejected</span>}
                      {item.status === 'discovered' && <span className="text-blue-600 flex items-center gap-1"><Search size={12}/> Discovered</span>}
                    </div>
                    
                    <div className="z-10 mt-auto">
                      <p className={`text-sm font-bold leading-snug line-clamp-2 ${item.status === 'rejected' ? 'text-black/40 line-through decoration-rose-500/50' : 'text-black/80'}`}>
                        {item.topic}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Internal Published Feed */}
          <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {posts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-60">
                <Brain size={48} className="mb-4 text-black/60" />
                <p className="font-mono text-sm tracking-widest uppercase text-black/60">Internal memory empty</p>
              </div>
            )}
            <AnimatePresence>
              {posts.map((post, i) => (
                <motion.div key={post.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i === 0 ? 0 : i * 0.05 }}
                  className="group relative p-7 rounded-[2rem] bg-white/40 border border-white/50 backdrop-blur-2xl hover:bg-white/70 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-3 relative z-10 cursor-pointer" onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
                    <h3 className="text-xl font-extrabold font-heading text-black leading-snug w-3/4 group-hover:text-blue-700 transition-colors">
                      {post.text?.split('.')[0] || post.title}
                    </h3>
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-mono text-black/40 font-bold whitespace-nowrap bg-black/5 px-3 py-1 rounded-full">
                        {new Date(post.createdAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedPost === post.id || true ? ( // Kept open for dashboard demo visibility
                      <motion.div key="expanded" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden relative z-10">
                        <div className="h-px w-full bg-black/10 my-4" />
                        <p className="text-sm text-black/70 leading-relaxed mb-5 font-medium italic border-l-2 border-black/20 pl-4">
                          {post.rationale}
                        </p>
                        
                        {/* Debate Log */}
                        {post.debateLog && post.debateLog.length > 0 && (
                          <div className="mb-5 bg-black/5 rounded-xl p-4 text-xs font-mono">
                            <h4 className="uppercase tracking-widest text-black/40 font-bold mb-3 border-b border-black/10 pb-2">Internal Agent Debate</h4>
                            <div className="flex flex-col gap-2">
                              {post.debateLog.map((log, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <span className={`font-bold ${log.agent === 'Ada' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {log.agent}:
                                  </span>
                                  <span className="text-black/70 pl-2">{log.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Interrogation UI */}
                        <div className="mt-4 border border-black/10 rounded-xl bg-white/50 p-4">
                          <form onSubmit={(e) => handleInterrogate(post.id, e)} className="relative flex items-center">
                            <input 
                              type="text"
                              value={interrogateText[post.id] || ''}
                              onChange={e => setInterrogateText(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder="Interrogate ADA's decision..."
                              className="w-full bg-transparent border-none focus:ring-0 text-sm font-mono text-black placeholder:text-black/30"
                            />
                            <button type="submit" disabled={isInterrogating[post.id]} className="absolute right-0 text-black/40 hover:text-black">
                              {isInterrogating[post.id] ? <Activity size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                          </form>
                          {interrogateResponse[post.id] && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-xs font-mono text-emerald-800 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                              <span className="font-bold">ADA:</span> {interrogateResponse[post.id]}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); }
      `}} />
    </motion.div>
  );
}
