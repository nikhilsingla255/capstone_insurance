const mongoose = require("mongoose");

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected");
  } catch (err) {
    console.log("Unable to connect to Database.");
    console.log("Error: ", err);
    process.exit(1);
  }
};

module.exports = connectToDb;