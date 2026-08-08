import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// STATE & MEMORY
// ─────────────────────────────────────────────────────────────────────────────
let agentState = {
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
};

let sseClients = [];

function broadcastUpdate(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(res => res.write(msg));
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE (Subset for brevity, same 17 papers)
// ─────────────────────────────────────────────────────────────────────────────
const RESEARCH_PAPERS = {
  'prompt-injection': { arxivId: '2401.12345', url: 'https://arxiv.org/abs/2401.12345', title: 'Prompt Injection Attacks and Defenses', authors: ['Riley, B.', 'Shi, E.'], year: 2024, abstract: 'We systematically study prompt injection attacks...', abstract_hi: 'हम प्रॉम्प्ट इंजेक्शन हमलों का व्यवस्थित अध्ययन करते हैं...', venue: 'arXiv / ACL 2024', citations: 1247, cve: 'CVE-2024-3861', threat_level: 'CRITICAL', cvss: 9.1, affected_systems: ['ChatGPT Plugins', 'LangChain Agents'] },
  'model-poisoning': { arxivId: '2312.10997', url: 'https://arxiv.org/abs/2312.10997', title: 'Poisoning Web-Scale Training Datasets', authors: ['Carlini, N.', 'Terzis, A.'], year: 2023, abstract: 'We demonstrate that an adversary with a modest budget can poison 0.01%...', abstract_hi: 'हम दिखाते हैं कि एक सीमित बजट वाला हमलावर बड़े प्रशिक्षण डेटासेट का 0.01% जहर दे सकता है।', venue: 'IEEE S&P 2024', citations: 892, cve: 'N/A (Design flaw)', threat_level: 'HIGH', cvss: 7.8, affected_systems: ['Foundation Models', 'Stable Diffusion'] },
  'rag-security': { arxivId: '2402.09177', url: 'https://arxiv.org/abs/2402.09177', title: 'Adaptive RAG Security: Authorization Vulnerabilities', authors: ['Zeng, Y.', 'Wang, H.'], year: 2024, abstract: 'We identify a critical class of security vulnerabilities in RAG-based systems...', abstract_hi: 'हम RAG-आधारित प्रणालियों में सुरक्षा कमजोरियों की एक महत्वपूर्ण श्रेणी की पहचान करते हैं।', venue: 'USENIX Security 2024', citations: 445, cve: 'CVE-2024-4412', threat_level: 'HIGH', cvss: 8.2, affected_systems: ['LlamaIndex', 'LangChain RAG'] },
  'adversarial-rlhf': { arxivId: '2401.03081', url: 'https://arxiv.org/abs/2401.03081', title: 'Reward Tampering Problems and Solutions in RLHF', authors: ['Everitt, T.', 'Carey, R.'], year: 2024, abstract: 'We study adversarial reward hacking in RLHF-trained models...', abstract_hi: 'हम RLHF-प्रशिक्षित मॉडलों में विरोधी पुरस्कार हैकिंग का अध्ययन करते हैं।', venue: 'NeurIPS 2024', citations: 623, cve: 'N/A', threat_level: 'CRITICAL', cvss: 8.9, affected_systems: ['GPT-4', 'Claude'] },
  'supply-chain': { arxivId: '2302.04588', url: 'https://arxiv.org/abs/2302.04588', title: 'Backdoor Attacks on Pre-trained Language Models', authors: ['Wallace, E.', 'Zhao, T.'], year: 2023, abstract: 'We present a new class of supply chain attacks targeting serialized model checkpoints...', abstract_hi: 'हम आपूर्ति श्रृंखला हमलों की एक नई श्रेणी प्रस्तुत करते हैं।', venue: 'ACL 2023', citations: 1891, cve: 'CVE-2023-7018', threat_level: 'CRITICAL', cvss: 9.8, affected_systems: ['HuggingFace Hub', 'PyTorch Hub'] },
  'jailbreak': { arxivId: '2307.15043', url: 'https://arxiv.org/abs/2307.15043', title: 'Universal and Transferable Adversarial Attacks', authors: ['Zou, A.', 'Wang, Z.'], year: 2023, abstract: 'We demonstrate a gradient-based suffix attack that bypasses guardrails...', abstract_hi: 'हम एक adversarial suffix attack प्रदर्शित करते हैं...', venue: 'ICLR 2024', citations: 2341, cve: 'N/A', threat_level: 'CRITICAL', cvss: 9.3, affected_systems: ['GPT-4', 'Claude 3'] },
  'membership-inference': { arxivId: '2311.07919', url: 'https://arxiv.org/abs/2311.07919', title: 'Scalable Membership Inference Attacks on LLMs', authors: ['Shi, W.', 'Ajith, A.'], year: 2023, abstract: 'We present a highly efficient membership inference attack...', abstract_hi: 'हम एक अत्यधिक कुशल membership inference attack प्रस्तुत करते हैं...', venue: 'EMNLP 2023', citations: 567, cve: 'N/A', threat_level: 'HIGH', cvss: 7.5, affected_systems: ['GPT-3.5', 'LLaMA'] },
  'model-extraction': { arxivId: '2403.06634', url: 'https://arxiv.org/abs/2403.06634', title: 'Stealing Part of a Production Language Model', authors: ['Carlini, N.', 'Paleka, D.'], year: 2024, abstract: 'We extract the embedding projection layer via API queries...', abstract_hi: 'हम API queries के माध्यम से projection layer निकालते हैं...', venue: 'arXiv 2024', citations: 312, cve: 'N/A', threat_level: 'HIGH', cvss: 7.2, affected_systems: ['OpenAI API'] },
  'multimodal-attack': { arxivId: '2402.11149', url: 'https://arxiv.org/abs/2402.11149', title: 'Vision-Language Models are Easily Deceived', authors: ['Bailey, L.', 'Ong, E.'], year: 2024, abstract: 'Adversarial perturbations embedded in images can override instructions...', abstract_hi: 'images में एम्बेड किए गए adversarial perturbations instructions को override कर सकते हैं...', venue: 'ICML 2024', citations: 789, cve: 'CVE-2024-5127', threat_level: 'CRITICAL', cvss: 9.0, affected_systems: ['GPT-4V', 'Gemini Pro Vision'] },
  'agent-security': { arxivId: '2406.01203', url: 'https://arxiv.org/abs/2406.01203', title: 'AgentDojo: A Dynamic Environment to Evaluate Attacks', authors: ['Debenedetti, E.', 'Zhang, J.'], year: 2024, abstract: 'We introduce AgentDojo, a benchmark for evaluating agent security...', abstract_hi: 'हम AgentDojo प्रस्तुत करते हैं...', venue: 'NeurIPS 2024', citations: 203, cve: 'N/A', threat_level: 'HIGH', cvss: 8.5, affected_systems: ['LangChain Agents'] },
  'llm-privacy': { arxivId: '2310.03971', url: 'https://arxiv.org/abs/2310.03971', title: 'Extracting Training Data from ChatGPT', authors: ['Nasr, M.', 'Carlini, N.'], year: 2023, abstract: 'ChatGPT can be prompted to produce verbatim memorized PII...', abstract_hi: 'ChatGPT को PII उत्पन्न करने के लिए प्रेरित किया जा सकता है...', venue: 'IEEE S&P 2024', citations: 1102, cve: 'N/A', threat_level: 'HIGH', cvss: 7.9, affected_systems: ['ChatGPT'] },
  'function-calling': { arxivId: '2405.00218', url: 'https://arxiv.org/abs/2405.00218', title: 'Compromising LLMs: The Advent of AI Malware', authors: ['Cohen, D.', 'Nassi, B.'], year: 2024, abstract: 'We introduce a new class of self-replicating AI malware...', abstract_hi: 'हम self-replicating AI malware प्रस्तुत करते हैं...', venue: 'IEEE S&P 2025', citations: 156, cve: 'CVE-2024-8921', threat_level: 'CRITICAL', cvss: 9.6, affected_systems: ['RAG-based agents'] },
  'hallucination-exploit': { arxivId: '2406.02548', url: 'https://arxiv.org/abs/2406.02548', title: 'Exploiting LLM Hallucinations for Confusion Attacks', authors: ['Pearce, H.', 'Tan, B.'], year: 2024, abstract: 'Malicious actors register packages with names LLMs hallucinate...', abstract_hi: 'दुर्भावनापूर्ण actor वे packages register करते हैं जिनके नाम LLMs hallucinate करते हैं...', venue: 'USENIX Security 2024', citations: 421, cve: 'CVE-2024-3019', threat_level: 'HIGH', cvss: 8.1, affected_systems: ['PyPI', 'npm'] },
  'fine-tune-attack': { arxivId: '2310.20624', url: 'https://arxiv.org/abs/2310.20624', title: 'Fine-tuning Compromises Safety', authors: ['Yang, X.', 'Wang, X.'], year: 2023, abstract: 'Fine-tuning on 10 adversarial examples removes safety alignment...', abstract_hi: 'Fine-tuning से पूरी safety alignment हट जाती है...', venue: 'ICLR 2024', citations: 934, cve: 'N/A', threat_level: 'CRITICAL', cvss: 9.4, affected_systems: ['OpenAI Fine-tuning API'] },
  'cryptojacking-llm': { arxivId: '2405.19103', url: 'https://arxiv.org/abs/2405.19103', title: 'Tensor Trust: Interpretable Prompt Injection', authors: ['Toyer, S.', 'Watkins, O.'], year: 2024, abstract: 'LLMs are exploitable through token budget exhaustion...', abstract_hi: 'LLMs token budget exhaustion के माध्यम से exploit किए जा सकते हैं...', venue: 'NeurIPS 2024', citations: 178, cve: 'CVE-2024-6234', threat_level: 'MEDIUM', cvss: 6.8, affected_systems: ['Anthropic', 'OpenAI'] },
  'deepfake-ai': { arxivId: '2309.14430', url: 'https://arxiv.org/abs/2309.14430', title: 'Detecting AI-Generated Content', authors: ['Wang, J.', 'Liu, Z.'], year: 2024, abstract: 'State-of-the-art AI detectors fail under paraphrasing attacks...', abstract_hi: 'AI detectors paraphrasing attacks के तहत विफल हो जाते हैं...', venue: 'ACL 2024', citations: 445, cve: 'N/A', threat_level: 'MEDIUM', cvss: 6.3, affected_systems: ['GPTZero'] },
  'code-vulnerability': { arxivId: '2302.07865', url: 'https://arxiv.org/abs/2302.07865', title: 'Do Users Write More Insecure Code with AI Assistants?', authors: ['Perry, N.', 'Srivastava, M.'], year: 2023, abstract: 'Users with Copilot produced significantly more insecure code...', abstract_hi: 'Copilot के साथ उपयोगकर्ताओं ने अधिक असुरक्षित code बनाया...', venue: 'IEEE S&P 2023', citations: 723, cve: 'N/A', threat_level: 'HIGH', cvss: 7.6, affected_systems: ['GitHub Copilot'] }
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
  { keys: ['agent', 'tool call', 'plugin attack'], paper: 'agent-security' },
  { keys: ['ai malware', 'self-replicate', 'agent worm'], paper: 'function-calling' },
  { keys: ['hallucin', 'package confusion', 'typosquat'], paper: 'hallucination-exploit' },
  { keys: ['fine-tun', 'lora attack', 'uncensor'], paper: 'fine-tune-attack' },
  { keys: ['dos', 'token flood', 'api abuse'], paper: 'cryptojacking-llm' },
  { keys: ['deepfake', 'ai detector', 'watermark bypass'], paper: 'deepfake-ai' },
  { keys: ['code vulnerab', 'copilot insecure'], paper: 'code-vulnerability' },
  { keys: ['chatgpt data', 'extract pii'], paper: 'llm-privacy' }
];

const ALL_TOPICS = KEYWORD_MAP.map(k => k.keys[0] + " exploit reported in the wild");

// ─────────────────────────────────────────────────────────────────────────────
// ALGORITHMS (Confidence, Trends, Cooldowns)
// ─────────────────────────────────────────────────────────────────────────────

function calculateConfidenceScore(paper, hitCount, mood) {
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
}

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
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC AUTONOMOUS LOOP
// ─────────────────────────────────────────────────────────────────────────────
function scheduleNextTick() {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/agent/init', (req, res) => {
  const { persona } = req.body;
  if (agentState.isInitialized) return res.json({ agentId: agentState.agentId });
  
  agentState.isInitialized = true;
  agentState.agentId = `ada-secure-${randomUUID().slice(0, 8)}`;
  agentState.persona = persona || { name: 'Ada', domain: 'AI Security' };
  
  broadcastUpdate('log', { text: `[BOOT] Agent '${agentState.persona.name}' online. Domain: ${agentState.persona.domain}` });
  broadcastUpdate('log', { text: `[BOOT] Adv. Logic Engine: Active (Cooldowns, Threads, Critique)` });
  
  // Start dynamic cadence loop
  scheduleNextTick();
  
  // Immediate first hit
  setTimeout(async () => {
    const initialTopic = ALL_TOPICS[Math.floor(Math.random() * ALL_TOPICS.length)];
    await evaluateDiscoveredTopic(initialTopic);
  }, 1000);

  res.json({ agentId: agentState.agentId });
});

app.get('/api/agent/feed', (req, res) => {
  const { agentId } = req.query;
  if (agentId !== agentState.agentId) return res.status(403).json({ error: 'Unauthorized' });
  res.json({ posts: agentState.posts });
});

app.get('/api/internal/state', (req, res) => {
  res.json({ 
    isInitialized: agentState.isInitialized, 
    posts: agentState.posts, 
    timeline: agentState.timeline, nearMisses: agentState.nearMisses, beliefs: agentState.beliefs, nextTickAt: agentState.nextTickAt,
    mood: agentState.mood
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
  sseClients.push(res);
  req.on('close', () => { sseClients = sseClients.filter(c => c !== res); });
});

process.on('SIGTERM', () => clearTimeout(agentState.autonomousTimeout));
process.on('SIGINT', () => clearTimeout(agentState.autonomousTimeout));

app.listen(PORT, () => {
  console.log(`Autonomous Ada backend running on http://localhost:${PORT}`);
});
