(function () {
  var GA4_MEASUREMENT_ID = ''; // PENDIENTE: pegar G-XXXXXXXXXX
  var META_PIXEL_ID = '';      // PENDIENTE: pegar ID numérico del Pixel de Meta

  function conValor(v) {
    return typeof v === 'string' && v.trim().length > 0;
  }

  window.dgcTrack = function () {};

  var gaId = conValor(GA4_MEASUREMENT_ID) ? GA4_MEASUREMENT_ID.trim() : '';
  var metaId = conValor(META_PIXEL_ID) ? META_PIXEL_ID.trim() : '';
  if (!gaId && !metaId) return;

  if (gaId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(ga);
  }

  if (metaId) {
    if (!window.fbq) {
      var n = window.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      var meta = document.createElement('script');
      meta.async = true;
      meta.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(meta);
    }
    window.fbq('init', metaId);
    window.fbq('track', 'PageView');
  }

  window.dgcTrack = function (tipo, datos) {
    datos = datos || {};
    if (tipo === 'lead') {
      if (window.gtag) {
        window.gtag('event', 'generate_lead', {
          method: datos.source || undefined
        });
      }
      if (window.fbq) window.fbq('track', 'Lead');
    } else if (tipo === 'begin_checkout') {
      var value = datos.value != null ? datos.value : 47;
      var currency = datos.currency || 'USD';
      if (window.gtag) {
        window.gtag('event', 'begin_checkout', {
          currency: currency,
          value: value
        });
      }
      if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          value: value,
          currency: currency
        });
      }
    }
  };
})();
