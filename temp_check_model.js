const { analyzeContent } = require('./model');

const samples = [
  {
    name: 'neutral fake',
    text: 'A viral social media post claims that drinking hot water every hour can completely eliminate all viruses from the body within 24 hours. Experts have not confirmed this claim.'
  },
  {
    name: 'trusted real',
    text: 'Reuters reports that the ministry confirmed the policy change in an official statement published on its website.'
  }
];

for (const sample of samples) {
  const result = analyzeContent(sample.text, 'text');
  console.log(sample.name, JSON.stringify({
    label: result.label,
    fakeProbability: result.fakeProbability,
    realProbability: result.realProbability,
    trustScore: result.trustScore,
    reasons: result.reasons.slice(0, 4)
  }, null, 2));
}
