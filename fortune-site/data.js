/* Language-neutral data. Per-language text lives in lang/<code>.js */
const LANG_DATA = {};
const DEFAULT_LANG = 'en';
function registerLang(code, d) { LANG_DATA[code] = d; }

/* Sign start dates [month, day] -> sign index (Aries=0 ... Pisces=11) */
const WESTERN = [
  { m: 1,  d: 20, i: 10 }, { m: 2,  d: 19, i: 11 }, { m: 3,  d: 21, i: 0 },
  { m: 4,  d: 20, i: 1 },  { m: 5,  d: 21, i: 2 },  { m: 6,  d: 21, i: 3 },
  { m: 7,  d: 23, i: 4 },  { m: 8,  d: 23, i: 5 },  { m: 9,  d: 23, i: 6 },
  { m: 10, d: 23, i: 7 },  { m: 11, d: 22, i: 8 },  { m: 12, d: 22, i: 9 }
];
/* Element per sign: 0 fire, 1 earth, 2 air, 3 water (repeats every 4 signs) */
const SIGN_ELEMENT = [0,1,2,3,0,1,2,3,0,1,2,3];

/* Korean family names (most common) */
const SURNAMES = [
  { ko: '김', rom: 'Kim' }, { ko: '이', rom: 'Lee' }, { ko: '박', rom: 'Park' },
  { ko: '최', rom: 'Choi' }, { ko: '정', rom: 'Jung' }, { ko: '강', rom: 'Kang' },
  { ko: '조', rom: 'Cho' }, { ko: '윤', rom: 'Yoon' }, { ko: '장', rom: 'Jang' },
  { ko: '임', rom: 'Lim' }
];

/* Given names. g: m / f / u(nisex). el: 0 wood 1 fire 2 earth 3 metal 4 water (null = pure Korean).
   v (vibe): cute / cool / elegant / bright / strong. hj: Hanja (glosses in lang files) or null. */
