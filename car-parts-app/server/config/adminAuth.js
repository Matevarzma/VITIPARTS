const crypto = require("crypto");

const safeCompare = (leftValue, rightValue) => {
  const leftBuffer = Buffer.from(String(leftValue));
  const rightBuffer = Buffer.from(String(rightValue));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const getAdminConfig = () => ({
  username: process.env.ADMIN_USERNAME || "",
  password: process.env.ADMIN_PASSWORD || "",
  tokenSecret: process.env.ADMIN_TOKEN_SECRET || "",
  tokenExpiresHours: Number(process.env.ADMIN_TOKEN_EXPIRES_HOURS) || 12,
});

const isAdminConfigured = () => {
  const { username, password, tokenSecret } = getAdminConfig();
  return Boolean(username && password && tokenSecret);
};

const signPayload = (encodedPayload, tokenSecret) =>
  crypto.createHmac("sha256", tokenSecret).update(encodedPayload).digest("base64url");

const createAdminToken = () => {
  const { username, tokenSecret, tokenExpiresHours } = getAdminConfig();

  const payload = {
    username,
    expiresAt: Date.now() + tokenExpiresHours * 60 * 60 * 1000,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encodedPayload, tokenSecret);

  return `${encodedPayload}.${signature}`;
};

const verifyAdminToken = (token) => {
  const { username, tokenSecret } = getAdminConfig();
  const [encodedPayload, signature] = String(token).split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Invalid token format.");
  }

  const expectedSignature = signPayload(encodedPayload, tokenSecret);

  if (!safeCompare(signature, expectedSignature)) {
    throw new Error("Invalid token signature.");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8")
  );

  if (!payload?.expiresAt || payload.expiresAt < Date.now()) {
    throw new Error("Token expired.");
  }

  if (!safeCompare(payload.username, username)) {
    throw new Error("Token user mismatch.");
  }

  return payload;
};

module.exports = {
  createAdminToken,
  getAdminConfig,
  isAdminConfigured,
  safeCompare,
  verifyAdminToken,
};
