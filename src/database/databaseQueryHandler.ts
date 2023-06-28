import { validate, v4 as uuidv4 } from 'uuid';

export function databaseQueryHandler(database: IDatabase, query: IQuery) {
  const { method, userID, body } = query;
  const { username, age, hobbies } = body || { username: '', age: 1, hobbies: [] };
  let response: IDatabaseResponse = { error: "Can't handle request" };

  if (userID && !validate(userID)) return { error: 'Invalid UserID' };

  switch (method) {
    case 'GET':
      if (!userID) {
        response = Object.values(database);
      } else {
        response = database[userID] || { error: 'User not found' };
      }

      break;

    case 'POST':
      if (userID || !body) {
        response = { error: "Can't handle request" };

        break;
      }

      const newUserId = uuidv4();
      const newUser: IUser = { id: newUserId, username, age, hobbies };
      database[newUserId] = newUser;
      response = newUser;

      break;

    case 'PUT':
      if (!userID || !body) {
        response = { error: "Can't handle request" };

        break;
      }

      if (!(userID in database)) {
        response = { error: 'User not found' };

        break;
      }

      const updatedUser: IUser = { id: userID, username, age, hobbies };
      database[userID] = updatedUser;
      response = updatedUser;

      break;

    case 'DELETE':
      if (!userID) {
        response = { error: "Can't handle request" };

        break;
      }

      if (!(userID in database)) {
        response = { error: 'User not found' };

        break;
      }

      const deletedUser = database[userID];
      delete database[userID];
      response = deletedUser;

      break;
  }

  return response;
}
