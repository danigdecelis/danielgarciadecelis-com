/* Medición de danielgarciadecelis.com: aviso de cookies, Google Analytics 4 y píxel de Meta.
   - Con los dos IDs vacíos no se muestra aviso ni se carga nada.
   - GA4 y el píxel solo se cargan si la persona acepta en el aviso; aceptar y rechazar van al mismo nivel.
   - La decisión se puede cambiar con el enlace «configurar cookies» que se añade al pie de cada página.
   - Eventos: PageView, ViewContent (El Desglose), Lead (altas), ClicComprar (botón propio de compra; el
     InitiateCheckout y el Purchase los manda Hotmart desde su checkout), muestra_abierta.
   - Los enlaces a pay.hotmart.com salen con las UTM de la visita y con sck/src para que Hotmart atribuya la venta. */
(function () {
  var GA4_MEASUREMENT_ID = ''; // PENDIENTE: pegar G-XXXXXXXXXX
  var META_PIXEL_ID = '2370688430350844'; // conjunto de datos «danielgarciadecelis.com», porfolio Dani GdC (23-oct-2026)

  var K_DECISION = 'dgc_cookies';          // 'si' | 'no'
  var K_ULTIMO = 'dgc_utm_ultimo';         // UTM de la última visita que las traía
  var K_PRIMERO = 'dgc_origen_primero';    // primer origen: fuente / medio / campaña · página · fecha
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function leer(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function guardar(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function conValor(v) { return typeof v === 'string' && v.trim().length > 0; }

  var gaId = conValor(GA4_MEASUREMENT_ID) ? GA4_MEASUREMENT_ID.trim() : '';
  var metaId = conValor(META_PIXEL_ID) ? META_PIXEL_ID.trim() : '';
  var hayMedicion = !!(gaId || metaId);
  var cargado = false;

  /* 1. Origen de la visita (primer y último toque), guardado solo en este navegador */
  var params = new URLSearchParams(window.location.search);
  var actuales = {};
  UTM.forEach(function (k) { var v = params.get(k); if (v) actuales[k] = v.slice(0, 200); });
  if (Object.keys(actuales).length) {
    guardar(K_ULTIMO, JSON.stringify(actuales));
    if (!leer(K_PRIMERO)) {
      guardar(K_PRIMERO, [actuales.utm_source || '-', actuales.utm_medium || '-', actuales.utm_campaign || '-'].join(' / ') +
        ' · ' + window.location.pathname + ' · ' + new Date().toISOString().slice(0, 10));
    }
  }
  function utmVisita() {
    if (Object.keys(actuales).length) return actuales;
    try { return JSON.parse(leer(K_ULTIMO) || '{}'); } catch (e) { return {}; }
  }

  /* 2. Enlaces a Hotmart: UTM + sck/src al pulsar */
  function decorarHotmart(a) {
    try {
      var u = new URL(a.href);
      if (u.hostname.indexOf('hotmart.com') === -1) return;
      var utm = utmVisita();
      UTM.forEach(function (k) { if (utm[k] && !u.searchParams.get(k)) u.searchParams.set(k, utm[k]); });
      var etiqueta = [utm.utm_source || 'directo', utm.utm_medium || '', utm.utm_campaign || '', utm.utm_content || '']
        .join('_').replace(/[^a-zA-Z0-9_\-]/g, '-').replace(/_+$/, '').slice(0, 100);
      if (!u.searchParams.get('sck')) u.searchParams.set('sck', etiqueta);
      if (!u.searchParams.get('src')) u.searchParams.set('src', window.location.pathname.replace(/\//g, '') || 'home');
      a.href = u.toString();
    } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="hotmart.com"]') : null;
    if (a) decorarHotmart(a);
  }, true);

  /* 3. Carga de GA4 y del píxel, solo con consentimiento */
  function cargar() {
    if (cargado || !hayMedicion) return;
    cargado = true;
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
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        var meta = document.createElement('script');
        meta.async = true;
        meta.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(meta);
      }
      window.fbq('init', metaId);
      window.fbq('track', 'PageView');
      if (/^\/el-desglose\/?$/.test(window.location.pathname)) {
        window.fbq('track', 'ViewContent', { content_name: 'El Desglose', value: 47, currency: 'USD' });
      }
    }
  }

  window.dgcTrack = function (tipo, datos) {
    datos = datos || {};
    if (!cargado) return;
    if (tipo === 'lead') {
      if (window.gtag) window.gtag('event', 'generate_lead', { method: datos.source || undefined, lead_source: datos.regalo || datos.source || undefined });
      if (window.fbq) window.fbq('track', 'Lead', { content_name: datos.regalo || datos.source || '' });
    } else if (tipo === 'begin_checkout') {
      var value = datos.value != null ? datos.value : 47;
      var currency = datos.currency || 'USD';
      if (window.gtag) window.gtag('event', 'begin_checkout', { currency: currency, value: value });
      if (window.fbq) window.fbq('trackCustom', 'ClicComprar', { value: value, currency: currency });
    } else {
      if (window.gtag) window.gtag('event', tipo, datos);
      if (window.fbq) window.fbq('trackCustom', tipo, datos);
    }
  };

  /* 4. Aviso de cookies */
  var CSS = '#dgc-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;' +
    'background:#0a0b0d;color:#edece8;border:1px solid rgba(237,236,232,.18);padding:20px;font:15px/1.5 Archivo,"Helvetica Neue",Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.35)}' +
    '#dgc-cookies p{margin:0 0 14px}#dgc-cookies a{color:#ffd23f}' +
    '#dgc-cookies .fila{display:flex;gap:10px;flex-wrap:wrap}' +
    '#dgc-cookies button{flex:1 1 140px;font:600 14px/1 "IBM Plex Mono",ui-monospace,monospace;padding:12px 14px;cursor:pointer;border:1px solid #ffd23f}' +
    '#dgc-cookies .si{background:#ffd23f;color:#0a0b0d}#dgc-cookies .no{background:#ffd23f;color:#0a0b0d}' +
    '#dgc-cookies button:focus-visible{outline:2px solid #edece8;outline-offset:2px}';

  function cerrarAviso() { var el = document.getElementById('dgc-cookies'); if (el) el.parentNode.removeChild(el); }

  function mostrarAviso() {
    if (!hayMedicion || document.getElementById('dgc-cookies')) return;
    if (!document.getElementById('dgc-cookies-css')) {
      var st = document.createElement('style'); st.id = 'dgc-cookies-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    var caja = document.createElement('div');
    caja.id = 'dgc-cookies';
    caja.setAttribute('role', 'dialog');
    caja.setAttribute('aria-label', 'Aviso de cookies');
    caja.innerHTML = '<p>Si aceptas, uso Google Analytics y el píxel de Meta para saber qué páginas y qué anuncios funcionan. Si no, no se carga ninguno. <a href="/cookies/">Más info</a>.</p>' +
      '<div class="fila"><button type="button" class="no">rechazar</button><button type="button" class="si">aceptar</button></div>';
    caja.querySelector('.si').addEventListener('click', function () { guardar(K_DECISION, 'si'); cerrarAviso(); cargar(); });
    caja.querySelector('.no').addEventListener('click', function () {
      var antes = leer(K_DECISION);
      guardar(K_DECISION, 'no'); cerrarAviso();
      if (antes === 'si' && cargado) window.location.reload(); // descarga lo ya cargado
    });
    document.body.appendChild(caja);
  }

  function enlacePie() {
    if (!hayMedicion) return;
    document.querySelectorAll('a[href="/cookies/"]').forEach(function (a) {
      if (a.closest('#dgc-cookies') || a.textContent.trim().toLowerCase() !== 'cookies' || a.parentNode.querySelector('.dgc-configurar')) return;
      var b = document.createElement('a');
      b.href = '#'; b.className = 'dgc-configurar'; b.textContent = 'configurar cookies';
      b.addEventListener('click', function (e) { e.preventDefault(); mostrarAviso(); });
      a.parentNode.insertBefore(b, a.nextSibling);
      a.parentNode.insertBefore(document.createTextNode(' '), b);
    });
  }

  window.dgcCookies = { abrir: mostrarAviso };

  function iniciar() {
    var decision = leer(K_DECISION);
    if (decision === 'si') cargar();
    else if (decision !== 'no') mostrarAviso();
    enlacePie();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
