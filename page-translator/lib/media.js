'use strict';
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let FFMPEG = process.env.FFMPEG_PATH;
if (!FFMPEG) {
  const sys = spawnSync('ffmpeg', ['-version']);
  FFMPEG = sys.status === 0 ? 'ffmpeg' : require('ffmpeg-static');
}

function run(cmd, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd });
    let err = '';
    p.stderr.on('data', (d) => { err += d; if (err.length > 200000) err = err.slice(-100000); });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve(err) : reject(new Error(`${path.basename(cmd)} 실패(${code}): ${err.slice(-800)}`))));
  });
}
const ffmpeg = (args, o) => run(FFMPEG, ['-y', '-hide_banner', ...args], o);

// ffprobe 없이 ffmpeg -i 출력에서 길이/해상도/오디오 유무를 읽는다.
async function probe(file) {
  const err = await new Promise((resolve) => {
    const p = spawn(FFMPEG, ['-hide_banner', '-i', file]);
    let s = '';
    p.stderr.on('data', (d) => (s += d));
    p.on('close', () => resolve(s));
  });
  const d = err.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  const v = err.match(/Video:.*?,\s*(\d{2,5})x(\d{2,5})/);
  if (!d || !v) throw new Error('영상 파일을 읽을 수 없습니다.');
  return {
    duration: +d[1] * 3600 + +d[2] * 60 + +d[3],
    width: +v[1],
    height: +v[2],
    hasAudio: /Audio:/.test(err),
  };
}

async function audioDuration(file) {
  const err = await new Promise((resolve) => {
    const p = spawn(FFMPEG, ['-hide_banner', '-i', file]);
    let s = '';
    p.stderr.on('data', (d) => (s += d));
    p.on('close', () => resolve(s));
  });
  const d = err.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  return d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0;
}

function hasYtDlp() {
  return spawnSync('yt-dlp', ['--version']).status === 0;
}

module.exports = { ffmpeg, probe, audioDuration, run, hasYtDlp, FFMPEG, fs, path };
