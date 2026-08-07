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
          <BookOpen size={18} className="text-white/60" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/50">{t.research_context}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className={`text-[10px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${tc.bg} ${tc.text}`}>
            {t.threat_level}: {paper.threat_level}
          </span>
          {paper.cvss && (
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              CVSS {paper.cvss}/10
            </span>
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
      layout="position"
      initial={{ opacity: 0, scale: 0.8, y: 60, filter: 'blur(12px)' }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 220, damping: 22, mass: 0.9, delay: index * 0.06 }}
      onMouseMove={handleMouseMove}
      className="relative break-inside-avoid rounded-[2rem] liquid-glass backdrop-blur-2xl overflow-hidden flex flex-col group mb-6"
      style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}
      whileHover={{ boxShadow: '0 25px 60px -15px rgba(0,0,0,0.15)', y: -4 }}
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
        <h2 className="text-2xl font-extrabold font-heading leading-tight mb-5 text-white group-hover:text-indigo-700 transition-colors duration-300">
          {text?.split('.')[0] || post.text?.split('.')[0] || 'Intelligence Report'}
        </h2>

        <div className="h-px w-full bg-gradient-to-r from-black/10 via-black/5 to-transparent mb-5" />

        {/* Rationale */}
        <p className="text-sm text-white/65 leading-relaxed mb-6 font-medium flex-1">
          {rationale}
        </p>

        {/* Research Paper Section */}
        {post.paper && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/10 hover:bg-black/[0.06] border border-white/10 transition-all mb-5 group/btn"
          >
            <span className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-white/60 group-hover/btn:text-white">
              <BookOpen size={14} />{t.research_context}
            </span>
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300 }}>
              <ChevronDown size={14} className="text-white/40" />
            </motion.span>
          </button>
        )}

        <AnimatePresence>
          {expanded && post.paper && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <ResearchPaperCard paper={post.paper} lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sources with Credibility Dots */}
        {post.sources?.length > 0 && (
          <div className="mt-4 pt-5 border-t border-white/10">
            <span className="block text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] font-extrabold mb-3">{t.primary_sources}</span>
            {post.sources.map((source, j) => (
              <a key={j} href={source} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-blue-50 hover:text-blue-700 transition-all group/link border border-transparent hover:border-blue-100">
                <div className="flex items-center gap-2 overflow-hidden">
                  {/* Credibility Dot (Green for arXiv) */}
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] flex-shrink-0" title="Tier 1 Verified Source" />
                  <span className="text-[11px] font-mono truncate mr-3 font-semibold">{source.replace('https://', '')}</span>
                </div>
                <ExternalLink size={13} className="opacity-30 group-hover/link:opacity-100 flex-shrink-0 transition-opacity" />
              </a>
            ))}
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
        const res = await fetch('http://localhost:3001/api/internal/state');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setMood(data.mood || 'baseline');
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

  // Filter posts based on search
  const filteredPosts = posts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const txt = p.text_en?.toLowerCase() || '';
    const rat = p.rationale_en?.toLowerCase() || '';
    const top = p.topic?.toLowerCase() || '';
    return txt.includes(q) || rat.includes(q) || top.includes(q);
  });

  // Background Mood Colors
  const bgMood = mood === 'panicked' 
    ? 'from-red-100 via-rose-50 to-orange-50' 
    : mood === 'skeptical' 
    ? 'from-blue-100 via-slate-100 to-indigo-50'
    : 'from-gray-100 via-slate-50 to-white';

  const videoRef = useRef(null);
  const fadeRef = useRef(0);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= 2) {
      video.style.opacity = '1';
    }

    const fade = (target, duration, callback) => {
      cancelAnimationFrame(fadeRef.current);
      const startOpacity = parseFloat(video.style.opacity || getComputedStyle(video).opacity || '0');
      let startTime = null;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        video.style.opacity = (startOpacity + (target - startOpacity) * progress).toString();

        if (progress < 1) {
          fadeRef.current = requestAnimationFrame(animate);
        } else if (callback) {
          callback();
        }
      };
      fadeRef.current = requestAnimationFrame(animate);
    };

    const handleLoadedData = () => {
      video.play().catch(() => {});
      fade(1, 500);
    };

    const handleTimeUpdate = () => {
      if (fadingOutRef.current) return;
      if (video.duration - video.currentTime <= 0.55) {
        fadingOutRef.current = true;
        fade(0, 500);
      }
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        fadingOutRef.current = false;
        video.play().catch(() => {});
        fade(1, 500);
      }, 100);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    if (video.readyState >= 2) {
      handleLoadedData();
    }

    return () => {
      cancelAnimationFrame(fadeRef.current);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-1000 bg-black text-white font-body font-medium`}>
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
      />
      {/* White Overlay to make background white but keep animation visible */}
      
      
      <div className="relative z-10">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-white text-black px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center gap-3 border border-white/20"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">{t.new_post}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col xl:flex-row gap-8">
        <div className="w-full xl:w-2/3 flex-shrink-0">
        {/* Navigation & Controls */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/20 hover:bg-white hover:shadow-lg transition-all text-xs font-mono uppercase tracking-widest font-bold"
          >
            <ArrowLeft size={14}/> {t.home}
          </button>
          
          {/* Mood / Cadence Activity Graph */}
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur border border-white/20 px-4 py-2 rounded-full">
            <Activity size={14} className={mood === 'panicked' ? 'text-red-500' : 'text-blue-500'} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/60">
              {mood === 'panicked' ? t.mood_panicked : mood === 'skeptical' ? t.mood_skeptical : t.mood_baseline}
            </span>
            <div className="flex gap-1 h-3 items-end ml-2">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: mood === 'panicked' ? ['20%', '100%', '20%'] : ['20%', '60%', '20%'] }}
                  transition={{ duration: mood === 'panicked' ? 0.3 : 1.2, repeat: Infinity, delay: i * 0.1 }}
                  className={`w-1 rounded-t-sm ${mood === 'panicked' ? 'bg-red-400' : 'bg-blue-400'}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="relative px-4 py-2 rounded-full bg-white text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-black/80 transition-all flex items-center gap-2 overflow-hidden group"
          >
            <Globe size={14} />
            {lang === 'en' ? 'HI' : 'EN'}
            <motion.div 
              className="absolute inset-0 border border-white/40 rounded-full"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </button>
        </div>

        <header className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-extrabold uppercase tracking-[0.2em] mb-6 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
            {t.badge}
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-white leading-tight mb-4">
            {t.heading1} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {t.heading2}
            </span>
          </h1>

          {nextTickAt && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold text-indigo-300 mt-2 backdrop-blur shadow">
              <Activity size={14} className="animate-pulse"/>
              Next Cycle In: {Math.max(0, Math.floor((nextTickAt - now)/1000))}s
            </div>
          )}
        </header>

        {/* Search Bar */}
        <div className="mb-12 relative max-w-xl mx-auto">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full liquid-glass placeholder:text-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-full py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-body text-sm font-medium transition-all"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, ease: "linear", repeat: Infinity }}
              className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
            />
            <p className="font-mono text-xs uppercase tracking-widest text-white/40 font-bold animate-pulse">
              {t.connecting}
            </p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
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
      </div>

      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <BeliefLedger beliefs={beliefs} />
        <NearMissLog nearMisses={nearMisses} />
      </div>

      </div>
    </div>
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
          <div key={b.id} className="space-y-2">
            <div className="text-sm font-medium text-white/80">{b.statement}</div>
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
