const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connection Success.`);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDatabase;
