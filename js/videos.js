/* Vídeos testimonio: se reproducen dentro de la página, sin salir a YouTube (norma de Daniel, 23-oct-2026).
   Convierte cada tarjeta enlazada a YouTube (.vid con .th) en un reproductor que carga el vídeo al pulsar. */
(function () {
  function idDe(url) {
    var m = url.match(/(?:[?&]v=|youtu\.be\/|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  document.querySelectorAll('a[href*="youtube.com/"], a[href*="youtu.be/"]').forEach(function (a) {
    var th = a.querySelector('.th');
    var id = idDe(a.getAttribute('href') || '');
    if (!th || !id) return;
    var tarjeta = document.createElement('div');
    tarjeta.className = a.className;
    while (a.firstChild) tarjeta.appendChild(a.firstChild);
    a.parentNode.replaceChild(tarjeta, a);
    var img = th.querySelector('img');
    th.setAttribute('role', 'button');
    th.setAttribute('tabindex', '0');
    th.setAttribute('aria-label', 'Reproducir ' + (img && img.alt ? img.alt.toLowerCase() : 'vídeo'));
    th.style.cursor = 'pointer';
    function reproducir() {
      if (th.getAttribute('data-activo')) return;
      th.setAttribute('data-activo', '1');
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
      f.title = img && img.alt ? img.alt : 'Vídeo';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.setAttribute('allowfullscreen', '');
      f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
      th.innerHTML = '';
      th.appendChild(f);
    }
    th.addEventListener('click', reproducir);
    th.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reproducir(); }
    });
  });
})();
