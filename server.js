const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
require('dotenv').config()

const app = express();

connectDB();

app.use(express.json({ extended: false }));

app.use("/api/projects", require("./routes/api/projects"));

app.use(
    express.static("frontend/build/")
);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend/build/index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
