import { IncomingMessage, ServerResponse, RequestOptions, request as serverRequest } from 'http';

let i = 0;

export function balancerRequestHandler(
  workers: number[],
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
    port: workers[i],
    method: request.method,
  };
  const requestToWorker = serverRequest(
    'http://localhost',
    requestOptions,
    (responseFromWorker) => {
      responseFromWorker.pipe(response);
    }
  );
  request.pipe(requestToWorker);

  i++;

  if (i === workers.length) i = 0;
}
