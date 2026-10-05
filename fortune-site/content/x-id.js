module.exports = H => ({
  items: `<li><a href="guide-korean-surnames.html"><b>10 Marga Korea Paling Umum</b></a><br>Kim, Lee, Park dan lainnya: Hanja, ejaan, dan konsep klan.</li>
<li><a href="guide-name-meanings.html"><b>Cara Membaca Arti Nama Korea</b></a><br>23 suku kata Hanja umum yang membuka arti nama seperti Seo-yun dan Ha-jun.</li>
<li><a href="guide-zodiac-traits.html"><b>Sifat Tradisional 12 Shio Korea</b></a><br>Seperti apa tiap hewan menurut tradisi, dan cara memakainya untuk seru-seruan.</li>`,
  pages: {
    'guide-korean-surnames': { title: '10 Marga Korea Paling Umum: Hanja, Ejaan, dan Klan', desc: 'Kim, Lee, Park, Choi dan lainnya: sepuluh marga Korea paling umum beserta Hanja, romanisasi yang lazim, dan penjelasan singkat tentang klan Korea.',
      html: `<p>Marga Korea terkenal sangat terpusat. Berdasarkan sensus nasional 2015, marga Kim mencakup sekitar satu dari lima orang Korea, Lee sekitar 15%, dan Park sekitar 8%. Bersama Choi, Jung, Kang, Cho, Yoon, Jang, dan Lim, marga-marga ini mencakup sebagian besar penduduk.</p>
<h2>Sepuluh marga</h2>
${H.surnameTable('id', ['Peringkat', 'Marga', 'Hanja', 'Ejaan umum', 'Arti karakter'])}
<p>Arti karakter adalah makna kamus. Marga diwariskan, jadi tidak dipilih berdasarkan artinya seperti nama depan.</p>
<h2>Mengapa ejaan berbeda</h2>
<p>Revised Romanization resmi menulis 이 sebagai I dan 박 sebagai Bak, tetapi keluarga dan paspor biasanya mempertahankan ejaan lama seperti Lee dan Park. Keduanya tidak salah. Jika kamu menulis nama bergaya Korea untuk seru-seruan, pilih ejaan yang paling dikenal pembaca, misalnya Kim, Lee, atau Park.</p>
<h2>Klan: marga sama, keluarga berbeda</h2>
<p>Marga Korea secara tradisi dipasangkan dengan asal klan (<i>bon-gwan</i>), biasanya nama tempat. Dua orang bisa sama-sama bermarga Kim tetapi berbeda klan, misalnya Kim dari Gimhae dan Kim dari Gyeongju. Menurut adat lama, orang semarga dan seklan tidak menikah. Larangan hukum itu dinyatakan inkonstitusional pada 1997 dan kemudian dihapus dari undang-undang.</p>
<h2>Memilih marga untuk nama Koreamu</h2>
<ul>
<li>Pilih dari sepuluh di atas jika ingin namamu terdengar alami bagi telinga orang Korea.</li>
<li>Marga yang pendek dan kuat seperti Kim atau Park cocok dengan hampir semua nama.</li>
<li>Ucapkan dengan keras. Jika bunyi akhir marga sama dengan bunyi awal nama depan, bisa sulit diucapkan.</li>
</ul>
<p>Pembuat nama kami sudah memilih dari sepuluh marga ini. <a href="../index.html?lang=id&amp;tab=name">Coba dengan marga pilihanmu</a></p>` },
    'guide-name-meanings': { title: 'Cara Membaca Arti Nama Korea: 23 Suku Kata Hanja', desc: 'Belajar menguraikan nama Korea. Tabel 23 suku kata Hanja umum beserta arti dan contoh seperti Seo-yun, Ha-jun, dan Ji-u.',
      html: `<p>Sebagian besar nama depan Korea dibentuk dari dua Hanja, dan tiap Hanja punya arti. Dengan mengenal beberapa saja, kamu bisa membaca arti banyak nama di drama dan profil idola.</p>
<h2>23 unsur yang umum</h2>
${H.syllableTable('id', ['Bunyi', 'Hanja', 'Arti'])}
<p>Satu bunyi bisa cocok dengan beberapa karakter, misalnya 夏 (musim panas) dan 河 (sungai) sama-sama dibaca <i>ha</i>. Karena itu nama yang tampak sama bisa berarti berbeda bagi tiap orang.</p>
<h2>Contoh</h2>
<ul>
<li><b>Seo-yun (서윤, 瑞允):</b> membawa keberuntungan + tulus</li>
<li><b>Ji-u (지우, 智宇):</b> kebijaksanaan + alam semesta</li>
<li><b>Ha-jun (하준, 河俊):</b> sungai + menonjol</li>
<li><b>Su-a (수아, 秀雅):</b> unggul + elegan</li>
<li><b>Eun-u (은우, 恩雨):</b> anugerah + hujan</li>
</ul>
<h2>Tips membaca</h2>
<ul>
<li>Pecah nama menjadi dua suku kata, lalu cari masing-masing di tabel.</li>
<li>Jika ada beberapa karakter yang mungkin, pilihan keluargalah yang menentukan; tanyakan jika bisa.</li>
<li>Nama asli Korea seperti Haneul (langit) atau Bora (ungu) tidak memakai Hanja, jadi tidak ada yang perlu diuraikan.</li>
</ul>
<p>Ingin melihatnya langsung? <a href="../index.html?lang=id&amp;tab=name">Dapatkan nama Korea</a> dan lihat arti di bawah tiap karakter.</p>` },
    'guide-zodiac-traits': { title: 'Sifat Tradisional 12 Shio Korea', desc: 'Sifat tradisional yang dikaitkan dengan dua belas shio Korea, dijelaskan sebagai kepercayaan rakyat dan bahan obrolan yang seru.',
      html: `<p>Di Korea dan seluruh Asia Timur, tiap hewan shio secara tradisi dikaitkan dengan seperangkat sifat. Ini kepercayaan rakyat yang diwariskan lintas generasi, bahan obrolan yang seru, bukan deskripsi ilmiah tentang siapa pun.</p>
<h2>Dua belas hewan dan sifat tradisionalnya</h2>
${H.table(['Shio', 'Sifat tradisional'], [['Tikus', 'cerdik, banyak akal'], ['Kerbau', 'sabar, dapat diandalkan'], ['Macan', 'berani, berkharisma'], ['Kelinci', 'lembut, diplomatis'], ['Naga', 'ambisius, percaya diri'], ['Ular', 'penuh pikiran, intuitif'], ['Kuda', 'bebas, energik'], ['Kambing', 'baik hati, artistik'], ['Monyet', 'pintar, jenaka'], ['Ayam', 'rajin, blak-blakan'], ['Anjing', 'setia, jujur'], ['Babi', 'dermawan, santai']])}
<h2>Memakainya dengan ramah</h2>
<ul>
<li>Jadikan pemecah suasana. Menanyakan "kamu shio apa?" adalah cara umum memulai obrolan di Korea.</li>
<li>Ingat bahwa manusia jauh lebih beragam daripada dua belas kategori.</li>
<li>Gabungkan dengan kecocokan: <a href="guide-korean-zodiac.html">panduan shio</a> menjelaskan pasangan harmoni dan bentrok.</li>
</ul>
<h2>Mengapa orang menyukainya</h2>
<p>Shio memberi teman bahasa bersama untuk saling menggoda dan memperkenalkan diri dengan ringan. Ia juga menghubungkanmu dengan tradisi yang masih hidup dalam percakapan sehari-hari orang Korea, dari lelucon ulang tahun hingga ucapan tahun baru.</p>
<p>Penasaran dengan kecocokanmu? <a href="../index.html?lang=id&amp;tab=match">Cek K-Match-mu</a></p>` }
  }
});
