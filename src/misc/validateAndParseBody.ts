export function validateAndParseBody(body: string) {
  try {
    const parsed: Omit<IUser, 'id'> = JSON.parse(body);

    const isUserNameProvided = 'username' in parsed;
    const isUserNameTypeString = typeof parsed.username === 'string';
    const isAgeProvided = 'age' in parsed;
    const isAgeTypeNumber = typeof parsed.age === 'number';
    const isHobbiesProvided = 'hobbies' in parsed;
    const isHobbiesTypeArray = Array.isArray(parsed.hobbies);
    const isEveryHobbyTypeString = parsed.hobbies.every(
      (hobby: unknown) => typeof hobby === 'string'
    );

    const isBodyValid =
      isUserNameProvided &&
      isUserNameTypeString &&
      isAgeProvided &&
      isAgeTypeNumber &&
      isHobbiesProvided &&
      isHobbiesTypeArray &&
      isEveryHobbyTypeString;

    if (!isBodyValid) throw new Error('Invalid body');

    return parsed;
  } catch (e) {
    return { error: 'Invalid request body' };
  }
}
