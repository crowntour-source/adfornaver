/* UI wiring. Depends on data.js, lang/*.js, app.js (logic) and share.js */
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const clean = s => (s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 20);
  const CFG = window.SITE_CONFIG || {};
  const CODES = langOrder();
  const PAGE = 6;
  let lang = DEFAULT_LANG;
  const last = { match: null, name: null };
  const sel = { name: 0 };

  /* ---------- helpers ---------- */
  function baseUrl() {
    if (CFG.siteUrl) return CFG.siteUrl.replace(/\/$/, '') + '/';
    return location.origin === 'null' ? location.href.split(/[?#]/)[0] : location.origin + location.pathname.replace(/index\.html$/, '');
  }
  const siteHost = () => { try { return new URL(baseUrl()).host || 'K-Name & K-Match'; } catch (e) { return 'K-Name & K-Match'; } };
  const docDir = () => (lang === 'ko' ? 'ko/' : 'en/');

  function pickLang(q) {
    try {
      if (CODES.includes(q.get('lang'))) return q.get('lang');
      const st = localStorage.getItem('lang');
      if (CODES.includes(st)) return st;
    } catch (e) { /* storage unavailable */ }
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    const alias = { ms: 'id', tl: 'en', fil: 'en' }[nav] || nav;
    return CODES.includes(alias) ? alias : 'en';
  }

  const fmt = (s, a, b) => s.replace('{a}', a).replace('{b}', b);
  const glossFor = () => {
    const en = LANG_DATA[DEFAULT_LANG], d = LANG_DATA[lang];
    return { gloss: { ...en.gloss, ...d.gloss }, native: { ...en.native, ...d.native } };
  };

  /* ---------- static texts ---------- */
  function applyStatic() {
    const t = uiFor(lang), d = LANG_DATA[lang];
    document.documentElement.lang = d.htmlLang;
    document.title = `${t.title} · ${t.tabName}`;
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
    const cur = $('surname').value || 'auto';
    $('surname').innerHTML = `<option value="auto">${esc(t.sAuto)}</option>` +
      SURNAMES.map(s => `<option value="${s.rom}">${s.ko} (${s.rom})</option>`).join('');
    $('surname').value = cur;
    $('langs').innerHTML = CODES.map(l =>
      `<button type="button" data-l="${l}" aria-pressed="${l === lang}">${esc(d_label(l))}</button>`).join('');
    const dir = docDir();
    $('t-links').innerHTML = [['guides', 'guides'], ['about', 'about'], ['privacy', 'privacy'], ['terms', 'terms'], ['contact', 'contact']]
      .map(([k, f]) => `<a href="${dir}${f}.html">${esc(t['nav' + k[0].toUpperCase() + k.slice(1)])}</a>`).join(' · ');
  }
  const d_label = l => LANG_DATA[l].label;

  /* ---------- share panel ---------- */
  function renderShare(container, card, caption, url, fileBase) {
    const t = uiFor(lang);
    const lk = Share.links(caption, url);
    container.innerHTML = `
      <h3>${esc(t.shareTitle)}</h3>
      <canvas class="preview" aria-label="${esc(card.kind === 'name' ? card.hangul : card.score + '%')}"></canvas>
      <div class="sbtns">
        ${Share.canNative() ? `<button type="button" class="pri" data-act="native">${esc(t.share)}</button>` : ''}
        <button type="button" data-act="feed">${esc(t.saveFeed)}</button>
        <button type="button" data-act="story">${esc(t.saveStory)}</button>
      </div>
      <div class="sbtns links">
        <a href="${esc(lk.facebook)}" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="${esc(lk.whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a href="${esc(lk.line)}" target="_blank" rel="noopener noreferrer">LINE</a>
        <a href="${esc(lk.telegram)}" target="_blank" rel="noopener noreferrer">Telegram</a>
        <a href="${esc(lk.x)}" target="_blank" rel="noopener noreferrer">X</a>
      </div>
      <div class="sbtns">
        <button type="button" data-act="link">${esc(t.copyLink)}</button>
        <button type="button" data-act="caption">${esc(t.copyCaption)}</button>
      </div>
      <p class="note">${esc(t.igHint)}</p>`;
    container.hidden = false;
    Share.render(container.querySelector('canvas'), card, 'feed');
    container.onclick = async e => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const act = b.dataset.act, flash = () => { const o = b.textContent; b.textContent = t.copied; setTimeout(() => { b.textContent = o; }, 1500); };
      try {
        if (act === 'native') await Share.nativeShare(card, caption, url, fileBase + '.png');
        else if (act === 'feed') await Share.save(card, 'feed', fileBase + '-feed.png');
        else if (act === 'story') await Share.save(card, 'story', fileBase + '-story.png');
        else if (act === 'link') { if (await Share.copy(url)) flash(); }
        else if (act === 'caption') { if (await Share.copy(`${caption} ${url} ${Share.HASHTAGS}`)) flash(); }
      } catch (err) { /* user cancelled share sheet */ }
    };
  }

  /* ---------- match ---------- */
  function matchCard(r, t, d) {
    const vi = verdictIndex(r.res.score);
    return {
      kind: 'match', lang, hue: (320 + r.res.score * 2) % 360,
      heading: t.tabMatch, a: r.nA || 'A', b: r.nB || 'B', ship: r.res.ship, shipLabel: t.shipName,
      score: r.res.score, verdict: t.verdict[vi], drama: t.dramaTitles[vi],
      stats: [['stComm', 'comm'], ['stPassion', 'passion'], ['stTrust', 'trust'], ['stHumor', 'humor']]
        .map(([lab, k]) => ({ label: t[lab], val: r.res.stats[k] })),
      footer: t.tryMatch, site: siteHost()
    };
  }

  function matchUrl(r) {
    const p = x => `${x.cn}.${x.sign}.${x.lp}`;
    const q = new URLSearchParams({ lang, t: 'm', p: `${p(r.pA)},${p(r.pB)}` });
    if (r.nA) q.set('a', r.nA);
    if (r.nB) q.set('b', r.nB);
    return baseUrl() + '?' + q.toString();
  }

  function renderMatch() {
    const r = last.match, out = $('out-match'), sh = $('share-match');
    if (!r) { out.hidden = true; sh.hidden = true; return; }
    const t = uiFor(lang), d = LANG_DATA[lang];
    const aCn = d.cn[r.pA.cn], bCn = d.cn[r.pB.cn];
    const aW = d.signs[r.pA.sign], bW = d.signs[r.pB.sign];
    const vi = verdictIndex(r.res.score);
    const bars = [['stComm', 'comm'], ['stPassion', 'passion'], ['stTrust', 'trust'], ['stHumor', 'humor']]
      .map(([lab, k]) => `<div class="stat"><span>${esc(t[lab])}</span><div class="bar"><i style="width:${r.res.stats[k]}%"></i></div><b>${r.res.stats[k]}</b></div>`).join('');
    out.innerHTML = `
      ${r.shared ? `<div class="banner">${esc(t.sharedMatch)}</div>` : ''}
      <h2>${esc(t.result)}</h2>
      ${r.res.ship ? `<p class="ship">💞 ${esc(t.shipName)}: <b>${esc(r.res.ship)}</b></p>` : ''}
      <div class="score">${r.res.score}<small style="font-size:1rem;color:var(--muted)"> / 100</small></div>
      <div class="bar" role="img" aria-label="${esc(t.score)} ${r.res.score}"><i style="width:${r.res.score}%"></i></div>
      <div class="verdict">${esc(t.verdict[vi])}</div>
      <p class="drama">“${esc(t.dramaTitles[vi])}” <small>— ${esc(t.dramaTitle)}</small></p>
      ${bars}
      <div class="row"><b>${esc(t.cnZodiac)}: ${esc(aCn)} × ${esc(bCn)}</b>${esc(fmt(t.rel[r.res.cn.key], aCn, bCn))}</div>
      <div class="row"><b>${esc(t.western)}: ${esc(aW)} × ${esc(bW)}</b>${esc(fmt(t.rel[r.res.wr.key], aW, bW))}</div>
      <div class="row"><b>${esc(t.lifePath)}: ${r.pA.lp} × ${r.pB.lp}</b>${esc(fmt(t.rel[r.res.lp.key], r.pA.lp, r.pB.lp))}</div>
      <div class="row"><b>${esc(t.tipsTitle)}</b>${esc(t.tips[vi])}</div>
      ${r.shared ? `<button type="button" class="go" id="try-match">${esc(t.tryMatch)}</button>` : ''}`;
    out.hidden = false;
    const card = matchCard(r, t, d);
    const caption = t.captionMatch.replace('{a}', card.a).replace('{b}', card.b).replace('{score}', r.res.score);
    renderShare(sh, card, caption, matchUrl(r), 'k-match');
  }

  /* ---------- names ---------- */
  function nameUrl(r, n) {
    const q = new URLSearchParams({ lang, t: 'n', k: n.ko, sn: r.sn.rom, z: r.seed });
    if (r.who) q.set('y', r.who);
    return baseUrl() + '?' + q.toString();
  }

  function nameCard(r, n, t) {
    const prof = idolProfile(n, r.seed), g = glossFor();
    return {
      kind: 'name', lang, hue: prof.hue, emoji: prof.emoji, heading: t.nameTitle, who: r.who,
      hangul: r.sn.ko + n.ko, rom: `${r.sn.rom} ${n.rom}`, hanja: n.hj || '',
      meaning: meaningOf(n, g),
      chips: [{ label: t.lblPosition, value: t.positions[prof.pos] }, { label: t.lblLucky, value: String(prof.lucky) }, { label: t.lblColor, swatch: prof.color }],
      footer: t.tryName, site: siteHost()
    };
  }

  function renderNames() {
    const r = last.name, out = $('out-name'), sh = $('share-name');
    if (!r) { out.hidden = true; sh.hidden = true; return; }
    const t = uiFor(lang), d = LANG_DATA[lang], g = glossFor();
    const shown = r.list.slice(0, PAGE * r.pages);
    if (sel.name >= shown.length) sel.name = 0;
    const cards = shown.map((n, i) => {
      const prof = idolProfile(n, r.seed);
      return `<div class="name${i === sel.name ? ' picked' : ''}">
        <div class="big">${esc(r.sn.ko + n.ko)} <span aria-hidden="true">${prof.emoji}</span></div>
        <div class="rom">${esc(r.sn.rom + ' ' + n.rom)}</div>
        ${n.hj ? `<div class="hj">${esc(n.hj)} · ${esc(n.py)}</div>` : ''}
        <small>${esc(t.meaning)}: ${esc(meaningOf(n, g))}</small>
        <small>${esc(t.lblPosition)}: ${esc(t.positions[prof.pos])} · ${esc(t.lblLucky)}: ${prof.lucky}</small>
        ${n.el !== null && r.b ? `<small>${esc(d.five[n.el])}</small>` : ''}
        ${n.badge ? `<span class="badge ${n.badge === 'badgeOther' ? 'o' : ''}">${esc(t[n.badge])}</span>` : ''}
        <button type="button" class="copy" data-pick="${i}">${esc(t.share)}</button>
      </div>`;
    }).join('');
    let head = '';
    if (r.b) {
      const e = yearElement(r.b);
      head = `<p class="note">${esc(t.yearElem)}: <b>${esc(d.five[e])}</b> · ${esc(t.helpElem)}: <b>${esc(d.five[supportElement(e)])}</b></p>`;
    }
    out.innerHTML = `
      ${r.shared ? `<div class="banner">${esc(t.sharedName)}</div>` : ''}
      <h2>${esc(t.nameResult)}</h2>${head}
      <div class="names">${cards}</div>
      ${!r.shared && shown.length < r.list.length ? `<button type="button" class="go more" id="more">${esc(t.more)}</button>` : ''}
      ${r.shared ? `<button type="button" class="go" id="try-name">${esc(t.tryName)}</button>` : ''}
      <p class="note">${esc(t.nameNote)}</p>`;
    out.hidden = false;
    const n = shown[sel.name];
    const card = nameCard(r, n, t);
    renderShare(sh, card, t.shareText.replace('{name}', `${card.hangul} (${card.rom})`), nameUrl(r, n), 'k-name');
  }

  /* ---------- events ---------- */
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

  function resetShared() {
    history.replaceState(null, '', location.pathname);
    last.match = null; last.name = null;
    renderMatch(); renderNames();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $('langs').addEventListener('click', e => { const b = e.target.closest('button[data-l]'); if (b) setLang(b.dataset.l); });
  $('tab-match').addEventListener('click', () => showTab('match'));
  $('tab-name').addEventListener('click', () => showTab('name'));

  $('out-name').addEventListener('click', e => {
    if (e.target.id === 'more') { last.name.pages++; renderNames(); return; }
    if (e.target.id === 'try-name') { resetShared(); return; }
    const b = e.target.closest('button[data-pick]');
    if (b) { sel.name = +b.dataset.pick; renderNames(); $('share-name').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  });
  $('out-match').addEventListener('click', e => { if (e.target.id === 'try-match') resetShared(); });

  $('form-match').addEventListener('submit', e => {
    e.preventDefault();
    const bA = parseDate($('birthA').value), bB = parseDate($('birthB').value);
    if (!bA || !bB) { $('err-match').textContent = uiFor(lang).required; last.match = null; renderMatch(); return; }
    $('err-match').textContent = '';
    const nA = clean($('nameA').value), nB = clean($('nameB').value);
    const pA = profileOf(bA), pB = profileOf(bB);
    last.match = { pA, pB, nA, nB, res: matchFromProfiles(pA, pB, nA, nB) };
    renderMatch();
  });

  $('form-name').addEventListener('submit', e => {
    e.preventDefault();
    const b = parseDate($('bdate').value); // optional
    const gender = $('gender').value, vibe = $('vibe').value, who = clean($('yourName').value);
    const seed = String(strHash([who.toLowerCase(), $('bdate').value, gender, vibe].join('|'))); // hash only: no birth date in share links
    sel.name = 0;
    last.name = { b, who, seed, pages: 1, sn: pickSurname(seed, $('surname').value), list: suggestNames(b, gender, vibe, seed) };
    renderNames();
  });

  /* ---------- shared-link landing ---------- */
  function loadShared(q) {
    const t = q.get('t');
    if (t === 'n') {
      const n = NAMES.find(x => x.ko === q.get('k')), sn = SURNAMES.find(s => s.rom === q.get('sn'));
      if (!n || !sn) return;
      const who = clean(q.get('y'));
      const seed = /^\d{1,10}$/.test(q.get('z') || '') ? q.get('z') : '0';
      last.name = { b: null, who, seed, pages: 1, sn, shared: true, list: [{ ...n, badge: n.hj === null ? 'native' : null }] };
      sel.name = 0; showTab('name');
    } else if (t === 'm') {
      const parse = s => { const a = (s || '').split('.').map(Number); return a.length === 3 && a[0] >= 0 && a[0] < 12 && a[1] >= 0 && a[1] < 12 && a[2] >= 1 && a[2] <= 9 && a.every(Number.isInteger) ? { cn: a[0], sign: a[1], lp: a[2] } : null; };
      const [x, y] = (q.get('p') || '').split(',');
      const pA = parse(x), pB = parse(y);
      if (!pA || !pB) return;
      const nA = clean(q.get('a')), nB = clean(q.get('b'));
      last.match = { pA, pB, nA, nB, shared: true, res: matchFromProfiles(pA, pB, nA, nB) };
      showTab('match');
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  ['birthA', 'birthB', 'bdate'].forEach(id => { $(id).max = todayStr; });
  const q = new URLSearchParams(location.search);
  loadShared(q);
  if (!last.name && !last.match && q.get('tab') === 'match') showTab('match');
  else if (!last.name && !last.match && q.get('tab') === 'name') showTab('name');
  setLang(pickLang(q));
})();
