interface IQuery {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  userID: string | undefined;
  body: Omit<IUser, 'id'> | null;
}

type ErrorMessages =
  | "Can't handle request"
  | 'User not found'
  | 'Invalid UserID';

type IDatabaseResponse = IUser | IUser[] | { error: ErrorMessages };
