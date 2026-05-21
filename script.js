const state = {
  historyKey: "newsguard_history_v2",
  themeKey: "newsguard_theme_v1",
  apiBase: (() => {
    const origin = window.location.origin || "";
    const isLocalHttp = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin);

    // Local dev: if frontend isn't on 3000, assume backend is on 3000
    if (isLocalHttp) {
      const currentPort = new URL(origin).port;
      return currentPort === "3000" ? origin.replace(/\/$/, "") : "http://localhost:3000";
    }

    // Production/staging: default to same-origin (avoids CORS)
    const apiFromMeta = document.querySelector('meta[name="api-base"]')?.content?.trim();
    if (apiFromMeta) {
      return apiFromMeta.replace(/\/$/, "");
    }

    return origin.replace(/\/$/, "");
  })()
};

const els = {};

function $(id) {
  return document.getElementById(id);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  const input = String(value);
  return input
    .split(String.fromCharCode(38)).join(String.fromCharCode(38) + "amp;")
    .split(String.fromCharCode(60)).join(String.fromCharCode(38) + "lt;")
    .split(String.fromCharCode(62)).join(String.fromCharCode(38) + "gt;")
    .split(String.fromCharCode(34)).join(String.fromCharCode(38) + "quot;")
    .split(String.fromCharCode(39)).join(String.fromCharCode(38) + "#39;");
}

