const express = require("express");

const {
  getAllBrands,
  getBrandById,
  getCarsByBrandId,
  createBrand,
  reorderBrands,
  deleteBrand,
} = require("../controllers/brandController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllBrands);
router.patch("/reorder", protectAdmin, reorderBrands);
router.get("/:id/cars", getCarsByBrandId);
router.get("/:id", getBrandById);
router.post("/", protectAdmin, createBrand);
router.delete("/:id", protectAdmin, deleteBrand);

module.exports = router;
