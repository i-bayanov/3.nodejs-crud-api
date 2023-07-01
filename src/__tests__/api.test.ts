import { availableParallelism } from 'os';
import request from 'supertest';
import { v4 as uuidv4, validate } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const server = request(`http://localhost:${PORT}`);

const endpoint = '/api/users';
const user: Partial<IUser> = {
  username: 'User',
  age: 20,
  hobbies: ['hobbie1', 'hobbie2'],
};

const createOneUser = async () => {
  const response = await server.post(endpoint).send(user);

  user.id = response.body.id;
};

const clearDataBase = async () => {
  const users = (await server.get(endpoint)).body as IUser[];

  for (let user of users) {
    await server.delete(endpoint + '/' + user.id);
  }
};

describe('Server should perform basic operations', () => {
  test('should response with an empty array after start', async () => {
    const response = await server.get(endpoint);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('should create user', async () => {
    const response = await server.post(endpoint).send(user);

    expect(response.statusCode).toBe(201);
    expect(response.body.username).toBe('User');
    expect(response.body.age).toBe(20);
    expect(response.body.hobbies).toEqual(['hobbie1', 'hobbie2']);
    expect(validate(response.body.id)).toBe(true);

    user.id = response.body.id;
  });

  test('should get user by id', async () => {
    const response = await server.get(endpoint + '/' + user.id);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(user);
  });

  test('should edit user', async () => {
    const response = await server.put(endpoint + '/' + user.id).send({ ...user, age: 21 });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ...user, age: 21 });
  });

  test('should delete user', async () => {
    const response = await server.delete(endpoint + '/' + user.id);

    expect(response.statusCode).toBe(204);
    expect(response.text).toBe('');
  });

  test('should response with an empty array in the end', async () => {
    const response = await server.get(endpoint);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe('Server should response with correct status codes if data provided is invalid', () => {
  beforeAll(createOneUser);

  afterAll(clearDataBase);

  test('should response with status code 404 on non-existing endpoint', async () => {
    const response1 = await server.get('/some-non/existing/resource');
    expect(response1.statusCode).toBe(404);
    expect(response1.text).toBe('<h1>Error 404 - Not found</h1>');

    const response2 = await server.post('/some-non/existing/resource').send(user);
    expect(response2.statusCode).toBe(404);
    expect(response2.text).toBe('<h1>Error 404 - Not found</h1>');
  });

  test('should response with status code 400 if provided userId is invalid', async () => {
    const urlWithInvalidUserID = endpoint + '/' + 'invalid-user-id';

    const responseGET = await server.get(urlWithInvalidUserID);
    expect(responseGET.statusCode).toBe(400);
    expect(responseGET.text).toBe('<h1>Error 400 - Invalid UserID</h1>');

    const responsePUT = await server.put(urlWithInvalidUserID).send({ ...user, age: 21 });
    expect(responsePUT.statusCode).toBe(400);
    expect(responsePUT.text).toBe('<h1>Error 400 - Invalid UserID</h1>');

    const responseDELETE = await server.delete(urlWithInvalidUserID);
    expect(responseDELETE.statusCode).toBe(400);
    expect(responseDELETE.text).toBe('<h1>Error 400 - Invalid UserID</h1>');
  });

  test("should response with status code 404 if user with provided id doesn't exist", async () => {
    const urlWithNonExisingUserId = endpoint + '/' + uuidv4();

    const response = await server.get(urlWithNonExisingUserId);
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('<h1>Error 404 - User not found</h1>');

    const responsePUT = await server.put(urlWithNonExisingUserId).send({ ...user, age: 21 });
    expect(responsePUT.statusCode).toBe(404);
    expect(responsePUT.text).toBe('<h1>Error 404 - User not found</h1>');

    const responseDELETE = await server.delete(urlWithNonExisingUserId);
    expect(responseDELETE.statusCode).toBe(404);
    expect(responseDELETE.text).toBe('<h1>Error 404 - User not found</h1>');
  });

  test("should response with status code 400 if new user body doesn't contain required fields or invalid", async () => {
    const response1 = await server.post(endpoint).send({ username: 'User', age: 20 });
    expect(response1.statusCode).toBe(400);
    expect(response1.text).toBe('<h1>Error 400 - Invalid request body</h1>');

    const response2 = await server.post(endpoint).send('invalid data');
    expect(response2.statusCode).toBe(400);
    expect(response2.text).toBe('<h1>Error 400 - Invalid request body</h1>');
  });

  test("should response with status code 400 if updating user body doesn't contain required fields or invalid", async () => {
    const response1 = await server
      .put(endpoint + '/' + user.id)
      .send({ username: 'User', age: 21 });
    expect(response1.statusCode).toBe(400);
    expect(response1.text).toBe('<h1>Error 400 - Invalid request body</h1>');

    const response2 = await server.put(endpoint + '/' + user.id).send('invalid data');
    expect(response2.statusCode).toBe(400);
    expect(response2.text).toBe('<h1>Error 400 - Invalid request body</h1>');
  });
});

describe('Server should', () => {
  beforeAll(clearDataBase);
  afterAll(clearDataBase);

  test('create all users if multiple requests are sent at the same time', async () => {
    const NUMBER_OF_USERS = availableParallelism() * 2 + 2;
    const usersArray = new Array(NUMBER_OF_USERS).fill(0).map((_el, i) => ({
      username: `User-${i + 1}`,
      age: Math.round(Math.random() * 100),
      hobbies: [`User-${i + 1}-hobbie-1`, `User-${i + 1}-hobbie-2`],
    }));

    await Promise.all(usersArray.map((user) => server.post(endpoint).send(user)));

    const createdUsers = (await server.get(endpoint)).body as IUser[];

    usersArray.forEach((user) => {
      const createdUser = createdUsers.find(
        (createdUser) => createdUser.username === user.username
      );

      expect(createdUser).toBeDefined();
      expect(createdUser?.age).toBe(user.age);
      expect(createdUser?.hobbies).toEqual(user.hobbies);
    });
  });
});