function getWords(text) {
  return (text.toLowerCase().match(/[a-z']+/g) || []);
}

function getSentences(text) {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function titleCase(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function cacheElements() {
  const ids = [
    "theme-toggle", "hamburger", "side-menu", "close-menu", "overlay",
    "landing-page", "analyzer-app", "pages-container", "text-input",
    "url-input", "pdf-input", "upload-area", "loader", "loader-progress",
    "loader-text", "loader-percent", "results", "real-progress", "fake-progress",
    "real-percent", "fake-percent", "classification", "risk-level",
    "model-confidence", "decision-confidence", "explanation-block",
    "explanation-list", "summary-text", "sentiment-display", "history-list",
    "error-page", "error-message"
  ];

  ids.forEach((id) => {
    const key = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    els[key] = $(id);
  });

  els.tabButtons = document.querySelectorAll(".tab-btn");
  els.tabContents = document.querySelectorAll(".tab-content");
  els.pageSections = document.querySelectorAll(".page-section");
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(state.themeKey, theme);
  if (els.themeToggle) {
    els.themeToggle.innerHTML = theme === "dark" ? '<i class="fa fa-moon-o"></i>' : '<i class="fa fa-sun-o"></i>';
  }
}

function initTheme() {
  setTheme(localStorage.getItem(state.themeKey) || "dark");
}

function openMenu() {
  els.sideMenu.classList.add("open");
  els.overlay.classList.add("visible");
  document.body.classList.add("modal-open");
}

function closeMenu() {
  els.sideMenu.classList.remove("open");
  els.overlay.classList.remove("visible");
  document.body.classList.remove("modal-open");
}

function clearActivePages() {
  els.pageSections.forEach((section) => section.classList.remove("active"));
}

function showLanding() {
  els.landingPage.style.display = "block";
  els.analyzerApp.style.display = "none";
  els.pagesContainer.style.display = "none";
  clearActivePages();
  closeMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAnalyzer() {
  els.landingPage.style.display = "none";
  els.analyzerApp.style.display = "block";
  els.pagesContainer.style.display = "none";
  clearActivePages();
  clearResults();
  closeMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPage(pageId) {
  els.landingPage.style.display = "none";
  els.analyzerApp.style.display = "none";
  els.pagesContainer.style.display = "block";
  clearActivePages();
  const section = $(`${pageId}-page`);
  if (section) section.classList.add("active");
  closeMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAbout() { showPage("about"); }
function showDeveloper() { showPage("developer"); }
function showMoreApps() { showPage("more-apps"); }
function showHowItWorks() { showPage("how-it-works"); }
function showFeatures() { showPage("features"); }
function showContact() { showPage("contact"); }
function showHistory() { showPage("history"); renderHistory(); }

function setTab(type) {
  els.tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === type));
  els.tabContents.forEach((tab) => tab.classList.toggle("active", tab.id === `${type}-tab`));
}

function showLoader(label) {
  els.loader.style.display = "block";
  els.loaderText.textContent = `${label}...`;
  els.loaderPercent.textContent = "0%";
  els.loaderProgress.style.width = "0%";
}

function animateLoader() {
  return new Promise((resolve) => {
    let progress = 0;
    els.loaderProgress.style.width = "0%";
    els.loaderPercent.textContent = "0%";

    const timer = setInterval(() => {
      progress = Math.min(progress + 8, 96);
      els.loaderProgress.style.width = `${progress}%`;
      els.loaderPercent.textContent = `${progress}%`;
      if (progress >= 96) clearInterval(timer);
    }, 70);

    setTimeout(() => {
      clearInterval(timer);
      els.loaderProgress.style.width = "100%";
      els.loaderPercent.textContent = "100%";
      resolve();
    }, 850);
  });
}

function hideLoader() {
  els.loader.style.display = "none";
}

function analyzeSentiment(text) {
  const positive = ["good", "great", "improve", "success", "positive", "gain", "benefit", "growth", "win"];
  const negative = ["bad", "fake", "lie", "scam", "crisis", "loss", "fear", "harm", "danger", "fraud"];
  const words = getWords(text);
  const pos = words.filter((word) => positive.includes(word)).length;
  const neg = words.filter((word) => negative.includes(word)).length;
  const score = pos - neg;
  const label = score > 1 ? "Positive" : score < -1 ? "Negative" : "Neutral";
  return { label, pos, neg };
}

function buildSummary(text) {
  const sentences = getSentences(text);
  if (!sentences.length) return "No readable content was found.";

  const ranked = sentences.map((sentence) => {
    let score = getWords(sentence).length;
    if (/\b(according to|report|study|data|source|official|evidence)\b/i.test(sentence)) score += 3;
    if (/\b(important|major|significant|breaking|reveals|announces)\b/i.test(sentence)) score += 2;
    return { sentence, score };
  });

  return ranked.sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.sentence).join(" ");
}

function buildExplanations(ctx) {
  const items = [];
  const add = (condition, text) => {
    if (condition) items.push(text);
  };

  add(ctx.hasUnrealisticClaim, "❌ Makes an unrealistic scientific or commercial claim");
  add(ctx.hasImpossibility, "❌ Contains a scientifically impossible claim");
  add(ctx.hasWeakSource, "❌ Relies on unverified, weak, or anonymous sourcing");
  add(ctx.hasNoVerifiedSource, "❌ Does not name a verifiable source, institution, or official record");
  add(ctx.hasExaggeratedCertainty, "❌ Uses absolute or exaggerated certainty");
  add(ctx.hasSensationalLanguage, "❌ Uses sensational or clickbait language");
  add(ctx.hasLoudFormatting, "❌ Uses loud punctuation or all-caps emphasis");
  add(ctx.hasVerifiedSource && !ctx.hasWeakSource, "✅ Includes verifiable references or institutions");
  add(ctx.sourceType === "url", "✅ URL can be cross-checked against source structure");
  add(ctx.sourceType === "pdf", "✅ PDF can be inspected for citations and evidence");
  if (!items.length) items.push("No strong misinformation signals were detected.");
  return items.slice(0, 6);
}

function analyzeTextHeuristically(rawText, sourceType) {
  const text = normalizeWhitespace(rawText);
  const words = getWords(text);
  const sentences = getSentences(text);
  const wordCount = words.length;
  const uniqueCount = new Set(words).size;
  const avgSentenceLength = sentences.length ? wordCount / sentences.length : wordCount;

  const hypeTerms = ["shocking", "breaking", "miracle", "secret", "hoax", "conspiracy", "urgent", "cure", "guaranteed", "exposed"];
  const certaintyTerms = ["always", "never", "100%", "proof", "undeniable", "everyone", "no one", "the truth"];
  const factTerms = ["according to", "report", "study", "data", "official", "research", "source", "evidence"];
  const emotionalTerms = ["amazing", "horrific", "outrageous", "disgusting", "panic", "fear", "terrifying", "incredible"];

  const countMatches = (terms) => terms.reduce((sum, term) => sum + (text.toLowerCase().includes(term) ? 1 : 0), 0);

  const hypeScore = countMatches(hypeTerms);
  const certaintyScore = countMatches(certaintyTerms);
  const factScore = countMatches(factTerms);
  const emotionalScore = countMatches(emotionalTerms);
  const punctuationScore = (text.match(/!{2,}|[A-Z]{5,}/g) || []).length;
  const quoteScore = (text.match(/["“”]/g) || []).length > 4 ? 1 : 0;
  const sourcePenalty = sourceType === "url" ? 0.05 : sourceType === "pdf" ? -0.03 : 0;

  let fakeProbability =
    0.22 +
    hypeScore * 0.08 +
    certaintyScore * 0.07 +
    emotionalScore * 0.05 +
    punctuationScore * 0.04 -
    factScore * 0.05 -
    Math.min(uniqueCount / Math.max(wordCount, 1), 0.25) +
    Math.max((avgSentenceLength - 22) / 120, -0.08) +
    sourcePenalty +
    quoteScore * 0.03;

  fakeProbability = clamp(fakeProbability, 0.05, 0.95);
  const realProbability = 1 - fakeProbability;

  const label = fakeProbability >= 0.55 ? "FAKE NEWS" : fakeProbability <= 0.35 ? "LIKELY REAL" : "UNCERTAIN";
  const confidence = label === "FAKE NEWS" ? fakeProbability : realProbability;
  const risk = fakeProbability >= 0.7 ? "High Risk" : fakeProbability >= 0.45 ? "Medium Risk" : "Low Risk";

  const hasSensationalLanguage = hypeScore > 0 || emotionalScore > 0;
  const hasWeakSource = false;
  const hasNoVerifiedSource = !factScore;
  const hasExaggeratedCertainty = certaintyScore > 0;
  const hasLoudFormatting = false;
  const hasVerifiedSource = factScore > 0;
  const hasUnrealisticClaim = false;
  const hasImpossibility = false;

  return {
    label,
    realProbability,
    fakeProbability,
    confidence,
    risk,
    sourceType,
    summary: buildSummary(text),
    sentiment: analyzeSentiment(text),
    explanations: buildExplanations({
      hasUnrealisticClaim,
      hasImpossibility,
      hasWeakSource,
      hasNoVerifiedSource,
      hasExaggeratedCertainty,
      hasSensationalLanguage,
      hasLoudFormatting,
      hasVerifiedSource,
      sourceType
    })
  };
}

function renderAnalysis(result) {
  els.results.style.display = "grid";
  els.realProgress.style.width = `${Math.round(result.realProbability * 100)}%`;
  els.fakeProgress.style.width = `${Math.round(result.fakeProbability * 100)}%`;
  els.realPercent.textContent = `${Math.round(result.realProbability * 100)}%`;
  els.fakePercent.textContent = `${Math.round(result.fakeProbability * 100)}%`;

  const classificationText = result.label === "INFORMATIONAL / NON-NEWS"
    ? "👉 📘 INFORMATIONAL CONTENT (NON-NEWS)"
    : result.label;

  els.classification.textContent = classificationText;
  els.classification.className = `classification ${result.label.includes("FAKE") ? "fake-text" : result.label.includes("REAL") ? "real-text" : "warn-text"}`;

  els.riskLevel.style.display = "block";
  els.riskLevel.textContent = `Risk: ${result.risk}`;

  els.modelConfidence.style.display = "block";
  els.modelConfidence.textContent = `Fake News → ${Math.round(result.fakeProbability * 100)}%`;

  els.decisionConfidence.style.display = "block";
  els.decisionConfidence.textContent = `Status → ${result.label === "FAKE NEWS" ? "❌ FAKE" : result.label === "REAL" ? "✅ REAL" : result.label === "LIKELY REAL" ? "✅ REAL" : result.label === "INFORMATIONAL / NON-NEWS" ? "👉 📘 INFORMATIONAL CONTENT (NON-NEWS)" : result.label === "UNCERTAIN" ? "⚠️ UNCERTAIN" : "⚠️ UNCERTAIN"}`;

  els.explanationBlock.style.display = "block";
  els.explanationList.innerHTML = result.explanations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  els.summaryText.innerHTML = `
    <strong>Verdict:</strong> ${escapeHtml(result.label)}<br>
    <strong>Confidence band:</strong> ${escapeHtml(result.confidenceBand || "N/A")}<br>
    <strong>Trust score:</strong> ${escapeHtml(`${result.trustScore ?? "N/A"}%`)}<br>
    <strong>Reason:</strong> ${escapeHtml(result.finalVerdictReason || "N/A")}<br>
    <strong>Risk:</strong> ${escapeHtml(result.risk)}
  `;

  const keywordLines = result.keywordHits
    ? Object.entries(result.keywordHits).filter(([, terms]) => terms.length).map(([bucket, terms]) => `${bucket}: ${terms.join(", ")}`)
    : [];

  els.sentimentDisplay.innerHTML = `
    <div class="sentiment-pill">Sentiment: ${escapeHtml(result.sentiment.label)}</div>
    <div class="sentiment-pill">Positive cues: ${result.sentiment.pos}</div>
    <div class="sentiment-pill">Negative cues: ${result.sentiment.neg}</div>
    <div class="sentiment-pill">Source: ${escapeHtml(titleCase(result.sourceType))}</div>
    <div class="sentiment-pill">Credibility: ${Math.round((result.credibilityScore || 0) * 100)}%</div>
    <div class="sentiment-pill">Evidence: ${Math.round((result.evidenceScore || 0) * 100)}%</div>
    <div class="sentiment-pill">Claim realism: ${Math.round((result.claimRealismScore || 0) * 100)}%</div>
    <div class="sentiment-pill">Tone: ${Math.round((result.toneScore || 0) * 100)}%</div>
    ${keywordLines.length ? `<div class="sentiment-pill">Keywords: ${escapeHtml(keywordLines[0])}</div>` : ""}
  `;
}

function saveHistory(entry) {
  const history = JSON.parse(localStorage.getItem(state.historyKey) || "[]");
  history.unshift(entry);
  localStorage.setItem(state.historyKey, JSON.stringify(history.slice(0, 20)));
}

function openHistoryItem(item) {
  if (!item) return;
  if (item.analysis) {
    showAnalyzer();
    renderAnalysis(item.analysis);
    return;
  }

  if (item.sourceType === "text" && item.summary) {
    showPage("history");
    els.historyList.insertAdjacentHTML("afterbegin", `<p style="text-align:center;color:var(--text-secondary);margin-bottom:16px;">This history item was saved before full analysis details were stored. Run a new analysis to save complete click-to-view data.</p>`);
  }
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem(state.historyKey) || "[]");
  if (!history.length) {
    els.historyList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">No previous analyses. Run some tests!</p>';
    return;
  }

  els.historyList.innerHTML = history.map((item) => `
    <button type="button" class="history-item" data-history-id="${escapeHtml(item.id)}" aria-label="View history item from ${escapeHtml(item.time)}">
      <div class="history-header">
        <div class="history-type">${escapeHtml(item.sourceType.toUpperCase())}</div>
        <div class="history-time">${escapeHtml(item.time)}</div>
      </div>
      <div class="history-result ${item.label.includes("FAKE") ? "FAKE" : "REAL"}">${escapeHtml(item.label)}</div>
      <div class="history-sentiment ${item.sentiment.label.toUpperCase()}">${escapeHtml(item.sentiment.label)} sentiment</div>
      <div class="history-summary">${escapeHtml(item.summary.slice(0, 180))}${item.summary.length > 180 ? "..." : ""}</div>
    </button>
  `).join("");

  els.historyList.querySelectorAll(".history-item").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedId = button.dataset.historyId;
      const selected = history.find((entry) => entry.id === selectedId);
      openHistoryItem(selected);
    });
  });
}

function clearHistory() {
  localStorage.removeItem(state.historyKey);
  renderHistory();
}

function clearResults() {
  const textInput = document.getElementById("text-input");
  const urlInput = document.getElementById("url-input");
  const pdfInput = document.getElementById("pdf-input");

  if (textInput) {
    textInput.value = "";
    textInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (urlInput) {
    urlInput.value = "";
    urlInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (pdfInput) {
    pdfInput.value = "";
  }

  setTab("text");

  els.results.style.display = "none";
  els.explanationBlock.style.display = "none";
  els.summaryText.textContent = "";
  els.sentimentDisplay.innerHTML = "";
  els.classification.textContent = "";
  els.riskLevel.style.display = "none";
  els.modelConfidence.style.display = "none";
  els.decisionConfidence.style.display = "none";
}

function showError(message) {
  els.errorMessage.textContent = message;
  showPage("error");
  els.errorPage.classList.add("active");
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsArrayBuffer(file);
  });
}

function decodePdfHexString(value) {
  const hex = value.replace(/[^0-9a-fA-F]/g, "");
  const bytes = [];
  for (let index = 0; index < hex.length - 1; index += 2) {
    const byte = Number.parseInt(hex.slice(index, index + 2), 16);
    if (!Number.isNaN(byte)) bytes.push(byte);
  }
  return new TextDecoder("latin1", { fatal: false }).decode(new Uint8Array(bytes));
}

function findPdfStreamRanges(bytes) {
  const decoder = new TextDecoder("latin1", { fatal: false });
  const rawText = decoder.decode(bytes);
  const ranges = [];
  let offset = 0;

  while (true) {
    const streamIndex = rawText.indexOf("stream", offset);
    if (streamIndex === -1) break;
    let dataStart = streamIndex + 6;

    while (dataStart < bytes.length && (bytes[dataStart] === 0x0d || bytes[dataStart] === 0x0a || bytes[dataStart] === 0x20 || bytes[dataStart] === 0x09)) {
      dataStart += 1;
    }

    const endIndex = rawText.indexOf("endstream", dataStart);
    if (endIndex === -1) break;

    let dataEnd = endIndex;
    while (dataEnd > dataStart && (bytes[dataEnd - 1] === 0x0d || bytes[dataEnd - 1] === 0x0a || bytes[dataEnd - 1] === 0x20 || bytes[dataEnd - 1] === 0x09)) {
      dataEnd -= 1;
    }

    ranges.push({ start: dataStart, end: dataEnd });
    offset = endIndex + 9;
  }

  return ranges;
}

function extractPdfTextOps(streamText) {
  const textChunks = [];

  const pushChunk = (value) => {
    const clean = normalizeWhitespace(String(value || ""));
    if (clean.length >= 2) textChunks.push(clean);
  };

  for (const literal of [...streamText.matchAll(/\((?:\\.|[^\\()])*\)\s*(?:Tj|TJ)/g)]) {
    const value = literal[0].replace(/\s*(?:Tj|TJ)\s*$/, "").slice(1, -1)
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\\\/g, "\\")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")");
    pushChunk(value);
  }

  for (const arrayMatch of [...streamText.matchAll(/\[(.*?)\]\s*TJ/g)]) {
    const parts = [...arrayMatch[1].matchAll(/\((?:\\.|[^\\()])*\)|<([0-9a-fA-F\s]{4,})>/g)].map((part) => {
      if (part[0].startsWith("(")) {
        return part[0].slice(1, -1)
          .replace(/\\n/g, " ")
          .replace(/\\r/g, " ")
          .replace(/\\t/g, " ")
          .replace(/\\\\/g, "\\")
          .replace(/\\\(/g, "(")
          .replace(/\\\)/g, ")");
      }
      return decodePdfHexString(part[1] || "");
    });
    pushChunk(parts.join(" "));
  }

  return textChunks.join(" ");
}

async function maybeDecompressStream(binary) {
  if (!binary || !binary.length || typeof DecompressionStream === "undefined") return "";
  const encodings = ["deflate-raw", "deflate"];
  for (const encoding of encodings) {
    try {
      const stream = new DecompressionStream(encoding);
      const response = new Response(new Blob([binary]).stream().pipeThrough(stream));
      return await response.text();
    } catch (error) {
      continue;
    }
  }
  return "";
}

function configurePdfJs(lib) {
  if (!lib) return;
  if (lib.GlobalWorkerOptions) {
    lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
  lib.standardFontDataUrl = "https://mozilla.github.io/pdf.js/web/standard_fonts/";
}

async function loadPdfParser() {
  if (window.pdfjsLib) {
    configurePdfJs(window.pdfjsLib);
    return window.pdfjsLib;
  }
  if (window.__pdfjsLoading) return window.__pdfjsLoading;

  window.__pdfjsLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.dataset.pdfjsLoader = "true";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;

    script.onload = () => {
      const lib = window.pdfjsLib || window.PDFJS || window["pdfjsLib"] || window["PDFJS"] || null;
      if (!lib || typeof lib.getDocument !== "function") {
        reject(new Error("PDF reader could not be loaded."));
        return;
      }

      window.pdfjsLib = lib;
      configurePdfJs(lib);

      resolve(lib);
    };

    script.onerror = () => reject(new Error("PDF reader could not be loaded."));

    document.head.appendChild(script);
  });

  return window.__pdfjsLoading;
}

