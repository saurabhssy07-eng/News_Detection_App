const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 'he',
  'her', 'his', 'i', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'our', 'she', 'that',
  'the', 'their', 'them', 'there', 'this', 'to', 'was', 'were', 'will', 'with', 'you',
  'your', 'we', 'they', 'but', 'not', 'been', 'had', 'said', 'say', 'says', 'may',
  'can', 'could', 'would', 'should', 'about', 'after', 'before', 'more', 'most', 'new',
  'news', 'report', 'reports', 'according', 'official', 'source', 'sources', 'into',
  'over', 'under', 'between', 'within', 'also', 'than', 'then', 'out', 'up', 'down',
  'who', 'whom', 'which', 'what', 'when', 'where', 'why', 'how'
]);

const PUBLIC_LIKE_DATASET = [
  { label: 'real', text: 'Government releases official budget report after public review and parliamentary debate.' },
  { label: 'real', text: 'Researchers published a study in a peer reviewed journal describing the findings in detail.' },
  { label: 'real', text: 'The ministry confirmed the policy change in a written statement to journalists.' },
  { label: 'real', text: 'Local hospital data shows a decline in flu cases over the last two weeks.' },
  { label: 'real', text: 'Election results were verified by the commission and published on the official website.' },
  { label: 'real', text: 'Scientists at the university measured the results using multiple independent trials.' },
  { label: 'real', text: 'The company announced quarterly earnings and shared audited financial statements.' },
  { label: 'real', text: 'The court issued a decision and explained the legal basis in its judgment.' },
  { label: 'real', text: 'A city spokesperson said the road repair project will begin next month.' },
  { label: 'real', text: 'The article cites data from public records and interviews with named experts.' },
  { label: 'real', text: 'The weather service reported heavy rainfall and issued a flood advisory for the region.' },
  { label: 'real', text: 'Investigators published evidence, photographs, and timelines in the case file.' },
  { label: 'real', text: 'The public health agency released guidance supported by clinical research and statistics.' },
  { label: 'real', text: 'Parliament debated the bill and several members spoke on record during the session.' },
  { label: 'real', text: 'The museum confirmed the exhibition dates and ticket details on its official page.' },
  { label: 'real', text: 'A transport authority statement explained the train delay caused by signal maintenance.' },
  { label: 'real', text: 'Independent auditors reviewed the accounts and reported no material irregularities.' },
  { label: 'real', text: 'The article quotes named witnesses and includes a link to the public report.' },
  { label: 'real', text: 'Medical experts explained the treatment results and noted the limitations of the study.' },
  { label: 'real', text: 'The agency verified the incident using satellite imagery and emergency logs.' },

  { label: 'fake', text: 'Shocking secret cure guarantees instant weight loss for everyone with zero effort.' },
  { label: 'fake', text: 'Breaking: celebrities exposed in a massive scam that proves the government is hiding the truth.' },
  { label: 'fake', text: 'You will never believe this miracle device that cures every disease overnight.' },
  { label: 'fake', text: 'Urgent warning! This one simple trick will make your phone charge in seconds.' },
  { label: 'fake', text: 'Experts claim the moon is made of cheese and the proof is undeniable, share now.' },
  { label: 'fake', text: 'A viral post says the president resigned secretly, but no official source exists.' },
  { label: 'fake', text: 'This unbelievable headline reveals a hidden conspiracy behind all world events.' },
  { label: 'fake', text: 'Doctors hate this new hack because it reverses aging in only three days.' },
  { label: 'fake', text: 'Click now to claim your free laptop before the limited offer disappears forever.' },
  { label: 'fake', text: 'The article promises guaranteed profit from a secret investment strategy with no risk.' },
  { label: 'fake', text: 'A fake screenshot allegedly shows the policy change, but it has no verification.' },
  { label: 'fake', text: 'The scam message urges readers to enter passwords to unlock a reward.' },
  { label: 'fake', text: 'Rumors spread that the city was evacuated, yet no report or confirmation was provided.' },
  { label: 'fake', text: 'This outrageous claim says the study was suppressed by unnamed people.' },
  { label: 'fake', text: 'The post uses all caps and exclamation marks to push a dramatic hoax.' },
  { label: 'fake', text: 'An anonymous source says aliens landed downtown and the story is already confirmed.' },
  { label: 'fake', text: 'The headline promises a secret formula that beats inflation instantly.' },
  { label: 'fake', text: 'False claims say the election was canceled, but the post offers no evidence.' },
  { label: 'fake', text: 'The miracle supplement is advertised as guaranteed to cure every illness.' },
  { label: 'fake', text: 'A manipulated clip is shared as proof that the event never happened.' }
];

