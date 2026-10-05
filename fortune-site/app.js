/* ---------- pure logic ---------- */
function parseDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return { y, m: mo, d };
}

// Year used for zodiac/element: before 4 Feb counts as previous year
function zodiacYear(b) { return (b.m < 2 || (b.m === 2 && b.d < 4)) ? b.y - 1 : b.y; }
function cnAnimal(b) { return (((zodiacYear(b) - 4) % 12) + 12) % 12; }
// 0 wood 1 fire 2 earth 3 metal 4 water
function yearElement(b) { return Math.floor(((((zodiacYear(b) - 4) % 10) + 10) % 10) / 2); }

function westernSign(b) {
  let sign = 9; // Capricorn: Dec 22 - Jan 19
  for (const s of WESTERN) {
    if (b.m > s.m || (b.m === s.m && b.d >= s.d)) sign = s.i;
  }
  return sign;
}

function lifePath(b) {
  const n = String(b.y) + String(b.m).padStart(2, '0') + String(b.d).padStart(2, '0');
  let sum = n.split('').reduce((a, c) => a + +c, 0);
  while (sum > 9) sum = String(sum).split('').reduce((a, c) => a + +c, 0);
  return sum;
}

function cnRelation(a, b) {
  if (a === b) return { key: 'same', score: 70 };
  const diff = Math.abs(a - b);
  if (diff === 6) return { key: 'clash', score: 40 };
  const sixPairs = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
  if (sixPairs.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a))) return { key: 'six', score: 95 };
  if (diff === 4 || diff === 8) return { key: 'trine', score: 90 }; // rat-dragon-monkey etc.
  return { key: 'neutral', score: 65 };
}

function westernRelation(a, b) {
  const ea = SIGN_ELEMENT[a], eb = SIGN_ELEMENT[b];
  if (ea === eb) return { key: 'wSame', score: 80 };
  if ((ea === 0 && eb === 2) || (ea === 2 && eb === 0) || (ea === 1 && eb === 3) || (ea === 3 && eb === 1)) return { key: 'wComp', score: 90 };
  return { key: 'wNeutral', score: 55 };
}

function lifeRelation(a, b) {
  if (a === b) return { key: 'lpSame', score: 85 };
  const groups = [[1,5,7],[2,4,8],[3,6,9]];
  if (groups.some(g => g.includes(a) && g.includes(b))) return { key: 'lpGood', score: 90 };
  return { key: 'lpNeutral', score: 60 };
}

