import net from 'net';

import { databaseQueryHandler } from './databaseQueryHandler';

export function runDatabase() {
  const databasePort = process.env.PORT;
  const database: IDatabase = {};

  const dbServer = net.createServer((socket) => {
    socket.on('data', (chunk) => {
      const request: IQuery = JSON.parse(chunk.toString());
      const response = databaseQueryHandler(database, request);

      socket.write(JSON.stringify(response));
      socket.pipe(socket);
    });
  });

  dbServer.listen(databasePort, () => console.log('Database is running on PORT', databasePort));
}
