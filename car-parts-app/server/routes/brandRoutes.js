const express = require("express");

const {
  getAllBrands,
  getBrandById,
  getCarsByBrandId,
  createBrand,
} = require("../controllers/brandController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllBrands);
router.get("/:id/cars", getCarsByBrandId);
router.get("/:id", getBrandById);
router.post("/", protectAdmin, createBrand);

module.exports = router;
