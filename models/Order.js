const mongoose = require("mongoose"); //import the mongoose library, which is a popular JavaScript library for MongoDB.
const moment = require("moment");

const OrderSchema = new mongoose.Schema({
  firstName: { type: mongoose.Schema.Types.String, ref: "firstName" },
  lastName: { type: mongoose.Schema.Types.String, ref: "firstName" },
  phoneNumber: { type: String, ref: "phoneNumber" },
  email: { type: String, ref: "email" },
  pickUp: { type: Boolean },
  delivery: { type: Boolean },
  collectDate: { type: String },
  time: { type: String },
  emailNews: { type: Boolean },
  purchased_date: { type: Date, default: Date.now() },
  cart: [
    {
      quantity: { type: Number },
      items: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: { type: Number, required: true },
          _id: false,
        },
      ],
    },
  ],
  state: { type: String },
  company: { type: String },
  address: { type: String },
  city: { type: String },
  postalCode: { type: String },
  grandTotal: { type: Number },
  status: { type: Boolean },
});

module.exports = mongoose.model("Order", OrderSchema);
