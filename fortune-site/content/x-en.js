module.exports = H => ({
  items: `<li><a href="guide-korean-surnames.html"><b>The 10 Most Common Korean Surnames</b></a><br>Kim, Lee, Park and the rest: Hanja, spellings and the idea of clans.</li>
<li><a href="guide-name-meanings.html"><b>How to Read the Meaning of a Korean Name</b></a><br>Twenty-three common Hanja syllables that unlock names like Seo-yun and Ha-jun.</li>
<li><a href="guide-zodiac-traits.html"><b>Folk Traits of the 12 Korean Zodiac Animals</b></a><br>What each animal is traditionally said to be like, and how to use it for fun.</li>`,
  pages: {
    'guide-korean-surnames': { title: 'The 10 Most Common Korean Surnames: Hanja, Spellings and Clans', desc: 'Kim, Lee, Park, Choi and more: the ten most common Korean surnames with their Hanja, common romanizations and a short explanation of Korean clans.',
      html: `<p>Korean surnames are famously concentrated. Based on the 2015 national census, Kim accounts for roughly one in five Koreans, Lee for about 15% and Park for about 8%. Together with Choi, Jung, Kang, Cho, Yoon, Jang and Lim they cover most of the population.</p>
<h2>The ten surnames</h2>
${H.surnameTable('en', ['#', 'Surname', 'Hanja', 'Common spellings', 'Character meaning'])}
<p>The character meanings are literal dictionary senses. A surname is inherited, so it is not chosen for its meaning the way a given name is.</p>
<h2>Why spellings differ</h2>
<p>The official Revised Romanization would write 이 as I and 박 as Bak, but families and passports usually keep older spellings such as Lee and Park. Neither is wrong. If you are writing a Korean-style name for fun, pick the spelling that looks most familiar to your readers, for example Kim, Lee or Park.</p>
<h2>Clans: same surname, different families</h2>
<p>Korean surnames are traditionally paired with a clan origin (<i>bon-gwan</i>), usually a place name. Two people can both be Kim yet belong to different clans, such as the Gimhae Kim and the Gyeongju Kim. Under an old custom, people of the same surname and clan did not marry. That legal ban was ruled unconstitutional in 1997 and later removed from the law.</p>
<h2>Using a surname for your Korean name</h2>
<ul>
<li>Choose from the ten above if you want your name to sound natural to Korean ears.</li>
<li>Match the feel of the given name: short, strong surnames such as Kim or Park pair well with almost anything.</li>
<li>Say it out loud. A surname and a given name that end and begin with the same sound can be hard to say.</li>
</ul>
<p>Our generator already picks from these ten. <a href="../index.html?lang=en&amp;tab=name">Try it with the surname of your choice</a>.</p>` },
    'guide-name-meanings': { title: 'How to Read the Meaning of a Korean Name: 23 Hanja Syllables', desc: 'Learn to decode Korean given names. A table of 23 common Hanja syllables with their meanings and examples such as Seo-yun, Ha-jun and Ji-u.',
      html: `<p>Most Korean given names are built from two Hanja, and each Hanja has a meaning. If you learn a handful of them, you can read the meaning of many names you meet in dramas and on idol profiles.</p>
<h2>23 common building blocks</h2>
${H.syllableTable('en', ['Sound', 'Hanja', 'Meaning'])}
<p>One sound can match several characters, for example both 夏 (summer) and 河 (river) are read <i>ha</i>. This is why the same-looking name can have different meanings for different people.</p>
<h2>Worked examples</h2>
<ul>
<li><b>Seo-yun (서윤, 瑞允):</b> auspicious + sincere.</li>
<li><b>Ji-u (지우, 智宇):</b> wisdom + universe.</li>
<li><b>Ha-jun (하준, 河俊):</b> river + outstanding.</li>
<li><b>Su-a (수아, 秀雅):</b> excellent + elegant.</li>
<li><b>Eun-u (은우, 恩雨):</b> grace + rain.</li>
</ul>
<h2>Reading tips</h2>
<ul>
<li>Split the name into two syllables, then look for each in the table.</li>
<li>If there is more than one possible character, the family's choice decides, so ask if you can.</li>
<li>Pure Korean names such as Haneul (sky) or Bora (purple) have no Hanja, so there is nothing to decode.</li>
</ul>
<p>Want to see this in action? <a href="../index.html?lang=en&amp;tab=name">Generate a name</a> and check the meaning shown under each character.</p>` },
    'guide-zodiac-traits': { title: 'Folk Traits of the 12 Korean Zodiac Animals', desc: 'The traditional personality traits attached to each of the twelve Korean zodiac animals, explained as folk belief and a fun conversation topic.',
      html: `<p>In Korea and across East Asia, each zodiac animal is traditionally linked with a set of personality traits. These are folk beliefs handed down over generations. They are a fun conversation topic, not a scientific description of anyone.</p>
<h2>The twelve animals and their folk traits</h2>
${H.table(['Animal', 'Traditional traits'], [['Rat', 'quick-witted, resourceful'], ['Ox', 'patient, reliable'], ['Tiger', 'bold, charismatic'], ['Rabbit', 'gentle, diplomatic'], ['Dragon', 'ambitious, confident'], ['Snake', 'thoughtful, intuitive'], ['Horse', 'free-spirited, energetic'], ['Goat', 'kind, artistic'], ['Monkey', 'clever, playful'], ['Rooster', 'diligent, outspoken'], ['Dog', 'loyal, honest'], ['Pig', 'generous, easygoing']])}
<h2>Using traits in a friendly way</h2>
<ul>
<li>Treat them as an icebreaker. Asking "what is your ddi?" is a common way to start talking in Korea.</li>
<li>Remember that people are far more varied than twelve categories.</li>
<li>Combine traits with compatibility: our <a href="guide-korean-zodiac.html">zodiac guide</a> explains harmony and clash pairs.</li>
</ul>
<h2>Why people like it</h2>
<p>The zodiac gives friends a shared language for playful teasing and gentle self-description. It also connects you to a tradition that is still part of everyday Korean conversation, from birthday jokes to New Year greetings.</p>
<p>Curious about your match? <a href="../index.html?lang=en&amp;tab=match">Check your K-Match</a>.</p>` }
  }
});
