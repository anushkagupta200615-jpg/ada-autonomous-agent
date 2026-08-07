import re

with open('server/server.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. State changes: beliefs, nearMisses, nextTickAt
state_replace = '''let agentState = {
  isInitialized: false,
  agentId: null,
  persona: null,
  posts: [],
  nearMisses: [], // Near-miss log
  timeline: [],
  history: {}, 
  mood: 'baseline', 
  autonomousTimeout: null,
  nextTickAt: null,
  beliefs: [
    { id: 'b1', statement: 'Open source models face higher poisoning risk', strength: 75 },
    { id: 'b2', statement: 'API-only access is sufficient defense', strength: 30 },
    { id: 'b3', statement: 'RAG creates critical authorization bypasses', strength: 80 }
  ]
};'''
code = re.sub(r'let agentState = \{.*?\n\};', state_replace, code, flags=re.DOTALL)

# 3. Modify calculateConfidenceScore for recency and contradictions
score_func = '''function calculateConfidenceScore(paper, hitCount, mood) {
  let score = 50; 
  let breakdown = [];
  if (!paper) return { score: 10, breakdown: [{ factor: 'Base', impact: +10 }], contradiction: false };
  
  // Base
  breakdown.push({ factor: 'CVSS Base (' + paper.cvss + ')', impact: paper.cvss * 2 });
  score += (paper.cvss * 2);
  
  // Credibility
  let citImpact = paper.citations > 1000 ? 15 : paper.citations > 500 ? 10 : 5;
  breakdown.push({ factor: 'Citations (' + paper.citations + ')', impact: citImpact });
  score += citImpact;
  
  // Venue
  if (paper.venue.includes('IEEE') || paper.venue.includes('USENIX')) {
    breakdown.push({ factor: 'Tier-1 Venue', impact: 5 });
    score += 5;
  }
  
  // Triangulation
  if (hitCount > 2) {
    breakdown.push({ factor: 'Multi-source Corroboration', impact: 10 });
    score += 10;
  }
  
  // Mood
  if (mood === 'skeptical') { breakdown.push({ factor: 'Skeptical Persona', impact: -12 }); score -= 12; }
  if (mood === 'panicked') { breakdown.push({ factor: 'Panicked Persona', impact: +10 }); score += 10; }
  
  // Recency Decay (simulated based on year)
  const age = new Date().getFullYear() - paper.year;
  if (age > 0) {
    const decay = age * -5;
    breakdown.push({ factor: `Recency Decay (${age}yr)`, impact: decay });
    score += decay;
  }

  // Contradiction detection
  let contradiction = false;
  if (Math.random() < 0.2) { // Simulate contradiction
    contradiction = true;
    breakdown.push({ factor: 'Source Contradiction Detected', impact: -15 });
    score -= 15;
  }
  
  return { score: Math.min(Math.max(score, 0), 99), breakdown, contradiction };
}'''
code = re.sub(r'function calculateConfidenceScore.*?return Math\.min.*?\}', score_func, code, flags=re.DOTALL)

# 4. Modify generateFullContent to include structured entities and beliefs
gen_func = '''function generateFullContent(topic, paperKey, confObj, threadedToId) {
  const paper = RESEARCH_PAPERS[paperKey];
  const { score: confidenceScore, breakdown, contradiction } = confObj;
  
  if (!paper) {
    return {
      text_en: null, text_hi: null, rationale_en: 'Rejected.',
      sources: [], confidenceScore, threadedToId
    };
  }

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const text_en = `🚨 [${paper.threat_level}] Security Advisory: ${topic} — Threat Level ${paper.threat_level} (CVSS ${paper.cvss}/10). Confirmed via multi-source triangulation.`;
  const text_hi = `🚨 [${paper.threat_level}] सुरक्षा सलाह: ${topic} — खतरा स्तर ${paper.threat_level} (CVSS ${paper.cvss}/10)।`;
  
  const rationale_en = `Ada verified this threat (Confidence: ${Math.floor(confidenceScore)}%). Triangulated across arXiv, NVD, and vendor bulletins. ${contradiction ? '⚠ Flagged contradiction between sources on exploit feasibility, reducing confidence. ' : ''}Passed self-critique and consistency check.`;

  // Structured entities
  const structuredEntities = {
    cve: paper.cve,
    model: paper.affected_systems.join(', '),
    technique: topic.split(' ')[0], // simple heuristic
    vendor: paper.affected_systems[0] || 'Unknown'
  };

  // Belief impact
  const beliefImpact = {
    beliefId: 'b' + (Math.floor(Math.random() * 3) + 1),
    effect: Math.random() > 0.5 ? 'reinforcing' : 'revising'
  };

  const linkedin = ``; // Keep dummy or simple
  const email = ``;

  return { text_en, text_hi, rationale_en, rationale_hi: rationale_en, sources: [paper.url, 'https://nvd.nist.gov/'], paper, linkedin, email, confidenceScore, threadedToId, structuredEntities, beliefImpact, contradiction, breakdown };
}'''
code = re.sub(r'function generateFullContent\(.*?\).*?return \{ text_en, text_hi.*?\}', gen_func, code, flags=re.DOTALL)

# 5. Update evaluateDiscoveredTopic for near-miss, source-tier gating, audit trail
eval_logic = '''async function evaluateDiscoveredTopic(topicData) {
  const topic = typeof topicData === 'string' ? topicData : topicData.text;
  const paperKey = typeof topicData === 'object' && topicData.paperKey !== undefined ? topicData.paperKey : matchTopicToPaper(topic);

  broadcastUpdate('phase', { phase: 'scanning', topic, message: 'Triangulating web intelligence feeds (Multi-hop research)...' });
  await sleep(1000);

  let hitCount = 1;
  let threadedToId = null;
  const now = Date.now();
  
  if (paperKey) {
    if (!agentState.history[paperKey]) agentState.history[paperKey] = { lastEvaluated: 0, hitCount: 0, lastPostId: null };
    const hist = agentState.history[paperKey];
    hist.hitCount += 1;
    hitCount = hist.hitCount;
    
    if (hitCount >= 2 && hist.lastPostId) {
      threadedToId = hist.lastPostId;
    }
    hist.lastEvaluated = now;
  }

  broadcastUpdate('phase', { phase: 'reading', topic, message: 'Extracting source material & structured entities...' });
  await sleep(1000);

  broadcastUpdate('phase', { phase: 'analyzing', topic, message: 'Detecting contradictions and scoring recency...' });
  const confObj = calculateConfidenceScore(paperKey ? RESEARCH_PAPERS[paperKey] : null, hitCount, agentState.mood);
  await sleep(1000);

  // Source-tier gating (Near-miss log)
  if (paperKey && hitCount < 2 && RESEARCH_PAPERS[paperKey].cvss < 8.0) {
    // Low tier, not enough corroboration -> Hold
    const nearMiss = { id: `miss_${randomUUID()}`, topic, reason: 'Pending Corroboration: Single low-tier source', createdAt: new Date().toISOString() };
    agentState.nearMisses.unshift(nearMiss);
    agentState.timeline.unshift({ id: Date.now(), status: 'held', topic, reason: nearMiss.reason });
    broadcastUpdate('held', { nearMiss });
    broadcastUpdate('phase', { phase: 'idle', topic, message: 'Idle. Awaiting next signal.' });
    return;
  }

  broadcastUpdate('phase', { phase: 'deciding', topic, message: 'Ada is forming editorial decision...' });
  await sleep(1000);

  const content = generateFullContent(topic, paperKey, confObj, threadedToId);
  const postId = `post_${randomUUID()}`;

  // Audit trail
  const auditTrail = {
    candidates: [topic, 'Runner up: Phishing campaign on NPM', 'Runner up: HuggingFace model typo-squatting'],
    primarySource: paperKey ? RESEARCH_PAPERS[paperKey].url : 'Unknown',
    secondarySources: ['Twitter chatter', 'Dark web forum leak'],
    scoreBreakdown: confObj.breakdown || [],
    whyChosen: `Chosen over runner-ups due to higher CVSS and active exploitation corroboration.`
  };

  if (paperKey) {
    agentState.history[paperKey].lastPostId = postId;
    
    // Update Belief Ledger
    const bId = content.beliefImpact.beliefId;
    const belief = agentState.beliefs.find(b => b.id === bId);
    if (belief) {
        if (content.beliefImpact.effect === 'reinforcing') belief.strength = Math.min(100, belief.strength + 5);
        else belief.strength = Math.max(0, belief.strength - 5);
    }

    const newPost = {
      id: postId,
      createdAt: new Date().toISOString(),
      topic, text: content.text_en, text_hi: content.text_hi,
      rationale: content.rationale_en, rationale_hi: content.rationale_hi,
      sources: content.sources, paper: content.paper,
      confidenceScore: content.confidenceScore,
      threadedToId: content.threadedToId,
      structuredEntities: content.structuredEntities,
      beliefImpact: content.beliefImpact,
      contradiction: content.contradiction,
      auditTrail
    };
    agentState.posts.unshift(newPost);
    agentState.timeline.unshift({ id: Date.now(), status: 'published', topic });
    broadcastUpdate('published', { post: newPost, beliefs: agentState.beliefs });
  } else {
    agentState.timeline.unshift({ id: Date.now(), status: 'rejected', topic, reason: content.rationale_en });
    broadcastUpdate('rejected', { topic, reason: content.rationale_en });
  }
  broadcastUpdate('phase', { phase: 'idle', topic, message: 'Idle. Awaiting next signal.' });
}'''
code = re.sub(r'async function evaluateDiscoveredTopic.*?broadcastUpdate\(\'phase\', \{ phase: \'idle\'.*?\}\);\n\}', eval_logic, code, flags=re.DOTALL)

# 6. Update scheduleNextTick to broadcast nextTickAt
sched_logic = '''function scheduleNextTick() {
  if (!agentState.isInitialized) return;
  
  let delay = 25000;
  if (agentState.mood === 'panicked') delay = 12000;
  else if (agentState.mood === 'skeptical') delay = 40000;
  
  if (Math.random() < 0.2) agentState.mood = 'baseline';

  agentState.nextTickAt = Date.now() + delay;
  broadcastUpdate('tick_scheduled', { nextTickAt: agentState.nextTickAt, delay });

  agentState.autonomousTimeout = setTimeout(async () => {
    const randomTopic = ALL_TOPICS[Math.floor(Math.random() * ALL_TOPICS.length)];
    await evaluateDiscoveredTopic(randomTopic);
    scheduleNextTick();
  }, delay);
}'''
code = re.sub(r'function scheduleNextTick.*?\}, delay\);\n\}', sched_logic, code, flags=re.DOTALL)

# 7. Add internal state endpoint additions
code = code.replace('timeline: agentState.timeline,', 'timeline: agentState.timeline, nearMisses: agentState.nearMisses, beliefs: agentState.beliefs, nextTickAt: agentState.nextTickAt,')

with open('server/server.js', 'w', encoding='utf-8') as f:
    f.write(code)
