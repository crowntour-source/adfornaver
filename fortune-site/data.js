/* Static data: zodiac, elements, hanja glosses, name candidates.
   Language order everywhere: en, ko, zh, fr, es */
const LANGS = ['en', 'ko', 'zh', 'fr', 'es'];
const LANG_LABEL = { en: 'EN', ko: '한국어', zh: '中文', fr: 'FR', es: 'ES' };
const HTML_LANG = { en: 'en', ko: 'ko', zh: 'zh-Hans', fr: 'fr', es: 'es' };

const CN_ZODIAC = {
  en: ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'],
  ko: ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'],
  zh: ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'],
  fr: ['Rat','Buffle','Tigre','Lapin','Dragon','Serpent','Cheval','Chèvre','Singe','Coq','Chien','Cochon'],
  es: ['Rata','Buey','Tigre','Conejo','Dragón','Serpiente','Caballo','Cabra','Mono','Gallo','Perro','Cerdo']
};

/* Sign start dates [month, day] -> index into SIGNS (Aries=0 ... Pisces=11) */
const WESTERN = [
  { m: 1,  d: 20, i: 10 }, { m: 2,  d: 19, i: 11 }, { m: 3,  d: 21, i: 0 },
  { m: 4,  d: 20, i: 1 },  { m: 5,  d: 21, i: 2 },  { m: 6,  d: 21, i: 3 },
  { m: 7,  d: 23, i: 4 },  { m: 8,  d: 23, i: 5 },  { m: 9,  d: 23, i: 6 },
  { m: 10, d: 23, i: 7 },  { m: 11, d: 22, i: 8 },  { m: 12, d: 22, i: 9 }
];
/* Element per sign: 0 fire, 1 earth, 2 air, 3 water (repeats every 4 signs) */
const SIGN_ELEMENT = [0,1,2,3,0,1,2,3,0,1,2,3];
const SIGNS = {
  en: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],
  ko: ['양자리','황소자리','쌍둥이자리','게자리','사자자리','처녀자리','천칭자리','전갈자리','사수자리','염소자리','물병자리','물고기자리'],
  zh: ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'],
  fr: ['Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne','Verseau','Poissons'],
  es: ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis']
};

/* Five elements order: wood, fire, earth, metal, water (generating cycle) */
const FIVE = {
  en: ['Wood','Fire','Earth','Metal','Water'],
  ko: ['목(木)','화(火)','토(土)','금(金)','수(水)'],
  zh: ['木','火','土','金','水'],
  fr: ['Bois','Feu','Terre','Métal','Eau'],
  es: ['Madera','Fuego','Tierra','Metal','Agua']
};

/* Hanja glosses [en, ko, zh, fr, es] */
const GLOSS = {
  '瑞':['auspicious','상서로운','祥瑞','de bon augure','auspicioso'],
  '允':['sincere','진실한','诚信','sincère','sincero'],
  '智':['wisdom','지혜','智慧','sagesse','sabiduría'],
  '宇':['universe','우주','宇宙','univers','universo'],
  '河':['river','강','河流','fleuve','río'],
  '俊':['outstanding','준수한','俊秀','éminent','sobresaliente'],
  '道':['the way','바른 길','正道','la voie','el camino'],
  '娟':['graceful','고운','娟秀','gracieux','grácil'],
  '敏':['quick-witted','민첩한','敏捷','vif','ágil'],
  '安':['peaceful','평안한','平安','paisible','apacible'],
  '夏':['summer','여름','夏天','été','verano'],
  '琳':['fine jade','아름다운 옥','美玉','jade précieux','jade fino'],
  '叡':['insightful','슬기로운','睿智','perspicace','perspicaz'],
  '秀':['excellent','빼어난','优秀','excellent','excelente'],
  '雅':['elegant','우아한','典雅','élégant','elegante'],
  '恩':['grace','은혜','恩惠','grâce','gracia'],
  '雨':['rain','비','雨露','pluie','lluvia'],
  '裕':['abundant','넉넉한','富足','abondant','abundante'],
  '娜':['graceful','아리따운','婀娜','gracile','garboso'],
  '彩':['colorful','빛깔','光彩','coloré','colorido'],
  '苑':['garden','동산','园苑','jardin','jardín'],
  '賢':['virtuous','어진','贤德','vertueux','virtuoso'],
  '佑':['blessing','도울','保佑','bénédiction','bendición'],
  '昭':['bright','밝은','光明','lumineux','brillante'],
  '律':['rhythm','가락','韵律','rythme','ritmo'],
  '太':['great','큰','宏大','grand','grande'],
  '陽':['sun','해','太阳','soleil','sol'],
  '潤':['lustrous','윤택한','润泽','lustré','lustroso'],
  '建':['to build','세울','建立','bâtir','construir'],
  '眞':['true','참된','真实','vrai','verdadero'],
  '抒':['expressive','펼칠','抒发','expressif','expresivo'],
  '在':['presence','있을','存在','présence','presencia'],
  '珉':['jade-like stone','옥돌','美石','pierre de jade','piedra de jade'],
  '多':['plentiful','많은','众多','nombreux','numeroso'],
  '昇':['rising','오를','上升','ascendant','ascendente'],
  '祐':['protection','도울','庇佑','protection','protección'],
  '海':['sea','바다','大海','mer','mar'],
  '仁':['benevolence','어질','仁爱','bonté','benevolencia'],
  '珍':['precious','보배','珍贵','précieux','precioso'],
  '珠':['pearl','구슬','珍珠','perle','perla']
};

