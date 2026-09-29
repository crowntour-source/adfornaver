'use strict';
// 외부 API 없이(PT_MOCK=1) 페이지/영상 파이프라인 전체를 점검하는 스모크 테스트
process.env.PT_MOCK = '1';
process.env.PT_ALLOW_PRIVATE = '1';
const assert = require('assert');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ffmpeg, probe } = require('../lib/media');

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pt-test-'));
  const mp4 = path.join(tmp, 'demo.mp4');
  await ffmpeg(['-f', 'lavfi', '-i', 'testsrc=size=640x360:rate=25:duration=4', '-f', 'lavfi', '-i', 'sine=frequency=300:duration=4', '-shortest', '-pix_fmt', 'yuv420p', mp4]);

  const fixture = http.createServer((req, res) => {
    if (req.url === '/demo.mp4') return res.end(fs.readFileSync(mp4));
    res.setHeader('content-type', 'text/html');
    res.end(`<html><head><title>Best Tours</title><meta name="description" content="Book your trip today"></head>
      <body><h1>Welcome to <b>Crown Tour</b></h1><p>Get 20% off your first booking.</p>
      <img src="/a.png" alt="Happy travelers"><input type="submit" value="Book Now">
      <script>document.body.innerHTML='x'</script><p>이미 한글</p>
      <video src="/demo.mp4"></video></body></html>`);
  }).listen(0);
  const base = `http://127.0.0.1:${fixture.address().port}`;

  const app = require('../server');
  const srv = app.listen(0);
  const api = `http://127.0.0.1:${srv.address().port}`;
  const post = async (u, b) => (await fetch(api + u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) })).json();
  const poll = async (id) => { for (;;) { const j = await (await fetch(`${api}/api/jobs/${id}`)).json(); if (j.status !== 'running') return j; await new Promise((r) => setTimeout(r, 300)); } };

  // 페이지
  const p = await post('/api/page', { url: base + '/' });
  assert(!p.error, p.error);
  assert(p.segments.some((s) => s.original === 'Crown Tour') && p.segments.some((s) => s.attr === 'alt'), 'segments');
  assert(!/<script/i.test(p.template), 'script removed');
  assert(!p.segments.some((s) => /이미/.test(s.original)), 'korean skipped');
  assert(p.videos.length === 1 && p.videos[0].url.endsWith('/demo.mp4'), 'video found');
  console.log('page ok:', p.segments.length, 'segments');

  // 사설 주소 차단
  process.env.PT_ALLOW_PRIVATE = '0';
  assert((await post('/api/page', { url: 'http://127.0.0.1/' })).error, 'ssrf blocked');
  process.env.PT_ALLOW_PRIVATE = '1';

  // 영상
  const fd = new FormData();
  fd.append('url', p.videos[0].url);
  const { jobId } = await (await fetch(api + '/api/video/analyze', { method: 'POST', body: fd })).json();
  const a = await poll(jobId);
  assert.equal(a.status, 'done', a.error);
  assert(a.result.segments.length && a.result.overlays.length, 'analysis');
  const r = await post('/api/video/render', { jobId, edit: { segments: a.result.segments, overlays: a.result.overlays, dub: true, keepOriginalAudio: 0.1, burnSubtitles: true } });
  const done = await poll(r.jobId);
  assert.equal(done.status, 'done', done.error);
  const out = path.join(tmp, 'out.mp4');
  fs.writeFileSync(out, Buffer.from(await (await fetch(api + done.result.file)).arrayBuffer()));
  const info = await probe(out);
  assert(info.hasAudio && info.width === 640 && Math.abs(info.duration - 4) < 0.5, JSON.stringify(info));
  console.log('video ok:', info, 'sample at', out);
  fs.copyFileSync(out, path.join(tmp, 'keep.mp4'));
  srv.close(); fixture.close();
  console.log('ALL PASS');
  process.exit(0);
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
