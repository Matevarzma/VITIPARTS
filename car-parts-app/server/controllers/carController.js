const mongoose = require("mongoose");

const Brand = require("../models/Brand");
const Car = require("../models/Car");
const Part = require("../models/Part");

const getAllCars = async (req, res) => {
  try {
    // Show cars in a predictable order for the frontend grid.
    const cars = await Car.find().sort({ brand: 1, model: 1 });
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars." });
  }
};

const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid car ID." });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car." });
  }
};

const createCar = async (req, res) => {
  try {
    const { brandId, model, year, image, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({ message: "Please choose a valid brand." });
    }

    const brand = await Brand.findById(brandId);

    if (!brand) {
      return res.status(404).json({ message: "Selected brand was not found." });
    }

    const newCar = await Car.create({
      brandId: brand._id,
      brand: brand.name,
      model,
      year,
      image,
      description,
    });

    res.status(201).json(newCar);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to create car." });
  }
};

const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid car ID." });
    }

    const deletedCar = await Car.findByIdAndDelete(id);

    if (!deletedCar) {
      return res.status(404).json({ message: "Car not found." });
    }

    // Remove parts that belong to the deleted car.
    await Part.deleteMany({ carId: id });

    res.status(200).json({ message: "Car deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete car." });
  }
};

module.exports = {
  getAllCars,
  getCarById,
  createCar,
  deleteCar,
};
