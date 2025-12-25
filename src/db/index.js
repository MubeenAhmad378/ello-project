const mongoose = require("mongoose");
const { DB_NAME } = require("../constants.js");

const connectDB = async () => {
  try {
    const ConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log(`\nMongoDB connected!! DB Host: ${ConnectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
