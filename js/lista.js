/* Alta en la lista desde las landings de regalo.
   Cada formulario lleva data-source (de dónde viene) y data-regalo (qué regalo pide).
   El alta va a un formulario de Wildmail (ActiveCampaign) que suscribe a la lista Newsletter
   y pone la etiqueta del regalo; la automatización de ese formulario manda el email de entrega.
   Seguimiento: utm_* del alta (último toque), «Primer origen» (primer toque guardado en este
   navegador) y «Página de alta». */
(function () {
  var PROC_URL = 'https://danigdecelis.activehosted.com/proc.php';

  // data-regalo → id del formulario de Wildmail
  var FORMULARIOS = { numeros: 5, iman: 6, 'caja-negra': 7 };

  // id de cada campo oculto en Wildmail
  var CAMPO = {
    utm_source: 3, utm_medium: 4, utm_campaign: 5, utm_content: 6, utm_term: 7,
    primer_origen: 8, pagina_alta: 9
  };

  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var K_ULTIMO = 'dgc_utm_ultimo';
  var K_PRIMERO = 'dgc_origen_primero';

  function leer(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function guardar(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

  // 1. Al cargar la página: si trae UTM, se guarda como último toque y, si es la primera vez, como primer toque.
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

  function ultimoToque() {
    if (Object.keys(actuales).length) return actuales;
    try { return JSON.parse(leer(K_ULTIMO) || '{}'); } catch (e) { return {}; }
  }

  function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function enviar(form) {
    var campoEmail = form.querySelector('input[type="email"]');
    var campoNombre = form.querySelector('input[name="nombre"]');
    var boton = form.querySelector('button[type="submit"]');
    var email = (campoEmail && campoEmail.value || '').trim();
    if (!emailOk(email)) {
      if (campoEmail) { campoEmail.style.borderColor = 'var(--danger)'; campoEmail.focus(); }
      return;
    }
    if (campoEmail) campoEmail.style.borderColor = '';
    if (boton) boton.disabled = true;

    var regalo = form.getAttribute('data-regalo') || '';
    var source = form.getAttribute('data-source') || '';
    var idForm = FORMULARIOS[regalo];
    var utm = ultimoToque();
    if (!utm.utm_source) utm = { utm_source: '(directo)' };

    var datos = new URLSearchParams();
    datos.append('u', String(idForm));
    datos.append('f', String(idForm));
    datos.append('s', '');
    datos.append('c', '0');
    datos.append('m', '0');
    datos.append('act', 'sub');
    datos.append('v', '2');
    datos.append('fullname', (campoNombre && campoNombre.value || '').trim());
    datos.append('email', email);
    UTM.forEach(function (k) { if (utm[k]) datos.append('field[' + CAMPO[k] + ']', utm[k]); });
    datos.append('field[' + CAMPO.primer_origen + ']', leer(K_PRIMERO) || '(directo) · ' + window.location.pathname + ' · ' + new Date().toISOString().slice(0, 10));
    datos.append('field[' + CAMPO.pagina_alta + ']', window.location.pathname);

    if (idForm) {
      fetch(PROC_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: datos.toString()
      }).catch(function () {});
    }
    form.classList.add('enviado');
    if (window.dgcTrack) window.dgcTrack('lead', { source: source, regalo: regalo });
  }

  document.querySelectorAll('form.js-regalo-form').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); enviar(form); });
  });
})();
