const mongoose = require("mongoose");

const Car = require("../models/Car");
const Part = require("../models/Part");

const getPartsByCarId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid car ID." });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    const parts = await Part.find({ carId: id }).sort({ createdAt: -1 });

    res.status(200).json(parts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch parts." });
  }
};

const createPartForCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, price, category, condition, image, description } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid car ID." });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    const newPart = await Part.create({
      carId: id,
      name,
      code,
      price,
      category,
      condition,
      image,
      description,
    });

    res.status(201).json(newPart);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to create part." });
  }
};

const deletePart = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid part ID." });
    }

    const deletedPart = await Part.findByIdAndDelete(id);

    if (!deletedPart) {
      return res.status(404).json({ message: "Part not found." });
    }

    res.status(200).json({ message: "Part deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete part." });
  }
};

module.exports = {
  getPartsByCarId,
  createPartForCar,
  deletePart,
};
