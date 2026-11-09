/* Service worker do Giz & Gabarito no navegador. Gerado por ferramentas-mulder/web/montar_web.py a partir de
   sw-modelo.js: não edite o sw.js do site à mão.
   - A página vem primeiro da rede (para pegar a versão nova) e, sem internet, do cache.
   - Dados, imagens e fontes vêm do cache; o que ainda não está nele vem da rede e fica guardado.
   - O nome do cache muda a cada versão do site, e o cache antigo é apagado. */
var CACHE = 'giz-359f085562f6';
var BASICO = ['./', 'index.html', 'web.js', 'marca.webp', 'manifest.webmanifest', 'icone-192.png', 'dados/catalogo.js', 'dados/niveis.js'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASICO); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n.indexOf('giz-') === 0 && n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var pedido = e.request;
  if (pedido.method !== 'GET') return;
  var url = new URL(pedido.url);
  var fontes = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== self.location.origin && !fontes) return;  // Firebase e outros serviços seguem direto
  if (pedido.mode === 'navigate') {
    e.respondWith(fetch(pedido).then(function (resposta) {
      var copia = resposta.clone();
      if (resposta.ok) caches.open(CACHE).then(function (c) { c.put('index.html', copia); });
      return resposta;
    }).catch(function () {
      return caches.open(CACHE).then(function (c) { return c.match('index.html'); });
    }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(pedido).then(function (guardada) {
      return guardada || fetch(pedido).then(function (resposta) {
        if (resposta.ok || resposta.type === 'opaque') c.put(pedido, resposta.clone());
        return resposta;
      });
    });
  }));
});