async function loadTesseract() {
  if (window.Tesseract) return window.Tesseract;
  if (window.__tesseractLoading) return window.__tesseractLoading;

  window.__tesseractLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.dataset.tesseractLoader = "true";
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;

    script.onload = () => {
      const lib = window.Tesseract || null;
      if (!lib || typeof lib.createWorker !== "function") {
        reject(new Error("OCR reader could not be loaded."));
        return;
      }
      resolve(lib);
    };

    script.onerror = () => reject(new Error("OCR reader could not be loaded."));

    document.head.appendChild(script);
  });

  return window.__tesseractLoading;
}

async function renderPdfPageToCanvas(page, scale = 1.5) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
}

async function ocrCanvas(canvas) {
  const Tesseract = await loadTesseract();
  const worker = await Tesseract.createWorker("eng");
  try {
    const result = await worker.recognize(canvas);
    return normalizeWhitespace(result?.data?.text || "");
  } finally {
    await worker.terminate();
  }
}

function looksLikeReadableText(text) {
  const value = normalizeWhitespace(String(text || ""));
  if (value.length < 20) return false;

  const letters = (value.match(/[A-Za-z]/g) || []).length;
  const spaces = (value.match(/\s/g) || []).length;
  const printable = (value.match(/[ -~]/g) || []).length;
  const ratio = printable / Math.max(value.length, 1);

  return letters >= 10 && spaces >= 3 && ratio >= 0.82;
}

