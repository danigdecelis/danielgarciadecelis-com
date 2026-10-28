/* Origen del contacto para los formularios de la home y de /lista/.
   Misma lógica y mismas claves de navegador que js/lista.js (el sistema de Rafa para las landings de regalo):
   «último toque» (dgc_utm_ultimo) y «primer origen» (dgc_origen_primero), para que todas las puertas
   guarden en Wildmail lo mismo: utm_* (campos 3-7), Primer origen (campo 8) y Página de alta (campo 9). */
(function () {
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var K_ULTIMO = 'dgc_utm_ultimo';
  var K_PRIMERO = 'dgc_origen_primero';

  function leer(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function guardar(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

  // Al cargar la página: si trae UTM, se guarda como último toque y, si es la primera vez, como primer toque.
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

  window.dgcOrigen = {
    // utm del último toque; sin ninguno, «(directo)»
    utm: function () {
      var u = actuales;
      if (!Object.keys(u).length) { try { u = JSON.parse(leer(K_ULTIMO) || '{}'); } catch (e) { u = {}; } }
      return u.utm_source ? u : { utm_source: '(directo)' };
    },
    // primer toque guardado en este navegador; sin ninguno, esta visita como directa
    primero: function () {
      return leer(K_PRIMERO) || '(directo) · ' + window.location.pathname + ' · ' + new Date().toISOString().slice(0, 10);
    }
  };
})();
