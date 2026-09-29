'use strict';
const fs = require('fs');
const path = require('path');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { safeFetch } = require('./net');
const { askJson, translateList, SYSTEM } = require('./claude');
const { ffmpeg, probe, audioDuration, run, hasYtDlp } = require('./media');

const FONT_FILE = process.env.FONT_PATH || path.join(__dirname, '..', 'fonts', 'NanumGothic-Bold.ttf');
GlobalFonts.registerFromPath(FONT_FILE, 'KoFont');

const OPENAI = 'https://api.openai.com/v1';
const openaiKey = () => {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY 가 설정되지 않았습니다(음성 인식/한글 더빙에 필요).');
  return process.env.OPENAI_API_KEY;
};

/* ---------- 1. 영상 가져오기 ---------- */
async function fetchVideo(url, dir) {
  const out = path.join(dir, 'source.mp4');
  if (/youtube\.com|youtu\.be|vimeo\.com|wistia|loom\.com/i.test(url) || !/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) {
    if (hasYtDlp()) {
      await run('yt-dlp', ['-f', 'mp4/bestvideo[ext=mp4]+bestaudio/best', '--merge-output-format', 'mp4', '--no-playlist', '-o', out, url]);
      return out;
    }
  }
  const { res } = await safeFetch(url, { timeout: 120000 });
  if (!res.ok) throw new Error(`영상을 내려받지 못했습니다 (HTTP ${res.status}).`);
  const len = +res.headers.get('content-length') || 0;
  if (len > 500 * 1024 * 1024) throw new Error('영상이 너무 큽니다(500MB 초과).');
  const ws = fs.createWriteStream(out);
  const reader = res.body.getReader();
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 500 * 1024 * 1024) { ws.destroy(); throw new Error('영상이 너무 큽니다(500MB 초과).'); }
    if (!ws.write(value)) await new Promise((r) => ws.once('drain', r));
  }
  await new Promise((r) => ws.end(r));
  return out;
}

