'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* .env 없음 */ }

const { buildPage } = require('./lib/page');
const video = require('./lib/video');

const app = express();
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'page-translator-'));
const upload = multer({ dest: path.join(WORK, 'uploads'), limits: { fileSize: 500 * 1024 * 1024 } });
const jobs = new Map();

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const wrap = (fn) => (req, res) => fn(req, res).catch((e) => res.status(400).json({ error: e.message }));

/* ---- 페이지 ---- */
app.post('/api/page', wrap(async (req, res) => {
  const { url, tone, glossary, render, keepScripts } = req.body || {};
  if (!url) throw new Error('URL을 입력하세요.');
  res.json(await buildPage(url, { tone, glossary, render: !!render, keepScripts: !!keepScripts }));
}));

/* ---- 영상 작업(비동기 Job) ---- */
function startJob(fn) {
  const id = crypto.randomBytes(6).toString('hex');
  const dir = path.join(WORK, id);
  fs.mkdirSync(dir, { recursive: true });
  const job = { id, dir, status: 'running', message: '시작…', result: null, error: null };
  jobs.set(id, job);
  Promise.resolve()
    .then(() => fn(job))
    .then((r) => { job.result = r; job.status = 'done'; job.message = '완료'; })
    .catch((e) => { job.status = 'error'; job.error = e.message; });
  return job;
}
const log = (job) => (m) => { job.message = m; };

app.post('/api/video/analyze', upload.single('file'), wrap(async (req, res) => {
  const url = req.body.url;
  if (!url && !req.file) throw new Error('영상 URL을 입력하거나 파일을 올려주세요.');
  const opts = { doStt: req.body.stt !== 'false', doOcr: req.body.ocr !== 'false' };
  const job = startJob(async (j) => {
    j.message = '영상 가져오는 중…';
    j.source = req.file ? req.file.path : await video.fetchVideo(url, j.dir);
    const r = await video.analyze(j.source, j.dir, log(j), opts);
    return r;
  });
  res.json({ jobId: job.id });
}));

app.post('/api/video/render', wrap(async (req, res) => {
  const src = jobs.get(req.body.jobId);
  if (!src || !src.source) throw new Error('분석 작업을 찾을 수 없습니다. 다시 분석하세요.');
  const job = startJob(async (j) => {
    j.source = src.source;
    await video.render(src.source, j.dir, req.body.edit || {}, log(j));
    return { file: `/api/jobs/${j.id}/output.mp4` };
  });
  res.json({ jobId: job.id });
}));

app.get('/api/jobs/:id', (req, res) => {
  const j = jobs.get(req.params.id);
  if (!j) return res.status(404).json({ error: '작업 없음' });
  res.json({ status: j.status, message: j.message, result: j.result, error: j.error });
});

app.get('/api/jobs/:id/output.mp4', (req, res) => {
  const j = jobs.get(req.params.id);
  const f = j && path.join(j.dir, 'output.mp4');
  if (!f || !fs.existsSync(f)) return res.status(404).end();
  res.download(f, 'korean-version.mp4');
});

app.get('/api/jobs/:id/source', (req, res) => {
  const j = jobs.get(req.params.id);
  if (!j || !j.source || !fs.existsSync(j.source)) return res.status(404).end();
  res.type('video/mp4').sendFile(path.resolve(j.source));
});

app.post('/api/srt', (req, res) => {
  res.type('text/plain; charset=utf-8').set('Content-Disposition', 'attachment; filename="korean.srt"').send(video.toSrt(req.body.segments || []));
});

const PORT = process.env.PORT || 3100;
if (require.main === module) {
  app.listen(PORT, () => console.log(`페이지 번역 도구: http://localhost:${PORT}`));
}
module.exports = app;
