'use strict';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function api(url, body, isForm) {
  const res = await fetch(url, isForm ? { method: 'POST', body } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || '요청 실패');
  return j;
}
async function poll(jobId, onMsg) {
  for (;;) {
    const j = await (await fetch(`/api/jobs/${jobId}`)).json();
    if (j.status === 'done') return j.result;
    if (j.status === 'error') throw new Error(j.error);
    onMsg(j.message);
    await new Promise((r) => setTimeout(r, 1500));
  }
}
const setStatus = (el, msg, err) => { el.textContent = msg || ''; el.classList.toggle('err', !!err); };

document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === b));
  document.querySelectorAll('.pane').forEach((p) => (p.hidden = p.id !== `tab-${b.dataset.tab}`));
}));

/* ================= 페이지 ================= */
let page = null; // {template, segments, videos}
let showingOrig = false;
const frame = $('#frame');

$('#pageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#pageGo').disabled = true;
  setStatus($('#pageStatus'), '페이지를 불러와 번역하는 중… (문구가 많으면 1~2분 걸릴 수 있습니다)');
  try {
    page = await api('/api/page', { url: $('#pageUrl').value, tone: $('#tone').value, glossary: $('#glossary').value, render: $('#render').checked, keepScripts: $('#keepScripts').checked });
    setStatus($('#pageStatus'), `번역 완료: 문구 ${page.segments.length}개`);
    $('#pageWork').hidden = false;
    frame.srcdoc = page.template;
    renderSegList();
    renderVideos();
  } catch (err) {
    setStatus($('#pageStatus'), err.message, true);
  } finally {
    $('#pageGo').disabled = false;
  }
});

function applySeg(doc, seg, text) {
  doc.querySelectorAll(`[data-pt="${seg.id}"]`).forEach((n) => { if (n.textContent !== text) n.textContent = text; });
  if (seg.kind === 'attr') doc.querySelectorAll(`[data-pt-attr-${seg.attr}="${seg.id}"]`).forEach((n) => n.setAttribute(seg.attr, text));
}
function applyAll() {
  const doc = frame.contentDocument;
  if (doc && page) page.segments.forEach((s) => applySeg(doc, s, showingOrig ? s.original : s.ko));
}
frame.addEventListener('load', () => {
  const doc = frame.contentDocument;
  applyAll();
  setEditMode();
  doc.addEventListener('input', (e) => {
    const el = e.target.closest && e.target.closest('[data-pt]');
    if (!el || showingOrig) return;
    const seg = page.segments[+el.dataset.pt];
    seg.ko = el.textContent;
    const ta = document.querySelector(`#segList textarea[data-id="${seg.id}"]`);
    if (ta) ta.value = seg.ko;
  });
  doc.addEventListener('click', (e) => {
    if (!$('#editMode').checked) return;
    if (e.target.closest('a')) e.preventDefault();
    const img = e.target.closest('img');
    if (img) { e.preventDefault(); pickImage(img); return; }
    const el = e.target.closest('[data-pt]');
    if (el) {
      const seg = page.segments[+el.dataset.pt];
      document.querySelectorAll('.seg.hl').forEach((x) => x.classList.remove('hl'));
      const row = document.querySelector(`.seg[data-id="${seg.id}"]`);
      if (row) { row.classList.add('hl'); row.scrollIntoView({ block: 'nearest' }); }
    }
  }, true);
  doc.addEventListener('submit', (e) => e.preventDefault(), true);
});
function setEditMode() {
  const on = $('#editMode').checked && !showingOrig;
  // display:contents 요소는 포커스/캐럿이 안 되므로 편집 중에는 inline 으로 바꾼다
  frame.contentDocument.querySelectorAll('[data-pt]').forEach((n) => { n.setAttribute('contenteditable', on ? 'true' : 'false'); if (n.tagName === 'SPAN') n.style.display = on ? 'inline' : 'contents'; });
}
$('#editMode').addEventListener('change', setEditMode);
$('#viewW').addEventListener('change', (e) => { frame.style.width = e.target.value; });
$('#showOrig').addEventListener('click', () => { showingOrig = !showingOrig; applyAll(); setEditMode(); });

