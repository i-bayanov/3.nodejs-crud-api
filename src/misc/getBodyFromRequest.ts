import { IncomingMessage } from 'http';

export async function getBodyFromRequest(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let requestBody = '';

    request
      .on('data', (chunk: string) => {
        if (chunk) requestBody += chunk;
      })
      .on('end', () => {
        resolve(requestBody);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
