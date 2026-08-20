const CACHE_NAME = 'control-limpieza-v2';

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
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

  /*
   * Activa inmediatamente la nueva versión
   */

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

  /*
   * Toma control de la aplicación
   * inmediatamente.
   */

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
   * NO guardamos respuestas de la API.
   *
   * Si no hay Internet,
   * Index.js utiliza localStorage
   * y la cola offline.
   */

  if (
    request.url.includes('/api')
  ) {

    return;

  }


  /*
   * =================================================
   * SOLO PETICIONES GET
   * =================================================
   *
   * POST, PUT, DELETE, etc.
   * no se manejan desde la caché.
   */

  if (
    request.method !== 'GET'
  ) {

    return;

  }


  /*
   * =================================================
   * APLICACIÓN
   * =================================================
   *
   * Primero intenta Internet.
   *
   * Si funciona:
   *   - devuelve la versión nueva
   *   - guarda una copia en caché
   *
   * Si falla:
   *   - utiliza la copia guardada.
   */

  event.respondWith(

    fetch(request)

      .then(response => {

        /*
         * Si la respuesta es válida,
         * guardamos una copia.
         */

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

        /*
         * INTERNET NO DISPONIBLE
         *
         * Buscamos la copia local.
         */

        return caches
          .match(request)
          .then(response => {

            if (response) {

              return response;

            }


            /*
             * Si no encontramos
             * exactamente el archivo,
             * intentamos devolver
             * index.html.
             */

            return caches.match(
              './index.html'
            );

          });

      })

  );

});
