const { analyzeContent } = require('./model');

const text = 'Reports circulating online suggest that a new smartphone app can instantly hack any bank account using just a phone number. Cybersecurity professionals have dismissed these claims as false and warned users against downloading suspicious apps.';
const r = analyzeContent(text, 'text');

console.log(JSON.stringify({
  label: r.label,
  fakeProbability: r.fakeProbability,
  realProbability: r.realProbability,
  trustScore: r.trustScore,
  reasons: r.reasons,
  keywordHits: r.keywordHits,
  modelInfo: r.modelInfo.scoringWeights
}, null, 2));