async function extractPdfText(file) {
  const pdfBytes = new Uint8Array(await readFileAsArrayBuffer(file));
  const results = [];

  try {
    const pdfjsLib = await loadPdfParser();
    const pdf = await pdfjsLib.getDocument({
      data: pdfBytes,
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: true,
      standardFontDataUrl: "https://mozilla.github.io/pdf.js/web/standard_fonts/"
    }).promise;

    const maxPages = Math.min(pdf.numPages, 20);
    for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false });
      const pageText = normalizeWhitespace((textContent.items || []).map((item) => item.str).join(" "));
      if (looksLikeReadableText(pageText)) results.push(pageText);
    }

    const combined = normalizeWhitespace(results.join(" "));
    if (looksLikeReadableText(combined)) {
      return combined;
    }

    const ocrPages = [];
    const ocrMaxPages = Math.min(pdf.numPages, 3);
    for (let pageNumber = 1; pageNumber <= ocrMaxPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const canvas = await renderPdfPageToCanvas(page, 1.5);
      const ocrText = await ocrCanvas(canvas);
      if (looksLikeReadableText(ocrText)) ocrPages.push(ocrText);
    }

    const ocrCombined = normalizeWhitespace(ocrPages.join(" "));
    if (looksLikeReadableText(ocrCombined)) {
      return ocrCombined;
    }
  } catch (error) {
    // Fall through to raw-text fallback below.
  }

  const rawText = new TextDecoder("latin1", { fatal: false }).decode(pdfBytes);
  const streamTexts = [];
  const streamRegex = /stream[\r\n]+([\s\S]*?)endstream/g;
  let streamMatch;

  while ((streamMatch = streamRegex.exec(rawText)) !== null) {
    const stream = streamMatch[1] || "";
    const textOps = extractPdfTextOps(stream);
    if (looksLikeReadableText(textOps)) streamTexts.push(textOps);

    const literalText = normalizeWhitespace(
      stream
        .replace(/\((?:\\.|[^\\()])*\)/g, " ")
        .replace(/<([0-9a-fA-F\s]{4,})>/g, (_, hex) => decodePdfHexString(hex))
    );
    if (looksLikeReadableText(literalText)) streamTexts.push(literalText);
  }

  const readable = normalizeWhitespace(streamTexts.join(" "));
  if (looksLikeReadableText(readable)) return readable;

  return "";
}