/* Name candidates. el: 0 wood 1 fire 2 earth 3 metal 4 water ; g: m / f / u (unisex) */
const NAMES = [
  { ko:'민준', hj:'敏俊', rom:'Minjun',  py:'Mǐn jùn',   g:'m', el:0 },
  { ko:'건우', hj:'建宇', rom:'Geonu',   py:'Jiàn yǔ',   g:'m', el:0 },
  { ko:'수아', hj:'秀雅', rom:'Sua',     py:'Xiù yǎ',    g:'f', el:0 },
  { ko:'채원', hj:'彩苑', rom:'Chaewon', py:'Cǎi yuàn',  g:'f', el:0 },
  { ko:'지우', hj:'智宇', rom:'Jiu',     py:'Zhì yǔ',    g:'u', el:1 },
  { ko:'지안', hj:'智安', rom:'Jian',    py:'Zhì ān',    g:'u', el:1 },
  { ko:'태양', hj:'太陽', rom:'Taeyang', py:'Tài yáng',  g:'m', el:1 },
  { ko:'승우', hj:'昇祐', rom:'Seungu',  py:'Shēng yòu', g:'m', el:1 },
  { ko:'하린', hj:'夏琳', rom:'Harin',   py:'Xià lín',   g:'f', el:1 },
  { ko:'소율', hj:'昭律', rom:'Soyul',   py:'Zhāo lǜ',   g:'f', el:1 },
  { ko:'도윤', hj:'道允', rom:'Doyun',   py:'Dào yǔn',   g:'m', el:2 },
  { ko:'예준', hj:'叡俊', rom:'Yejun',   py:'Ruì jùn',   g:'m', el:2 },
  { ko:'현우', hj:'賢佑', rom:'Hyeonu',  py:'Xián yòu',  g:'m', el:2 },
  { ko:'유나', hj:'裕娜', rom:'Yuna',    py:'Yù nà',     g:'f', el:2 },
  { ko:'다은', hj:'多恩', rom:'Daeun',   py:'Duō ēn',    g:'f', el:2 },
  { ko:'유진', hj:'裕眞', rom:'Yujin',   py:'Yù zhēn',   g:'u', el:2 },
  { ko:'서윤', hj:'瑞允', rom:'Seoyun',  py:'Ruì yǔn',   g:'u', el:3 },
  { ko:'재민', hj:'在珉', rom:'Jaemin',  py:'Zài mín',   g:'u', el:3 },
  { ko:'진우', hj:'珍宇', rom:'Jinu',    py:'Zhēn yǔ',   g:'m', el:3 },
  { ko:'서연', hj:'瑞娟', rom:'Seoyeon', py:'Ruì juān',  g:'f', el:3 },
  { ko:'주아', hj:'珠雅', rom:'Jua',     py:'Zhū yǎ',    g:'f', el:3 },
  { ko:'하준', hj:'河俊', rom:'Hajun',   py:'Hé jùn',    g:'m', el:4 },
  { ko:'은우', hj:'恩雨', rom:'Euno',    py:'Ēn yǔ',     g:'m', el:4 },
  { ko:'해인', hj:'海仁', rom:'Haein',   py:'Hǎi rén',   g:'u', el:4 },
  { ko:'나윤', hj:'娜潤', rom:'Nayun',   py:'Nà rùn',    g:'f', el:4 },
  { ko:'윤서', hj:'潤抒', rom:'Yunseo',  py:'Rùn shū',   g:'f', el:4 },
  { ko:'하은', hj:'河恩', rom:'Haeun',   py:'Hé ēn',     g:'f', el:4 }
];
