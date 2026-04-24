const express = require("express");

const {
  getAdminSession,
  loginAdmin,
} = require("../controllers/authController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/me", protectAdmin, getAdminSession);

module.exports = router;
