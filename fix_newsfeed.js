/**
 * fix_newsfeed.js — Surgical fix of NewsFeed.jsx layout issues:
 *  1. Video: use `fixed` + start at opacity:0, fade in on load
 *  2. Layout: restructure return block so sidebar is INSIDE the flex row
 *  3. Remove leftover broken divs that caused misalignment
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/NewsFeed.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// ── 1. Add new state vars after lastPostId ─────────────────────────────────
code = code.replace(
  `  const [lastPostId, setLastPostId] = useState(null);
  
  const t = T[lang];`,
  `  const [lastPostId, setLastPostId] = useState(null);
  const [nearMisses, setNearMisses] = useState([]);
  const [beliefs, setBeliefs] = useState([]);
  const [nextTickAt, setNextTickAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  
  const t = T[lang];`
);

// ── 2. Patch the fetch to also set new state ───────────────────────────────
code = code.replace(
  `          setPosts(data.posts || []);
          setMood(data.mood || 'baseline');`,
  `          setPosts(data.posts || []);
          setMood(data.mood || 'baseline');
          setNearMisses(data.nearMisses || []);
          setBeliefs(data.beliefs || []);
          setNextTickAt(data.nextTickAt || null);`
);

// ── 3. Add tick timer to cleanup ───────────────────────────────────────────
code = code.replace(
  `    const interval = setInterval(fetchFeed, 2000);
    return () => clearInterval(interval);`,
  `    const interval = setInterval(fetchFeed, 2000);
    const tickInterval = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(interval); clearInterval(tickInterval); };`
);

// ── 4. Fix video — start opacity 0, use fixed, fade in on load ─────────────
code = code.replace(
  `    if (video.readyState >= 2) {
      video.style.opacity = '1';
    }`,
  `    video.style.opacity = '0';
    if (video.readyState >= 2) {
      video.play().catch(() => {});
      video.style.opacity = '1';
    }`
);

// ── 5. Replace the whole return block ─────────────────────────────────────
const returnStart = `  return (
    <div className={\`min-h-screen relative overflow-hidden transition-colors duration-1000 bg-black text-white font-body font-medium\`}>
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
                  className={\`w-1 rounded-t-sm \${mood === 'panicked' ? 'bg-red-400' : 'bg-blue-400'}\`}
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-extrabold uppercase tracking-[0.2em] mb-6 shadow-sm backdrop-blur"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            {t.badge}
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-white leading-tight mb-4">
            {t.heading1} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
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
            className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/40 rounded-full py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-body text-sm font-medium transition-all"
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
        <div className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-6 pt-4">
          <BeliefLedger beliefs={beliefs} />
          <NearMissLog nearMisses={nearMisses} />
        </div>

      </div>
      </div>
    </div>
  );
}`;

// Find return start marker and end of component
const OLD_RETURN_START = `  return (
    <div className={\`min-h-screen relative overflow-hidden transition-colors duration-1000 bg-black text-white font-body font-medium\`}>`;

// Find the exact position
const idx = code.indexOf(OLD_RETURN_START);
if (idx === -1) {
  console.error('ERROR: Could not find return block start!');
  process.exit(1);
}

// Find the closing } of the default export function
// We look for the very last `}` in the component (before BeliefLedger)
const beliefLedgerMarker = '\nfunction BeliefLedger';
const bIdx = code.indexOf(beliefLedgerMarker);
if (bIdx === -1) {
  console.error('ERROR: Could not find BeliefLedger function!');
  process.exit(1);
}

// Extract everything before the old return
const before = code.substring(0, idx);
// Extract everything from BeliefLedger onward
const after = code.substring(bIdx);

// Write the new file
const newCode = before + returnStart + after;
fs.writeFileSync(filePath, newCode, 'utf8');
console.log('SUCCESS: NewsFeed.jsx patched');
console.log('Lines:', newCode.split('\n').length);
