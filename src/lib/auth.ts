import Cookies from 'js-cookie';

export type User = {
  name?: string;
  email: string;
};

// Cookie expiration in days
const COOKIE_EXPIRES = 7;

export const login = (user: User) => {
  Cookies.set("isAuthenticated", "true", { expires: COOKIE_EXPIRES });
  Cookies.set("user", JSON.stringify(user), { expires: COOKIE_EXPIRES });
};

export const logout = () => {
  Cookies.remove("isAuthenticated");
  Cookies.remove("user");
};

export const getUser = (): User | null => {
  try {
    const userData = Cookies.get("user");
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error("Failed to parse user data from cookie", e);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return Cookies.get("isAuthenticated") === "true";
};
