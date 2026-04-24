const express = require("express");

const {
  getAllCars,
  getCarById,
  createCar,
  deleteCar,
} = require("../controllers/carController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllCars);
router.get("/:id", getCarById);
router.post("/", protectAdmin, createCar);
router.delete("/:id", protectAdmin, deleteCar);

module.exports = router;
