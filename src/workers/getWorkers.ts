import cluster from 'cluster';
import { availableParallelism } from 'os';

export function getWorkers(mainPort: number, databasePort: number) {
  return new Array(availableParallelism() - 1).fill(0).map((_el, index) => {
    const workerPort = mainPort + index + 1;
    const worker = cluster.fork({ PORT: workerPort });

    worker.once('online', () => {
      const message: IWorkerInitialMessage = { runAs: 'worker', databasePort };

      worker.send(message);
    });

    return workerPort;
  });
}
