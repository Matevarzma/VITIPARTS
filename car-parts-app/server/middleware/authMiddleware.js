const {
  isAdminConfigured,
  verifyAdminToken,
} = require("../config/adminAuth");

const protectAdmin = (req, res, next) => {
  if (!isAdminConfigured()) {
    return res.status(500).json({
      message: "Admin access is not configured on the server.",
    });
  }

  const authorizationHeader = req.headers.authorization || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Admin authorization is required.",
    });
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    req.admin = verifyAdminToken(token);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your admin session is invalid or expired.",
    });
  }
};

module.exports = {
  protectAdmin,
};
