const CACHE_NAME = 'control-limpieza-v1';

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];


/****************************************************
 * INSTALAR
 ****************************************************/

self.addEventListener('install', event => {

  event.waitUntil(

    caches
      .open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(ARCHIVOS);

      })

  );

  self.skipWaiting();

});


/****************************************************
 * ACTIVAR
 ****************************************************/

self.addEventListener('activate', event => {

  event.waitUntil(

    caches
      .keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })

  );

  self.clients.claim();

});


/****************************************************
 * PETICIONES
 ****************************************************/

self.addEventListener('fetch', event => {

  const request =
    event.request;


  /*
   * API
   *
   * NO intentamos cachearla.
   * Si no hay Internet, el Index
   * trabaja con la cola local.
   */

  if (
    request.url.includes('/api')
  ) {

    return;

  }


  /*
   * ARCHIVOS DE LA APLICACIÓN
   *
   * Primero intenta Internet.
   * Si no hay Internet,
   * utiliza la copia guardada.
   */

  event.respondWith(

    fetch(request)

      .then(response => {

        const copia =
          response.clone();

        caches
          .open(CACHE_NAME)
          .then(cache => {

            cache.put(
              request,
              copia
            );

          });

        return response;

      })

      .catch(() => {

        return caches.match(request);

      })

  );

});
