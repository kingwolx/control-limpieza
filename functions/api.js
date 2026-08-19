const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwrQXkMxYMw5w1uoydvNr6-f3cjnGwb0lrESv_JhCRenwnfhmiifmNNdtSPJwc_4QA/exec';


export async function onRequest(context) {

  const request = context.request;


  if (request.method !== 'POST') {

    return new Response(
      JSON.stringify({
        ok: false,
        mensaje: 'Método no permitido.'
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  }


  try {

    const cuerpo =
      await request.text();


    const respuesta =
      await fetch(
        APPS_SCRIPT_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: cuerpo
        }
      );


    const texto =
      await respuesta.text();


    return new Response(
      texto,
      {
        status: respuesta.status,

        headers: {
          'Content-Type':
            'application/json'
        }
      }
    );


  }
  catch (error) {

    return new Response(

      JSON.stringify({

        ok: false,

        mensaje:
          'Error de conexión con Apps Script: ' +
          error.message

      }),

      {
        status: 500,

        headers: {
          'Content-Type':
            'application/json'
        }
      }

    );

  }

}
