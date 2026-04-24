const {
  createAdminToken,
  getAdminConfig,
  isAdminConfigured,
  safeCompare,
} = require("../config/adminAuth");

const loginAdmin = async (req, res) => {
  try {
    const { username = "", password = "" } = req.body;

    if (!isAdminConfigured()) {
      return res.status(500).json({
        message: "Admin credentials are not configured on the server.",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const adminConfig = getAdminConfig();
    const isValidUsername = safeCompare(username, adminConfig.username);
    const isValidPassword = safeCompare(password, adminConfig.password);

    if (!isValidUsername || !isValidPassword) {
      return res.status(401).json({
        message: "Invalid admin credentials.",
      });
    }

    const token = createAdminToken();

    res.status(200).json({
      token,
      username: adminConfig.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to sign in." });
  }
};

const getAdminSession = async (req, res) => {
  res.status(200).json({
    username: req.admin.username,
  });
};

module.exports = {
  getAdminSession,
  loginAdmin,
};
