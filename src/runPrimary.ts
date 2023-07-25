import http from 'http';
import cluster from 'cluster';
import * as dotenv from 'dotenv';

import { serverRequestHandler, balancerRequestHandler } from './handlers';
import { getWorkers } from './workers';

export function runPrimary() {
  dotenv.config();
  const mainPort = Number(process.env.PORT) || 4000;

  if (mainPort <= 1) throw new Error('Invalid port');

  const databasePort = mainPort - 1;
  const withBalancer = process.env.NODE_ENV_BALANCER === 'with_balancer';

  const database = cluster.fork({ PORT: databasePort });
  database.once('online', () => {
    const message: IWorkerInitialMessage = { runAs: 'database', databasePort };
    database.send(message);
  });

  let server: http.Server;

  if (withBalancer) {
    const workerPorts = getWorkers(mainPort, databasePort);

    server = http.createServer(balancerRequestHandler.bind(null, workerPorts));
  } else {
    server = http.createServer(serverRequestHandler.bind(null, databasePort));
  }

  server.listen(mainPort, () => console.log(`Server is listening on http://localhost:${mainPort}`));
}
