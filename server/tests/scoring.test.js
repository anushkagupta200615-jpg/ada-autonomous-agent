import { calculateConfidenceScore } from '../scoring.js';

describe('ADA Confidence Scoring Rubric', () => {
  const CURRENT_YEAR = 2024;
  
  test('(a) single-source low-tier topic → scored low (held/rejected)', () => {
    const paper = { cvss: 4.5, tier: 3, year: 2024 };
    const hitCount = 1;
    const mood = 'baseline';
    const result = calculateConfidenceScore(paper, hitCount, mood, CURRENT_YEAR, true);
    
    // Base 50 + Specificity 9 + Tier -10 + Novelty 10 + Recency 5 = 64
    expect(result.score).toBeLessThan(75);
    expect(result.breakdown).toContainEqual({ factor: 'Source Tier', impact: -10 });
  });

  test('(b) duplicate/near-duplicate of recently published topic → rejected (scored down)', () => {
    const paper = { cvss: 8.5, tier: 1, year: 2024 };
    const hitCount = 3; // >2 means duplicate
    const mood = 'baseline';
    const result = calculateConfidenceScore(paper, hitCount, mood, CURRENT_YEAR, true);
    
    // Base 50 + Spec 17 + Tier 20 + Novelty -25 + Recency 5 = 67
    expect(result.score).toBeLessThan(75);
    expect(result.breakdown).toContainEqual({ factor: 'Novelty', impact: -25 });
  });

  test('(c) stale event with high recency-decay → scored below threshold', () => {
    const paper = { cvss: 9.8, tier: 1, year: 2021 }; // 3 years old
    const hitCount = 1;
    const mood = 'baseline';
    const result = calculateConfidenceScore(paper, hitCount, mood, CURRENT_YEAR, true);
    
    // Base 50 + Spec 20 + Tier 20 + Novelty 10 + Recency -75 = 25
    expect(result.score).toBeLessThan(75);
    expect(result.breakdown).toContainEqual({ factor: 'Recency', impact: -75 });
  });

  test('(d) high-tier multi-source topic → published (high score)', () => {
    const paper = { cvss: 9.0, tier: 1, year: 2024 };
    const hitCount = 2; // triangulated
    const mood = 'baseline';
    const result = calculateConfidenceScore(paper, hitCount, mood, CURRENT_YEAR, true);
    
    // Base 50 + Spec 18 + Tier 20 + Novelty 15 + Recency 5 = 108 (capped at 99)
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.breakdown).toContainEqual({ factor: 'Novelty', impact: 15 });
  });
  
  test('Missing paper -> scores 10 safely', () => {
    const result = calculateConfidenceScore(null, 1, 'baseline', CURRENT_YEAR, true);
    expect(result.score).toBe(10);
  });
});
