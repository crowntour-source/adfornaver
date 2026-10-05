/* Loads AdSense only when adsenseClient is configured. Slots stay empty (hidden) otherwise. */
(() => {
  const cfg = window.SITE_CONFIG || {};
  if (!/^ca-pub-\d{10,}$/.test(cfg.adsenseClient || '')) return;
  const slots = document.querySelectorAll('.ad-slot[data-slot]');
  const s = document.createElement('script');
  s.async = true; s.crossOrigin = 'anonymous';
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + cfg.adsenseClient;
  document.head.appendChild(s);
  slots.forEach(el => {
    const id = (cfg.slots || {})[el.dataset.slot];
    if (!id) return;
    el.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="' + cfg.adsenseClient +
      '" data-ad-slot="' + id + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* ad blocked */ }
  });
})();