const NAMES = [
  { ko:'민준', hj:'敏俊', rom:'Minjun',  py:'Mǐn jùn',   g:'m', el:0, v:'cool' },
  { ko:'건우', hj:'建宇', rom:'Geonu',   py:'Jiàn yǔ',   g:'m', el:0, v:'strong' },
  { ko:'수아', hj:'秀雅', rom:'Sua',     py:'Xiù yǎ',    g:'f', el:0, v:'elegant' },
  { ko:'채원', hj:'彩苑', rom:'Chaewon', py:'Cǎi yuàn',  g:'f', el:0, v:'cute' },
  { ko:'화연', hj:'花娟', rom:'Hwayeon', py:'Huā juān',  g:'f', el:0, v:'cute' },
  { ko:'하연', hj:'夏蓮', rom:'Hayeon',  py:'Xià lián',  g:'f', el:0, v:'cute' },
  { ko:'호진', hj:'虎珍', rom:'Hojin',   py:'Hǔ zhēn',   g:'m', el:0, v:'strong' },
  { ko:'영준', hj:'英俊', rom:'Yeongjun',py:'Yīng jùn',  g:'m', el:0, v:'cool' },
  { ko:'빈우', hj:'彬宇', rom:'Binu',    py:'Bīn yǔ',    g:'m', el:0, v:'cool' },
  { ko:'지우', hj:'智宇', rom:'Jiu',     py:'Zhì yǔ',    g:'u', el:1, v:'bright' },
  { ko:'지안', hj:'智安', rom:'Jian',    py:'Zhì ān',    g:'u', el:1, v:'elegant' },
  { ko:'태양', hj:'太陽', rom:'Taeyang', py:'Tài yáng',  g:'m', el:1, v:'bright' },
  { ko:'승우', hj:'昇祐', rom:'Seungu',  py:'Shēng yòu', g:'m', el:1, v:'strong' },
  { ko:'하린', hj:'夏琳', rom:'Harin',   py:'Xià lín',   g:'f', el:1, v:'cute' },
  { ko:'소율', hj:'昭律', rom:'Soyul',   py:'Zhāo lǜ',   g:'f', el:1, v:'bright' },
  { ko:'성아', hj:'星雅', rom:'Seonga',  py:'Xīng yǎ',   g:'f', el:1, v:'elegant' },
  { ko:'성우', hj:'星佑', rom:'Seongu',  py:'Xīng yòu',  g:'m', el:1, v:'bright' },
  { ko:'천우', hj:'天佑', rom:'Cheonu',  py:'Tiān yòu',  g:'m', el:1, v:'bright' },
  { ko:'찬우', hj:'燦宇', rom:'Chanu',   py:'Càn yǔ',    g:'m', el:1, v:'bright' },
  { ko:'려은', hj:'麗恩', rom:'Ryeoeun', py:'Lì ēn',     g:'f', el:1, v:'elegant' },
  { ko:'애린', hj:'愛琳', rom:'Aerin',   py:'Ài lín',    g:'f', el:1, v:'cute' },
  { ko:'도윤', hj:'道允', rom:'Doyun',   py:'Dào yǔn',   g:'m', el:2, v:'cool' },
  { ko:'예준', hj:'叡俊', rom:'Yejun',   py:'Ruì jùn',   g:'m', el:2, v:'elegant' },
  { ko:'현우', hj:'賢佑', rom:'Hyeonu',  py:'Xián yòu',  g:'m', el:2, v:'cool' },
  { ko:'유나', hj:'裕娜', rom:'Yuna',    py:'Yù nà',     g:'f', el:2, v:'cute' },
  { ko:'다은', hj:'多恩', rom:'Daeun',   py:'Duō ēn',    g:'f', el:2, v:'cute' },
  { ko:'유진', hj:'裕眞', rom:'Yujin',   py:'Yù zhēn',   g:'u', el:2, v:'elegant' },
  { ko:'용준', hj:'龍俊', rom:'Yongjun', py:'Lóng jùn',  g:'m', el:2, v:'strong' },
  { ko:'미나', hj:'美娜', rom:'Mina',    py:'Měi nà',    g:'f', el:2, v:'cute' },
  { ko:'서윤', hj:'瑞允', rom:'Seoyun',  py:'Ruì yǔn',   g:'u', el:3, v:'elegant' },
  { ko:'재민', hj:'在珉', rom:'Jaemin',  py:'Zài mín',   g:'u', el:3, v:'cool' },
  { ko:'진우', hj:'珍宇', rom:'Jinu',    py:'Zhēn yǔ',   g:'m', el:3, v:'strong' },
  { ko:'용우', hj:'勇宇', rom:'Yongu',   py:'Yǒng yǔ',   g:'m', el:3, v:'strong' },
  { ko:'서연', hj:'瑞娟', rom:'Seoyeon', py:'Ruì juān',  g:'f', el:3, v:'elegant' },
  { ko:'주아', hj:'珠雅', rom:'Jua',     py:'Zhū yǎ',    g:'f', el:3, v:'cute' },
  { ko:'하준', hj:'河俊', rom:'Hajun',   py:'Hé jùn',    g:'m', el:4, v:'cool' },
  { ko:'은우', hj:'恩雨', rom:'Euno',    py:'Ēn yǔ',     g:'m', el:4, v:'cute' },
  { ko:'해인', hj:'海仁', rom:'Haein',   py:'Hǎi rén',   g:'u', el:4, v:'elegant' },
  { ko:'나윤', hj:'娜潤', rom:'Nayun',   py:'Nà rùn',    g:'f', el:4, v:'cute' },
  { ko:'윤서', hj:'潤抒', rom:'Yunseo',  py:'Rùn shū',   g:'f', el:4, v:'elegant' },
  { ko:'하은', hj:'河恩', rom:'Haeun',   py:'Hé ēn',     g:'f', el:4, v:'cute' },
  { ko:'소월', hj:'昭月', rom:'Sowol',   py:'Zhāo yuè',  g:'f', el:4, v:'elegant' },
  { ko:'설아', hj:'雪雅', rom:'Seola',   py:'Xuě yǎ',    g:'f', el:4, v:'elegant' },
  { ko:'연우', hj:'蓮雨', rom:'Yeonu',   py:'Lián yǔ',   g:'u', el:4, v:'cute' },
  // pure Korean (no Hanja)
  { ko:'하늘', hj:null, rom:'Haneul', py:null, g:'u', el:null, v:'bright' },
  { ko:'보라', hj:null, rom:'Bora',   py:null, g:'f', el:null, v:'cute' },
  { ko:'나래', hj:null, rom:'Narae',  py:null, g:'f', el:null, v:'bright' },
  { ko:'다온', hj:null, rom:'Daon',   py:null, g:'u', el:null, v:'cute' },
  { ko:'가온', hj:null, rom:'Gaon',   py:null, g:'u', el:null, v:'cool' },
  { ko:'새봄', hj:null, rom:'Saebom', py:null, g:'f', el:null, v:'cute' }
];
