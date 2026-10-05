/* Browser-native voice: text-to-speech (Listen) and speech recognition (mic). No keys, no server. */
const Voice = (() => {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const BCP47 = { en: 'en-US', ko: 'ko-KR', th: 'th-TH', vi: 'vi-VN', id: 'id-ID', zh: 'zh-CN', fr: 'fr-FR', es: 'es-ES' };
  const tag = code => BCP47[code] || code;

  function voiceFor(l) {
    const vs = synth.getVoices(), want = l.toLowerCase();
    const norm = v => v.lang.replace('_', '-').toLowerCase();
    return vs.find(v => norm(v) === want) || vs.find(v => norm(v).startsWith(want.slice(0, 2)));
  }

  /* Resolves true if speech started, false if there is no usable voice or no support. */
  function speak(text, lang, rate) {
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return false;
    const l = tag(lang), v = voiceFor(l);
    const loaded = synth.getVoices().length > 0;
    if (!v && loaded && l.startsWith('ko')) return false; // Korean requested but device has no Korean voice
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = l; if (v) u.voice = v; u.rate = rate || 1;
    synth.speak(u);
    return true;
  }

  const canListen = () => !!SR;

  /* One-shot recognition. cb({text}) or cb({error}). Returns stop function. */
  function listen(lang, cb, onEnd) {
    const r = new SR();
    r.lang = tag(lang); r.interimResults = false; r.maxAlternatives = 1;
    let got = false;
    r.onresult = e => { got = true; cb({ text: e.results[0][0].transcript }); };
    r.onerror = e => { if (!got) cb({ error: e.error || 'error' }); };
    r.onend = () => { if (!got) cb({ error: 'no-speech' }); onEnd && onEnd(); };
    r.start();
    return () => { try { r.stop(); } catch (e) { /* already stopped */ } };
  }

  return { speak, listen, canListen, tag };
})();
