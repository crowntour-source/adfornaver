/* Share-card rendering (canvas) and share actions. Pure browser code, no network. */
const Share = (() => {
  const FONT = '"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic","Noto Sans Thai","Leelawadee UI","PingFang SC",system-ui,sans-serif';
  const HASHTAGS = '#KName #KMatch #KPop #Korea';

  function segments(text, lang) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      try { return Array.from(new Intl.Segmenter(lang, { granularity: 'word' }).segment(text), s => s.segment); } catch (e) { /* fall through */ }
    }
    return text.split(/(\s+)/);
  }

  function wrap(ctx, text, maxW, lang, maxLines) {
    const lines = []; let cur = '';
    for (const seg of segments(text, lang)) {
      const test = cur + seg;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur.trim()); cur = seg.trimStart(); } else cur = test;
    }
    if (cur.trim()) lines.push(cur.trim());
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,1}$/, '…'); }
    return lines;
  }

  // draw one centered line, shrinking font until it fits
  function fit(ctx, text, x, y, size, weight, maxW) {
    let sz = size;
    do { ctx.font = `${weight} ${sz}px ${FONT}`; sz -= 4; } while (ctx.measureText(text).width > maxW && sz > 20);
    ctx.fillText(text, x, y);
    return y;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function background(ctx, W, H, hue) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, `hsl(${hue},75%,58%)`);
    g.addColorStop(1, `hsl(${(hue + 55) % 360},70%,32%)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc((i * 233 + 90) % W, (i * 397 + 160) % H, 90 + i * 22, 0, Math.PI * 2); ctx.fill(); }
  }

  function footer(ctx, W, H, card) {
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
    fit(ctx, card.footer, W / 2, H - 120, 46, 700, W - 140);
    ctx.globalAlpha = 0.85; fit(ctx, card.site, W / 2, H - 56, 36, 500, W - 140); ctx.globalAlpha = 1;
  }

  function drawName(ctx, W, H, c) {
    background(ctx, W, H, c.hue);
    const story = H > 1500, top = story ? 330 : 120;
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    fit(ctx, c.heading, W / 2, top, 46, 700, W - 140);
    if (c.who) { ctx.globalAlpha = 0.9; fit(ctx, c.who + '  ➜', W / 2, top + 66, 44, 500, W - 140); ctx.globalAlpha = 1; }
    ctx.font = `120px ${FONT}`; ctx.fillText(c.emoji, W / 2, top + 230);
    fit(ctx, c.hangul, W / 2, top + 440, 230, 800, W - 120);
    fit(ctx, c.rom, W / 2, top + 540, 76, 700, W - 140);
    let y = top + 540;
    if (c.hanja) { ctx.globalAlpha = 0.9; fit(ctx, c.hanja, W / 2, y += 78, 58, 500, W - 140); ctx.globalAlpha = 1; }
    ctx.font = `500 44px ${FONT}`;
    const lines = wrap(ctx, c.meaning, W - 200, c.lang, 3);
    y += 40;
    lines.forEach(l => { y += 62; ctx.fillText(l, W / 2, y); });
    // profile chips
    const cy = y + 70, cw = (W - 160 - 40) / 3, ch = 170;
    c.chips.forEach((chip, i) => {
      const x = 80 + i * (cw + 20);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; roundRect(ctx, x, cy, cw, ch, 28); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.85; fit(ctx, chip.label, x + cw / 2, cy + 56, 30, 500, cw - 30); ctx.globalAlpha = 1;
      if (chip.swatch) {
        ctx.fillStyle = chip.swatch; ctx.beginPath(); ctx.arc(x + cw / 2, cy + 110, 26, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#fff';
      } else fit(ctx, chip.value, x + cw / 2, cy + 128, 48, 800, cw - 30);
    });
    footer(ctx, W, H, c);
  }

  function drawMatch(ctx, W, H, c) {
    background(ctx, W, H, c.hue);
    const story = H > 1500, top = story ? 300 : 110;
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    fit(ctx, c.heading, W / 2, top, 46, 700, W - 140);
    fit(ctx, `${c.a}  ×  ${c.b}`, W / 2, top + 100, 84, 800, W - 120);
    if (c.ship) { ctx.globalAlpha = 0.95; fit(ctx, `💞 ${c.shipLabel}: ${c.ship}`, W / 2, top + 175, 48, 600, W - 140); ctx.globalAlpha = 1; }
    fit(ctx, `${c.score}%`, W / 2, top + 440, 300, 900, W - 200);
    // bar
    const bx = 140, bw = W - 280, by = top + 480;
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; roundRect(ctx, bx, by, bw, 26, 13); ctx.fill();
    ctx.fillStyle = '#fff'; roundRect(ctx, bx, by, Math.max(26, bw * c.score / 100), 26, 13); ctx.fill();
    ctx.fillStyle = '#fff';
    fit(ctx, c.verdict, W / 2, by + 100, 58, 800, W - 140);
    ctx.font = `italic 500 44px ${FONT}`;
    let y = by + 120;
    wrap(ctx, `“${c.drama}”`, W - 200, c.lang, 2).forEach(l => { y += 58; ctx.fillText(l, W / 2, y); });
    // stats
    y += 50;
    c.stats.forEach(st => {
      ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = `600 34px ${FONT}`; ctx.fillText(st.label, 120, y + 30);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; roundRect(ctx, 480, y + 6, 360, 24, 12); ctx.fill();
      ctx.fillStyle = '#fff'; roundRect(ctx, 480, y + 6, 360 * st.val / 100, 24, 12); ctx.fill();
      ctx.textAlign = 'right'; ctx.font = `700 34px ${FONT}`; ctx.fillText(String(st.val), W - 120, y + 30);
      y += 62;
    });
    ctx.textAlign = 'center';
    footer(ctx, W, H, c);
  }

  function render(canvas, card, ratio) {
    const W = 1080, H = ratio === 'story' ? 1920 : 1350;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (card.kind === 'name') drawName(ctx, W, H, card); else drawMatch(ctx, W, H, card);
  }

  const toBlob = canvas => new Promise(res => canvas.toBlob(res, 'image/png'));

  async function save(card, ratio, filename) {
    const c = document.createElement('canvas'); render(c, card, ratio);
    const blob = await toBlob(c);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  async function nativeShare(card, caption, url, filename) {
    const c = document.createElement('canvas'); render(c, card, 'feed');
    const blob = await toBlob(c);
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], text: `${caption} ${url}` });
    return navigator.share({ text: caption, url });
  }

  const enc = encodeURIComponent;
  function links(caption, url) {
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&hashtag=${enc('#KName')}`,
      whatsapp: `https://wa.me/?text=${enc(caption + ' ' + url)}`,
      line: `https://social-plugins.line.me/lineit/share?url=${enc(url)}&text=${enc(caption)}`,
      telegram: `https://t.me/share/url?url=${enc(url)}&text=${enc(caption)}`,
      x: `https://twitter.com/intent/tweet?text=${enc(caption + ' ' + HASHTAGS)}&url=${enc(url)}`
    };
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { return false; }
  }

  return { render, save, nativeShare, links, copy, HASHTAGS, canNative: () => typeof navigator !== 'undefined' && !!navigator.share };
})();
