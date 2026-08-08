/**
 * fix_newsfeed2.js — Surgical replacement using string indices.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/NewsFeed.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// ── 1. Add new state vars after lastPostId ─────────────────────────────────
const stateOld = `  const [lastPostId, setLastPostId] = useState(null);\r\n  \r\n  const t = T[lang];`;
const stateNew = `  const [lastPostId, setLastPostId] = useState(null);\r\n  const [nearMisses, setNearMisses] = useState([]);\r\n  const [beliefs, setBeliefs] = useState([]);\r\n  const [nextTickAt, setNextTickAt] = useState(null);\r\n  const [now, setNow] = useState(Date.now());\r\n  \r\n  const t = T[lang];`;
if (code.includes(stateOld)) { code = code.replace(stateOld, stateNew); console.log('✓ Added state vars'); }
else console.warn('✗ State vars marker not found');

// ── 2. Patch the fetch to also set new state ───────────────────────────────
const fetchOld = `          setPosts(data.posts || []);\r\n          setMood(data.mood || 'baseline');`;
const fetchNew = `          setPosts(data.posts || []);\r\n          setMood(data.mood || 'baseline');\r\n          setNearMisses(data.nearMisses || []);\r\n          setBeliefs(data.beliefs || []);\r\n          setNextTickAt(data.nextTickAt || null);`;
if (code.includes(fetchOld)) { code = code.replace(fetchOld, fetchNew); console.log('✓ Patched fetch'); }
else console.warn('✗ Fetch marker not found');

// ── 3. Add tick timer ──────────────────────────────────────────────────────
const timerOld = `    const interval = setInterval(fetchFeed, 2000);\r\n    return () => clearInterval(interval);`;
const timerNew = `    const interval = setInterval(fetchFeed, 2000);\r\n    const tickInterval = setInterval(() => setNow(Date.now()), 1000);\r\n    return () => { clearInterval(interval); clearInterval(tickInterval); };`;
if (code.includes(timerOld)) { code = code.replace(timerOld, timerNew); console.log('✓ Added tick timer'); }
else console.warn('✗ Timer marker not found');

// ── 4. Fix video initial opacity in loadeddata handler ────────────────────
const videoOld = `    if (video.readyState >= 2) {\r\n      video.style.opacity = '1';\r\n    }`;
const videoNew = `    video.style.opacity = '0';\r\n\r\n    if (video.readyState >= 2) {\r\n      video.style.opacity = '1';\r\n      video.play().catch(() => {});\r\n    }`;
if (code.includes(videoOld)) { code = code.replace(videoOld, videoNew); console.log('✓ Fixed video opacity'); }
else console.warn('✗ Video opacity marker not found');

// ── 5. Replace entire NewsFeed return block ────────────────────────────────
// Find the NewsFeed return block (the backtick version of className)
const returnMarker = "return (\r\n    <div className={`min-h-screen relative overflow-hidden transition-colors duration-1000 bg-black text-white font-body font-medium`}>";
const markerIdx = code.indexOf(returnMarker);
if (markerIdx === -1) { console.error('ERROR: NewsFeed return marker not found'); process.exit(1); }

// Find the matching closing of the NewsFeed function — look for the BeliefLedger function def
const beliefMarker = '\r\nfunction BeliefLedger';
const bIdx = code.indexOf(beliefMarker);
if (bIdx === -1) { console.error('ERROR: BeliefLedger not found'); process.exit(1); }

const newReturnBlock = `return (
    <div className="min-h-screen relative overflow-x-hidden bg-black text-white font-body font-medium">

      {/* ── Background Video ── */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{ opacity: 0 }}
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
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
                  className={\`w-1 rounded-t-sm \${mood === 'panicked' ? 'bg-red-400' : 'bg-blue-400'}\`}
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
              <Activity size={14} className="animate-pulse"/>
              Next Cycle In: {Math.max(0, Math.floor((nextTickAt - now) / 1000))}s
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
            <BeliefLedger beliefs={beliefs} />
            <NearMissLog nearMisses={nearMisses} />
          </div>

        </div>
      </div>
    </div>
  );
}`;

const before = code.substring(0, markerIdx);
const after = code.substring(bIdx);
const newCode = before + newReturnBlock + after;

fs.writeFileSync(filePath, newCode, 'utf8');
console.log('SUCCESS: NewsFeed.jsx patched');
console.log('Lines:', newCode.split('\n').length);
