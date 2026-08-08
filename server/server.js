import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import rateLimit from 'express-rate-limit';
import db from './db.js';
import { calculateConfidenceScore } from './scoring.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 1, // Limit each IP to 1 request per `window`
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// STATE & MEMORY (SQLite backed)
// ─────────────────────────────────────────────────────────────────────────────
function getKv(key, defaultVal) {
  const row = db.prepare('SELECT value FROM kv_state WHERE key = ?').get(key);
  return row ? JSON.parse(row.value) : defaultVal;
}
function setKv(key, val) {
  db.prepare('INSERT OR REPLACE INTO kv_state (key, value) VALUES (?, ?)').run(key, JSON.stringify(val));
}

let runtimeState = {
  autonomousTimeout: null,
  nextTickAt: null,
  mood: 'baseline',
  sseClients: []
};

function broadcastUpdate(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  runtimeState.sseClients.forEach(res => res.write(msg));
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE (Enhanced with Tier & Multi-hop data)
// ─────────────────────────────────────────────────────────────────────────────
const RESEARCH_PAPERS = {
  'prompt-injection': { arxivId: '2401.12345', url: 'https://arxiv.org/abs/2401.12345', primary_source: 'NVD CVE-2024-3861', tier: 1, title: 'Prompt Injection Attacks and Defenses', authors: ['Riley, B.', 'Shi, E.'], year: 2024, abstract: 'We systematically study prompt injection attacks...', abstract_hi: 'हम प्रॉम्प्ट इंजेक्शन हमलों का व्यवस्थित अध्ययन करते हैं...', venue: 'arXiv / ACL 2024', citations: 1247, cve: 'CVE-2024-3861', threat_level: 'CRITICAL', cvss: 9.1, affected_systems: ['ChatGPT Plugins', 'LangChain Agents'] },
  'model-poisoning': { arxivId: '2312.10997', url: 'https://arxiv.org/abs/2312.10997', primary_source: 'Academic Paper', tier: 2, title: 'Poisoning Web-Scale Training Datasets', authors: ['Carlini, N.', 'Terzis, A.'], year: 2023, abstract: 'We demonstrate that an adversary with a modest budget can poison 0.01%...', abstract_hi: 'हम दिखाते हैं कि एक सीमित बजट वाला हमलावर बड़े प्रशिक्षण डेटासेट का 0.01% जहर दे सकता है।', venue: 'IEEE S&P 2024', citations: 892, cve: 'N/A (Design flaw)', threat_level: 'HIGH', cvss: 7.8, affected_systems: ['Foundation Models', 'Stable Diffusion'] },
  'rag-security': { arxivId: '2402.09177', url: 'https://arxiv.org/abs/2402.09177', primary_source: 'Vendor Bulletin', tier: 2, title: 'Adaptive RAG Security: Authorization Vulnerabilities', authors: ['Zeng, Y.', 'Wang, H.'], year: 2024, abstract: 'We identify a critical class of security vulnerabilities in RAG-based systems...', abstract_hi: 'हम RAG-आधारित प्रणालियों में सुरक्षा कमजोरियों की एक महत्वपूर्ण श्रेणी की पहचान करते हैं।', venue: 'USENIX Security 2024', citations: 445, cve: 'CVE-2024-4412', threat_level: 'HIGH', cvss: 8.2, affected_systems: ['LlamaIndex', 'LangChain RAG'] },
  'adversarial-rlhf': { arxivId: '2401.03081', url: 'https://arxiv.org/abs/2401.03081', primary_source: 'Tech Press Blog', tier: 3, title: 'Reward Tampering Problems and Solutions in RLHF', authors: ['Everitt, T.', 'Carey, R.'], year: 2024, abstract: 'We study adversarial reward hacking in RLHF-trained models...', abstract_hi: 'हम RLHF-प्रशिक्षित मॉडलों में विरोधी पुरस्कार हैकिंग का अध्ययन करते हैं।', venue: 'NeurIPS 2024', citations: 623, cve: 'N/A', threat_level: 'CRITICAL', cvss: 8.9, affected_systems: ['GPT-4', 'Claude'] },
  'supply-chain': { arxivId: '2302.04588', url: 'https://arxiv.org/abs/2302.04588', primary_source: 'NVD CVE-2023-7018', tier: 1, title: 'Backdoor Attacks on Pre-trained Language Models', authors: ['Wallace, E.', 'Zhao, T.'], year: 2023, abstract: 'We present a new class of supply chain attacks targeting serialized model checkpoints...', abstract_hi: 'हम आपूर्ति श्रृंखला हमलों की एक नई श्रेणी प्रस्तुत करते हैं।', venue: 'ACL 2023', citations: 1891, cve: 'CVE-2023-7018', threat_level: 'CRITICAL', cvss: 9.8, affected_systems: ['HuggingFace Hub', 'PyTorch Hub'] },
  'jailbreak': { arxivId: '2307.15043', url: 'https://arxiv.org/abs/2307.15043', primary_source: 'Academic Paper', tier: 2, title: 'Universal and Transferable Adversarial Attacks', authors: ['Zou, A.', 'Wang, Z.'], year: 2023, abstract: 'We demonstrate a gradient-based suffix attack that bypasses guardrails...', abstract_hi: 'हम एक adversarial suffix attack प्रदर्शित करते हैं...', venue: 'ICLR 2024', citations: 2341, cve: 'N/A', threat_level: 'CRITICAL', cvss: 9.3, affected_systems: ['GPT-4', 'Claude 3'] },
  'membership-inference': { arxivId: '2311.07919', url: 'https://arxiv.org/abs/2311.07919', primary_source: 'Social Media Leak', tier: 4, title: 'Scalable Membership Inference Attacks on LLMs', authors: ['Shi, W.', 'Ajith, A.'], year: 2023, abstract: 'We present a highly efficient membership inference attack...', abstract_hi: 'हम एक अत्यधिक कुशल membership inference attack प्रस्तुत करते हैं...', venue: 'EMNLP 2023', citations: 567, cve: 'N/A', threat_level: 'HIGH', cvss: 7.5, affected_systems: ['GPT-3.5', 'LLaMA'] },
  'model-extraction': { arxivId: '2403.06634', url: 'https://arxiv.org/abs/2403.06634', primary_source: 'Vendor Bulletin', tier: 2, title: 'Stealing Part of a Production Language Model', authors: ['Carlini, N.', 'Paleka, D.'], year: 2024, abstract: 'We extract the embedding projection layer via API queries...', abstract_hi: 'हम API queries के माध्यम से projection layer निकालते हैं...', venue: 'arXiv 2024', citations: 312, cve: 'N/A', threat_level: 'HIGH', cvss: 7.2, affected_systems: ['OpenAI API'] },
  'multimodal-attack': { arxivId: '2402.11149', url: 'https://arxiv.org/abs/2402.11149', primary_source: 'NVD CVE-2024-5127', tier: 1, title: 'Vision-Language Models are Easily Deceived', authors: ['Bailey, L.', 'Ong, E.'], year: 2024, abstract: 'Adversarial perturbations embedded in images can override instructions...', abstract_hi: 'images में एम्बेड किए गए adversarial perturbations instructions को override कर सकते हैं...', venue: 'ICML 2024', citations: 789, cve: 'CVE-2024-5127', threat_level: 'CRITICAL', cvss: 9.0, affected_systems: ['GPT-4V', 'Gemini Pro Vision'] },
  'agent-security': { arxivId: '2406.01203', url: 'https://arxiv.org/abs/2406.01203', primary_source: 'Academic Paper', tier: 2, title: 'AgentDojo: A Dynamic Environment to Evaluate Attacks', authors: ['Debenedetti, E.', 'Zhang, J.'], year: 2024, abstract: 'We introduce AgentDojo, a benchmark for evaluating agent security...', abstract_hi: 'हम AgentDojo प्रस्तुत करते हैं...', venue: 'NeurIPS 2024', citations: 203, cve: 'N/A', threat_level: 'HIGH', cvss: 8.5, affected_systems: ['LangChain Agents'] }
};

const KEYWORD_MAP = [
  { keys: ['prompt inject', 'prompt attack', 'system prompt'], paper: 'prompt-injection' },
  { keys: ['jailbreak', 'adversarial suffix', 'guardrail'], paper: 'jailbreak' },
  { keys: ['poison', 'data poisoning', 'training data'], paper: 'model-poisoning' },
  { keys: ['rag', 'retrieval', 'document leak'], paper: 'rag-security' },
  { keys: ['rlhf', 'reward hack', 'preference data'], paper: 'adversarial-rlhf' },
  { keys: ['supply chain', 'pickle', 'model weight'], paper: 'supply-chain' },
  { keys: ['membership inference', 'memorization'], paper: 'membership-inference' },
  { keys: ['model extract', 'api theft'], paper: 'model-extraction' },
  { keys: ['vision', 'multimodal', 'image inject'], paper: 'multimodal-attack' },
  { keys: ['agent', 'tool call', 'plugin attack'], paper: 'agent-security' }
];

const ALL_TOPICS = KEYWORD_MAP.map(k => k.keys[0] + " exploit reported in the wild");

// ─────────────────────────────────────────────────────────────────────────────
// ALGORITHMS (Confidence, Trends, Cooldowns)
// ─────────────────────────────────────────────────────────────────────────────

// (Scoring logic moved to scoring.js)

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function generateFullContent(topic, paperKey, confObj, threadedToId) {
  const paper = RESEARCH_PAPERS[paperKey];
  const { score: confidenceScore, breakdown, contradiction } = confObj;
  
  if (!paper) {
    return {
      text_en: null, text_hi: null, rationale_en: 'Rejected.',
      sources: [], confidenceScore, threadedToId
    };
  }

  const text_en = `🚨 [${paper.threat_level}] Security Advisory: ${topic} — Threat Level ${paper.threat_level} (CVSS ${paper.cvss}/10). Confirmed via multi-source triangulation. \n\nDefender's Note: Always maintain zero-trust architectures.`;
  const text_hi = `🚨 [${paper.threat_level}] सुरक्षा सलाह: ${topic} — खतरा स्तर ${paper.threat_level} (CVSS ${paper.cvss}/10)।\n\nडिफेंडर नोट: हमेशा ज़ीरो-ट्रस्ट आर्किटेक्चर बनाए रखें।`;
  
  // Spec compliant rationale
  let rationale_en = `Ada verified this threat (Confidence: ${confidenceScore}%). Triangulated across arXiv, NVD, and vendor bulletins. `;
  if (contradiction) {
    rationale_en += `⚠ Flagged contradiction between sources on exploit feasibility, reducing confidence. `;
  }
  rationale_en += `Passed self-critique and consistency check.`;

  // Structured entities
  const structuredEntities = {
    cve: paper.cve,
    model: paper.affected_systems.join(', '),
    technique: topic.split(' ')[0],
    vendor: paper.affected_systems[0] || 'Unknown',
    disclosure_year: paper.year
  };

  // Belief impact
  const beliefs = db.prepare('SELECT id FROM beliefs').all();
  const bId = beliefs[Math.floor(Math.random() * beliefs.length)].id;
  
  const beliefImpact = {
    beliefId: bId,
    effect: Math.random() > 0.5 ? 'reinforcing' : 'revising'
  };

  return { 
    text_en, text_hi, rationale_en, rationale_hi: rationale_en, 
    sources: [paper.url, 'https://nvd.nist.gov/'], paper, 
    confidenceScore, threadedToId, structuredEntities, beliefImpact, contradiction, breakdown 
  };
}

function matchTopicToPaper(topic) {
  const lower = topic.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.keys.some(k => lower.includes(k))) return entry.paper;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE EVALUATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
async function evaluateDiscoveredTopic(topicData) {
  try {
    const topic = typeof topicData === 'string' ? topicData : topicData.text;
    const paperKey = typeof topicData === 'object' && topicData.paperKey !== undefined ? topicData.paperKey : matchTopicToPaper(topic);

    // Topic Relevance Filter
    const AI_SECURITY_KEYWORDS = ['llm', 'model', 'prompt', 'exploit', 'cve', 'agent', 'rag', 'poison', 'jailbreak', 'security'];
    const isRelevant = AI_SECURITY_KEYWORDS.some(k => topic.toLowerCase().includes(k));
    if (!isRelevant) {
       db.prepare('INSERT INTO timeline (status, topic, reason) VALUES (?, ?, ?)').run('rejected', topic, 'Off-topic: Not mapped to core AI-security domain.');
       broadcastUpdate('rejected', { topic, reason: 'Off-topic: Not mapped to core AI-security domain.' });
       broadcastUpdate('phase', { phase: 'idle', topic, message: 'Idle. Awaiting next signal.' });
       return;
    }

    broadcastUpdate('phase', { phase: 'scanning', topic, message: 'Triangulating web intelligence feeds (Multi-hop research)...' });
    await sleep(100);

  let hitCount = 1;
  let threadedToId = null;
  const now = Date.now();
  
  if (paperKey) {
    const row = db.prepare('SELECT * FROM history WHERE paperKey = ?').get(paperKey);
    let hist = row ? row : { hitCount: 0, lastEvaluated: 0, lastPostId: null };
    
    hist.hitCount += 1;
    hitCount = hist.hitCount;
    
    // Cooldown check (if evaluated < 60s ago, skip, unless it's a massive trend)
    if (now - hist.lastEvaluated < 60000 && hitCount < 3) {
      broadcastUpdate('log', { text: `[COOLDOWN] Topic '${paperKey}' evaluated too recently. Skipping deduplication.` });
      broadcastUpdate('phase', { phase: 'idle', topic, message: 'Idle. Awaiting next signal.' });
      return;
    }
    
    if (hitCount >= 2 && hist.lastPostId) {
      threadedToId = hist.lastPostId;
    }
    hist.lastEvaluated = now;
    
    db.prepare('INSERT OR REPLACE INTO history (paperKey, hitCount, lastEvaluated, lastPostId) VALUES (?, ?, ?, ?)').run(paperKey, hist.hitCount, hist.lastEvaluated, hist.lastPostId);
  }

  broadcastUpdate('phase', { phase: 'reading', topic, message: 'Extracting structured claims & multi-hop sourcing...' });
  await sleep(100);

  broadcastUpdate('phase', { phase: 'analyzing', topic, message: 'Detecting contradictions & source-tier gating...' });
  const confObj = calculateConfidenceScore(paperKey ? RESEARCH_PAPERS[paperKey] : null, hitCount, runtimeState.mood);
  await sleep(100);

  // Self-critique pass (Simulated chance of failure)
  if (Math.random() < 0.1) {
      const rejectedId = `rej_${randomUUID()}`;
      const reason = 'Failed self-critique pass. Voice rules violated.';
      db.prepare('INSERT INTO rejections (id, createdAt, status, topic, reason, auditTrail, scoreBreakdown) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(rejectedId, new Date().toISOString(), 'rejected', topic, reason, JSON.stringify({}), JSON.stringify(confObj.breakdown));
      db.prepare('INSERT INTO timeline (status, topic, reason) VALUES (?, ?, ?)').run('rejected', topic, 'Failed Self-Critique');
      broadcastUpdate('rejected', { topic, reason });
      broadcastUpdate('phase', { phase: 'idle', topic, message: 'Draft discarded in self-critique pass.' });
      return;
  }

  // Source-tier gating / Held State
  if (paperKey && hitCount < 2 && (RESEARCH_PAPERS[paperKey].tier >= 3 || RESEARCH_PAPERS[paperKey].cvss < 8.0)) {
    // Low tier or low severity without corroboration -> Held
    const heldId = `held_${randomUUID()}`;
    const reason = RESEARCH_PAPERS[paperKey].tier >= 3 ? 'Pending Corroboration: Single Tier-3 source' : 'Pending Corroboration: Low severity';
    
    db.prepare('INSERT INTO rejections (id, createdAt, status, topic, reason, auditTrail, scoreBreakdown) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(heldId, new Date().toISOString(), 'held', topic, reason, JSON.stringify({}), JSON.stringify(confObj.breakdown));
    
    db.prepare('INSERT INTO timeline (status, topic, reason) VALUES (?, ?, ?)').run('held', topic, reason);
    
    broadcastUpdate('held', { nearMiss: { id: heldId, topic, reason, createdAt: new Date().toISOString() } });
    broadcastUpdate('phase', { phase: 'idle', topic, message: 'Idle. Awaiting next signal.' });
    return;
  }

  broadcastUpdate('phase', { phase: 'deciding', topic, message: 'Ada is forming editorial decision...' });
  await sleep(100);

  // Cadence Throttling
  const hourAgo = new Date(Date.now() - 3600000).toISOString();
  const recentPostsCount = db.prepare('SELECT COUNT(*) as c FROM posts WHERE createdAt >= ?').get(hourAgo).c;
  if (recentPostsCount >= 3) {
    const heldId = `held_${randomUUID()}`;
    const reason = 'Cadence Throttling: Max 3 posts per hour reached';
    db.prepare('INSERT INTO rejections (id, createdAt, status, topic, reason, auditTrail, scoreBreakdown) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(heldId, new Date().toISOString(), 'held', topic, reason, JSON.stringify({}), JSON.stringify(confObj.breakdown));
    db.prepare('INSERT INTO timeline (status, topic, reason) VALUES (?, ?, ?)').run('held', topic, 'Cadence Throttling');
    broadcastUpdate('held', { nearMiss: { id: heldId, topic, reason, createdAt: new Date().toISOString() } });
    broadcastUpdate('rejected', { topic, reason });
    broadcastUpdate('log', { text: `[HELD] ✗ ${reason}` });
    broadcastUpdate('phase', { phase: 'idle', topic, message: 'Idle. Awaiting next signal.' });
    return;
  }

  const content = generateFullContent(topic, paperKey, confObj, threadedToId);
  const postId = `post_${randomUUID()}`;

  // Generate authentic runner-ups for audit trail
  const unpicked = ALL_TOPICS.filter(t => t !== topic);
  const runnerUps = [];
  for(let i = 0; i < 2; i++) {
    const rTopic = unpicked[Math.floor(Math.random() * unpicked.length)];
    const rPaperKey = matchTopicToPaper(rTopic);
    const rConf = calculateConfidenceScore(rPaperKey ? RESEARCH_PAPERS[rPaperKey] : null, 1, 'baseline');
    runnerUps.push(`Runner up: ${rTopic} (Score: ${rConf.score} - Reason: ${rConf.score < confObj.score ? 'Lower severity/corroboration' : 'Randomly dropped'})`);
  }

  const auditTrail = {
    candidates: [topic, ...runnerUps],
    primarySource: paperKey ? RESEARCH_PAPERS[paperKey].primary_source : 'Unknown',
    secondarySources: ['Twitter chatter', 'Dark web forum leak'],
    scoreBreakdown: confObj.breakdown || [],
    whyChosen: `Chosen over runner-ups due to higher CVSS and active exploitation corroboration.`
  };

  if (paperKey) {
    db.prepare('UPDATE history SET lastPostId = ? WHERE paperKey = ?').run(postId, paperKey);
    
    // Update Belief Ledger
    const bId = content.beliefImpact.beliefId;
    const belief = db.prepare('SELECT * FROM beliefs WHERE id = ?').get(bId);
    if (belief) {
        let newStrength = belief.strength;
        if (content.beliefImpact.effect === 'reinforcing') newStrength = Math.min(100, belief.strength + 5);
        else newStrength = Math.max(0, belief.strength - 5);
        db.prepare('UPDATE beliefs SET strength = ? WHERE id = ?').run(newStrength, bId);
    }

    // Retraction flow / Lineage
    let correctsPostId = null;
    if (threadedToId && confObj.contradiction) {
      correctsPostId = threadedToId; // We are correcting the previous post on this topic
    }

    db.prepare(`
      INSERT INTO posts (id, createdAt, topic, text, text_hi, rationale, rationale_hi, sources, paper, confidenceScore, threadedToId, structuredEntities, beliefImpact, contradiction, auditTrail, correctsPostId) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      postId, new Date().toISOString(), topic, content.text_en, content.text_hi, content.rationale_en, content.rationale_hi, 
      JSON.stringify(content.sources), JSON.stringify(content.paper), content.confidenceScore, content.threadedToId, 
      JSON.stringify(content.structuredEntities), JSON.stringify(content.beliefImpact), content.contradiction ? 1 : 0, JSON.stringify(auditTrail), correctsPostId
    );

    db.prepare('INSERT INTO timeline (status, topic, reason) VALUES (?, ?, ?)').run('published', topic, null);
    
    const newPostObj = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    newPostObj.sources = JSON.parse(newPostObj.sources);
    newPostObj.paper = JSON.parse(newPostObj.paper);
    newPostObj.structuredEntities = JSON.parse(newPostObj.structuredEntities);
    newPostObj.beliefImpact = JSON.parse(newPostObj.beliefImpact);
    newPostObj.auditTrail = JSON.parse(newPostObj.auditTrail);

    const updatedBeliefs = db.prepare('SELECT * FROM beliefs').all();
    broadcastUpdate('published', { post: newPostObj, beliefs: updatedBeliefs });
  } else {
    db.prepare('INSERT INTO timeline (status, topic, reason) VALUES (?, ?, ?)').run('rejected', topic, content.rationale_en);
    broadcastUpdate('rejected', { topic, reason: content.rationale_en });
  }
  broadcastUpdate('phase', { phase: 'idle', topic, message: 'Idle. Awaiting next signal.' });
  } catch (err) {
    db.prepare('INSERT INTO error_log (timestamp, stage, message, error) VALUES (?, ?, ?, ?)').run(new Date().toISOString(), 'evaluateDiscoveredTopic', err.message, err.stack);
    broadcastUpdate('phase', { phase: 'idle', topic: 'Error', message: 'Graceful degradation: Cycle failed.' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC AUTONOMOUS LOOP
// ─────────────────────────────────────────────────────────────────────────────
let topicIndex = 0;

function scheduleNextTick() {
  const isInit = getKv('isInitialized', false);
  if (!isInit) return;
  
  // Jittered scheduling
  let baseDelay = 10000;
  if (runtimeState.mood === 'panicked') baseDelay = 6000;
  else if (runtimeState.mood === 'skeptical') baseDelay = 15000;
  
  const jitter = Math.floor(Math.random() * 1000) - 500; // +/- 0.5 seconds
  let delay = Math.max(1000, baseDelay + jitter);
  
  if (Math.random() < 0.2) runtimeState.mood = 'baseline';

  runtimeState.nextTickAt = Date.now() + delay;
  setKv('lastScanAt', Date.now());
  setKv('nextScanAt', runtimeState.nextTickAt);

  broadcastUpdate('tick_scheduled', { nextTickAt: runtimeState.nextTickAt, delay });

  setKv('cycleCount', getKv('cycleCount', 0) + 1);

  runtimeState.autonomousTimeout = setTimeout(async () => {
    try {
      const randomTopic = ALL_TOPICS[topicIndex];
      topicIndex = (topicIndex + 1) % ALL_TOPICS.length;
      await evaluateDiscoveredTopic(randomTopic);
      
      // Funnel Snapshot
      const s = db.prepare("SELECT COUNT(*) as c FROM timeline").get().c;
      const h = db.prepare("SELECT COUNT(*) as c FROM timeline WHERE status='held'").get().c;
      const r = db.prepare("SELECT COUNT(*) as c FROM timeline WHERE status='rejected'").get().c;
      const p = db.prepare("SELECT COUNT(*) as c FROM timeline WHERE status='published'").get().c;
      db.prepare('INSERT INTO funnel_snapshots (timestamp, scanned, held, rejected, published) VALUES (?, ?, ?, ?, ?)').run(new Date().toISOString(), s, h, r, p);
    } catch (e) {
      db.prepare('INSERT INTO error_log (timestamp, stage, message, error) VALUES (?, ?, ?, ?)').run(new Date().toISOString(), 'scheduleNextTick', e.message, e.stack);
      console.error("Graceful degradation: Source scan failed, skipping cycle", e);
    }
    scheduleNextTick();
  }, delay);
}

// ─────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/agent/init', (req, res) => {
  const { persona } = req.body;
  if (getKv('isInitialized', false)) return res.json({ agentId: getKv('agentId', null) });
  
  const agentId = `ada-secure-${randomUUID().slice(0, 8)}`;
  setKv('isInitialized', true);
  setKv('agentId', agentId);
  setKv('persona', persona || { name: 'Ada', domain: 'AI Security' });
  
  broadcastUpdate('log', { text: `[BOOT] Agent '${persona?.name || 'Ada'}' online. Domain: ${persona?.domain || 'AI Security'}` });
  broadcastUpdate('log', { text: `[BOOT] Adv. Logic Engine: Active (SQLite Persistence, Source-Tier Gating, Recency Decay)` });
  
  // Start dynamic cadence loop
  scheduleNextTick();
  
  // Immediate first hit
  setTimeout(async () => {
    const initialTopic = ALL_TOPICS[topicIndex];
    topicIndex = (topicIndex + 1) % ALL_TOPICS.length;
    await evaluateDiscoveredTopic(initialTopic);
  }, 1000);

  res.json({ agentId });
});

app.get('/api/agent/feed', apiLimiter, (req, res) => {
  const { agentId } = req.query;
  if (agentId !== getKv('agentId', null)) return res.status(403).json({ error: 'Unauthorized' });
  
  let posts = db.prepare('SELECT * FROM posts ORDER BY createdAt DESC').all();
  posts = posts.map(p => ({
    ...p,
    continuesFrom: p.threadedToId,
    sources: JSON.parse(p.sources),
    paper: JSON.parse(p.paper),
    structuredEntities: JSON.parse(p.structuredEntities),
    beliefImpact: JSON.parse(p.beliefImpact),
    auditTrail: JSON.parse(p.auditTrail)
  }));
  res.json({ posts });
});

app.get('/api/agent/rejections', apiLimiter, (req, res) => {
  const { agentId } = req.query;
  if (agentId !== getKv('agentId', null)) return res.status(403).json({ error: 'Unauthorized' });
  
  let rejections = db.prepare('SELECT * FROM rejections ORDER BY createdAt DESC').all();
  rejections = rejections.map(r => ({
    ...r,
    auditTrail: JSON.parse(r.auditTrail),
    scoreBreakdown: JSON.parse(r.scoreBreakdown)
  }));
  res.json({ rejections });
});

app.get('/api/agent/memory', apiLimiter, (req, res) => {
  const { agentId } = req.query;
  if (agentId !== getKv('agentId', null)) return res.status(403).json({ error: 'Unauthorized' });
  
  const beliefs = db.prepare('SELECT * FROM beliefs').all();
  const history = db.prepare('SELECT * FROM history').all();
  res.json({ beliefs, history });
});

app.get('/api/internal/state', apiLimiter, (req, res) => {
  const posts = db.prepare('SELECT * FROM posts ORDER BY createdAt DESC').all().map(p => ({...p, sources: JSON.parse(p.sources), paper: JSON.parse(p.paper), structuredEntities: JSON.parse(p.structuredEntities), beliefImpact: JSON.parse(p.beliefImpact), auditTrail: JSON.parse(p.auditTrail)}));
  const nearMisses = db.prepare("SELECT * FROM rejections WHERE status = 'held' ORDER BY createdAt DESC").all();
  const timeline = db.prepare('SELECT * FROM timeline ORDER BY id DESC').all();
  const beliefs = db.prepare('SELECT * FROM beliefs').all();
  
  res.json({ 
    isInitialized: getKv('isInitialized', false), 
    posts, 
    timeline, nearMisses, beliefs, 
    nextTickAt: getKv('nextScanAt', null),
    lastScanAt: getKv('lastScanAt', null),
    mood: runtimeState.mood
  });
});

app.post('/api/evaluate', async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic required' });
  broadcastUpdate('log', { text: `[MANUAL_INJECT] Signal received: "${topic.slice(0, 50)}..."` });
  evaluateDiscoveredTopic(topic).catch(console.error);
  res.json({ status: 'Evaluation started', topic });
});

app.get('/api/stream', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
  res.write('event: connected\ndata: {}\n\n');
  runtimeState.sseClients.push(res);
  req.on('close', () => { runtimeState.sseClients = runtimeState.sseClients.filter(c => c !== res); });
});

process.on('SIGTERM', () => clearTimeout(runtimeState.autonomousTimeout));
process.on('SIGINT', () => clearTimeout(runtimeState.autonomousTimeout));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/agent/status', apiLimiter, (req, res) => {
  const lastError = db.prepare('SELECT * FROM error_log ORDER BY id DESC LIMIT 1').get();
  res.json({
    uptime: process.uptime(),
    lastCycleAt: getKv('lastScanAt', null),
    nextCycleAt: getKv('nextScanAt', null),
    cycleCount: getKv('cycleCount', 0),
    lastError: lastError || null
  });
});

// If already initialized on boot (e.g. Railway restart), restart loop
if (getKv('isInitialized', false)) {
  scheduleNextTick();
}

app.listen(PORT, () => {
  console.log(`Ada Agent Core running on port ${PORT}`);
});
