/* Shared data/helpers for extra guide pages. Syllable glosses come from lang/*.js (single source of truth). */
const fs = require('fs'), path = require('path');
const LD = {};
for (const f of fs.readdirSync(path.join(__dirname, '..', 'lang'))) {
  new Function('registerLang', fs.readFileSync(path.join(__dirname, '..', 'lang', f), 'utf8'))((c, d) => { LD[c] = d; });
}
const SURNAMES = [
  { ko: '김', hj: '金', sp: 'Kim', m: { en: 'gold, metal', ko: '쇠, 금', th: 'ทอง โลหะ', vi: 'vàng, kim loại', id: 'emas, logam' } },
  { ko: '이', hj: '李', sp: 'Lee, Yi, Rhee, I', m: { en: 'plum', ko: '오얏(자두)', th: 'ลูกพลัม', vi: 'mận', id: 'plum' } },
  { ko: '박', hj: '朴', sp: 'Park, Pak, Bak', m: { en: 'simple, plain', ko: '순박함', th: 'เรียบง่าย', vi: 'giản dị', id: 'sederhana' } },
  { ko: '최', hj: '崔', sp: 'Choi, Choe', m: { en: 'lofty, high', ko: '높고 큼', th: 'สูงส่ง', vi: 'cao vời', id: 'menjulang' } },
  { ko: '정', hj: '鄭', sp: 'Jung, Jeong, Chung', m: { en: 'ancient state name', ko: '옛 나라 이름', th: 'ชื่อรัฐโบราณ', vi: 'tên một nước cổ', id: 'nama negara kuno' } },
  { ko: '강', hj: '姜', sp: 'Kang', m: { en: 'ginger', ko: '생강', th: 'ขิง', vi: 'gừng', id: 'jahe' } },
  { ko: '조', hj: '趙', sp: 'Cho, Jo', m: { en: 'ancient state name', ko: '옛 나라 이름', th: 'ชื่อรัฐโบราณ', vi: 'tên một nước cổ', id: 'nama negara kuno' } },
  { ko: '윤', hj: '尹', sp: 'Yoon, Yun', m: { en: 'to govern', ko: '다스림', th: 'ปกครอง', vi: 'cai quản', id: 'memerintah' } },
  { ko: '장', hj: '張', sp: 'Jang, Chang', m: { en: 'to stretch (a bow)', ko: '활을 당김', th: 'ขึงคันธนู', vi: 'giương cung', id: 'merentang busur' } },
  { ko: '임', hj: '林', sp: 'Lim, Im, Yim', m: { en: 'forest', ko: '숲', th: 'ป่า', vi: 'rừng', id: 'hutan' } }
];
const SYL = [['지','智'],['서','瑞'],['현','賢'],['하','河'],['준','俊'],['수','秀'],['아','雅'],['은','恩'],['해','海'],['성','星'],['월','月'],['화','花'],['애','愛'],['연','蓮'],['천','天'],['용','勇'],['채','彩'],['주','珠'],['하','夏'],['윤','潤'],['윤','允'],['우','宇'],['우','雨']];
const table = (head, rows) => `<table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
module.exports = {
  surnameTable: (lang, head) => table(head, SURNAMES.map((s, i) => [i + 1, s.ko, s.hj, s.sp, s.m[lang]])),
  syllableTable: (lang, head) => table(head, SYL.map(([k, h]) => [k, h, LD[lang].gloss[h]])),
  table
};
