'use strict';
const Anthropic = require('@anthropic-ai/sdk');

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
let client;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY 가 설정되지 않았습니다. .env 파일을 확인하세요.');
  }
  client = client || new Anthropic();
  return client;
}

function extractJson(text) {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (m ? m[1] : text).trim();
  const start = body.search(/[\[{]/);
  return JSON.parse(start > 0 ? body.slice(start) : body);
}

async function askJson(content, { system, maxTokens = 8000 } = {}) {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content }],
  });
  return extractJson(msg.content.map((b) => b.text || '').join(''));
}

const SYSTEM = [
  '당신은 한국어 광고 카피 전문 번역가입니다. 영문 원페이지 광고/랜딩페이지 문구를 자연스러운 한국어로 옮깁니다.',
  '규칙: 브랜드명·제품명·URL·이메일·전화번호·숫자·통화기호는 그대로 둡니다. 원문에 없는 내용(가격, 기간, 효능, 수치)을 지어내지 않습니다.',
  '과장·허위 표현을 새로 만들지 않고, 원문 톤(친근/격식)을 유지합니다. 같은 문장을 반복하지 않고 문맥에 맞게 다양하게 표현합니다.',
  '이름과 날짜는 절대 틀리지 않게 그대로 옮기고, 번역 불가한 항목은 원문을 그대로 반환합니다.',
].join('\n');

// strings: string[]  →  한국어 string[] (같은 길이·같은 순서)
async function translateList(strings, { tone = '', glossary = '', context = '' } = {}) {
  if (process.env.PT_MOCK === '1') return strings.map((s) => `[KO] ${s}`);
  const out = new Array(strings.length);
  const BATCH_CHARS = 6000;
  let batch = [];
  let chars = 0;
  const flush = async () => {
    if (!batch.length) return;
    const items = batch;
    batch = [];
    chars = 0;
    const prompt = [
      context && `페이지 맥락: ${context}`,
      tone && `원하는 말투: ${tone}`,
      glossary && `용어집(반드시 준수):\n${glossary}`,
      '아래 JSON 배열의 각 문자열을 한국어로 번역하세요. 같은 길이의 JSON 문자열 배열만 출력하세요(설명 금지).',
      '앞뒤 공백은 유지하고, 줄바꿈이 있으면 그대로 유지하세요.',
      JSON.stringify(items.map((i) => i.text)),
    ].filter(Boolean).join('\n\n');
    let res;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        res = await askJson(prompt, { system: SYSTEM });
        if (Array.isArray(res) && res.length === items.length) break;
      } catch (e) {
        if (attempt === 1) throw e;
      }
      res = null;
    }
    if (!res) throw new Error('번역 결과 형식이 올바르지 않습니다. 다시 시도하세요.');
    items.forEach((it, k) => (out[it.idx] = String(res[k])));
  };
  for (let i = 0; i < strings.length; i++) {
    if (chars + strings[i].length > BATCH_CHARS || batch.length >= 80) await flush();
    batch.push({ idx: i, text: strings[i] });
    chars += strings[i].length;
  }
  await flush();
  return out;
}

module.exports = { askJson, translateList, SYSTEM, getClient, MODEL };
