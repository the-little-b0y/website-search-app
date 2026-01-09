const express = require("express");
const cors = require("cors");

const searchRoutes = require("./routes/search.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/search", searchRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

module.exports = app;
