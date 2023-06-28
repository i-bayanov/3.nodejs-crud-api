import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

import { getBodyFromRequest, validateAndParseBody } from '../misc';
import { databaseResponseHandler } from './databaseResponseHandler';

export async function serverRequestHandler(
  databasePort: number,
  request: IncomingMessage,
  response: ServerResponse
) {
  try {
    const { method, url } = request;
    // console.log('Process on PORT:', process.env.PORT, 'received', `"${method}"`, 'request:', url);

    const urlRE = /^\/api\/users(?:\/(?<userID>[^?#\/]+))?$/;
    const urlMatchResult = url?.match(urlRE);

    if (!urlMatchResult) {
      response.statusCode = 404;
      response.end('<h1>Error 404 - Not found</h1>');

      return;
    }

    if (!method) {
      response.statusCode = 400;
      response.end('<h1>Error 400 - Invalid request method</h1>');

      return;
    }

    const { userID } = urlMatchResult.groups!;

    const requestBody = await getBodyFromRequest(request);

    let body: Omit<IUser, 'id'> | { error: string } | null = null;

    if (requestBody) {
      body = validateAndParseBody(requestBody);

      if ('error' in body) {
        response.statusCode = 400;
        response.end(`<h1>Error 400 - ${body.error}</h1>`);

        return;
      }
    }

    const databaseSocket = new Socket();
    const databaseQuery: IQuery = {
      method: method as IQuery['method'],
      userID,
      body,
    };
    databaseSocket.connect(databasePort);
    databaseSocket.write(JSON.stringify(databaseQuery));
    databaseSocket.on('data', (data) => {
      databaseResponseHandler(method, response, data.toString());
    });
  } catch {
    response.statusCode = 500;
    response.end('<h1>Error 500 - Internal server error</h1>');
  }
}
