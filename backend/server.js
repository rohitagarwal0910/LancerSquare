const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(express.json({extended: false}));

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

app.use("/api/projects", require("./routes/api/projects"));

// Serve static assets in production
if(process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("../frontend/build"))

  app.get("*", (req, res) => {
    res.sendFile("../frontend/build/index.html")
  })
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
