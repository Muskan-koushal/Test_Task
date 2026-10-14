import AsyncStorage from "@react-native-async-storage/async-storage";

export type AuthUser = {
  fullName: string;
  email: string;
};

const REGISTERED_USER_KEY = "@task/registered-user";
const SESSION_KEY = "@task/session";

const readUser = async (key: string): Promise<AuthUser | null> => {
  const value = await AsyncStorage.getItem(key);
  if (value === null) {
    return null;
  }

  const user: unknown = JSON.parse(value);
  if (
    typeof user !== "object" ||
    user === null ||
    !("fullName" in user) ||
    typeof user.fullName !== "string" ||
    !("email" in user) ||
    typeof user.email !== "string"
  ) {
    throw new Error("Saved account data is invalid.");
  }

  return { fullName: user.fullName, email: user.email };
};

export const saveRegisteredUser = (user: AuthUser) =>
  AsyncStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(user));

export const getRegisteredUser = () => readUser(REGISTERED_USER_KEY);

export const saveSession = (user: AuthUser) =>
  AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));

export const getSession = () => readUser(SESSION_KEY);

export const clearSession = () => AsyncStorage.removeItem(SESSION_KEY);