async function analyzePayload(rawText, sourceType) {
  const prepared = normalizeWhitespace(rawText);
  if (!prepared || prepared.length < 20) {
    showError("Please provide more content. The analyzer needs at least 20 characters.");
    return;
  }

  showLoader("Analyzing content");
  await animateLoader();

  const apiUrls = [];
  if (state.apiBase) {
    apiUrls.push(state.apiBase);
  }
  if (!apiUrls.includes("http://localhost:3000")) {
    apiUrls.push("http://localhost:3000");
  }

  try {
    let lastError = null;

    for (const baseUrl of apiUrls) {
      try {
        const response = await fetch(`${baseUrl}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: prepared, sourceType })
        });

        const contentType = response.headers.get("content-type") || "";
        const responseText = await response.text();

        if (!/application\/json/i.test(contentType)) {
          lastError = new Error(`Unexpected response from API at ${baseUrl}.`);
          continue;
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          lastError = new Error("The server returned invalid JSON.");
          continue;
        }

        if (!response.ok || !data.ok) {
          lastError = new Error(data.error || "Analysis failed.");
          continue;
        }

        const result = data.result;
        renderAnalysis(result);
        saveHistory({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          time: new Date().toLocaleString(),
          sourceType,
          label: result.label,
          sentiment: result.sentiment,
          summary: result.summary,
          analysis: result
        });
        return;
      } catch (requestError) {
        lastError = requestError;
      }
    }

    throw lastError || new Error("Analysis failed.");
  } catch (error) {
    showError(error.message || "Analysis failed.");
  } finally {
    hideLoader();
  }
}

function getTextInputValue() {
  const textarea = document.getElementById("text-input");
  return textarea ? textarea.value : "";
}

async function analyzeText() {
  await analyzePayload(getTextInputValue(), "text");
}

function unwrapRedirectUrl(input) {
  const value = normalizeWhitespace(input);
  let parsedUrl;
  try {
    parsedUrl = new URL(value);
  } catch (error) {
    return value;
  }

  const wrappedUrl = parsedUrl.searchParams.get("RU") || parsedUrl.searchParams.get("ru");
  if (!wrappedUrl) return value;

  try {
    return decodeURIComponent(wrappedUrl);
  } catch (error) {
    return wrappedUrl;
  }
}

function isDirectArticleUrl(input) {
  try {
    const parsedUrl = new URL(unwrapRedirectUrl(input));
    return /^https?:$/.test(parsedUrl.protocol);
  } catch (error) {
    return false;
  }
}

async function analyzeUrl() {
  const urlInput = document.getElementById("url-input");
  const url = normalizeWhitespace(urlInput ? urlInput.value : "");
  const normalizedUrl = unwrapRedirectUrl(url);
  if (!isDirectArticleUrl(normalizedUrl)) {
    showError("Please enter a valid article URL or redirect link");
    return;
  }

  await analyzePayload(normalizedUrl, "url");
}

async function handlePdfSelection(file) {
  if (!file) return;
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    showError("Please select a PDF file.");
    return;
  }
  const text = await extractPdfText(file);
  if (!text) {
    showError("No readable text was found in the PDF.");
    return;
  }
  await analyzePayload(text, "pdf");
}

function bindEvents() {
  els.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });

  const triggerAnalyzeOnEnter = (input, handler) => {
    if (!input) return;
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.isComposing) return;
      if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      handler();
    });
  };

  els.hamburger.addEventListener("click", openMenu);
  els.closeMenu.addEventListener("click", closeMenu);
  els.overlay.addEventListener("click", closeMenu);

  els.tabButtons.forEach((btn) => btn.addEventListener("click", () => setTab(btn.dataset.tab)));

  triggerAnalyzeOnEnter(els.textInput, analyzeText);
  triggerAnalyzeOnEnter(els.urlInput, analyzeUrl);

  document.querySelectorAll("a[onclick]").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  document.querySelectorAll(".browse-btn").forEach((btn) => {
    btn.addEventListener("click", () => els.pdfInput.click());
  });

  els.pdfInput.addEventListener("change", (event) => handlePdfSelection(event.target.files && event.target.files[0]));

  els.uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    els.uploadArea.style.opacity = "0.85";
  });

  els.uploadArea.addEventListener("dragleave", () => {
    els.uploadArea.style.opacity = "1";
  });

  els.uploadArea.addEventListener("drop", (event) => {
    event.preventDefault();
    els.uploadArea.style.opacity = "1";
    handlePdfSelection(event.dataTransfer.files && event.dataTransfer.files[0]);
  });

  document.querySelectorAll(".history-controls .clear-btn").forEach((btn) => {
    btn.addEventListener("click", clearHistory);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.showLanding = showLanding;
  window.showAnalyzer = showAnalyzer;
  window.showPage = showPage;
  window.showAbout = showAbout;
  window.showDeveloper = showDeveloper;
  window.showMoreApps = showMoreApps;
  window.showHowItWorks = showHowItWorks;
  window.showFeatures = showFeatures;
  window.showContact = showContact;
  window.showHistory = showHistory;
  window.analyzeText = analyzeText;
  window.analyzeUrl = analyzeUrl;
  window.clearResults = clearResults;
  window.clearHistory = clearHistory;
}

function init() {
  cacheElements();
  initTheme();
  bindEvents();
  setTab("text");
  showLanding();
  renderHistory();
  loadPdfParser().catch(() => {});
}

document.addEventListener("DOMContentLoaded", init);
