const express = require("express");
const router = express.Router(); //The router receives incoming HTTP requests, examines the URL and HTTP method, and decides which controller (or controller action) should handle the request. It essentially acts as a traffic director, directing requests to the appropriate controller.
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

//CREATE AN ORDER
router.post("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ email: req.user.email });

    // console.log(cart);
    if (!cart) return res.json({ msg: "You have no cart" });

    // let total = 0;

    const myOrder = await Order.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      email: req.user.email,
      pickUp: req.body.mode === "Pick Up",
      delivery: req.body.mode === "Delivery",
      emailNews: req.body.saveEmail,
      purchased_date: req.body.purchased_date,
      collectDate: req.body.pickUpDelivery,
      time: req.body.time,
      cart: cart.mainCart,
      state: req.body.state,
      company: req.body.company,
      address: req.body.address,
      city: req.body.city,
      postalCode: req.body.postalCode,
      grandTotal: req.body.total,
      status: false,
    });

    await myOrder.save();
    await Cart.findByIdAndDelete(cart._id);
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
    const order = await Order.findOne({ email: req.user.email });
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
    const orders = await Order.find().populate({
      path: "cart.items",
      populate: { path: "product" },
    });

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

router.patch("/:id", auth, isAdmin, async (req, res) => {
  // return console.log("hi orders controller");
  // return console.log(req.params.id);   //i got [object Object]. NAZE??!!
  try {
    // return console.log(req.params.id);
    // const orderId = req.params.id;
    const order = await Order.findById(req.params.id);
    // return console.log(order);
    if (!order) return res.json({ msg: "This order does not exist" });
    order.status = !order.status;

    await order.save();
    return res.json({ msg: "Order status has been updated" });
  } catch (e) {
    return res.status(400).json({
      error: e.message,
      msg: "Error in updating client's order status",
    });
  }
});
module.exports = router;