const CREDIBLE_DOMAINS = [
  'reuters.com',
  'apnews.com',
  'bbc.com',
  'bbc.co.uk',
  'thehindu.com',
  'nytimes.com',
  'washingtonpost.com',
  'wsj.com',
  'economist.com',
  'associatedpress.com'
];

const SATIRE_CUES = [
  'the onion',
  'babylon bee',
  'onion',
  'satire',
  'parody',
  'humor',
  'comedy',
  'joke article'
];

const CLAIM_VERB_CUES = [
  'claims',
  'claims that',
  'claimed',
  'alleges',
  'alleged',
  'reports that',
  'says that',
  'said that',
  'viral post',
  'social media post',
  'rumor',
  'rumours',
  'rumors',
  'no evidence',
  'not confirmed',
  'not verified',
  'unconfirmed',
  'unverified',
  'no official source',
  'no source',
  'experts have not confirmed',
  'has not been confirmed',
  'has not been verified'
];

const SIGNALS = {
  sensational: ['shocking', 'breaking', 'urgent', 'miracle', 'guaranteed', 'secret', 'exposed', 'unbelievable', 'exclusive', 'viral', 'hoax'],
  weakEvidence: ['according to reports', 'sources say', 'reports claim', 'experts say', 'rumors say', 'allegedly', 'supposedly', 'anonymous source', 'no official source', 'unverified', 'no verification', 'claims to have', 'apparently'],
  strongEvidence: ['official statement', 'peer reviewed', 'published study', 'verified by', 'public records', 'named experts', 'independent auditors', 'clinical trial', 'confirmed by', 'data shows', 'court issued', 'government release', 'official website', 'public review', 'links to the report', 'government announced', 'officials stated', 'initiative launched', 'policy change', 'policy announced'],
  absolutist: ['always', 'never', 'everyone', 'no one', 'undeniable', 'proof', 'guarantees', 'instantly', 'overnight', '100% success', '100% accurate', 'zero risk', 'cannot fail'],
  unrealistic: ['stop aging', 'reverse aging', 'live indefinitely', 'live forever', 'cure every disease', 'instant weight loss', 'instant profit', 'guaranteed profit', 'without effort', 'zero effort', 'overnight cure', 'beat inflation instantly', 'cure all'],
  impossible: ['moon is made of cheese', 'time travel', 'perpetual motion', 'free energy', 'defies physics', 'breaks the laws of physics', 'teleport', 'immortal', 'human bodies never age']
};

