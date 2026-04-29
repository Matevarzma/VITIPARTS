const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const brandRoutes = require("./routes/brandRoutes");
const carRoutes = require("./routes/carRoutes");
const partRoutes = require("./routes/partRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB before handling application data.
connectDB();

// Middleware for frontend requests and JSON request bodies.
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Car Parts API is running.",
  });
});

app.get("/ping", (req, res) => {
  res.status(200).send("ok");
});

app.use("/api/auth", authRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/cars", carRoutes);
app.use("/api", partRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
