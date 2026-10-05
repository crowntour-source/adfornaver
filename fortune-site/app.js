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

function profileOf(b) { return { cn: cnAnimal(b), sign: westernSign(b), lp: lifePath(b) }; }

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function shipName(nameA, nameB) {
  const A = Array.from((nameA || '').trim()), B = Array.from((nameB || '').trim());
  if (!A.length || !B.length) return '';
  const head = A.slice(0, Math.ceil(A.length / 2)).join('');
  const tail = B.slice(Math.floor(B.length / 2)).join('');
  const out = head + tail;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

// Works from zodiac/sign/life-path indices only, so share links need no birth dates.
function matchFromProfiles(pA, pB, nameA, nameB) {
  const cn = cnRelation(pA.cn, pB.cn);
  const wr = westernRelation(pA.sign, pB.sign);
  const lp = lifeRelation(pA.lp, pB.lp);
  const pair = [nameA || '', nameB || ''].map(s => s.trim().toLowerCase()).sort().join('|');
  const nameVibe = pair === '|' ? 70 : 60 + (strHash(pair) % 21); // 60..80, playful
  const score = Math.round(cn.score * 0.35 + wr.score * 0.25 + lp.score * 0.25 + nameVibe * 0.15);
  const jitter = k => (strHash(pair + ':' + score + ':' + k) % 21) - 10;
  const stats = {
    comm: clamp(lp.score + jitter('c'), 35, 99),
    passion: clamp(wr.score + jitter('p'), 35, 99),
    trust: clamp(cn.score + jitter('t'), 35, 99),
    humor: clamp(nameVibe + 10 + jitter('h'), 35, 99)
  };
  return { score, cn, wr, lp, stats, ship: shipName(nameA, nameB) };
}

function compatibility(bA, bB, nameA, nameB) {
  return matchFromProfiles(profileOf(bA), profileOf(bB), nameA, nameB);
}

function hslHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return '#' + [f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, '0')).join('');
}

const IDOL_EMOJI = ['🌸','⭐','🔥','💜','🌙','🍀','🐰','🐻','✨','🎤','💎','🦋'];
// Fun "idol profile" derived from the name (stable for the same input)
function idolProfile(n, seed) {
  const h = k => strHash(`${seed}|${n.ko}|${k}`);
  const hue = h('hue') % 360;
  return {
    pos: h('pos') % 7,
    lucky: (h('lucky') % 99) + 1,
    hue,
    color: hslHex(hue, 75, 60),
    emoji: IDOL_EMOJI[h('emoji') % IDOL_EMOJI.length]
  };
}

function verdictIndex(score) { return score >= 85 ? 0 : score >= 72 ? 1 : score >= 60 ? 2 : 3; }

// element e is supported by the one that generates it (wood>fire>earth>metal>water>wood)
function supportElement(e) { return (e + 4) % 5; }

function seededOrder(arr, seed) {
  return arr.map((x, i) => ({ x, k: strHash(seed + ':' + i) })).sort((a, b) => a.k - b.k).map(o => o.x);
}

function pickSurname(seed, choice) {
  if (choice !== 'auto') { const f = SURNAMES.find(s => s.rom === choice); if (f) return f; }
  return SURNAMES[strHash(seed + ':sn') % SURNAMES.length];
}

// b may be null (birth date optional). vibe: 'any' or a vibe key.
function suggestNames(b, gender, vibe, seed) {
  const e = b ? yearElement(b) : null, sup = b ? supportElement(e) : null;
  const pool = NAMES.filter(n => gender === 'u' || n.g === gender || n.g === 'u');
  const rank = n => (vibe !== 'any' && n.v === vibe ? 0 : 4) + (e === null || n.el === null ? 2 : n.el === sup ? 0 : n.el === e ? 1 : 2);
  return seededOrder(pool, seed).sort((x, y) => rank(x) - rank(y))
    .map(n => ({ ...n, badge: n.hj === null ? 'native' : e === null ? null : n.el === sup ? 'badgeSupport' : n.el === e ? 'badgeSame' : 'badgeOther' }));
}

function meaningOf(n, g) {
  return n.hj === null ? g.native[n.ko] : [...n.hj].map(c => `${c} ${g.gloss[c]}`).join(' · ');
}

/* ---------- UI ---------- */
function langOrder() {
  const pref = ['en', 'ko', 'th', 'vi', 'id', 'zh', 'fr', 'es'];
  const codes = Object.keys(LANG_DATA);
  return pref.filter(c => codes.includes(c)).concat(codes.filter(c => !pref.includes(c)));
}

// Resolve strings for a language, falling back to English per key
function uiFor(code) {
  const en = LANG_DATA[DEFAULT_LANG].ui, cur = LANG_DATA[code].ui;
  return { ...en, ...cur, rel: { ...en.rel, ...cur.rel } };
}

if (typeof module !== 'undefined') {
  module.exports = { parseDate, cnAnimal, yearElement, westernSign, lifePath, compatibility, matchFromProfiles, shipName, idolProfile, suggestNames, meaningOf, pickSurname };
}
