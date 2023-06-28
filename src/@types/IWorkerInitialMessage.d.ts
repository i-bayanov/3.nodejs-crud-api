interface IWorkerInitialMessage {
  runAs: 'database' | 'worker';
  databasePort: number;
}
