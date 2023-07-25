import http from 'http';
import { runDatabase } from './database';
import { serverRequestHandler } from './handlers';

export function runWorker() {
  const workerPort = process.env.PORT;

  process.once('message', ({ runAs, databasePort }: IWorkerInitialMessage) => {
    if (runAs === 'database') runDatabase();

    if (runAs === 'worker') {
      const workerServer = http.createServer(serverRequestHandler.bind(null, databasePort));

      workerServer.listen(workerPort, () =>
        console.log(`Worker is listening on http://localhost:${workerPort}`)
      );
    }
  });
}