let imgTarget;
function pickImage(img) { imgTarget = img; $('#imgPick').value = ''; $('#imgPick').click(); }
$('#imgPick').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f || !imgTarget) return;
  const r = new FileReader();
  r.onload = () => { imgTarget.removeAttribute('srcset'); imgTarget.setAttribute('src', r.result); };
  r.readAsDataURL(f);
});

function renderSegList() {
  const box = $('#segList');
  box.innerHTML = page.segments.map((s) => `<div class="seg" data-id="${s.id}"><small>${esc(s.kind === 'attr' ? `[${s.attr}] ` : '')}${esc(s.original)}</small><textarea data-id="${s.id}">${esc(s.ko)}</textarea></div>`).join('');
  box.querySelectorAll('textarea').forEach((ta) => ta.addEventListener('input', () => {
    const seg = page.segments[+ta.dataset.id];
    seg.ko = ta.value;
    if (!showingOrig) applySeg(frame.contentDocument, seg, seg.ko);
  }));
}
$('#filter').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('#segList .seg').forEach((d) => {
    const s = page.segments[+d.dataset.id];
    d.hidden = q && !(s.original + s.ko).toLowerCase().includes(q);
  });
});

function renderVideos() {
  const box = $('#videoBox');
  if (!page.videos.length) { box.innerHTML = ''; return; }
  box.innerHTML = `<h3>페이지 속 영상 ${page.videos.length}개</h3>` + page.videos.map((v, i) => `<div class="vid"><button data-i="${i}" type="button">영상 한글화 →</button><span>${esc(v.url)}</span></div>`).join('');
  box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    $('#videoUrl').value = page.videos[+b.dataset.i].url;
    document.querySelector('[data-tab="video"]').click();
  }));
}

$('#dlHtml').addEventListener('click', () => {
  const doc = frame.contentDocument.documentElement.cloneNode(true);
  doc.querySelectorAll('[data-pt]').forEach((n) => {
    if (n.tagName === 'SPAN') n.replaceWith(...n.childNodes);
    else { n.removeAttribute('data-pt'); n.removeAttribute('contenteditable'); }
  });
  doc.querySelectorAll('*').forEach((n) => [...n.attributes].forEach((a) => { if (a.name.startsWith('data-pt-attr-') || a.name === 'contenteditable') n.removeAttribute(a.name); }));
  const html = '<!doctype html>\n' + doc.outerHTML;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  a.download = 'korean-page.html';
  a.click();
});

/* ================= 영상 ================= */
let vjob = null; // jobId
let vdata = null; // {segments, overlays, info}

$('#videoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData();
  if ($('#videoFile').files[0]) fd.append('file', $('#videoFile').files[0]);
  else fd.append('url', $('#videoUrl').value);
  fd.append('stt', $('#optStt').checked);
  fd.append('ocr', $('#optOcr').checked);
  $('#videoGo').disabled = true;
  try {
    const { jobId } = await api('/api/video/analyze', fd, true);
    vjob = jobId;
    vdata = await poll(jobId, (m) => setStatus($('#videoStatus'), m));
    setStatus($('#videoStatus'), vdata.warnings.join(' / ') || '분석 완료 — 아래에서 문구를 고치고 "한글 영상 만들기"를 누르세요.', vdata.warnings.length > 0);
    $('#videoWork').hidden = false;
    $('#srcVideo').src = `/api/jobs/${jobId}/source`;
    renderSegs();
    renderOvs();
  } catch (err) {
    setStatus($('#videoStatus'), err.message, true);
  } finally {
    $('#videoGo').disabled = false;
  }
});

