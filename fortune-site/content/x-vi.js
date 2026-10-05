module.exports = H => ({
  items: `<li><a href="guide-korean-surnames.html"><b>10 họ Hàn Quốc phổ biến nhất</b></a><br>Kim, Lee, Park và các họ khác: Hán tự, cách viết và khái niệm dòng họ.</li>
<li><a href="guide-name-meanings.html"><b>Cách đọc ý nghĩa tên Hàn Quốc</b></a><br>23 âm tiết Hán tự phổ biến giúp giải mã những tên như Seo-yun, Ha-jun.</li>
<li><a href="guide-zodiac-traits.html"><b>Tính cách dân gian của 12 con giáp Hàn Quốc</b></a><br>Mỗi con giáp được cho là thế nào và cách dùng cho vui.</li>`,
  pages: {
    'guide-korean-surnames': { title: '10 họ Hàn Quốc phổ biến nhất: Hán tự, cách viết và dòng họ', desc: 'Kim, Lee, Park, Choi và các họ khác: mười họ Hàn Quốc phổ biến nhất với Hán tự, cách La-tinh hóa thường gặp và giải thích ngắn về dòng họ.',
      html: `<p>Họ của người Hàn nổi tiếng là rất tập trung. Theo tổng điều tra dân số năm 2015, họ Kim chiếm khoảng một phần năm người Hàn, họ Lee khoảng 15% và họ Park khoảng 8%. Cùng với Choi, Jung, Kang, Cho, Yoon, Jang và Lim, các họ này bao phủ phần lớn dân số.</p>
<h2>Mười họ</h2>
${H.surnameTable('vi', ['Hạng', 'Họ', 'Hán tự', 'Cách viết thường gặp', 'Nghĩa của chữ'])}
<p>Nghĩa của chữ là nghĩa từ điển. Họ được thừa kế nên không được chọn theo ý nghĩa như tên.</p>
<h2>Vì sao cách viết khác nhau</h2>
<p>Hệ thống Revised Romanization chính thức viết 이 là I và 박 là Bak, nhưng gia đình và hộ chiếu thường giữ cách viết cũ như Lee và Park. Cách nào cũng không sai. Nếu bạn viết tên kiểu Hàn cho vui, hãy chọn cách viết quen mắt nhất với người đọc, ví dụ Kim, Lee hay Park.</p>
<h2>Dòng họ: cùng họ nhưng khác gia đình</h2>
<p>Họ Hàn theo truyền thống đi kèm quê quán dòng họ (<i>bon-gwan</i>), thường là địa danh. Hai người cùng họ Kim có thể thuộc hai dòng họ khác nhau, như Kim Gimhae và Kim Gyeongju. Theo tục cũ, người cùng họ và cùng dòng họ không kết hôn. Điều cấm trong luật đó bị tuyên là vi hiến năm 1997 và sau này bị bãi bỏ.</p>
<h2>Chọn họ cho tên Hàn của bạn</h2>
<ul>
<li>Chọn trong mười họ trên nếu muốn tên nghe tự nhiên với người Hàn.</li>
<li>Họ ngắn và mạnh như Kim hay Park hợp với hầu hết mọi tên.</li>
<li>Hãy đọc to. Nếu âm cuối của họ trùng âm đầu của tên thì có thể khó đọc.</li>
</ul>
<p>Công cụ của chúng tôi vốn chọn trong mười họ này. <a href="../index.html?lang=vi&amp;tab=name">Thử với họ bạn thích</a></p>` },
    'guide-name-meanings': { title: 'Cách đọc ý nghĩa tên Hàn Quốc: 23 âm tiết Hán tự', desc: 'Học cách giải mã tên Hàn. Bảng 23 âm tiết Hán tự phổ biến cùng ý nghĩa và ví dụ như Seo-yun, Ha-jun, Ji-u.',
      html: `<p>Hầu hết tên Hàn được tạo từ hai Hán tự, mỗi chữ có nghĩa riêng. Chỉ cần biết vài chữ, bạn có thể đọc ý nghĩa của nhiều tên gặp trong phim và hồ sơ idol.</p>
<h2>23 thành phần phổ biến</h2>
${H.syllableTable('vi', ['Âm', 'Hán tự', 'Ý nghĩa'])}
<p>Một âm có thể ứng với nhiều chữ, ví dụ 夏 (mùa hè) và 河 (dòng sông) đều đọc là <i>ha</i>. Vì vậy những cái tên nhìn giống nhau có thể mang nghĩa khác nhau.</p>
<h2>Ví dụ</h2>
<ul>
<li><b>Seo-yun (서윤, 瑞允):</b> cát tường + chân thành</li>
<li><b>Ji-u (지우, 智宇):</b> trí tuệ + vũ trụ</li>
<li><b>Ha-jun (하준, 河俊):</b> dòng sông + tuấn tú</li>
<li><b>Su-a (수아, 秀雅):</b> xuất sắc + thanh nhã</li>
<li><b>Eun-u (은우, 恩雨):</b> ân huệ + mưa</li>
</ul>
<h2>Mẹo đọc</h2>
<ul>
<li>Tách tên thành hai âm tiết rồi tìm từng âm trong bảng.</li>
<li>Nếu có nhiều chữ khả dĩ, gia đình là người quyết định, nên hỏi nếu có thể.</li>
<li>Tên thuần Hàn như Haneul (bầu trời) hay Bora (màu tím) không có Hán tự nên không có gì để giải mã.</li>
</ul>
<p>Muốn xem thực tế? <a href="../index.html?lang=vi&amp;tab=name">Nhận tên Hàn</a> và xem nghĩa dưới từng chữ.</p>` },
    'guide-zodiac-traits': { title: 'Tính cách dân gian của 12 con giáp Hàn Quốc', desc: 'Những nét tính cách truyền thống gắn với mười hai con giáp Hàn Quốc, được giải thích như tín ngưỡng dân gian và chủ đề trò chuyện vui.',
      html: `<p>Ở Hàn Quốc và khắp Đông Á, mỗi con giáp được truyền thống gắn với một bộ tính cách. Đó là tín ngưỡng dân gian truyền qua nhiều thế hệ, là chủ đề trò chuyện vui chứ không phải mô tả khoa học về ai.</p>
<h2>Mười hai con giáp và tính cách dân gian</h2>
${H.table(['Con giáp', 'Tính cách truyền thống'], [['Chuột', 'nhanh trí, tháo vát'], ['Trâu', 'kiên nhẫn, đáng tin'], ['Hổ', 'táo bạo, có sức hút'], ['Thỏ', 'nhẹ nhàng, khéo ngoại giao'], ['Rồng', 'tham vọng, tự tin'], ['Rắn', 'sâu sắc, trực giác tốt'], ['Ngựa', 'tự do, tràn năng lượng'], ['Dê', 'tốt bụng, nghệ sĩ'], ['Khỉ', 'thông minh, tinh nghịch'], ['Gà', 'chăm chỉ, thẳng thắn'], ['Chó', 'trung thành, trung thực'], ['Lợn', 'hào phóng, dễ chịu']])}
<h2>Dùng một cách thân thiện</h2>
<ul>
<li>Dùng như câu phá băng. Hỏi "bạn tuổi gì?" là cách bắt chuyện phổ biến ở Hàn Quốc.</li>
<li>Hãy nhớ con người đa dạng hơn mười hai nhóm rất nhiều.</li>
<li>Kết hợp với độ hợp: <a href="guide-korean-zodiac.html">hướng dẫn con giáp</a> giải thích các cặp hợp và xung.</li>
</ul>
<h2>Vì sao mọi người thích</h2>
<p>Con giáp là ngôn ngữ chung để bạn bè trêu đùa và tự giới thiệu nhẹ nhàng. Nó cũng nối bạn với một truyền thống vẫn còn trong hội thoại hằng ngày của người Hàn, từ câu đùa sinh nhật đến lời chúc năm mới.</p>
<p>Tò mò về độ hợp? <a href="../index.html?lang=vi&amp;tab=match">Xem K-Match của bạn</a></p>` }
  }
});
