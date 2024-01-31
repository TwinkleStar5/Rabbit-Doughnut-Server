const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  email: { type: mongoose.Schema.Types.String, ref: "Email" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, require: true },
      _id: false,
    },
  ],
  mainCart: [
    {
      quantity: { type: Number, default: 1 },
      items: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: { type: Number, require: true },
          _id: false,
        },
      ],
    },
  ],
  deliveryPickUp_date: { type: Date, default: Date.now() },
}); 

module.exports = mongoose.model("Cart", CartSchema);

//EXPECTED OUTPUT:
// {
//   "_id": "658d98222902dc1b8324aba1", //_id: Unique identifier for the cart document.
//   "user": "658bf41a64daea4d0b3ba159", //ref:"User" => ID of the user who added this cart.
//   "items": [ //items have an array of products
//     {
//       "product": {
//         "_id": "658bb6a35bd6ccd62b8a6178",
//         "name": "Cookie donut",
//         "price": 13,
//         "description": "who doesn't love oreos",
//         "quantity": 300,
//         "isActive": false,
//         "image": "1703674191597-chocolate-chip-doughnut-cookies7.jpg",
//         "__v": 0
//       },
//       "quantity": 4, //The quantity of this specific product in the cart
//       "subtotal": 52 //The subtotal cost for the quantity of this specific product in the cart
//     },
// {
//   "product": {
//       "_id": "658ba8e41b1d16e63a802ec4",
//       "name": "Sakura donut",
//       "price": 18,
//       "description": "gives you diabetes in the spring",
//       "quantity": 500,
//       "isActive": false,
//       "image": "1703651556831-sakura.webp",
//       "__v": 0
//   },
//   "quantity": 78,
//   "subtotal": 1404
// },
//   ]
// }
