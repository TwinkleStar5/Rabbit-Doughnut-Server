const express = require("express");
const router = express.Router(); //The router receives incoming HTTP requests, examines the URL and HTTP method, and decides which controller (or controller action) should handle the request. It essentially acts as a traffic director, directing requests to the appropriate controller.
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

//CREATE ORDER => find a cashier and empty your cart to make your payment
router.post("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ msg: "You have no cart" });

    //find a cashier => tell the cashier your id, all items you have, and the total price of your items
    const myOrder = await Order.create({
      user: req.user._id,
      items: cart.items,
      total: cart.total,
    });

    await myOrder.save(); //the cashier is informed by you and agrees to be your service
    await Cart.findByIdAndDelete(cart._id); //you empty your cart slowly to let the cashier continue the payment process
    return res.json({
      msg: "Cart has been emptied and order has been created",
      myOrder,
    });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in creating an order" });
  }
});

//READ ALL ORDERS => as customer
router.get("/", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ user: req.user._id });
    if (!order) return res.json({ msg: "You have not created any orders" });
    return res.json(order);
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in getting your order" });
  }
});

//READ ALL ORDERS => as admin
router.get("/all", auth, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    if (!orders)
      return res.json({ msg: "No customers have ordered anything yet" });

    return res.json(orders);
  } catch (e) {
    return res.status(400).json({
      error: e.message,
      msg: "Error in viewing all orders from your customers",
    });
  }
});

//UPDATE ORDERS

//DELETE ORDERS
module.exports = router;
