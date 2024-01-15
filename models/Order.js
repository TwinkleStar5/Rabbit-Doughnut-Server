const mongoose = require("mongoose"); //import the mongoose library, which is a popular JavaScript library for MongoDB.

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  purchased_date: { type: Date, default: Date.now() },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      //required: true => This is a property that you can set within the schema definition for a specific field. It indicates that the subtotal field is required and must have a value when creating or updating a document. If a document is saved without providing a value for subtotal, Mongoose will trigger a validation error.
      subtotal: { type: Number, required: true },
      _id: false,
    },
  ],
  total: { type: Number },
});

module.exports = mongoose.model("Order", OrderSchema);
