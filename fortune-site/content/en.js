module.exports = {
  code: 'en', htmlLang: 'en', other: 'ko', otherLabel: 'English',
  ui: {
    siteName: 'K-Name & K-Match', tagline: 'Fun Korean names and K-style compatibility for fans of Korea',
    nav: { guides: 'Guides', about: 'About', privacy: 'Privacy Policy', terms: 'Terms', contact: 'Contact' },
    tool: 'Try the tools', cta: 'Get your Korean name', ctaMatch: 'Check your K-Match', updated: 'Last updated',
    readMore: 'Read the guide', home: 'Home', rights: 'All rights reserved.'
  },
  pages: {
    guides: {
      title: 'Guides to Korean Names, the Five Elements and the Korean Zodiac',
      desc: 'Plain-language guides on how Korean names work, the five elements in naming, and the Korean zodiac (ddi).',
      html: `<p>These guides explain the ideas behind our Korean name generator and K-Match tool. They are written for fans of Korean culture who want to understand what they are looking at, not just get a result.</p>
<ul class="guide-list">
<li><a href="guide-korean-names.html"><b>How Korean Names Work</b></a><br>Family names, given names, Hanja meanings, romanization and what makes a name sound natural.</li>
<li><a href="guide-five-elements.html"><b>Hanja and the Five Elements in Korean Naming</b></a><br>Why traditional name-givers look at wood, fire, earth, metal and water, and how modern families treat it.</li>
<li><a href="guide-korean-zodiac.html"><b>The Korean Zodiac (Ddi) and Compatibility</b></a><br>The twelve animals, how to find yours, and how the traditional harmony and clash pairs work.</li>
</ul>`
    },
    'guide-korean-names': {
      title: 'How Korean Names Work: Family Names, Given Names and Meanings',
      desc: 'A clear guide to Korean naming: name order, common surnames, Hanja and native names, romanization, and tips for choosing a Korean name as a fan.',
      html: `<p>A Korean name looks short, but it carries a surprising amount of structure. Understanding it helps you pick a name that sounds natural instead of one that only looks good on a profile picture.</p>
<h2>Family name first, given name second</h2>
<p>In Korea the family name comes first. Someone named Kim Hae-rin would say the family name Kim first, followed by the given name Hae-rin. Family names are very concentrated: Kim, Lee and Park together account for more than 40% of the population, and Choi, Jung, Kang, Cho, Yoon, Jang and Lim make up much of the rest. That is why you hear the same surnames again and again in Korean dramas.</p>
<h2>Given names are usually two syllables</h2>
<p>Most given names have two syllables, such as Seo-yun, Ha-jun or Min-seo. Names like these have been among the most popular for children in recent years. The two syllables are often written with two Hanja (Chinese characters), each carrying its own meaning.</p>
<h2>Hanja names and native Korean names</h2>
<p>Many Korean names are built from Hanja. The same sound can map to several characters. For example, the syllable <i>seo</i> can be written with a character meaning "auspicious" (瑞) or with one meaning "book, writing" (書), so two people called Seo-yun may have different meanings behind the same name. There is also a smaller group of purely native names that have no Hanja, such as Haneul ("sky"), Bora ("purple") or Narae ("wings"). Our generator includes both kinds and shows the meaning of each character so you can see what you are choosing.</p>
<h2>Romanization</h2>
<p>South Korea's official system is called Revised Romanization. Personal names are often an exception, because families and passports keep older spellings. The surname written Lee, Yi or Rhee is the same Korean surname. When you write your Korean name in the Latin alphabet, pick one spelling and keep it consistent.</p>
<h2>Generation names and family customs</h2>
<p>Traditionally, brothers and cousins of the same generation could share one syllable in their names, with the other syllable personal to each child. This custom is less strict today. Married women keep their own family name in Korea.</p>
<h2>Tips for choosing a Korean name as a fan</h2>
<ul>
<li>Pick a meaning you like first, then check that the sound is comfortable for you to say.</li>
<li>Choose a family name from the common ones if you want your full name to sound natural.</li>
<li>Remember that a fun Korean name is a nickname. It is not a legal name unless you are registering one under Korean rules.</li>
<li>If you need an official translation of your own name, ask a professional translator instead of relying on a generator.</li>
</ul>
<p>Ready to try? <a href="../index.html?lang=en">Generate your Korean name</a> and share the card with friends.</p>`
    },
    'guide-five-elements': {
      title: 'Hanja and the Five Elements in Korean Naming',
      desc: 'How the traditional five elements (wood, fire, earth, metal, water) influence Korean name choices, and how our name generator uses them for fun.',
      html: `<p>When Korean families choose a name, some look beyond sound and meaning to a traditional idea called the five elements, or <i>ohaeng</i>. This guide explains the idea and how far our tool takes it.</p>
<h2>The five elements</h2>
<p>The elements are wood, fire, earth, metal and water. In traditional thinking they support one another in a cycle: wood feeds fire, fire creates earth (ash), earth bears metal, metal gathers water, and water nourishes wood. The same system shows up in East Asian medicine, calendars and feng shui.</p>
<h2>Where birth information comes in</h2>
<p>Traditional name-givers use the birth year, month, day and hour (the <i>saju</i>, "four pillars") to see which elements are strong or weak in a person's chart. A name made of characters that carry the missing element is believed to balance it. Different schools disagree on the details, such as whether an element is decided by a character's radical, its stroke count or its sound.</p>
<h2>How our generator uses it</h2>
<p>We keep it deliberately simple. If you enter a date of birth, we work out the element of your birth year and prefer names whose element supports it in the cycle. For example, a Fire year is supported by Wood. If you leave the date empty, we skip this step and choose names by the vibe you pick. Our element labels for each name are our own fan-friendly classification, so please treat them as entertainment.</p>
<h2>What modern families actually weigh</h2>
<ul>
<li><b>Sound:</b> a name should be easy to say and to call out loud.</li>
<li><b>Meaning:</b> the Hanja should carry hopeful ideas such as wisdom, kindness or brightness.</li>
<li><b>Family:</b> some families keep a shared syllable across siblings.</li>
<li><b>Legal rules:</b> in Korea, only Hanja on the official list for personal names can be registered.</li>
</ul>
<h2>The bottom line</h2>
<p>The five elements are a fun and culturally rich lens, not a science. Enjoy them as part of Korean tradition, and choose a name for the meaning and sound you love. <a href="../index.html?lang=en">Try the Korean name generator</a>.</p>`
    },
    'guide-korean-zodiac': {
      title: 'The Korean Zodiac (Ddi): The 12 Animals and Compatibility',
      desc: 'Find your Korean zodiac animal (ddi), see recent birth years, and learn how the traditional harmony and clash pairs work.',
      html: `<p>In Korea it is common to ask "What is your <i>ddi</i>?" (무슨 띠예요?). The answer is your zodiac animal, based on your birth year, and it is often used as a light way to guess age or start a conversation.</p>
<h2>The twelve animals</h2>
<p>The order is Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat (Sheep), Monkey, Rooster, Dog and Pig. The cycle repeats every twelve years.</p>
<table>
<tr><th>Animal</th><th>Recent birth years</th></tr>
<tr><td>Rat</td><td>1996, 2008, 2020</td></tr><tr><td>Ox</td><td>1997, 2009, 2021</td></tr>
<tr><td>Tiger</td><td>1998, 2010, 2022</td></tr><tr><td>Rabbit</td><td>1999, 2011, 2023</td></tr>
<tr><td>Dragon</td><td>2000, 2012, 2024</td></tr><tr><td>Snake</td><td>2001, 2013, 2025</td></tr>
<tr><td>Horse</td><td>2002, 2014, 2026</td></tr><tr><td>Goat</td><td>2003, 2015, 2027</td></tr>
<tr><td>Monkey</td><td>2004, 2016, 2028</td></tr><tr><td>Rooster</td><td>2005, 2017, 2029</td></tr>
<tr><td>Dog</td><td>2006, 2018, 2030</td></tr><tr><td>Pig</td><td>2007, 2019, 2031</td></tr>
</table>
<h2>A note about January and February birthdays</h2>
<p>The traditional zodiac year starts at the lunar new year, which falls between late January and mid February. Our tool uses 4 February as a simple cut-off, so if you were born in January or February, check the lunar new year date for your birth year.</p>
<h2>Harmony and clash in traditional matching</h2>
<p>Traditional compatibility (<i>gunghap</i>) looks at relationships between the animals:</p>
<ul>
<li><b>Three harmonies:</b> Rat-Dragon-Monkey, Ox-Snake-Rooster, Tiger-Horse-Dog and Rabbit-Goat-Pig are seen as natural allies.</li>
<li><b>Six harmonies:</b> Rat-Ox, Tiger-Pig, Rabbit-Dog, Dragon-Rooster, Snake-Monkey and Horse-Goat are seen as warm, complementary pairs.</li>
<li><b>Clashes:</b> animals six places apart, such as Rat-Horse or Tiger-Monkey, are seen as opposites: strong attraction but needing patience.</li>
</ul>
<h2>How the K-Match score is made</h2>
<p>Our K-Match combines the zodiac relationship (35%), the element relationship of the Western sun signs (25%), the life path number from the birth date (25%) and a playful factor from the two names (15%). It also adds four fun "chemistry" bars and a drama title. It is made for conversation, not for deciding anything about a real relationship.</p>
<p><a href="../index.html?lang=en">Check your K-Match</a> with a friend, a crush or your favorite idol's birthday.</p>`
    },
    about: {
      title: 'About K-Name & K-Match',
      desc: 'What K-Name & K-Match is, who it is for, and how the name suggestions and match scores are made.',
      html: `<p>K-Name & K-Match is a free, fan-made website for people who love Korean music, dramas and culture. It does two things: it suggests a Korean name with its meaning, and it gives a playful compatibility score based on birth dates.</p>
<h2>Who it is for</h2>
<p>Fans of K-pop and K-dramas around the world, including readers in English, Korean, Thai, Vietnamese, Indonesian, Chinese, French and Spanish. If you have ever wondered what your name might be in Korean, or how well you match with a friend, this site is for you.</p>
<h2>How the results are made</h2>
<ul>
<li><b>Names:</b> we maintain a hand-picked list of Korean given names with Hanja or native meanings, and combine them with common Korean family names. The same inputs always give the same suggestions.</li>
<li><b>Match scores:</b> the score blends the Chinese zodiac relationship, the Western sun sign elements, the life path number and a playful name factor. The method is explained in our <a href="guide-korean-zodiac.html">zodiac guide</a>.</li>
<li><b>Share cards:</b> images are drawn in your browser. Nothing you type is uploaded to create them.</li>
</ul>
<h2>What this site is not</h2>
<p>It is entertainment. It is not fortune-telling, relationship advice, a legal naming service or an official translation. We are not affiliated with any artist, agency or company. Names and meanings were compiled by us for fun, and we welcome corrections through the <a href="contact.html">contact page</a>.</p>
<h2>Funding</h2>
<p>The site may display advertising to cover hosting costs. Ads never change the results you see.</p>`
    },
    privacy: {
      title: 'Privacy Policy',
      desc: 'How K-Name & K-Match handles your data, cookies, Google AdSense advertising and your choices.',
      html: `<p>This policy explains what information K-Name & K-Match processes and what choices you have. We keep it as simple as the site itself.</p>
<h2>Information you enter</h2>
<p>Names, dates of birth and other choices you type into our tools are processed in your browser to produce a result. They are not sent to our servers and we do not create accounts or user profiles.</p>
<h2>What is in a share link</h2>
<p>When you share a result, the link contains only the chosen Korean name, a family name, a short number that fixes the look of the card, and, for K-Match, zodiac and life-path indexes plus any first names you typed. Dates of birth are never included in a link. Please do not type information you would not want friends to see.</p>
<h2>Cookies and local storage</h2>
<p>We store your language choice in your browser's local storage so the site opens in the same language next time. You can clear it at any time in your browser settings.</p>
<h2>Advertising and Google AdSense</h2>
<p>We may use Google AdSense to show ads. Google and its partners use cookies or similar technologies, including advertising identifiers, to serve and measure ads, and may show ads based on your previous visits to this or other websites. Learn how Google uses data at <a href="https://policies.google.com/technologies/ads" rel="noopener">policies.google.com/technologies/ads</a>. You can manage personalized advertising at <a href="https://adssettings.google.com" rel="noopener">adssettings.google.com</a>, or opt out of many third-party vendors at <a href="https://www.aboutads.info" rel="noopener">aboutads.info</a>.</p>
<p>Visitors in the European Economic Area, the United Kingdom and Switzerland are asked for consent through a Google-certified consent message before personalized ads or non-essential cookies are used.</p>
<h2>Social sharing</h2>
<p>Share buttons are plain links to Facebook, WhatsApp, LINE, Telegram and X. We load no social media scripts on our pages. When you click a button, you leave our site and that service's own privacy policy applies. Instagram has no web share link, so we offer an image you can save and post yourself.</p>
<h2>Server logs</h2>
<p>Our hosting provider may keep standard technical logs, such as IP address, browser type and request time, for security and operation.</p>
<h2>Children</h2>
<p>The site is not directed to children under 13 (or under 16 where local law sets a higher age). We do not knowingly collect personal information from children.</p>
<h2>Your rights</h2>
<p>Because we do not store the information you enter, there is usually nothing to access or delete. If you believe we hold personal data about you, contact us and we will respond in line with the privacy law that applies to you.</p>
<h2>Changes and contact</h2>
<p>We may update this policy and will change the date below when we do. Questions: see our <a href="contact.html">contact page</a>.</p>`
    },
    terms: {
      title: 'Terms of Use',
      desc: 'The terms for using K-Name & K-Match, including entertainment-only disclaimer, intellectual property and liability.',
      html: `<p>By using K-Name & K-Match you agree to these terms. If you do not agree, please do not use the site.</p>
<h2>Entertainment only</h2>
<p>The Korean names, meanings, zodiac information and compatibility scores are provided for entertainment. They are not predictions, advice, legal naming services or official translations. Do not make decisions about relationships, names for official use or anything important based on them.</p>
<h2>Your use of the site</h2>
<p>You may use the tools and share the result cards for personal, non-commercial purposes. Please do not misuse the site, try to disrupt it, or use it to harass others.</p>
<h2>Intellectual property</h2>
<p>The site design, text, guides and name data are owned by the site operator. Result cards you create may be shared freely with a link back to the site. We are not affiliated with or endorsed by any artist, agency or entertainment company, and any trademarks mentioned belong to their owners.</p>
<h2>No warranty</h2>
<p>The site is provided as is, without warranties of any kind. We do not guarantee that content is error-free or always available.</p>
<h2>Limitation of liability</h2>
<p>To the extent permitted by law, we are not liable for any loss arising from your use of the site or from reliance on its results.</p>
<h2>Third-party links and ads</h2>
<p>The site may link to or display content from third parties, including advertisers. We are not responsible for their content or practices.</p>
<h2>Changes</h2>
<p>We may update these terms. Continued use after a change means you accept the updated terms.</p>`
    },
    contact: {
      title: 'Contact Us',
      desc: 'Contact K-Name & K-Match about corrections, partnerships or privacy requests.',
      html: `<p>We would love to hear from you.</p>
<p>Email: <a href="mailto:{{EMAIL}}"><b>{{EMAIL}}</b></a></p>
<h2>What to write to us about</h2>
<ul>
<li>Corrections to a name, Hanja meaning or translation.</li>
<li>Suggestions for new names, languages or features.</li>
<li>Partnership or advertising enquiries.</li>
<li>Privacy questions or requests.</li>
</ul>
<p>We read every message and aim to reply within a few business days.</p>`
    }
  }
};
