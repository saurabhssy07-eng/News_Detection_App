const { analyzeContent } = require('./model');

const samples = [
  'fake_score = 0',
  'if "100% success" in text: fake_score += 0.3',
  'if "live indefinitely" in text: fake_score += 0.3',
  'if no_sources_detected: fake_score += 0.4',
  'if fake_score > 0.6: prediction = "FAKE"',
  'The ministry confirmed the policy change in a written statement to journalists.',
  'A post says the city was evacuated, but no official source exists.',
  'Doctors say a miracle supplement can stop aging and cure every disease with 100% success. There is no verified source.',
  'This treatment promises to let people live indefinitely with zero effort and no risk.'
];

for (const text of samples) {
  const result = analyzeContent(text, 'text');
  console.log('---');
  console.log(text);
  console.log(JSON.stringify({
    label: result.label,
    fakeProbability: result.fakeProbability,
    realProbability: result.realProbability,
    confidence: result.confidence,
    risk: result.risk,
    explanations: result.explanations
  }, null, 2));
}
