const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  //new mongoose.Schema, serves as a blueprint or structure for how data should be stored in the MongoDB database.
  fullname: { type: String, require: true },
  username: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema); //tell mongoDB how a user looks like. Save, retrieve, or modify user data based on this plan (UserSchema).