const num = (v) => (Number.isFinite(+v) ? +v : 0);
function renderSegs() {
  $('#segTable').innerHTML = vdata.segments.map((s, i) => `<div class="seg" data-i="${i}">
    <small>${esc(s.en || '')}</small>
    <div class="row two"><div class="row"><input type="number" step="0.1" data-f="start" value="${s.start}" title="시작(초)"><input type="number" step="0.1" data-f="end" value="${s.end}" title="끝(초)"><button type="button" data-seek>▶</button><button type="button" data-del>삭제</button></div></div>
    <textarea data-f="ko">${esc(s.ko)}</textarea></div>`).join('');
  bindTable('#segTable', vdata.segments, renderSegs);
}
function renderOvs() {
  $('#ovTable').innerHTML = vdata.overlays.map((o, i) => `<div class="seg" data-i="${i}">
    <small>${esc(o.en || '')}</small>
    <div class="row"><input type="number" step="0.1" data-f="start" value="${o.start}" title="시작"><input type="number" step="0.1" data-f="end" value="${o.end}" title="끝"><button type="button" data-seek>▶</button><button type="button" data-del>삭제</button></div>
    <div class="row"><input type="number" step="1" data-f="x" data-pct value="${Math.round(o.x * 100)}" title="x %"><input type="number" step="1" data-f="y" data-pct value="${Math.round(o.y * 100)}" title="y %"><input type="number" step="1" data-f="w" data-pct value="${Math.round(o.w * 100)}" title="너비 %"><input type="number" step="1" data-f="h" data-pct value="${Math.round(o.h * 100)}" title="높이 %"></div>
    <div class="row"><input type="color" data-f="bg" value="${/^#[0-9a-f]{6}$/i.test(o.bg) ? o.bg : '#000000'}" title="배경색"><input type="color" data-f="fg" value="${/^#[0-9a-f]{6}$/i.test(o.fg) ? o.fg : '#ffffff'}" title="글자색"><label><input type="checkbox" data-f="enabled" ${o.enabled === false ? '' : 'checked'}> 사용</label></div>
    <textarea data-f="ko">${esc(o.ko)}</textarea></div>`).join('');
  bindTable('#ovTable', vdata.overlays, renderOvs);
}
function bindTable(sel, arr, rerender) {
  document.querySelectorAll(`${sel} .seg`).forEach((row) => {
    const item = arr[+row.dataset.i];
    row.querySelectorAll('[data-f]').forEach((inp) => inp.addEventListener('input', () => {
      const f = inp.dataset.f;
      item[f] = inp.type === 'checkbox' ? inp.checked : inp.type === 'number' ? (inp.dataset.pct !== undefined ? num(inp.value) / 100 : num(inp.value)) : inp.value;
    }));
    row.querySelector('[data-seek]').addEventListener('click', () => { $('#srcVideo').currentTime = item.start; $('#srcVideo').play(); });
    row.querySelector('[data-del]').addEventListener('click', () => { arr.splice(+row.dataset.i, 1); rerender(); });
  });
}
$('#addSeg').addEventListener('click', () => { const t = $('#srcVideo').currentTime || 0; vdata.segments.push({ start: +t.toFixed(1), end: +(t + 2).toFixed(1), en: '', ko: '' }); renderSegs(); });
$('#addOv').addEventListener('click', () => { const t = $('#srcVideo').currentTime || 0; vdata.overlays.push({ start: +t.toFixed(1), end: +(t + 3).toFixed(1), x: 0.1, y: 0.8, w: 0.8, h: 0.12, en: '', ko: '', bg: '#000000', fg: '#ffffff' }); renderOvs(); });

$('#dlSrt').addEventListener('click', async () => {
  const res = await fetch('/api/srt', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ segments: vdata.segments }) });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(await res.blob());
  a.download = 'korean.srt';
  a.click();
});

$('#renderGo').addEventListener('click', async () => {
  $('#renderGo').disabled = true;
  $('#outVideo').hidden = $('#outLink').hidden = true;
  try {
    const edit = { segments: vdata.segments, overlays: vdata.overlays, dub: $('#optDub').checked, keepOriginalAudio: +$('#optBg').value, burnSubtitles: $('#optSub').checked, voice: $('#optVoice').value };
    const { jobId } = await api('/api/video/render', { jobId: vjob, edit });
    const r = await poll(jobId, (m) => setStatus($('#renderStatus'), m));
    setStatus($('#renderStatus'), '완성! 고칠 곳이 있으면 수정 후 다시 만들기를 누르세요.');
    $('#outVideo').src = $('#outLink').href = r.file;
    $('#outVideo').hidden = $('#outLink').hidden = false;
  } catch (err) {
    setStatus($('#renderStatus'), err.message, true);
  } finally {
    $('#renderGo').disabled = false;
  }
});
