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
    purchased_date: {
      type: Date,
      default: Date.now,
      get: function (val) {
        return moment(val).format("lll");
      },
    },
    // purchased_date: {
    //   type: Date,
    //   default: Date.now,
    //   getters: true, // Enable getters for this field
    //   get: (val) => {
    //     if (!val) return val;

    //     const date = new Date(val);
    //     const gbDateStyle = date.toLocaleDateString("en-GB", {
    //       day: "numeric",
    //       month: "short",
    //       year: "numeric",
    //     });

    //     const timeStyle = date.toLocaleTimeString("en-GB", {
    //       hour: "numeric",
    //       minute: "numeric",
    //       hour12: true,
    //     });

    //     return `${gbDateStyle}, ${timeStyle}`;
    //   },
    // },
    cart: [
      {
        quantity: { type: Number },
        items: [
          {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, //['2']['2']['2']
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
