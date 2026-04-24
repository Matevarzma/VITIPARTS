const ADMIN_TOKEN_KEY = "vitiparts_admin_token";
const ADMIN_AUTH_EVENT = "vitiparts-admin-auth-changed";

const emitAdminAuthChange = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
};

export const getStoredAdminToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(ADMIN_TOKEN_KEY) || "";
};

export const hasStoredAdminToken = () => Boolean(getStoredAdminToken());

export const setStoredAdminToken = (token) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  emitAdminAuthChange();
};

export const clearStoredAdminToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  emitAdminAuthChange();
};

export const getAdminRequestConfig = () => {
  const token = getStoredAdminToken();

  if (!token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const subscribeToAdminAuthChanges = (callback) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => {
    callback();
  };

  window.addEventListener(ADMIN_AUTH_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(ADMIN_AUTH_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
};