function normalizeWhitespace(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function tokenize(text) {
  return normalizeWhitespace(text)
    .toLowerCase()
    .match(/[a-z0-9']+/g)?.filter((token) => token.length > 2 && !STOP_WORDS.has(token)) || [];
}

function buildVocabulary(dataset, minDocumentFrequency = 1, maxVocabularySize = 4000) {
  const documentFrequency = new Map();

  for (const item of dataset) {
    const uniqueTokens = new Set(tokenize(item.text));
    for (const token of uniqueTokens) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }

  const orderedTerms = [...documentFrequency.entries()]
    .filter(([, freq]) => freq >= minDocumentFrequency)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxVocabularySize)
    .map(([term]) => term);

  const termToIndex = new Map();
  orderedTerms.forEach((term, index) => termToIndex.set(term, index));

  return { orderedTerms, termToIndex, documentFrequency };
}

function vectorize(text, vocabulary, idf) {
  const tokens = tokenize(text);
  const counts = new Map();

  for (const token of tokens) {
    if (vocabulary.termToIndex.has(token)) {
      counts.set(token, (counts.get(token) || 0) + 1);
    }
  }

  const vector = new Float64Array(vocabulary.orderedTerms.length);
  const totalTokens = [...counts.values()].reduce((sum, count) => sum + count, 0) || 1;

  for (const [term, count] of counts.entries()) {
    const index = vocabulary.termToIndex.get(term);
    const tf = count / totalTokens;
    vector[index] = tf * (idf[index] || 0);
  }

  return vector;
}

function computeIdf(dataset, vocabulary) {
  const totalDocs = dataset.length;
  return vocabulary.orderedTerms.map((term) => {
    const df = vocabulary.documentFrequency.get(term) || 0;
    return Math.log((1 + totalDocs) / (1 + df)) + 1;
  });
}

function sigmoid(value) {
  if (value >= 0) {
    const z = Math.exp(-value);
    return 1 / (1 + z);
  }
  const z = Math.exp(value);
  return z / (1 + z);
}

function dotProduct(a, b) {
  let sum = 0;
  for (let index = 0; index < a.length; index += 1) {
    sum += a[index] * b[index];
  }
  return sum;
}

function trainLogisticRegression(features, labels, { learningRate = 0.5, iterations = 350, regularization = 0.0005 } = {}) {
  const weights = new Float64Array(features[0]?.length || 0);
  let bias = 0;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const gradientW = new Float64Array(weights.length);
    let gradientB = 0;

    for (let index = 0; index < features.length; index += 1) {
      const x = features[index];
      const y = labels[index];
      const prediction = sigmoid(dotProduct(weights, x) + bias);
      const error = prediction - y;

      for (let term = 0; term < weights.length; term += 1) {
        gradientW[term] += error * x[term];
      }
      gradientB += error;
    }

    const scale = 1 / Math.max(features.length, 1);
    for (let term = 0; term < weights.length; term += 1) {
      const grad = gradientW[term] * scale + regularization * weights[term];
      weights[term] -= learningRate * grad;
    }
    bias -= learningRate * gradientB * scale;
  }

  return { weights, bias };
}

function trainTestSplit(dataset, testRatio = 0.25) {
  const shuffled = dataset.map((item) => ({ ...item }));
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor((index + 1) * 0.73) % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  const testSize = Math.max(1, Math.round(shuffled.length * testRatio));
  return {
    train: shuffled.slice(0, shuffled.length - testSize),
    test: shuffled.slice(shuffled.length - testSize)
  };
}

function predictProbability(model, text) {
  const vector = vectorize(text, model.vocabulary, model.idf);
  const linearScore = dotProduct(model.weights, vector) + model.bias;
  return sigmoid(linearScore);
}

function evaluateModel(model, dataset) {
  let correct = 0;
  const matrix = { real: { real: 0, fake: 0 }, fake: { real: 0, fake: 0 } };

  for (const item of dataset) {
    const proba = predictProbability(model, item.text);
    const predicted = proba >= 0.5 ? 'fake' : 'real';
    matrix[item.label][predicted] += 1;
    if (predicted === item.label) correct += 1;
  }

  const accuracy = correct / Math.max(dataset.length, 1);
  return { accuracy, matrix };
}

function createModel(dataset) {
  const { train, test } = trainTestSplit(dataset, 0.25);
  const vocabulary = buildVocabulary(train, 1, 3000);
  const idf = computeIdf(train, vocabulary);
  const trainFeatures = train.map((item) => vectorize(item.text, vocabulary, idf));
  const trainLabels = train.map((item) => (item.label === 'fake' ? 1 : 0));
  const classifier = trainLogisticRegression(trainFeatures, trainLabels);
  const model = {
    vocabulary,
    idf,
    weights: classifier.weights,
    bias: classifier.bias
  };
  const evaluation = evaluateModel(model, test);
  return { model, evaluation, trainSize: train.length, testSize: test.length };
}

const TRAINING_RESULT = createModel(PUBLIC_LIKE_DATASET);

function analyzeSentiment(text) {
  const positive = ['good', 'great', 'improve', 'success', 'positive', 'gain', 'benefit', 'growth', 'win'];
  const negative = ['bad', 'fake', 'lie', 'scam', 'crisis', 'loss', 'fear', 'harm', 'danger', 'fraud'];
  const words = tokenize(text);
  const pos = words.filter((word) => positive.includes(word)).length;
  const neg = words.filter((word) => negative.includes(word)).length;
  const score = pos - neg;
  const label = score > 1 ? 'Positive' : score < -1 ? 'Negative' : 'Neutral';
  return { label, pos, neg };
}

function buildSummary(text) {
  const sentences = normalizeWhitespace(text).split(/(?<=[.!?])\s+/).filter(Boolean);
  if (!sentences.length) return 'No readable content was found.';
  return sentences.slice(0, 3).join(' ');
}

function getDomainFromSourceText(text) {
  const value = normalizeWhitespace(text).toLowerCase();
  const urlMatches = [...value.matchAll(/https?:\/\/[^\s"')]+/g)].map((match) => match[0]);

  for (const candidate of urlMatches) {
    try {
      const hostname = new URL(candidate).hostname.toLowerCase().replace(/^www\./, '');
      return hostname;
    } catch (error) {
      continue;
    }
  }

  const domainMatch = value.match(/\b(?:www\.)?([a-z0-9.-]+\.[a-z]{2,})\b/i);
  return domainMatch ? domainMatch[1].toLowerCase() : '';
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function detectSignals(text) {
  const lower = normalizeWhitespace(text).toLowerCase();
  const signals = [];

  if (hasAny(lower, SIGNALS.sensational)) signals.push('sensational');
  if (hasAny(lower, SIGNALS.weakEvidence)) signals.push('weakEvidence');
  if (hasAny(lower, SIGNALS.strongEvidence)) signals.push('strongEvidence');
  if (hasAny(lower, SIGNALS.absolutist)) signals.push('absolutist');
  if (hasAny(lower, SIGNALS.unrealistic)) signals.push('unrealistic');
  if (hasAny(lower, SIGNALS.impossible)) signals.push('impossible');
  if (hasAny(lower, CLAIM_VERB_CUES)) signals.push('claimCue');

  if (countMatches(text, /!{2,}/g) > 0 || countMatches(text, /\b[A-Z]{5,}\b/g) > 0) {
    signals.push('loudFormatting');
  }

  if (hasAny(lower, SATIRE_CUES)) {
    signals.push('satire');
  }

  return signals;
}

function analyzeContent(rawText, sourceType = 'text') {
  const text = normalizeWhitespace(rawText);
  const lower = text.toLowerCase();
  const baseFakeProbability = predictProbability(TRAINING_RESULT.model, text);
  const signals = detectSignals(text);
  const domain = getDomainFromSourceText(text);

  const isCredibleDomain = CREDIBLE_DOMAINS.some((trusted) => domain === trusted || domain.endsWith(`.${trusted}`));
  const hasSatireCue = signals.includes('satire');
  const hasSensationalLanguage = signals.includes('sensational');
  const hasWeakEvidence = signals.includes('weakEvidence');
  const hasStrongEvidence = signals.includes('strongEvidence');
  const hasAbsolutistTone = signals.includes('absolutist');
  const hasUnrealisticClaim = signals.includes('unrealistic');
  const hasImpossibility = signals.includes('impossible');
  const hasClaimCue = signals.includes('claimCue');
  const hasLoudFormatting = signals.includes('loudFormatting');

  const questionMarks = countMatches(text, /\?/g);
  const uppercaseRatio = text.length ? (text.match(/[A-Z]/g) || []).length / text.length : 0;
  const hasMisleadingHeadline = /^(breaking|shocking|urgent|you won't believe|what happens next|exclusive)\b/i.test(text) || (hasSensationalLanguage && !hasStrongEvidence);
  const evidenceRegex = /\b(according to|reported|confirmed|published|study|data|official|statement|records|interview|spokesperson|research|report|proof|citation|cites|source|sources)\b/i;
  const lacksEvidence = !hasStrongEvidence && (hasWeakEvidence || !evidenceRegex.test(text));

  let sourceCredibility = 0.35;
  if (isCredibleDomain) sourceCredibility += 0.42;
  if (sourceType === 'url') sourceCredibility += 0.04;
  if (sourceType === 'pdf') sourceCredibility += 0.02;
  if (hasStrongEvidence) sourceCredibility += 0.22;
  if (hasWeakEvidence) sourceCredibility -= 0.06;
  sourceCredibility = clamp(sourceCredibility, 0, 1);

  let evidenceScore = 0.35;
  if (hasStrongEvidence) evidenceScore += 0.40;
  if (isCredibleDomain) evidenceScore += 0.18;
  if (hasWeakEvidence) evidenceScore -= 0.10;
  if (lacksEvidence) evidenceScore -= 0.10;
  if (hasSatireCue) evidenceScore -= 0.08;
  evidenceScore = clamp(evidenceScore, 0, 1);

  let claimRealismScore = 0.55;
  if (hasUnrealisticClaim) claimRealismScore -= 0.38;
  if (hasImpossibility) claimRealismScore -= 0.44;
  if (hasAbsolutistTone) claimRealismScore -= 0.10;
  if (hasClaimCue && lacksEvidence) claimRealismScore -= 0.08;
  if (questionMarks > 2) claimRealismScore -= 0.03;
  claimRealismScore = clamp(claimRealismScore, 0, 1);

  let toneScore = 0.35;
  if (hasSensationalLanguage) toneScore += 0.20;
  if (hasAbsolutistTone) toneScore += 0.10;
  if (hasLoudFormatting) toneScore += 0.08;
  if (hasStrongEvidence) toneScore -= 0.10;
  toneScore = clamp(toneScore, 0, 1);

  const hasFormalPolicy = /\b(government announced|officials stated|initiative launched|policy change|policy announced|ministry confirmed|minister said|spokesperson said)\b/i.test(text);

  const informationalContent =
    /\b(guide|guidance|overview|introduction|explains?|educational|tutorial|how to|what is|background|summary|definition|manual|handbook|reference|resources?)\b/i.test(text) &&
    !hasUnrealisticClaim &&
    !hasImpossibility &&
    !hasMisleadingHeadline &&
    !hasSensationalLanguage;

  const mlWeight = 0.18;
  const ruleWeight = 0.82;

  let scoreFromRules =
    (baseFakeProbability * mlWeight) +
    ((1 - sourceCredibility) * 0.26) +
    ((1 - evidenceScore) * 0.20) +
    ((1 - claimRealismScore) * 0.24) +
    (toneScore * 0.08) +
    (hasWeakEvidence ? 0.08 : 0) +
    (hasClaimCue && lacksEvidence ? 0.08 : 0) +
    (hasMisleadingHeadline ? 0.10 : 0) +
    (hasImpossibility ? 0.18 : 0) +
    (hasUnrealisticClaim ? 0.14 : 0) +
    (hasSatireCue ? 0.06 : 0) -
    (isCredibleDomain ? 0.16 : 0) -
    (hasStrongEvidence ? 0.12 : 0);

  if (hasFormalPolicy) {
    scoreFromRules -= 0.10;
  }

  if (toneScore <= 0.20 && !hasSensationalLanguage && !hasAbsolutistTone && !hasUnrealisticClaim && !hasImpossibility) {
    scoreFromRules -= 0.06;
  }

  let fakeProbability = clamp(scoreFromRules, 0.02, 0.98);
  let realProbability = 1 - fakeProbability;

  if (hasImpossibility) {
    fakeProbability = clamp(Math.max(fakeProbability, 0.86), 0.02, 0.98);
    realProbability = 1 - fakeProbability;
  }

  if (hasUnrealisticClaim && !isCredibleDomain) {
    fakeProbability = clamp(Math.max(fakeProbability, 0.76), 0.02, 0.98);
    realProbability = 1 - fakeProbability;
  }

  if (hasWeakEvidence && !hasStrongEvidence && !isCredibleDomain && !hasSatireCue) {
    fakeProbability = clamp(Math.max(fakeProbability, 0.72), 0.02, 0.98);
    realProbability = 1 - fakeProbability;
  }

  if (hasClaimCue && lacksEvidence && !hasStrongEvidence) {
    fakeProbability = clamp(Math.max(fakeProbability, 0.74), 0.02, 0.98);
    realProbability = 1 - fakeProbability;
  }

  if (hasMisleadingHeadline && !isCredibleDomain) {
    fakeProbability = clamp(Math.max(fakeProbability, 0.68), 0.02, 0.98);
    realProbability = 1 - fakeProbability;
  }

  if (isCredibleDomain && hasStrongEvidence && !hasImpossibility && !hasUnrealisticClaim) {
    fakeProbability = clamp(fakeProbability - 0.28, 0.02, 0.92);
    realProbability = 1 - fakeProbability;
  }

  if (hasSatireCue) {
    fakeProbability = clamp(fakeProbability - 0.14, 0.02, 0.92);
    realProbability = 1 - fakeProbability;
  }

  // === EXPLICIT SCORING THRESHOLDS ===
  const realScore = Math.round(realProbability * 100);
  const fakeScore = Math.round(fakeProbability * 100);
  
  // Detect strong signals for override decision-making
  const strongFakeSignals = hasImpossibility || hasUnrealisticClaim || (hasWeakEvidence && hasClaimCue && !hasStrongEvidence) || (hasMisleadingHeadline && !isCredibleDomain);
  const strongRealSignals = (isCredibleDomain && hasStrongEvidence) || (hasStrongEvidence && !hasSensationalLanguage && !hasAbsolutistTone) || hasFormalPolicy;
  
  // Detect structural/tone patterns that bias toward REAL
  const isFormalStructured = hasFormalPolicy || (hasStrongEvidence && !hasSensationalLanguage) || (toneScore <= 0.25 && !hasAbsolutistTone);
  const isNeutralNoExaggeration = toneScore <= 0.30 && !hasUnrealisticClaim && !hasImpossibility && !hasSensationalLanguage;
  
  // Detect red flags that strongly bias toward FAKE
  const hasClearFakeFlags = hasSensationalLanguage && (hasAbsolutistTone || hasUnrealisticClaim || hasImpossibility);
  
  let label = 'UNCERTAIN';

  if (informationalContent) {
    label = 'INFORMATIONAL / NON-NEWS';
  } 
  // === FORCED FAKE CLASSIFICATIONS (high confidence) ===
  else if (hasImpossibility) {
    label = 'FAKE NEWS';  // Impossible claims always fake
  } 
  else if (fakeScore >= 80) {
    label = 'FAKE NEWS';  // Very high fake probability
  } 
  else if (fakeScore >= 65 && (hasSensationalLanguage || hasAbsolutistTone || hasUnrealisticClaim)) {
    label = 'FAKE NEWS';  // High fake + red flags
  } 
  else if (fakeScore >= 60 && strongFakeSignals && !isCredibleDomain) {
    label = 'FAKE NEWS';  // Moderately high fake + multiple signals
  }
  // === FORCED REAL CLASSIFICATIONS (high confidence) ===
  else if (realScore >= 75) {
    label = 'REAL';  // Very high real probability
  } 
  else if (realScore >= 65 && (isCredibleDomain || hasStrongEvidence || strongRealSignals)) {
    label = 'REAL';  // High real probability + credibility signals
  } 
  else if (realScore >= 60) {
    label = 'REAL';  // Default to REAL when real score is >= 60
  }
  // === THRESHOLD-BASED DECISIONS ===
  else if (fakeScore >= 60) {
    label = 'FAKE NEWS';  // Fake score >= 60
  }
  // === BIAS TOWARD REAL (structured, neutral, formal) ===
  else if (isFormalStructured || isNeutralNoExaggeration || hasFormalPolicy) {
    label = 'REAL';  // Bias REAL for structured/formal/neutral content
  }
  // === BIAS TOWARD FAKE (sensational, unrealistic, absolute) ===
  else if (hasClearFakeFlags) {
    label = 'FAKE NEWS';  // Multiple red flags = fake
  }
  else if (fakeScore >= 50 && (hasSensationalLanguage || hasAbsolutistTone)) {
    label = 'FAKE NEWS';  // Moderate fake + sensational tone
  }
  // === DEFAULT: REAL IF NO STRONG FAKE SIGNALS ===
  else if (fakeScore <= 45 || !strongFakeSignals) {
    label = 'REAL';  // Default to REAL when fake score is low or no strong fake signals
  }
  // === FALLBACK: ONLY RETURN UNCERTAIN IF TRULY CONFLICTING ===
  else if (fakeScore >= 40 && fakeScore <= 60 && realScore >= 40 && realScore <= 60) {
    // Both scores in middle range with conflicting signals
    if (!strongFakeSignals && !strongRealSignals) {
      label = 'REAL';  // Prefer REAL when balanced and no strong signals
    } else {
      label = 'UNCERTAIN';
    }
  }
  else {
    label = 'REAL';  // Final fallback to REAL
  }
  
  // Satire override
  if (hasSatireCue && !isCredibleDomain && label !== 'FAKE NEWS') {
    label = 'REAL';  // Satire is not fake news, it's intentional
  }

  const confidence =
    label === 'FAKE NEWS' ? (fakeScore / 100) :
    label === 'REAL' ? (realScore / 100) :
    label === 'INFORMATIONAL / NON-NEWS' ? 0.85 :
    Math.max(fakeScore, realScore) / 100;

  const risk = fakeProbability >= 0.75 ? 'HIGH' : fakeProbability >= 0.5 ? 'MEDIUM' : 'LOW';

  const reasons = [];
  const addReason = (condition, reason) => {
    if (condition) reasons.push(reason);
  };

  addReason(informationalContent, 'ℹ️ Informational or explanatory content, not a direct news claim');
  addReason(hasSatireCue, '⚠️ Satire or parody cue detected');
  addReason(hasImpossibility, '❌ Contains a scientifically impossible claim');
  addReason(hasUnrealisticClaim, '❌ Makes an unrealistic scientific or commercial claim');
  addReason(hasWeakEvidence, '❌ Relies on weak, vague, or anonymous sourcing');
  addReason(lacksEvidence, '❌ Lacks verifiable evidence or named sourcing');
  addReason(hasClaimCue && lacksEvidence, '❌ Makes a claim without supporting evidence');
  addReason(hasMisleadingHeadline, '❌ Headline appears sensational or misleading');
  addReason(hasAbsolutistTone, '⚠️ Uses absolute or exaggerated certainty');
  addReason(hasSensationalLanguage, '⚠️ Uses sensational or clickbait language');
  addReason(hasLoudFormatting, '⚠️ Uses loud punctuation or all-caps emphasis');

  if (isCredibleDomain) reasons.push('✅ Credible source domain detected');
  if (hasStrongEvidence) reasons.push('✅ Contains verifiable references or evidence');

  if (!reasons.length) {
    reasons.push('No strong misinformation signals were detected');
  }

  const trustScore = Math.round(
    clamp(
      (sourceCredibility * 34) +
      (evidenceScore * 28) +
      (claimRealismScore * 22) +
      ((1 - toneScore) * 8) +
      ((1 - fakeProbability) * 8),
      0,
      100
    )
  );

  const finalVerdictReason =
    label === 'FAKE NEWS'
      ? 'The article contains weak evidence, claim cues, or unrealistic claims that outweigh neutral tone.'
      : label === 'REAL'
        ? isCredibleDomain
          ? 'A credible source domain and supporting evidence outweigh weak misinformation signals.'
          : 'The article has enough evidence cues and low misinformation risk to be treated as real.'
        : label === 'INFORMATIONAL / NON-NEWS'
          ? 'The content is informational rather than a news claim.'
          : hasSatireCue
            ? 'The content contains satire or parody cues, so it is not treated as a straightforward news claim.'
            : 'The content contains mixed signals, so the system cannot confidently label it.';

  const confidenceBand = fakeScore >= 85 ? '85–100' : fakeScore >= 70 ? '70–84' : fakeScore >= 55 ? '55–69' : 'Below 55';

  const keywordDictionary = {
    sensational: SIGNALS.sensational,
    weakEvidence: SIGNALS.weakEvidence,
    strongEvidence: SIGNALS.strongEvidence,
    absolutist: SIGNALS.absolutist,
    unrealistic: SIGNALS.unrealistic,
    impossible: SIGNALS.impossible,
    satire: SATIRE_CUES,
    claimCue: CLAIM_VERB_CUES
  };

  const keywordHits = Object.fromEntries(
    Object.entries(keywordDictionary).map(([bucket, terms]) => [bucket, terms.filter((term) => lower.includes(term)).slice(0, 5)])
  );

  const modelInfo = {
    type: 'hybrid-ml-plus-rules',
    trainingSamples: PUBLIC_LIKE_DATASET.length,
    trainSplit: TRAINING_RESULT.trainSize,
    testSplit: TRAINING_RESULT.testSize,
    vocabularySize: TRAINING_RESULT.model.vocabulary.orderedTerms.length,
    accuracy: Number(TRAINING_RESULT.evaluation.accuracy.toFixed(3)),
    confusionMatrix: TRAINING_RESULT.evaluation.matrix,
    scoringWeights: {
      mlWeight,
      ruleWeight,
      sourceCredibility: Number(sourceCredibility.toFixed(2)),
      evidence: Number(evidenceScore.toFixed(2)),
      claimRealism: Number(claimRealismScore.toFixed(2)),
      tone: Number(toneScore.toFixed(2)),
      fakeProbability: Number(fakeProbability.toFixed(2))
    },
    featureEngineering: [
      'sensational language',
      'weak or anonymous sourcing',
      'source credibility/domain trust',
      'claim-verbs without evidence',
      'unrealistic and impossible claims',
      'headline deception',
      'satire/parody cue detection'
    ]
  };

  return {
    label,
    realProbability,
    fakeProbability,
    realScore,
    fakeScore,
    confidence,
    confidenceBand,
    risk,
    sourceType,
    summary: buildSummary(text),
    sentiment: analyzeSentiment(text),
    reasons,
    explanations: reasons,
    keywordDictionary,
    keywordHits,
    sourceCredibility: Number(sourceCredibility.toFixed(2)),
    evidenceScore: Number(evidenceScore.toFixed(2)),
    claimRealismScore: Number(claimRealismScore.toFixed(2)),
    toneScore: Number(toneScore.toFixed(2)),
    trustScore,
    finalVerdictReason,
    modelInfo
  };
}

module.exports = {
  analyzeContent,
  tokenize,
  normalizeWhitespace
};
