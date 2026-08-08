import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ExternalLink, ArrowLeft, Brain, Zap, Download, BookOpen, Globe, ChevronDown, FileText, Users, Calendar, Star, Share2, Mail, Copy, CheckCheck, AlertTriangle, Cpu, Search, Activity, GitCommit, Target, BarChart2 } from 'lucide-react';

// ─── COPY HOOK ──────────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2200);
    });
  };
  return { copied, copy };
}

// ─── ANIMATED COUNT UP ────────────────────────────────────────────────────────
function CountUp({ value }) {
  const nodeRef = useRef(null);
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = Math.round(latest);
      }
    });
  }, [spring]);

  return <span ref={nodeRef}>{0}</span>;
}

// ─── CYCLE COUNTDOWN ────────────────────────────────────────────────────────
function CycleCountdown({ nextTickAt, now }) {
    const seconds = Math.max(0, Math.floor((nextTickAt - now) / 1000));
    return (
        <motion.span
            key={seconds}
            initial={{ scale: 1.2, color: seconds === 0 ? '#10b981' : '#a5b4fc' }}
            animate={{ scale: 1, color: '#a5b4fc' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {seconds}s
        </motion.span>
    );
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    badge: 'Verified Threat Intelligence',
    live: 'LIVE',
    heading1: 'Verified Intelligence.',
    heading2: 'Zero Hallucinations.',
    connecting: 'Establishing secure link...',
    empty_title: 'Awaiting Signal Injection.',
    empty_desc: 'Initialize the agent on the Dashboard, then inject a topic to generate your first advisory.',
    verified_alert: 'Verified Alert',
    research_context: 'Cited Research Paper',
    citations: 'citations',
    venue: 'Published in',
    abstract: 'Abstract',
    primary_sources: 'Primary Sources',
    download_pdf: 'Download Full Report (PDF)',
    threat_level: 'Threat Level',
    authors: 'Authors',
    affected: 'Affected Systems',
    cvss: 'CVSS Score',
    cve: 'CVE Reference',
    copy_linkedin: 'Copy LinkedIn Post',
    copy_email: 'Copy Email Draft',
    copied: 'Copied!',
    home: 'Home',
    share_section: 'Share This Advisory',
    search: 'Filter intelligence reports...',
    confidence: 'Confidence',
    threaded: 'Threaded Follow-up',
    mood_baseline: 'System Nominal',
    mood_panicked: 'High Threat Environment',
    mood_skeptical: 'Skeptical / Deep Verification',
    new_post: 'New Intelligence Published'
  },
  hi: {
    badge: 'सत्यापित खतरा खुफिया',
    live: 'लाइव',
    heading1: 'सत्यापित बुद्धिमत्ता।',
    heading2: 'शून्य मतिभ्रम।',
    connecting: 'सुरक्षित कनेक्शन स्थापित हो रहा है...',
    empty_title: 'सिग्नल इंजेक्शन की प्रतीक्षा।',
    empty_desc: 'Dashboard पर agent initialize करें, फिर पहली advisory generate करने के लिए topic inject करें।',
    verified_alert: 'सत्यापित चेतावनी',
    research_context: 'उद्धृत शोध पत्र',
    citations: 'उद्धरण',
    venue: 'प्रकाशित:',
    abstract: 'सार',
    primary_sources: 'प्राथमिक स्रोत',
    download_pdf: 'रिपोर्ट डाउनलोड करें (PDF)',
    threat_level: 'खतरा स्तर',
    authors: 'लेखक',
    affected: 'प्रभावित सिस्टम',
    cvss: 'CVSS स्कोर',
    cve: 'CVE संदर्भ',
    copy_linkedin: 'LinkedIn पोस्ट कॉपी करें',
    copy_email: 'Email ड्राफ्ट कॉपी करें',
    copied: 'कॉपी हो गया!',
    home: 'होम',
    share_section: 'यह Advisory शेयर करें',
    search: 'खुफिया रिपोर्ट फ़िल्टर करें...',
    confidence: 'विश्वास',
    threaded: 'थ्रेडेड फॉलो-अप',
    mood_baseline: 'सिस्टम सामान्य',
    mood_panicked: 'उच्च खतरा पर्यावरण',
    mood_skeptical: 'संशयवादी / गहरा सत्यापन',
    new_post: 'नई खुफिया प्रकाशित'
  }
};

const THREAT_COLORS = {
  CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]', bar: 'bg-red-500' },
  HIGH:     { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.15)]', bar: 'bg-orange-500' },
  MEDIUM:   { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.1)]', bar: 'bg-yellow-500' },
};

