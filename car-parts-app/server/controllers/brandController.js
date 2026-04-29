const mongoose = require("mongoose");

const Brand = require("../models/Brand");
const Car = require("../models/Car");
const Part = require("../models/Part");

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch brands." });
  }
};

const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid brand ID." });
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found." });
    }

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch brand." });
  }
};

const getCarsByBrandId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid brand ID." });
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found." });
    }

    const cars = await Car.find({ brandId: id }).sort({ model: 1, year: 1 });

    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars for this brand." });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    const trimmedName = name?.trim();

    const existingBrand = await Brand.findOne({
      name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: "i" },
    });

    if (existingBrand) {
      return res.status(400).json({ message: "This brand already exists." });
    }

    const newBrand = await Brand.create({
      name: trimmedName,
      image,
      description,
    });

    // If older cars were saved before Brand support was added, link them when
    // the admin creates the matching brand name.
    await Car.updateMany(
      {
        brand: { $regex: `^${escapeRegex(trimmedName)}$`, $options: "i" },
        $or: [{ brandId: { $exists: false } }, { brandId: null }],
      },
      {
        brandId: newBrand._id,
        brand: newBrand.name,
      }
    );

    res.status(201).json(newBrand);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to create brand." });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid brand ID." });
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found." });
    }

    const brandCars = await Car.find({ brandId: id }).select("_id");
    const carIds = brandCars.map((car) => car._id);

    if (carIds.length > 0) {
      await Part.deleteMany({ carId: { $in: carIds } });
      await Car.deleteMany({ brandId: id });
    }

    await Brand.findByIdAndDelete(id);

    res.status(200).json({ message: "Brand deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete brand." });
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  getCarsByBrandId,
  createBrand,
  deleteBrand,
};
