import re

with open('client/src/pages/NewsFeed.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. State vars
state_chunk = '''  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [lastPostId, setLastPostId] = useState(null);
  const [nearMisses, setNearMisses] = useState([]);
  const [beliefs, setBeliefs] = useState([]);
  const [nextTickAt, setNextTickAt] = useState(null);
  const [now, setNow] = useState(Date.now());'''
code = code.replace('''  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [lastPostId, setLastPostId] = useState(null);''', state_chunk)

# 2. set them in fetch
fetch_chunk = '''          setPosts(data.posts || []);
          setMood(data.mood || 'baseline');
          setNearMisses(data.nearMisses || []);
          setBeliefs(data.beliefs || []);
          setNextTickAt(data.nextTickAt || null);'''
code = code.replace('''          setPosts(data.posts || []);
          setMood(data.mood || 'baseline');''', fetch_chunk)

# 3. Add timer tick
timer_chunk = '''    fetchFeed();
    const interval = setInterval(fetchFeed, 2000);
    const tickInterval = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(interval); clearInterval(tickInterval); };'''
code = code.replace('''    fetchFeed();
    const interval = setInterval(fetchFeed, 2000);
    return () => clearInterval(interval);''', timer_chunk)

# 4. Add countdown + UI components
ui_inject = '''        <h1 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-white leading-tight">
          {t.heading1} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {t.heading2}
          </span>
        </h1>
        {nextTickAt && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold text-indigo-300 mt-6 backdrop-blur">
            <Activity size={14} className="animate-pulse"/>
            Next Cycle In: {Math.max(0, Math.floor((nextTickAt - now)/1000))}s
          </div>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full relative z-10">
        
        {/* LEFT COLUMN: Main Feed */}
        <div className="w-full lg:w-2/3">
'''
code = code.replace('''        <h1 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-white leading-tight">
          {t.heading1} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {t.heading2}
          </span>
        </h1>
      </header>''', ui_inject)

# 5. Right column (sidebar)
sidebar_inject = '''          </div>
        </div>

        {/* RIGHT COLUMN: Beliefs & Near Misses */}
        <div className="w-full lg:w-1/3 space-y-6">
          <BeliefLedger beliefs={beliefs} />
          <NearMissLog nearMisses={nearMisses} />
        </div>
      </div>
'''
code = code.replace('''          </div>
        )}
      </div>''', sidebar_inject)

# 6. Add Audit Trail Modal state and UI to PostCard
postcard_state = '''function PostCard({ post, lang, index }) {
  const [expanded, setExpanded] = useState(false);
  const [showAudit, setShowAudit] = useState(false);'''
code = code.replace('''function PostCard({ post, lang, index }) {
  const [expanded, setExpanded] = useState(false);''', postcard_state)

audit_button = '''        {/* PDF Download + Share Section */}
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

          <motion.button'''
code = code.replace('''        {/* PDF Download + Share Section */}
        <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
          <motion.button''', audit_button)

# 7. Append new components at the end
new_components = '''

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
            <div className="text-right text-[10px] font-mono text-white/40">Confidence: {b.strength}%</div>
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
'''
code += new_components

with open('client/src/pages/NewsFeed.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
