const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const cheerio = require('cheerio');
const { analyzeContent } = require('./model');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const analysisCache = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

function normalizeWhitespace(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function stripHtmlTags(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/gi, ' ')
    .replace(/&/gi, '&')
    .replace(/</gi, '<')
    .replace(/>/gi, '>')
    .replace(/"/gi, '"')
    .replace(/'/gi, "'");
}

function removeEmptyLines(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

function isNoiseText(text) {
  const value = normalizeWhitespace(text);
  if (!value) return true;
  if (/^(advertisement|ads?|sign up|subscribe|cookies?|privacy policy|terms of service)$/i.test(value)) return true;
  return value.length < 20;
}

function extractMainContent(html) {
  const $ = cheerio.load(String(html || ''), { decodeEntities: true });

  $('script, style, noscript, svg, iframe, form, nav, header, footer, aside, menu, button, input, select, textarea').remove();
  $('script, style, nav, header, footer, aside, .advert, .ad, .promo').remove();
  $('[class*="ad"], [id*="ad"], [class*="advert"], [id*="advert"], [class*="promo"], [id*="promo"], [class*="newsletter"], [id*="newsletter"]').remove();

  const selectors = [
    'article p',
    '.ins_storybody p',
    '.sp__content p',
    '.story__content p',
    '.article-content p',
    'article',
    'main',
    '[role="main"]',
    'section[class*="content"]',
    'div[class*="content"]',
    'div[class*="article"]',
    'div[class*="post"]',
    'div[class*="story"]'
  ];

  for (const selector of selectors) {
    const chunks = $(selector)
      .map((_, element) => normalizeWhitespace($(element).text()))
      .get()
      .filter((text) => text && !isNoiseText(text));

    if (chunks.length > 5) {
      return removeEmptyLines(decodeHtmlEntities(chunks.join(' ')));
    }
  }

  const fallbackText = normalizeWhitespace($('body').text());
  return removeEmptyLines(decodeHtmlEntities(fallbackText && !isNoiseText(fallbackText) ? fallbackText : ''));
}

function unwrapRedirectUrl(input) {
  const value = normalizeWhitespace(input);
  let parsedUrl;
  try {
    parsedUrl = new URL(value);
  } catch (error) {
    return value;
  }

  const wrappedUrl = parsedUrl.searchParams.get('RU') || parsedUrl.searchParams.get('ru');
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

function extractTitle(html) {
  const titleMatch = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return titleMatch ? normalizeWhitespace(decodeHtmlEntities(stripHtmlTags(titleMatch[1]))) : '';
}


function fetchRemoteUrl(targetUrl, redirects = 0) {
  return new Promise((resolve, reject) => {
    const client = targetUrl.startsWith('https:') ? https : http;
    const request = client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 NewsGuardAI/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'DNT': '1',
        'Upgrade-Insecure-Requests': '1'
      }
    }, (response) => {
      const statusCode = response.statusCode || 0;
      if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
        response.resume();
        if (redirects >= 3) {
          reject(new Error('Too many redirects.'));
          return;
        }
        const nextUrl = new URL(response.headers.location, targetUrl).toString();
        resolve(fetchRemoteUrl(nextUrl, redirects + 1));
        return;
      }

      if (statusCode < 200 || statusCode >= 300) {
        response.resume();
        const error = new Error(`Failed to fetch URL (${statusCode}).`);
        error.statusCode = statusCode;
        reject(error);
        return;
      }

      let raw = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { raw += chunk; });
      response.on('end', () => resolve(raw));
    });

    request.on('error', reject);
    request.setTimeout(20000, () => {
      request.destroy(new Error('URL request timed out.'));
    });
  });
}

function fetchReadableFallback(targetUrl) {
  const fallbackUrl = `https://r.jina.ai/http://${targetUrl.replace(/^https?:\/\//i, '')}`;
  return fetchRemoteUrl(fallbackUrl);
}

function isGoogleNewsUrl(targetUrl) {
  try {
    return new URL(targetUrl).hostname === 'news.google.com';
  } catch (error) {
    return false;
  }
}

function extractMetaDescription(html) {
  const source = String(html || '');
  const metaMatch =
    source.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
    source.match(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i) ||
    source.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
    source.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*>/i);
  return metaMatch ? normalizeWhitespace(decodeHtmlEntities(stripHtmlTags(metaMatch[1]))) : '';
}

function getHostnameFromUrl(targetUrl) {
  try {
    return new URL(unwrapRedirectUrl(targetUrl)).hostname.toLowerCase().replace(/^www\./, '');
  } catch (error) {
    return '';
  }
}

