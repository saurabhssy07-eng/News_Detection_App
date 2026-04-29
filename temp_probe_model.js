const { analyzeContent } = require('./model');

const samples = [
  'This is an official statement from the ministry confirming the policy change.',
  'shocking secret cure guarantees instant weight loss for everyone'
];

for (const sample of samples) {
  try {
    const result = analyzeContent(sample, 'text');
    console.log(JSON.stringify({
      label: result.label,
      risk: result.risk,
      confidenceBand: result.confidenceBand,
      trustScore: result.trustScore
    }));
  } catch (error) {
    console.error('ERR', error && error.stack ? error.stack : error);
    process.exitCode = 1;
  }
}
