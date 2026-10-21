/* Alta en la lista desde las landings de regalo. Cada formulario lleva data-source (de dónde viene) y data-regalo (qué regalo pide). */
(function () {
  var LISTA_SUBMIT_URL = ''; // PENDIENTE: endpoint de alta en Wildmail

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
    var payload = {
      nombre: (campoNombre && campoNombre.value || '').trim(),
      email: email,
      source: form.getAttribute('data-source') || '',
      regalo: form.getAttribute('data-regalo') || '',
      ts: new Date().toISOString()
    };
    if (LISTA_SUBMIT_URL) {
      fetch(LISTA_SUBMIT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      }).catch(function () {});
    }
    form.classList.add('enviado');
    if (window.dgcTrack) window.dgcTrack('lead', { source: payload.source, regalo: payload.regalo });
  }

  document.querySelectorAll('form.js-regalo-form').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); enviar(form); });
  });
})();
