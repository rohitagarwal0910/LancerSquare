const mongoose = require("mongoose");
const config = require("config");

const connectDB = async () => {
    try {
        // await mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
        await mongoose.connect("mongodb+srv://rohit123:rohit123@devconnector-kyzjh.mongodb.net/LancerSquare?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
        console.log("MongoDB Connected")
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = connectDB;