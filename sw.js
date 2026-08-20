const CACHE_NAME = 'control-limpieza-v2';

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './icon-192.png',
  './icon-512.png'
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
   * =================================================
   * API
   * =================================================
   *
   * No cacheamos la API.
   */

  if (
    request.url.includes('/api')
  ) {

    return;

  }


  /*
   * =================================================
   * SOLO GET
   * =================================================
   */

  if (
    request.method !== 'GET'
  ) {

    return;

  }


  /*
   * =================================================
   * ARCHIVOS DE LA APLICACIÓN
   * =================================================
   */

  event.respondWith(

    fetch(request)

      .then(response => {

        if (
          response &&
          response.status === 200
        ) {

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

        }


        return response;

      })

      .catch(() => {

        return caches
          .match(request)
          .then(response => {

            if (response) {

              return response;

            }


            return caches.match(
              './index.html'
            );

          });

      })

  );

});
