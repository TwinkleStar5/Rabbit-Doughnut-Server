const mongoose = require("mongoose"); //import the mongoose library, which is a popular JavaScript library for MongoDB.

const OrderSchema = new mongoose.Schema({
  firstName: { type: mongoose.Schema.Types.String, ref: "firstName" },
  lastName: { type: mongoose.Schema.Types.String, ref: "firstName" },
  phoneNumber: { type: Number, ref: "phoneNumber" },
  email: { type: mongoose.Schema.Types.String, ref: "email" },
  pickUp: { type: Boolean },
  delivery: { type: Boolean },
  emailNews: { type: Boolean},
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
  state: { type: mongoose.Schema.Types.String },
  company: { type: mongoose.Schema.Types.String },
  address: { type: mongoose.Schema.Types.String },
  city: { type: mongoose.Schema.Types.String },
  postalCode: { type: Number },
  grandTotal: { type: Number },
});

module.exports = mongoose.model("Order", OrderSchema);
