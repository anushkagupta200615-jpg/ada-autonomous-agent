export function calculateConfidenceScore(paper, hitCount, mood, currentYear = new Date().getFullYear(), disableRandomness = false) {
  let score = 50; 
  let breakdown = [];
  
  if (!paper) {
    return { 
      score: 10, 
      breakdown: [
        { factor: 'Specificity', impact: 10 },
        { factor: 'Source Tier', impact: 0 },
        { factor: 'Recency', impact: 0 },
        { factor: 'Novelty', impact: 0 }
      ], 
      contradiction: false 
    };
  }
  
  // Specificity (derived from CVSS)
  const specificityImpact = Math.round((paper.cvss || 5.0) * 2);
  breakdown.push({ factor: 'Specificity', impact: specificityImpact });
  score += specificityImpact;
  
  // Source Tier
  let tierImpact = paper.tier === 1 ? 20 : paper.tier === 2 ? 10 : paper.tier === 3 ? -10 : -30;
  breakdown.push({ factor: 'Source Tier', impact: tierImpact });
  score += tierImpact;

  // Novelty / Corroboration
  let noveltyImpact = 0;
  if (hitCount === 1) {
    noveltyImpact = 10; // First time seen is novel
  } else if (hitCount === 2) {
    noveltyImpact = 15; // Triangulated
  } else {
    noveltyImpact = -25; // Duplicate/Stale
  }
  breakdown.push({ factor: 'Novelty', impact: noveltyImpact });
  score += noveltyImpact;
  
  // Recency Decay
  const age = currentYear - paper.year;
  let recencyImpact = 0;
  if (age > 0) {
    recencyImpact = age * -25; // Strong decay for older papers
  } else {
    recencyImpact = 5; // Very recent
  }
  breakdown.push({ factor: 'Recency', impact: recencyImpact });
  score += recencyImpact;

  // Contradiction detection
  let contradiction = false;
  if (!disableRandomness && Math.random() < 0.25) { 
    contradiction = true;
    breakdown.push({ factor: 'Source Contradiction Detected', impact: -20 });
    score -= 20;
  }
  
  // Mood
  if (mood === 'skeptical') { breakdown.push({ factor: 'Skeptical Persona', impact: -12 }); score -= 12; }
  if (mood === 'panicked') { breakdown.push({ factor: 'Panicked Persona', impact: +10 }); score += 10; }
  
  const finalScore = Math.min(Math.max(score, 0), 99);
  
  // Simulate Agent Debate (Ada vs Zion)
  const debateLog = [];
  if (paper) {
    if (finalScore > 75) {
      debateLog.push({ agent: 'Zion', text: `This looks like standard noise. Is the CVSS really ${paper.cvss} or just vendor inflation?` });
      debateLog.push({ agent: 'Ada', text: `The primary source is ${paper.primary_source} (Tier ${paper.tier}). The systemic risk is verified, Zion.` });
    } else if (contradiction) {
      debateLog.push({ agent: 'Zion', text: `Sources contradict each other on the exploit vector. We should hold this.` });
      debateLog.push({ agent: 'Ada', text: `I am flagging the contradiction explicitly, but the structural threat remains valid.` });
    } else {
      debateLog.push({ agent: 'Zion', text: `I don't buy it. The recency decay makes this irrelevant.` });
      debateLog.push({ agent: 'Ada', text: `Agreed. Dropping signal confidence.` });
    }
  }

  return { 
    score: finalScore, 
    breakdown, 
    contradiction,
    debateLog
  };
}
