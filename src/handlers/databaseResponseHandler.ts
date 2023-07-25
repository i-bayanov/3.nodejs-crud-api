import { ServerResponse } from 'http';

export function databaseResponseHandler(method: string, response: ServerResponse, msg: string) {
  const databaseResponse: IDatabaseResponse = JSON.parse(msg);
  let statusCode = 400;
  let responseMsg = '<h1>Error 400 - Invalid request</h1>';

  if ('error' in databaseResponse) {
    const { error } = databaseResponse;

    if (error === 'Invalid UserID') {
      responseMsg = `<h1>Error 400 - ${error}</h1>`;
    }

    if (error === 'User not found') {
      statusCode = 404;
      responseMsg = `<h1>Error 404 - ${error}</h1>`;
    }
  } else {
    switch (method) {
      case 'GET':
      case 'PUT':
        statusCode = 200;
        responseMsg = msg;
        response.setHeader('Content-Type', 'application/json');

        break;
      case 'POST':
        statusCode = 201;
        responseMsg = msg;
        response.setHeader('Content-Type', 'application/json');

        break;
      case 'DELETE':
        statusCode = 204;
        responseMsg = '';

        break;
    }
  }

  response.statusCode = statusCode;
  response.write(responseMsg);
  response.end();
}
