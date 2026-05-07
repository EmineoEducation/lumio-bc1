// ── Intercepteur API key ──
(function() {
  // Récupérer clé depuis sessionStorage si déjà saisie
  const saved = sessionStorage.getItem('lumio_api_key');
  if (saved) window.__ANTHROPIC_KEY = saved;

  const _fetch = window.fetch.bind(window);
  window.fetch = function(url, opts = {}) {
    if (typeof url === 'string' && url.includes('api.anthropic.com')) {
      const key = window.__ANTHROPIC_KEY || '';
      opts = {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          ...(opts.headers || {})
        }
      };
    }
    return _fetch(url, opts);
  };
})();


// ══════════════════════════════════════════════════════════════
//  MAIL APP — Outlook/Apple Mail-like
