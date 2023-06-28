interface IUser {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

interface IDatabase {
  [id: string]: IUser;
}
