const express = require("express");

const {
  getPartsByCarId,
  createPartForCar,
  deletePart,
} = require("../controllers/partController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/cars/:id/parts", getPartsByCarId);
router.post("/cars/:id/parts", protectAdmin, createPartForCar);
router.delete("/parts/:id", protectAdmin, deletePart);

module.exports = router;
