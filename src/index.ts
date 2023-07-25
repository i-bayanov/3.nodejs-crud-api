import cluster from 'cluster';
import { runPrimary } from './runPrimary';
import { runWorker } from './runWorker';

if (cluster.isPrimary) {
  runPrimary();
} else {
  runWorker();
}
