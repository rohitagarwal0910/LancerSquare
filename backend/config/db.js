const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || db, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log("MongoDB Connected")
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = connectDB;