/* ---------- 2. 음성 인식(STT) ---------- */
async function transcribe(videoFile, dir) {
  const wav = path.join(dir, 'audio.mp3');
  await ffmpeg(['-i', videoFile, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '48k', wav]);
  if (process.env.PT_MOCK === '1') return [{ start: 0.5, end: 2.5, text: 'Hello from the mock transcript.' }];
  const form = new FormData();
  form.append('model', 'whisper-1');
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'segment');
  form.append('file', new Blob([fs.readFileSync(wav)]), 'audio.mp3');
  const res = await fetch(`${OPENAI}/audio/transcriptions`, { method: 'POST', headers: { authorization: `Bearer ${openaiKey()}` }, body: form });
  if (!res.ok) throw new Error(`음성 인식 실패: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  return (j.segments || []).map((s) => ({ start: +s.start.toFixed(2), end: +s.end.toFixed(2), text: s.text.trim() })).filter((s) => s.text);
}

/* ---------- 3. 화면 속 영어 텍스트 찾기(Claude 비전) ---------- */
async function detectOnScreenText(videoFile, dir, info) {
  const fdir = path.join(dir, 'frames');
  fs.mkdirSync(fdir, { recursive: true });
  const interval = Math.max(1, info.duration / 45);
  await ffmpeg(['-i', videoFile, '-vf', `fps=1/${interval},scale=768:-2`, '-q:v', '5', path.join(fdir, '%04d.jpg')]);
  const files = fs.readdirSync(fdir).filter((f) => f.endsWith('.jpg')).sort();
  if (process.env.PT_MOCK === '1') {
    return [{ start: 0, end: Math.min(2, info.duration), x: 0.1, y: 0.1, w: 0.5, h: 0.12, en: 'SALE NOW', ko: '[KO] SALE NOW', bg: '#000000', fg: '#ffffff' }];
  }
  const found = []; // {t, text, x,y,w,h,bg,fg}
  for (let i = 0; i < files.length; i += 6) {
    const chunk = files.slice(i, i + 6);
    const content = [];
    chunk.forEach((f, k) => {
      const t = +((i + k) * interval).toFixed(2);
      content.push({ type: 'text', text: `프레임 ${k} (t=${t}s)` });
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: fs.readFileSync(path.join(dir, 'frames', f)).toString('base64') } });
    });
    content.push({
      type: 'text',
      text: [
        '각 프레임에서 화면에 "그려진" 영어 자막/문구/버튼 텍스트를 모두 찾으세요. 로고, 브랜드명, URL, 전화번호, 워터마크는 제외합니다.',
        '좌표는 프레임 크기 대비 0~1 비율(x,y=좌상단, w,h=크기)이며 텍스트 영역을 약간 여유 있게 감싸야 합니다.',
        'bg=텍스트 뒤 배경색 hex, fg=글자색 hex. JSON만 출력:',
        '[{"frame":0,"items":[{"text":"...","x":0.1,"y":0.8,"w":0.5,"h":0.1,"bg":"#000000","fg":"#ffffff"}]}, ...]',
      ].join('\n'),
    });
    const res = await askJson(content, { system: '당신은 영상 프레임의 텍스트 위치를 정확히 찾는 OCR 도우미입니다. 보이는 글자만 기록하고 추측하지 않습니다.' });
    for (const fr of res || []) {
      for (const it of fr.items || []) found.push({ t: +((i + fr.frame) * interval).toFixed(2), ...it });
    }
  }
  // 연속 프레임의 같은 텍스트를 하나의 구간으로 병합
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const groups = [];
  for (const f of found.sort((a, b) => a.t - b.t)) {
    const g = groups.find((g) => norm(g.en) === norm(f.text) && f.t - g.last <= interval * 1.5 + 0.01);
    if (g) { g.last = f.t; g.end = f.t + interval; }
    else groups.push({ en: f.text, start: f.t, end: f.t + interval, last: f.t, x: f.x, y: f.y, w: f.w, h: f.h, bg: f.bg || '#000000', fg: f.fg || '#ffffff' });
  }
  const list = groups.filter((g) => norm(g.en).length > 1).map(({ last, ...g }) => ({ ...g, end: Math.min(g.end, info.duration) }));
  const ko = await translateList(list.map((g) => g.en), { context: '영상 화면 속 자막/문구(짧게, 박스 안에 들어가도록)' });
  return list.map((g, i) => ({ ...g, ko: ko[i] }));
}

/* ---------- 4. 분석 파이프라인 ---------- */
async function analyze(videoFile, dir, log, { doStt = true, doOcr = true } = {}) {
  const info = await probe(videoFile);
  const result = { info, segments: [], overlays: [], warnings: [] };
  if (doStt && info.hasAudio) {
    log('음성 인식 중…');
    try {
      const segs = await transcribe(videoFile, dir);
      log('음성 번역 중…');
      const ko = segs.length ? await translateList(segs.map((s) => s.text), { context: '영상 내레이션/대사(더빙용이므로 원문과 비슷한 길이로 간결하게)' }) : [];
      result.segments = segs.map((s, i) => ({ ...s, en: s.text, ko: ko[i], text: undefined }));
    } catch (e) {
      result.warnings.push(`음성 처리 건너뜀: ${e.message}`);
    }
  }
  if (doOcr) {
    log('화면 속 영어 텍스트 찾는 중…');
    try {
      result.overlays = await detectOnScreenText(videoFile, dir, info);
    } catch (e) {
      result.warnings.push(`화면 텍스트 처리 건너뜀: ${e.message}`);
    }
  }
  return result;
}

/* ---------- 5. 렌더링 ---------- */
async function tts(text, file, voice) {
  if (process.env.PT_MOCK === '1') {
    await ffmpeg(['-f', 'lavfi', '-i', `sine=frequency=440:duration=${Math.max(0.6, text.length * 0.08)}`, file]);
    return;
  }
  const res = await fetch(`${OPENAI}/audio/speech`, {
    method: 'POST',
    headers: { authorization: `Bearer ${openaiKey()}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.TTS_MODEL || 'tts-1', voice: voice || 'nova', input: text, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`한글 음성 합성 실패: ${(await res.text()).slice(0, 300)}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

function overlayPng(ov, W, H, file) {
  const bw = Math.max(2, Math.round(ov.w * W));
  const bh = Math.max(2, Math.round(ov.h * H));
  const canvas = createCanvas(bw, bh);
  const c = canvas.getContext('2d');
  c.fillStyle = ov.bg || '#000000';
  c.fillRect(0, 0, bw, bh);
  const lines = String(ov.ko || '').split('\n');
  const pad = bw * 0.04;
  let size = Math.floor((bh / lines.length) * 0.78);
  const fits = (s) => { c.font = `${s}px KoFont`; return Math.max(...lines.map((l) => c.measureText(l).width)) <= bw - pad * 2; };
  while (size > 8 && !fits(size)) size -= 1;
  c.font = `${size}px KoFont`;
  c.fillStyle = ov.fg || '#ffffff';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  lines.forEach((l, i) => c.fillText(l, bw / 2, (bh / lines.length) * (i + 0.5)));
  fs.writeFileSync(file, canvas.toBuffer('image/png'));
  return { x: Math.round(ov.x * W), y: Math.round(ov.y * H) };
}

async function render(videoFile, dir, edit, log) {
  const info = await probe(videoFile);
  const { segments = [], overlays = [], dub = true, keepOriginalAudio = 0.08, burnSubtitles = false, voice } = edit;
  const out = path.join(dir, 'output.mp4');
  const inputs = ['-i', videoFile];
  const filters = [];
  let idx = 1;

  // 화면 텍스트 → PNG 오버레이
  let vlabel = '0:v';
  const ovs = overlays.filter((o) => o.enabled !== false && o.ko);
  ovs.forEach((o, i) => {
    const png = path.join(dir, `ov${i}.png`);
    const pos = overlayPng(o, info.width, info.height, png);
    inputs.push('-i', png);
    const next = `v${i}`;
    filters.push(`[${vlabel}][${idx}:v]overlay=${pos.x}:${pos.y}:enable='between(t,${(+o.start).toFixed(2)},${(+o.end).toFixed(2)})'[${next}]`);
    vlabel = next;
    idx++;
  });

  // 자막 번인(하단 중앙): 세그먼트마다 PNG
  if (burnSubtitles) {
    segments.filter((s) => s.ko).forEach((s, i) => {
      const png = path.join(dir, `sub${i}.png`);
      const ov = { x: 0.05, y: 0.84, w: 0.9, h: 0.11, ko: s.ko, bg: '#000000', fg: '#ffffff' };
      const pos = overlayPng(ov, info.width, info.height, png);
      inputs.push('-i', png);
      const next = `s${i}`;
      filters.push(`[${vlabel}][${idx}:v]overlay=${pos.x}:${pos.y}:enable='between(t,${s.start},${s.end})'[${next}]`);
      vlabel = next;
      idx++;
    });
  }

  // 한글 더빙
  let alabel = info.hasAudio && keepOriginalAudio > 0 ? '0:a' : null;
  const dubParts = [];
  if (dub) {
    const list = segments.filter((s) => s.ko && s.ko.trim());
    for (let i = 0; i < list.length; i++) {
      log(`한글 음성 만드는 중 (${i + 1}/${list.length})`);
      const s = list[i];
      const raw = path.join(dir, `tts${i}.mp3`);
      await tts(s.ko, raw, voice);
      const dur = await audioDuration(raw);
      const next = list[i + 1];
      const slot = Math.max(0.5, (next ? Math.min(next.start, s.end + 1.2) : s.end + 1.2) - s.start);
      const tempo = dur > slot ? Math.min(1.6, dur / slot) : 1;
      const fit = path.join(dir, `fit${i}.wav`);
      await ffmpeg(['-i', raw, '-af', tempo > 1.01 ? `atempo=${tempo.toFixed(3)}` : 'anull', '-ar', '44100', '-ac', '2', fit]);
      dubParts.push({ file: fit, delayMs: Math.round(s.start * 1000) });
    }
  }
  const aInputs = [];
  dubParts.forEach((d) => { inputs.push('-i', d.file); aInputs.push(`[${idx}:a]adelay=${d.delayMs}|${d.delayMs}[d${idx}]`); d.label = `[d${idx}]`; idx++; });
  filters.push(...aInputs);
  const mixIn = [];
  if (alabel) { filters.push(`[0:a]volume=${keepOriginalAudio}[bg]`); mixIn.push('[bg]'); }
  dubParts.forEach((d) => mixIn.push(d.label));
  let amap = null;
  if (mixIn.length) {
    filters.push(`${mixIn.join('')}amix=inputs=${mixIn.length}:normalize=0:duration=longest:dropout_transition=0[aout]`);
    amap = '[aout]';
  }

  const args = [...inputs];
  if (filters.length) args.push('-filter_complex', filters.join(';'));
  args.push('-map', vlabel === '0:v' ? '0:v' : `[${vlabel}]`);
  if (amap) args.push('-map', amap);
  else if (info.hasAudio) args.push('-map', '0:a');
  args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-t', String(info.duration), out);
  log('영상 합치는 중…');
  await ffmpeg(args);
  return out;
}

function toSrt(segments) {
  const ts = (t) => {
    const ms = Math.round(t * 1000);
    const p = (n, l = 2) => String(n).padStart(l, '0');
    return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
  };
  return segments.filter((s) => s.ko).map((s, i) => `${i + 1}\n${ts(s.start)} --> ${ts(s.end)}\n${s.ko}\n`).join('\n');
}

module.exports = { fetchVideo, analyze, render, toSrt };