async function fetchArticleText(targetUrl) {
  const normalizedTargetUrl = unwrapRedirectUrl(targetUrl);

  try {
    const html = await fetchRemoteUrl(normalizedTargetUrl);
    const articleText = extractMainContent(html);

    if (articleText.length >= 20) {
      return articleText;
    }

    const title = extractTitle(html);
    if (title.length >= 20) {
      return title;
    }
  } catch (error) {
    const statusCode = Number(error && error.statusCode);
    if (![403, 429, 451, 500, 502, 503, 504].includes(statusCode) && !isGoogleNewsUrl(normalizedTargetUrl)) {
      // Fall through for ordinary fetch failures and non-blocked pages.
    }
  }

  try {
    const fallback = await fetchReadableFallback(normalizedTargetUrl);
    const fallbackText = extractMainContent(fallback) || extractTitle(fallback);
    if (fallbackText.length < 20) {
      throw new Error('Could not extract readable text from this URL.');
    }

    return fallbackText;
  } catch (error) {
    const statusCode = Number(error && error.statusCode);
    if (statusCode === 451 || statusCode === 403) {
      const unsupportedError = new Error('This source is blocked by the publisher or news aggregator. Paste the original article URL instead.');
      unsupportedError.statusCode = 422;
      throw unsupportedError;
    }
    throw new Error(error.message || 'Could not fetch readable article text from this URL.');
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function parseRequestJson(body) {
  if (!body || !String(body).trim()) return {};
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    const invalidJsonError = new Error('Invalid JSON body.');
    invalidJsonError.statusCode = 400;
    throw invalidJsonError;
  }
}

function getErrorMessage(error, fallbackMessage) {
  if (!error) return fallbackMessage;
  if (typeof error === 'string') return error;
  return error.message || fallbackMessage;
}

function getStatusCode(error, fallbackStatus = 500) {
  const statusCode = Number(error && error.statusCode);
  return Number.isFinite(statusCode) && statusCode > 0 ? statusCode : fallbackStatus;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function serveStatic(res, pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(ROOT, safePath);
  if (!filePath.startsWith(ROOT)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  if (req.method === 'GET' && parsed.pathname === '/api/health') {
    sendJson(res, 200, { ok: true, service: 'NewsGuard AI backend' });
    return;
  }

  if (req.method === 'GET' && parsed.pathname === '/api/analyze') {
    sendJson(res, 200, {
      ok: true,
      message: 'Use POST with JSON body { content, sourceType } to analyze news content.'
    });
    return;
  }

  if (req.method === 'POST' && parsed.pathname === '/api/analyze') {
    try {
      const body = await readRequestBody(req);
      let payload = {};
      try {
        payload = parseRequestJson(body);
      } catch (error) {
        sendJson(res, getStatusCode(error, 400), { ok: false, error: getErrorMessage(error, 'Invalid JSON body.') });
        return;
      }

      const sourceType = payload.sourceType === 'url' || payload.sourceType === 'pdf' ? payload.sourceType : 'text';
      let content = normalizeWhitespace(payload.content || payload.text || payload.article || '');
      let normalizedTargetUrl = '';
      let sourceDomain = '';

      if (sourceType === 'url') {
        const targetUrl = normalizeWhitespace(payload.url || payload.content || payload.text || payload.article || '');
        normalizedTargetUrl = unwrapRedirectUrl(targetUrl);

        if (!normalizedTargetUrl) {
          sendJson(res, 400, { error: 'Please enter a direct article URL or a redirect link that resolves to one' });
          return;
        }

        if (!isDirectArticleUrl(normalizedTargetUrl)) {
          sendJson(res, 400, { error: 'Please enter a valid http(s) news article URL.' });
          return;
        }

        sourceDomain = getHostnameFromUrl(normalizedTargetUrl);

        try {
          content = await fetchArticleText(normalizedTargetUrl);
        } catch (error) {
          const statusCode = getStatusCode(error, 422);
          const message = getErrorMessage(error, 'Could not fetch readable article text from this URL.');
          sendJson(res, statusCode, {
            ok: false,
            error: message
          });
          return;
        }

        const MIN_LEN = 300;
        if (!content || content.length < MIN_LEN) {
          sendJson(res, 422, {
            ok: false,
            status: 'EXTRACTION_FAILED',
            message: 'Unable to extract full article content. Try a direct article link or paste text.'
          });
          return;
        }
      }

      if (content.length < 20) {
        sendJson(res, 200, { ok: false, error: 'Please provide at least 20 characters of content.' });
        return;
      }

      let result;
      try {
        const cacheKey = sourceType === 'url' ? `url:${normalizedTargetUrl}` : '';
        if (cacheKey && analysisCache.has(cacheKey)) {
          result = analysisCache.get(cacheKey);
        } else {
          result = analyzeContent(content, sourceType, {
            sourceUrl: sourceType === 'url' ? normalizedTargetUrl : '',
            sourceDomain: sourceType === 'url' ? sourceDomain : ''
          });
          if (cacheKey) {
            analysisCache.set(cacheKey, result);
          }
        }
      } catch (analysisError) {
        sendJson(res, 500, {
          ok: false,
          error: getErrorMessage(analysisError, 'Analysis failed.')
        });
        return;
      }

      sendJson(res, 200, {
        ok: true,
        result
      });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: getErrorMessage(error, 'Analysis failed.') });
    }
    return;
  }

  if (req.method === 'GET') {
    serveStatic(res, parsed.pathname || '/');
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
});

server.listen(PORT, () => {
  console.log(`NewsGuard AI backend running on http://localhost:${PORT}`);
});