function strHash(s) {
  let h = 2166136261;
  for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

function compatibility(bA, bB, nameA, nameB) {
  const cn = cnRelation(cnAnimal(bA), cnAnimal(bB));
  const wr = westernRelation(westernSign(bA), westernSign(bB));
  const lp = lifeRelation(lifePath(bA), lifePath(bB));
  const pair = [nameA || '', nameB || ''].map(s => s.trim().toLowerCase()).sort().join('|');
  const nameVibe = pair === '|' ? 70 : 60 + (strHash(pair) % 21); // 60..80, playful
  const score = Math.round(cn.score * 0.35 + wr.score * 0.25 + lp.score * 0.25 + nameVibe * 0.15);
  return { score, cn, wr, lp };
}

function verdictIndex(score) { return score >= 85 ? 0 : score >= 72 ? 1 : score >= 60 ? 2 : 3; }

// element e is supported by the one that generates it (wood>fire>earth>metal>water>wood)
function supportElement(e) { return (e + 4) % 5; }

function seededOrder(arr, seed) {
  return arr.map((x, i) => ({ x, k: strHash(seed + ':' + i) })).sort((a, b) => a.k - b.k).map(o => o.x);
}

function suggestNames(b, gender, surname, limit) {
  const e = yearElement(b), sup = supportElement(e);
  const pool = NAMES.filter(n => gender === 'u' || n.g === gender || n.g === 'u');
  const rank = n => (n.el === sup ? 0 : n.el === e ? 1 : 2);
  const shuffled = seededOrder(pool, `${b.y}${b.m}${b.d}${surname}${gender}`);
  return shuffled.sort((a, c) => rank(a) - rank(c)).slice(0, limit || 6)
    .map(n => ({ ...n, badge: n.el === sup ? 'badgeSupport' : n.el === e ? 'badgeSame' : 'badgeOther' }));
}

function meaningOf(hanja, langIdx) {
  return [...hanja].map(c => `${c} ${GLOSS[c][langIdx]}`).join(' · ');
}

/* ---------- UI ---------- */
if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  let lang = 'en';
  const last = { match: null, name: null };

  function pickLang() {
    try {
      const q = new URLSearchParams(location.search).get('lang');
      if (LANGS.includes(q)) return q;
      const st = localStorage.getItem('lang');
      if (LANGS.includes(st)) return st;
    } catch (e) { /* storage unavailable */ }
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.includes(nav) ? nav : 'en';
  }

  const fmt = (s, a, b) => s.replace('{a}', a).replace('{b}', b);

  function applyStatic() {
    const t = I18N[lang];
    document.documentElement.lang = HTML_LANG[lang];
    document.title = t.title;
    $('t-title').textContent = t.title;
    $('t-sub').textContent = t.subtitle;
    $('tab-match').textContent = t.tabMatch;
    $('tab-name').textContent = t.tabName;
    $('t-pa').textContent = t.personA;
    $('t-pb').textContent = t.personB;
    $('t-calc').textContent = t.calc;
    $('t-find').textContent = t.find;
    $('t-disc').textContent = t.disclaimer;
    $('t-foot').textContent = t.footer;
    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t[el.dataset.t]; });
    $('langs').innerHTML = LANGS.map(l =>
      `<button type="button" data-l="${l}" aria-pressed="${l === lang}">${LANG_LABEL[l]}</button>`).join('');
  }

  function renderMatch() {
    const r = last.match, out = $('out-match');
    if (!r) { out.hidden = true; return; }
    const t = I18N[lang];
    const aCn = CN_ZODIAC[lang][cnAnimal(r.bA)], bCn = CN_ZODIAC[lang][cnAnimal(r.bB)];
    const aW = SIGNS[lang][westernSign(r.bA)], bW = SIGNS[lang][westernSign(r.bB)];
    const aL = lifePath(r.bA), bL = lifePath(r.bB);
    const vi = verdictIndex(r.res.score);
    out.innerHTML = `
      <h2>${esc(t.result)}</h2>
      <div class="score">${r.res.score}<small style="font-size:1rem;color:var(--muted)"> / 100</small></div>
      <div class="bar" role="img" aria-label="${esc(t.score)} ${r.res.score}"><i style="width:${r.res.score}%"></i></div>
      <div class="verdict">${esc(t.verdict[vi])}</div>
      <div class="row"><b>${esc(t.cnZodiac)}: ${esc(aCn)} × ${esc(bCn)}</b>${esc(fmt(t.rel[r.res.cn.key], aCn, bCn))}</div>
      <div class="row"><b>${esc(t.western)}: ${esc(aW)} × ${esc(bW)}</b>${esc(fmt(t.rel[r.res.wr.key], aW, bW))}</div>
      <div class="row"><b>${esc(t.lifePath)}: ${aL} × ${bL}</b>${esc(fmt(t.rel[r.res.lp.key], aL, bL))}</div>
      <div class="row"><b>${esc(t.tipsTitle)}</b>${esc(t.tips[vi])}</div>`;
    out.hidden = false;
  }

  function renderNames() {
    const r = last.name, out = $('out-name');
    if (!r) { out.hidden = true; return; }
    const t = I18N[lang], li = LANGS.indexOf(lang);
    const e = yearElement(r.b), sup = supportElement(e);
    const cjk = lang === 'ko' || lang === 'zh';
    const cards = r.list.map(n => {
      const given = cjk ? n.ko : n.rom;
      const full = r.surname ? (cjk ? r.surname + given : r.surname + ' ' + given) : given;
      return `<div class="name">
        <div class="big">${esc(full)}</div>
        <div class="hj">${esc(n.ko)} · ${esc(n.hj)}</div>
        <small>${esc(t.roman)}: ${esc(n.rom)}</small>
        <small>${esc(t.pinyin)}: ${esc(n.py)}</small>
        <small>${esc(t.meaning)}: ${esc(meaningOf(n.hj, li))}</small>
        <small>${esc(FIVE[lang][n.el])}</small>
        <span class="badge ${n.badge === 'badgeOther' ? 'o' : ''}">${esc(t[n.badge])}</span>
      </div>`;
    }).join('');
    out.innerHTML = `
      <h2>${esc(t.nameResult)}</h2>
      <p class="note">${esc(t.yearElem)}: <b>${esc(FIVE[lang][e])}</b> · ${esc(t.helpElem)}: <b>${esc(FIVE[lang][sup])}</b></p>
      <div class="names">${cards}</div>
      <p class="note">${esc(t.nameNote)}</p>`;
    out.hidden = false;
  }

  function setLang(l) {
    lang = l;
    try { localStorage.setItem('lang', l); } catch (e) { /* ignore */ }
    applyStatic(); renderMatch(); renderNames();
  }

  function showTab(which) {
    const m = which === 'match';
    $('tab-match').setAttribute('aria-selected', m);
    $('tab-name').setAttribute('aria-selected', !m);
    $('panel-match').hidden = !m;
    $('panel-name').hidden = m;
  }

  $('langs').addEventListener('click', e => { const b = e.target.closest('button[data-l]'); if (b) setLang(b.dataset.l); });
  $('tab-match').addEventListener('click', () => showTab('match'));
  $('tab-name').addEventListener('click', () => showTab('name'));

  $('form-match').addEventListener('submit', e => {
    e.preventDefault();
    const bA = parseDate($('birthA').value), bB = parseDate($('birthB').value);
    if (!bA || !bB) { $('err-match').textContent = I18N[lang].required; last.match = null; renderMatch(); return; }
    $('err-match').textContent = '';
    last.match = { bA, bB, res: compatibility(bA, bB, $('nameA').value, $('nameB').value) };
    renderMatch();
  });

  $('form-name').addEventListener('submit', e => {
    e.preventDefault();
    const b = parseDate($('bdate').value);
    if (!b) { $('err-name').textContent = I18N[lang].required; last.name = null; renderNames(); return; }
    $('err-name').textContent = '';
    const surname = $('surname').value.trim();
    last.name = { b, surname, list: suggestNames(b, $('gender').value, surname, 6) };
    renderNames();
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  ['birthA', 'birthB'].forEach(id => { $(id).max = todayStr; });
  setLang(pickLang());
}

if (typeof module !== 'undefined') {
  module.exports = { parseDate, cnAnimal, yearElement, westernSign, lifePath, compatibility, suggestNames, meaningOf };
}