// ─── PDF PRINT TRIGGER ────────────────────────────────────────────────────────
function triggerPostPDF(post, lang) {
  const isHindi = lang === 'hi';
  const text = isHindi ? post.text_hi : post.text;
  const rationale = isHindi ? post.rationale_hi : post.rationale;
  const p = post.paper;

  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8"/>
      <title>Ada Intelligence Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; font-size: 13px; color: #111; padding: 60px; max-width: 760px; margin: auto; line-height: 1.7; }
        header { border-bottom: 2px solid #111; padding-bottom: 24px; margin-bottom: 32px; }
        .label { font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #666; font-weight: bold; }
        h1 { font-size: 26px; font-weight: 700; line-height: 1.2; margin: 12px 0 8px; }
        .meta { display: flex; gap: 24px; margin: 16px 0; flex-wrap: wrap; }
        .badge { background: #111; color: white; padding: 3px 12px; border-radius: 20px; font-family: monospace; font-size: 10px; font-weight: bold; letter-spacing: 0.1em; }
        section { margin: 28px 0; }
        section h2 { font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #444; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 14px; }
        .abstract-box { background: #f8f8f8; border-left: 3px solid #111; padding: 16px 20px; border-radius: 0 8px 8px 0; }
        .paper-card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
        .source-link { font-family: monospace; font-size: 11px; color: #1d4ed8; word-break: break-all; }
        footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; }
        footer .label { color: #aaa; }
        @media print { body { padding: 40px; } }
      </style>
    </head>
    <body>
      <header>
        <div class="label">Ada Autonomous AI Security Researcher · Confidential Intelligence Report</div>
        <h1>${text || 'Intelligence Report'}</h1>
        <div class="meta">
          <span class="badge">Verified Threat</span>
          ${p ? `<span class="badge" style="background:#b91c1c">${p.threat_level}</span>` : ''}
          <span class="badge" style="background:#1d4ed8">Confidence: ${Math.floor(post.confidenceScore || 90)}%</span>
          <span style="font-family:monospace;font-size:11px;color:#666">${new Date(post.createdAt).toUTCString()}</span>
        </div>
      </header>

      <section>
        <h2>Editorial Rationale</h2>
        <p>${rationale}</p>
      </section>

      ${p ? `
      <section>
        <h2>Primary Source Details</h2>
        <div class="paper-card">
          <div style="font-weight:bold; font-size: 16px; margin-bottom: 8px;">${p.title}</div>
          <div style="font-family:monospace; font-size:11px; color:#555; margin-bottom: 16px;">
            ${p.authors.join(', ')} · ${p.year} · ${p.citations} citations
          </div>
          ${p.cve && p.cve !== 'N/A' ? `<div style="margin-bottom:8px;font-family:monospace;color:#c2410c;font-weight:bold;">CVE: ${p.cve}</div>` : ''}
          <div class="abstract-box">${isHindi ? p.abstract_hi : p.abstract}</div>
        </div>
      </section>
      <section>
        <h2>Reference Link</h2>
        <div class="source-link">${p.url}</div>
      </section>
      ` : ''}

      <footer>
        <div class="label">Auto-generated by Ada</div>
        <div class="label">Page 1 of 1</div>
      </footer>
      <script>window.onload = () => window.print();</script>
    </body>
    </html>
  `);
  win.document.close();
}

// ─── CONFIDENCE METER & JUDGMENT REPLAY ──────────────────────────────────────
function ConfidenceMeter({ score, tc }) {
  const [replay, setReplay] = useState(false);
  
  return (
    <div 
      className="relative flex items-center gap-3 w-full group/meter"
      onMouseEnter={() => setReplay(true)}
      onMouseLeave={() => setReplay(false)}
    >
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, type: 'spring' }}
          className={`absolute top-0 left-0 bottom-0 ${tc.bar}`}
        />
        {/* Judgment Replay Overlay - Animate tiny bars inside */}
        <AnimatePresence>
          {replay && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black flex gap-[2px] p-[2px]"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: '0%' }}
                  animate={{ height: `${Math.random() * 100}%` }}
                  transition={{ duration: 0.2, yoyo: Infinity, repeat: Infinity, repeatType: 'mirror', delay: i * 0.05 }}
                  className="flex-1 bg-green-400 rounded-sm"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-mono font-bold text-white/50">{score}%</span>
    </div>
  );
}

// ─── RESEARCH PAPER CARD (animated) ──────────────────────────────────────────
function ResearchPaperCard({ paper, lang }) {
  const t = T[lang];
  if (!paper) return null;
  const tc = THREAT_COLORS[paper.threat_level] || THREAT_COLORS.HIGH;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.15 }}
      className={`mt-6 rounded-3xl border p-6 liquid-glass ${tc.border} ${tc.glow}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-white/80" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/70">{t.research_context}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.span 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: 'spring', damping: 12 }}
            className={`text-[10px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${tc.bg} ${tc.text}`}
          >
            {t.threat_level}: {paper.threat_level}
          </motion.span>
          {paper.cvss && (
            <motion.span 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: 'spring', damping: 12, delay: 0.1 }}
              className="text-[10px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-gray-100 text-gray-700"
            >
              CVSS {paper.cvss}/10
            </motion.span>
          )}
        </div>
      </div>

      <h3 className="font-bold text-lg text-white leading-snug mb-2">{paper.title}</h3>
      
      <div className="flex flex-wrap gap-3 mb-5 text-[11px] font-mono text-white/50">
        <span className="flex items-center gap-1.5"><Users size={12}/> {paper.authors.slice(0, 2).join(', ')}</span>
        <span className="flex items-center gap-1.5"><Calendar size={12}/> {paper.year}</span>
        <span className="flex items-center gap-1.5"><Star size={12}/> {paper.citations.toLocaleString()} {t.citations}</span>
        <span className="flex items-center gap-1.5"><FileText size={12}/> {t.venue} {paper.venue}</span>
      </div>

      {/* Abstract */}
      <div className="rounded-2xl bg-white/10 border border-white/10 p-5 mb-5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold mb-3">{t.abstract}</p>
        <p className="text-sm text-white/70 leading-relaxed">
          {lang === 'hi' ? paper.abstract_hi : paper.abstract}
        </p>
      </div>

      {/* CVE + Affected Systems */}
      <div className="flex flex-col gap-3">
        {paper.cve && paper.cve !== 'N/A' && paper.cve !== 'N/A (Design flaw)' && (
          <div className="flex items-center gap-3">
            <AlertTriangle size={13} className="text-orange-500" />
            <span className="text-xs font-mono font-bold text-white/50">{t.cve}:</span>
            <span className="text-xs font-mono text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">{paper.cve}</span>
          </div>
        )}
        {paper.affected_systems?.length > 0 && (
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold flex items-center gap-2 mb-2"><Cpu size={11}/> {t.affected}</span>
            <div className="flex flex-wrap gap-2">
              {paper.affected_systems.map((sys, i) => (
                <motion.span key={i}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.06, type: 'spring' }}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-white/60 font-semibold"
                >
                  {sys}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <a href={paper.url} target="_blank" rel="noopener noreferrer"
          className="text-xs font-mono text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5">
          <ExternalLink size={11}/> arxiv:{paper.arxivId}
        </a>
      </div>
    </motion.div>
  );
}

// ─── NEWS CARD ────────────────────────────────────────────────────────────────
function PostCard({ post, lang, index }) {
  const [expanded, setExpanded] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const { copied, copy } = useCopy();
  const t = T[lang];
  const text = lang === 'hi' ? post.text_hi : post.text;
  const rationale = lang === 'hi' ? post.rationale_hi : post.rationale;
  const tc = post.paper ? (THREAT_COLORS[post.paper.threat_level] || THREAT_COLORS.HIGH) : THREAT_COLORS.MEDIUM;

  // Mouse-tracking glow effect
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 30 });

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  return (
    <motion.article
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.97, y: 30, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.9, filter: 'blur(8px)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      className="relative break-inside-avoid rounded-[2rem] liquid-glass backdrop-blur-2xl overflow-hidden flex flex-col group mb-6 z-10 hover:z-20"
      style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}
      whileHover={{ boxShadow: '0 25px 60px -15px rgba(0,0,0,0.15)', y: -4, scale: 1.01 }}
    >
      {/* Threading Visual Indicator */}
      {post.threadedToId && (
        <div className="absolute top-0 right-8 w-px h-12 bg-gradient-to-b from-indigo-500 to-transparent" />
      )}

      {/* Mouse-tracking gradient glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"
        style={{
          background: `radial-gradient(350px circle at ${springX}px ${springY}px, rgba(99,102,241,0.08), transparent 70%)`
        }}
      />

      {/* Threat level accent bar */}
      <div className={`h-1.5 w-full ${post.paper?.threat_level === 'CRITICAL' ? 'bg-gradient-to-r from-red-500 to-rose-600' : post.paper?.threat_level === 'HIGH' ? 'bg-gradient-to-r from-orange-400 to-amber-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`} />

      <div className="p-8 flex flex-col h-full relative z-10">
        
        {/* Thread Badge */}
        {post.threadedToId && (
          <div className="flex items-center gap-2 mb-4">
            <GitCommit size={14} className="text-indigo-500" />
            <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest">{t.threaded}: {post.threadedToId.split('_')[1]}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-white text-black px-3.5 py-1.5 rounded-full uppercase tracking-widest font-extrabold shadow">
              {t.verified_alert}
            </span>
            {post.paper && (
              <span className={`text-[10px] font-mono font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full ${tc.bg} ${tc.text}`}>
                {post.paper.threat_level}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-white/30 font-bold">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Confidence Meter */}
        {post.confidenceScore && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <Target size={12}/> {t.confidence}
              </span>
            </div>
            <ConfidenceMeter score={Math.floor(post.confidenceScore)} tc={tc} />
          </div>
        )}

        {/* Glitch headline on hover */}
        <h2 className="text-2xl font-extrabold font-heading leading-tight mb-5 text-white group-hover:text-indigo-400 transition-colors duration-300 line-clamp-2">
          {text?.split('.')[0] || post.text?.split('.')[0] || 'Intelligence Report'}
        </h2>

        <div className="h-px w-full bg-gradient-to-r from-black/10 via-black/5 to-transparent mb-5" />

        {/* Rationale Reveal (Staggered) */}
        <div className="flex-1 mb-6">
            <button 
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-mono font-bold text-white/50 hover:text-white transition-colors mb-3 flex items-center gap-2 uppercase tracking-widest"
            >
                {expanded ? 'Hide Rationale' : 'View Editorial Rationale'}
                <motion.span animate={{ rotate: expanded ? 180 : 0 }}><ChevronDown size={14}/></motion.span>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div 
                        initial="hidden" 
                        animate="visible" 
                        exit="hidden" 
                        variants={{
                            visible: { opacity: 1, height: 'auto', transition: { staggerChildren: 0.12, duration: 0.3 } },
                            hidden: { opacity: 0, height: 0, transition: { staggerChildren: 0.05, staggerDirection: -1, duration: 0.3 } }
                        }}
                        className="space-y-3 pl-3 border-l-2 border-indigo-500/30 overflow-hidden"
                    >
                        <div className="py-2 space-y-3">
                          {rationale.split(/(?<=\.)\s+/).filter(Boolean).map((sentence, sIdx) => (
                              <motion.p 
                                  key={sIdx}
                                  variants={{
                                      hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
                                      visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
                                  }}
                                  className="text-sm text-white/90 leading-relaxed font-medium"
                              >
                                  {sentence}
                              </motion.p>
                          ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Research Paper Section */}
        {post.paper && (
          <div className="mb-5">
              <span className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-white/60 mb-3">
                <BookOpen size={14} />{t.research_context}
              </span>


              <ResearchPaperCard paper={post.paper} lang={lang} />
          </div>
        )}

        {/* Sources with Credibility Dots (Animated Chips) */}
        {post.sources?.length > 0 && (
          <div className="mt-4 pt-5 border-t border-white/10">
            <span className="block text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] font-extrabold mb-3">{t.primary_sources}</span>
            <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                    {expanded && post.sources.map((source, j) => (
                      <motion.a 
                        key={j} href={source} target="_blank" rel="noopener noreferrer"
                        initial={{ opacity: 0, rotateX: 90, scale: 0.8 }}
                        animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                        exit={{ opacity: 0, rotateX: -90, scale: 0.8 }}
                        transition={{ delay: 0.3 + (j * 0.1), type: 'spring', stiffness: 200 }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-blue-50 hover:text-blue-700 transition-all group/link border border-transparent hover:border-blue-100 flex-shrink-0"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] flex-shrink-0" title="Tier 1 Verified Source" />
                        <span className="text-[11px] font-mono font-semibold max-w-[200px] truncate">{source.replace('https://', '')}</span>
                        <ExternalLink size={11} className="opacity-30 group-hover/link:opacity-100 flex-shrink-0 transition-opacity" />
                      </motion.a>
                    ))}
                </AnimatePresence>
                {/* Always show at least 1 static chip if not expanded just for visual balance, or maybe just only show on expanded. We'll only show on expanded to meet the 'staggered reveal' requirement. Wait, maybe show all statically if not expanded? No, the prompt says 'expand a card to animate rationale ... with source chips flipping in individually'. So we tie it to `expanded`. */}
                {!expanded && post.sources.map((source, j) => (
                      <a 
                        key={j} href={source} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-xl bg-white/5 opacity-50 hover:opacity-100 transition-all group/link border border-transparent flex-shrink-0"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 flex-shrink-0" />
                        <span className="text-[10px] font-mono max-w-[150px] truncate">{source.replace('https://', '')}</span>
                      </a>
                ))}
            </div>
          </div>
        )}

        {/* PDF Download + Share Section */}
        <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
          
          {post.auditTrail && (
            <button
              onClick={() => setShowAudit(!showAudit)}
              className="flex w-full items-center justify-between p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 transition-all font-mono text-xs uppercase tracking-widest font-bold"
            >
              <span className="flex items-center gap-2"><FileText size={14} /> Full Audit Trail</span>
              <ChevronDown size={14} className={showAudit ? "rotate-180" : ""} />
            </button>
          )}

          <AnimatePresence>
            {showAudit && post.auditTrail && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-black/40 rounded-xl border border-white/5 p-4 mb-4"
              >
                <div className="space-y-4">
                  {post.contradiction && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded p-2 text-xs font-mono text-red-400">
                      ⚠ Contradiction Detected between sources
                    </div>
                  )}
                  {post.structuredEntities && (
                    <div>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">Extracted Entities</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-white/5 p-2 rounded text-xs font-mono"><span className="opacity-50">CVE:</span> {post.structuredEntities.cve}</div>
                        <div className="bg-white/5 p-2 rounded text-xs font-mono"><span className="opacity-50">Vendor:</span> {post.structuredEntities.vendor}</div>
                        <div className="bg-white/5 p-2 rounded text-xs font-mono col-span-2"><span className="opacity-50">Target:</span> {post.structuredEntities.model}</div>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Score Breakdown</span>
                    <ul className="mt-1 space-y-1">
                      {post.auditTrail.scoreBreakdown.map((s, i) => (
                        <li key={i} className="text-xs font-mono flex justify-between">
                          <span>{s.factor}</span>
                          <span className={s.impact > 0 ? 'text-emerald-400' : 'text-red-400'}>{s.impact > 0 ? '+' : ''}{s.impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Decision Matrix</span>
                    <p className="text-xs text-white/70 mt-1 italic">"{post.auditTrail.whyChosen}"</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => triggerPostPDF(post, lang)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-white text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-black/80 transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.25)]"
          >
            <Download size={14} className="text-white/80" />
            {t.download_pdf}
          </motion.button>

          {/* Share Buttons */}
          {(post.linkedin || post.email) && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/30 font-bold mb-2 text-center mt-4">{t.share_section}</p>
              <div className="grid grid-cols-2 gap-2">
                {post.linkedin && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => copy(post.linkedin, `li-${post.id}`)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
                      copied === `li-${post.id}`
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-[#0A66C2]/5 border-[#0A66C2]/20 text-[#0A66C2] hover:bg-[#0A66C2]/10'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {copied === `li-${post.id}` ? (
                        <motion.span key="done" initial={{scale:0}} animate={{scale:1}} className="flex items-center gap-1.5">
                          <CheckCheck size={13}/> {t.copied}
                        </motion.span>
                      ) : (
                        <motion.span key="copy" initial={{scale:0}} animate={{scale:1}} className="flex items-center gap-1.5">
                          <Share2 size={13}/> {t.copy_linkedin}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )}
                {post.email && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => copy(post.email, `em-${post.id}`)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
                      copied === `em-${post.id}`
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {copied === `em-${post.id}` ? (
                        <motion.span key="done" initial={{scale:0}} animate={{scale:1}} className="flex items-center gap-1.5">
                          <CheckCheck size={13}/> {t.copied}
                        </motion.span>
                      ) : (
                        <motion.span key="copy" initial={{scale:0}} animate={{scale:1}} className="flex items-center gap-1.5">
                          <Mail size={13}/> {t.copy_email}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── MAIN FEED PAGE ────────────────────────────────────────────────────────────
export default function NewsFeed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');
  const [mood, setMood] = useState('baseline');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [lastPostId, setLastPostId] = useState(null);
  const [nearMisses, setNearMisses] = useState([]);
  const [beliefs, setBeliefs] = useState([]);
  const [nextTickAt, setNextTickAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  
  const t = T[lang];

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_URL}/api/internal/state`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setMood(data.mood || 'baseline');
          setNearMisses(data.nearMisses || []);
          setBeliefs(data.beliefs || []);
          setNextTickAt(data.nextTickAt || null);
          setNearMisses(data.nearMisses || []);
          setBeliefs(data.beliefs || []);
          setNextTickAt(data.nextTickAt || null);
          
          // Toast Notification logic
          if (data.posts.length > 0) {
            const currentTop = data.posts[0].id;
            if (lastPostId && currentTop !== lastPostId) {
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4000);
            }
            setLastPostId(currentTop);
          }
        }
      } catch (err) {
        console.error("Feed error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeed();
    const interval = setInterval(fetchFeed, 2000);
    const tickInterval = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(interval); clearInterval(tickInterval); };
  }, [lastPostId]);

  // Filter and Deduplicate posts
  const filteredPosts = [];
  const seenTitles = new Map();
  
  posts.forEach(p => {
    let match = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const txt = p.text_en?.toLowerCase() || '';
      const rat = p.rationale_en?.toLowerCase() || '';
      const top = p.topic?.toLowerCase() || '';
      match = txt.includes(q) || rat.includes(q) || top.includes(q);
    }
    
    if (match) {
      const title = p.text_en?.split('.')[0] || p.text?.split('.')[0] || 'Unknown';
      const normTitle = title.toLowerCase().trim();
      
      if (seenTitles.has(normTitle)) {
        const parentId = seenTitles.get(normTitle);
        filteredPosts.push({ ...p, threadedToId: parentId });
      } else {
        seenTitles.set(normTitle, p.id);
        filteredPosts.push(p);
      }
    }
  });

  // Calculate funnel data from timeline if available
  const funnel = { scanned: 0, held: 0, rejected: 0, published: 0 };
  if (posts.length > 0 || nearMisses.length > 0) {
      funnel.scanned = 100; // Mock total or sum up
      funnel.published = posts.length;
      funnel.held = nearMisses.length;
      funnel.rejected = Math.max(0, funnel.scanned - (funnel.published + funnel.held)); // Simplified for UI
  }

  // Background Mood Colors
  const bgMood = mood === 'panicked' 
    ? 'from-red-100 via-rose-50 to-orange-50' 
    : mood === 'skeptical' 
    ? 'from-blue-100 via-slate-100 to-indigo-50'
    : 'from-gray-100 via-slate-50 to-white';

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use CSS transition for fade in instead of manual JS animation
    video.style.opacity = '0';
    video.style.transition = 'opacity 1.2s ease-in-out';

    const onReady = () => {
      video.play().catch(() => {});
      requestAnimationFrame(() => {
        video.style.opacity = '1';
      });
    };

    if (video.readyState >= 2) {
      onReady();
    } else {
      video.addEventListener('loadeddata', onReady, { once: true });
    }

    return () => {
      video.removeEventListener('loadeddata', onReady);
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4 }} className="min-h-screen relative overflow-x-hidden bg-black text-white font-body font-medium">

      {/* ── Background Video ── */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-100 transition-opacity duration-[2000ms]"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
      />
      {/* Dark scrim for readability */}
      <div className="fixed inset-0 z-0 bg-black/55 pointer-events-none" />

      {/* ── Toast ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-white/10 backdrop-blur border border-white/20 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">{t.new_post}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page content ── */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Nav */}
        <div className="max-w-7xl mx-auto w-full px-6 pt-8 flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-xs font-mono font-bold uppercase tracking-widest text-white"
          >
            <ArrowLeft size={14}/> {t.home}
          </button>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full">
            <Activity size={14} className={mood === 'panicked' ? 'text-red-400' : 'text-blue-400'} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/70">
              {mood === 'panicked' ? t.mood_panicked : mood === 'skeptical' ? t.mood_skeptical : t.mood_baseline}
            </span>
            <div className="flex gap-1 h-3 items-end">
              {[...Array(5)].map((_, i) => (
                <motion.div key={i}
                  animate={{ height: mood === 'panicked' ? ['20%','100%','20%'] : ['20%','60%','20%'] }}
                  transition={{ duration: mood === 'panicked' ? 0.3 : 1.2, repeat: Infinity, delay: i * 0.1 }}
                  className={`w-1 rounded-t-sm ${mood === 'panicked' ? 'bg-red-400' : 'bg-blue-400'}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <Globe size={14}/> {lang === 'en' ? 'HI' : 'EN'}
          </button>
        </div>

        {/* Hero */}
        <header className="max-w-7xl mx-auto w-full px-6 mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-extrabold uppercase tracking-[0.2em] mb-5 shadow backdrop-blur"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> {t.badge}
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight text-white leading-tight mb-4 drop-shadow-lg">
            {t.heading1}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              {t.heading2}
            </span>
          </h1>

          {nextTickAt && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold text-indigo-300 mt-2 backdrop-blur">
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Activity size={14} className="text-indigo-400"/>
              </motion.div>
              Next Cycle In: <CycleCountdown nextTickAt={nextTickAt} now={now} />
            </div>
          )}
        </header>

        {/* Search */}
        <div className="max-w-2xl mx-auto w-full px-6 mb-8 relative">
          <Search size={18} className="absolute left-10 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/40 rounded-full py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 text-sm font-medium transition-all"
          />
        </div>

        {/* ── Two-column grid ── */}
        <div className="max-w-7xl mx-auto w-full px-6 pb-20 flex flex-col xl:flex-row gap-8 items-start flex-1">

          {/* LEFT — Feed */}
          <div className="w-full xl:flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
                  className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
                />
                <p className="font-mono text-xs uppercase tracking-widest text-white/40 font-bold animate-pulse">
                  {t.connecting}
                </p>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 gap-6">
                <AnimatePresence>
                  {filteredPosts.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="col-span-full py-20 text-center"
                    >
                      <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto flex items-center justify-center mb-6">
                        <Brain size={32} className="text-white/30" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t.empty_title}</h3>
                      <p className="text-white/50 text-sm">{t.empty_desc}</p>
                    </motion.div>
                  ) : (
                    filteredPosts.map((post, index) => (
                      <PostCard key={post.id} post={post} lang={lang} index={index} />
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* RIGHT — Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-6">
            
            {/* Live Scanner Ticker */}
            <div className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-[2rem] p-5 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">Live Scanner Ticker</span>
              </div>
              <div className="flex w-max overflow-hidden relative">
                <motion.div 
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ ease: "linear", duration: 15, repeat: Infinity }}
                    className="flex items-center gap-6 whitespace-nowrap font-mono text-xs text-white/70"
                >
                    <span>[SCANNING] Dark web forums...</span>
                    <motion.span animate={{ opacity: [0.6, 1, 0.6], color: ['#9ca3af', '#60a5fa', '#9ca3af'] }} transition={{ repeat: Infinity, duration: 2 }} className="bg-white/10 px-2 py-0.5 rounded text-white">[ANALYZING] CVE-2024-3861 payload signature...</motion.span>
                    <span>[HELD] Potential supply chain exploit on NPM...</span>
                    <span>[VERIFYING] arXiv paper 2405.12221...</span>
                    <span>[SCANNING] Dark web forums...</span>
                    <motion.span animate={{ opacity: [0.6, 1, 0.6], color: ['#9ca3af', '#60a5fa', '#9ca3af'] }} transition={{ repeat: Infinity, duration: 2 }} className="bg-white/10 px-2 py-0.5 rounded text-white">[ANALYZING] CVE-2024-3861 payload signature...</motion.span>
                    <span>[HELD] Potential supply chain exploit on NPM...</span>
                    <span>[VERIFYING] arXiv paper 2405.12221...</span>
                </motion.div>
              </div>
            </div>

            {/* Discovery Funnel */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-white/40 mb-4 flex items-center gap-2">
                <BarChart2 size={14} /> Discovery Funnel
              </h3>
              <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-mono text-white/60"><span>Scanned</span> <span><CountUp value={funnel.scanned} /></span></div>
                      <div className="h-1.5 bg-blue-500/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="h-full bg-blue-500" /></div>
                  </div>
                  <div className="flex flex-col gap-1 pl-2">
                      <div className="flex justify-between text-[10px] font-mono text-white/60"><span>Held / Corroborating</span> <span><CountUp value={funnel.held} /></span></div>
                      <div className="h-1.5 bg-yellow-500/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(funnel.held / funnel.scanned) * 100}%` }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="h-full bg-yellow-500" /></div>
                  </div>
                  <div className="flex flex-col gap-1 pl-4">
                      <div className="flex justify-between text-[10px] font-mono text-white/60"><span>Rejected</span> <span><CountUp value={funnel.rejected} /></span></div>
                      <div className="h-1.5 bg-red-500/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(funnel.rejected / funnel.scanned) * 100}%` }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }} className="h-full bg-red-500" /></div>
                  </div>
                  <div className="flex flex-col gap-1 pl-6">
                      <div className="flex justify-between text-[10px] font-mono text-white/60 font-bold"><span className="text-emerald-400">Published</span> <span className="text-emerald-400"><CountUp value={funnel.published} /></span></div>
                      <div className="h-1.5 bg-emerald-500/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(funnel.published / funnel.scanned) * 100}%` }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} className="h-full bg-emerald-500" /></div>
                  </div>
              </div>
            </div>

            <BeliefLedger beliefs={beliefs} />
            <NearMissLog nearMisses={nearMisses} />
          </div>

        </div>
      </div>
    </motion.div>
  );
}
function BeliefLedger({ beliefs }) {
  if (!beliefs || beliefs.length === 0) return null;
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-white/40 mb-4 flex items-center gap-2">
        <Brain size={14} /> Belief Ledger
      </h3>
      <div className="space-y-4">
        {beliefs.map(b => (
          <div key={b.id} className="space-y-2 relative">
            <div className="text-sm font-medium text-white/80">{b.statement}</div>
            
            {/* Animated Tally Effect (emergent) */}
            <AnimatePresence>
                {b.strength > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: [0, 1, 0], y: -10 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        key={`tally-${b.strength}`}
                        className="absolute right-0 top-0 text-[10px] font-mono text-emerald-400 font-bold"
                    >
                        Update
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${b.strength > 75 ? 'bg-red-500' : b.strength > 50 ? 'bg-orange-400' : 'bg-blue-400'}`}
                style={{ width: `${b.strength}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
              <span>Foundation</span>
              <span>Confidence: {b.strength}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NearMissLog({ nearMisses }) {
  if (!nearMisses || nearMisses.length === 0) return null;
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-white/40 mb-4 flex items-center gap-2">
        <AlertTriangle size={14} /> Near-Miss Log (Held)
      </h3>
      <div className="space-y-3">
        {nearMisses.slice(0, 5).map(miss => (
          <div key={miss.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-xs font-bold text-white/90 truncate mb-1">{miss.topic}</div>
            <div className="text-[10px] font-mono text-yellow-400/80">{miss.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
