export const TOKEN_COOKIE_NAME = "token";

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
};

export const setCookie = (name: string, value: string, days = 7): void => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

export const deleteCookie = (name: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

export const setAuthToken = (token: string, user?: unknown): void => {
  setCookie(TOKEN_COOKIE_NAME, token, 7);
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return getCookie(TOKEN_COOKIE_NAME) || localStorage.getItem("token");
};

export const getStoredUser = (): any | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const clearAuthToken = (): void => {
  deleteCookie(TOKEN_COOKIE_NAME);
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
