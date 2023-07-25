import { IncomingMessage, ServerResponse, RequestOptions, request as serverRequest } from 'http';

let i = 0;

export function balancerRequestHandler(
  workerPorts: number[],
  request: IncomingMessage,
  response: ServerResponse
) {
  /* console.log(
    'Balancer on PORT',
    process.env.PORT,
    'received',
    `"${request.method}"`,
    'request:',
    request.url,
    'and redirected it to worker on PORT',
    workers[i]
  ); */

  const requestOptions: RequestOptions = {
    path: request.url,
    port: workerPorts[i],
    method: request.method,
  };
  const requestToWorker = serverRequest(
    'http://localhost',
    requestOptions,
    (responseFromWorker) => {
      response.statusCode = responseFromWorker.statusCode!;
      for (let header in responseFromWorker.headers) {
        response.setHeader(header, responseFromWorker.headers[header]!);
      }
      responseFromWorker.pipe(response);
    }
  );

  request.pipe(requestToWorker).on('error', () => {
    response.statusCode = 500;
    response.end('<h1>Error 500 - Internal server error</h1>');
  });

  i++;

  if (i === workerPorts.length) i = 0;
}
