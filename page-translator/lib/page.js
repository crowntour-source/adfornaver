'use strict';
const cheerio = require('cheerio');
const { safeFetch } = require('./net');
const { translateList } = require('./claude');

const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'code', 'pre', 'svg', 'textarea', 'template']);
const ATTRS = ['alt', 'title', 'placeholder', 'aria-label', 'value'];
const HAS_LATIN = /[A-Za-z]{2,}/;
const HAS_HANGUL = /[가-힯]/;

async function loadHtml(url, { render }) {
  if (render) {
    let chromium;
    try {
      ({ chromium } = require('playwright'));
    } catch {
      throw new Error('브라우저 렌더링에는 playwright 설치가 필요합니다 (npm i playwright && npx playwright install chromium).');
    }
    const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {});
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
      });
      return { html: await page.content(), finalUrl: page.url() };
    } finally {
      await browser.close();
    }
  }
  const { res, url: finalUrl } = await safeFetch(url, { accept: 'text/html,application/xhtml+xml' });
  if (!res.ok) throw new Error(`페이지를 불러오지 못했습니다 (HTTP ${res.status}).`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) throw new Error('페이지가 너무 큽니다(8MB 초과).');
  return { html: buf.toString('utf8'), finalUrl };
}

function abs(base, u) {
  try { return new URL(u, base).href; } catch { return null; }
}

function findVideos($, base) {
  const out = new Map();
  const add = (u, kind) => { const a = u && abs(base, u); if (a && !out.has(a)) out.set(a, kind); };
  $('video[src], video source[src]').each((_, e) => add($(e).attr('src'), 'file'));
  $('meta[property="og:video"], meta[property="og:video:url"], meta[property="og:video:secure_url"]').each((_, e) => add($(e).attr('content'), 'file'));
  $('iframe[src]').each((_, e) => {
    const s = $(e).attr('src') || '';
    if (/youtube\.com|youtu\.be|vimeo\.com|wistia|loom\.com/i.test(s)) add(s, 'platform');
  });
  $('a[href]').each((_, e) => {
    const h = $(e).attr('href') || '';
    if (/\.(mp4|webm|mov)(\?|$)/i.test(h)) add(h, 'file');
  });
  return [...out].map(([url, kind]) => ({ url, kind }));
}

/**
 * URL → { template(HTML, data-pt 마커 포함), segments[], videos[], baseUrl }
 * 한글 번역은 segments[i].ko 에 채운다. 스크립트는 기본 제거(정적 스냅샷)해서 번역문이 덮어써지지 않게 한다.
 */
async function buildPage(url, opts = {}) {
  const { html, finalUrl } = await loadHtml(url, opts);
  const $ = cheerio.load(html, { decodeEntities: false });
  const videos = findVideos($, finalUrl);

  if (!opts.keepScripts) {
    $('script').remove();
    $('meta[http-equiv="Content-Security-Policy"]').remove();
    $('noscript').each((_, e) => { $(e).replaceWith($(e).html() || ''); });
    $('[onclick],[onload]').each((_, e) => { $(e).removeAttr('onclick').removeAttr('onload'); });
  }
  // 지연 로딩 이미지
  $('img[data-src]').each((_, e) => { if (!$(e).attr('src') || /^data:/.test($(e).attr('src'))) $(e).attr('src', $(e).attr('data-src')); });
  $('img[data-srcset]').each((_, e) => { $(e).attr('srcset', $(e).attr('data-srcset')); });
  $('html').attr('lang', 'ko');
  $('meta[http-equiv="Content-Language"]').remove();
  $('head').prepend(`<base href="${finalUrl}">`);

  const segments = [];
  const push = (seg) => { seg.id = segments.length; segments.push(seg); return seg.id; };

  // <title>, meta description 등
  const title = $('title').first();
  if (title.length && HAS_LATIN.test(title.text())) {
    const id = push({ kind: 'text', tag: 'title', original: title.text().trim() });
    title.attr('data-pt', id).text(title.text().trim());
  }
  $('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]').each((_, e) => {
    const c = $(e).attr('content');
    if (c && HAS_LATIN.test(c)) $(e).attr('data-pt-attr-content', push({ kind: 'attr', attr: 'content', tag: 'meta', original: c }));
  });

  const walk = (node, tag) => {
    node.contents().each((_, child) => {
      if (child.type === 'text') {
        const raw = child.data;
        if (tag === 'title' || tag === 'head' || !raw.trim() || !HAS_LATIN.test(raw) || HAS_HANGUL.test(raw)) return;
        const lead = raw.match(/^\s*/)[0];
        const trail = raw.match(/\s*$/)[0];
        const id = push({ kind: 'text', tag, original: raw.trim().replace(/\s+/g, ' ') });
        $(child).replaceWith(`${lead}<span data-pt="${id}" style="display:contents">${cheerio.load('')('<i>').text(segments[id].original).html()}</span>${trail}`);
      } else if (child.type === 'tag') {
        const t = child.name.toLowerCase();
        if (SKIP_TAGS.has(t) || t === 'head') return;
        const $c = $(child);
        for (const a of ATTRS) {
          const v = $c.attr(a);
          if (!v || !HAS_LATIN.test(v)) continue;
          if (a === 'value' && !/^(submit|button|reset)$/i.test($c.attr('type') || '')) continue;
          $c.attr(`data-pt-attr-${a}`, push({ kind: 'attr', attr: a, tag: t, original: v }));
        }
        walk($c, t);
      }
    });
  };
  walk($('body'), 'body');

  const list = segments.map((s) => s.original);
  const ko = list.length
    ? await translateList(list, { tone: opts.tone, glossary: opts.glossary, context: `${finalUrl} 원페이지 광고` })
    : [];
  segments.forEach((s, i) => { s.ko = ko[i]; });

  return { template: $.html(), segments, videos, baseUrl: finalUrl };
}

module.exports = { buildPage };
