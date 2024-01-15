const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

//ADD ITEMS INTO CART 
router.post("/", auth, async (req, res) => {
  if (req.user.isAdmin) return res.json({ msg: "Customers only can shop" });
  const { productId, quantity } = req.body; //get the exact property names (productId and quantity) of the cart from the request submitted by user
  const product = await Product.findById(productId); //find the product added by the user by the product's id from the model Product
  const cart = await Cart.findOne({ user: req.user._id }); //find the user who added cart by the user's personal id

  try {
    //if the added quantity from the req.body is more than the available quantity in the database, ALL OF THE SAME PRODUCT
    if (quantity > product.quantity)
      return res.json({ msg: "This product has sold out" });

    //if cart is empty, we're gonna create a new cart for the user to add his first item
    if (!cart) {
      const myCart = await Cart.create({
        //Cart.create => to create and save a new document (record) in the MongoDB database based on the Mongoose model Cart. It adheres to the blueprint or schema defined in the Cart model
        user: req.user._id, //Sets the user field to the ID of the current user.
        items: [
          //An array containing details of the added product (like productId, quantity, and subtotal).
          {
            product: productId,
            quantity,
            subtotal: parseFloat(product.price) * parseInt(quantity),
          },
        ],
        total: parseFloat(product.price) * parseInt(quantity), //The total cost of all items in the cart.
      });
      await myCart.save(); //Since Mongoose operations are asynchronous, await is used to wait for the Cart.create operation to complete before proceeding with the next steps.
      return res.json({
        msg: "First product added to cart successfully", //to notify the client
        cart: myCart, //allows the client to have immediate access to information about the cart, including its unique identifier (_id), user, items, total, and any other fields defined in the cart schema.
      });
    }

    //if there's already one product in the cart, we want to check if we're adding another similar product or not
    if (cart) {
      const similarProductInCart = cart.items.find(
        //find that one item among the many items in the cart where the item in the cart is same as the new item added. then we call that as the "selected-similar-product in the curr cart"
        (item) => item.product._id == productId
      );

      //if the "selected-similar-product" exists, we increase the quantity
      if (similarProductInCart) {
        //add the quantity from the client to the quantity of the "selected-similar-product in the curr cart"
        similarProductInCart.quantity += quantity;
        //if the quantity of the "selected-similar-product in the curr cart" is more than the "selected-similar-product" from the database,..
        if (similarProductInCart.quantity > product.quantity) {
          return res.json({ msg: "This product has sold out" });
        }
        //UPDATE THE SUBTOTAL OF THE SIMILAR PRODUCT WE ARE NOW FOCUSING.
        similarProductInCart.subtotal =
          product.price * similarProductInCart.quantity;

        //UPDATE THE CART TOTAL => by calculating the price of the product added and add to the cart total
        cart.total += quantity * product.price;
      } else {
        //if we're not adding another similar product, we're adding a different product. WE DON'T INCREASE QUANTITY, but we create a new object(sub-item) and push into the main items array
        cart.items.push({
          product: productId,
          quantity,
          subtotal: product.price * quantity,
        });
        cart.total += quantity * product.price;
      }
      await cart.save();
      return res.json({ msg: "Product added to cart successfully", cart });
    }
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in adding to cart" });
  }
});

// Why we need to check if there's no cart? why we didn't do the same as for adding products as admin?
// Adding Products as Admin:
// Admins add products to the database, and each product is independent.
// Admins can add multiple products, and each product is saved as a separate entity in the database.
// The process is straightforward: create a new product, set its details, and save it to the database.
//Adding Items to User's Cart:
//Users add items to their shopping cart, and each cart is specific to a user.
//Users can have only one active cart at a time, and the cart contains multiple items.
//The process is more complex: check if the user has an existing cart, update the cart if the product is already in it, or create a new cart if there isn't one.

//In essence, the cart-related logic is more complex because it needs to manage the user's ongoing shopping session, whereas adding a product as an admin is a standalone operation.

//DISPLAY ALL ITEMS IN CART
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.isAdmin) return res.json({ msg: "Customers only can shop" });
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart) return res.json({ msg: "Cart is empty, please add some items" });
    return res.json(cart);
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in viewing cart" });
  }
});

//DELETE SINGLE ITEM IN CART
router.delete("/:id", auth, async (req, res) => {
  try {
    //find the user's cart using the user's id
    const cart = await Cart.findOne({ user: req.user._id });

    //create an array of items where each product is not same as the requested product.
    //this means that the item in the cart in which it is same as the reqested product will be filtered out/ left out.
    cart.items = cart.items.filter((item) => item.product._id != req.params.id);

    //recalculate the total by summing up the subtotals of each item
    cart.total = cart.items.reduce((total, item) => total + item.subtotal, 0);
    await cart.save();
    return res.json({ msg: "This item has successfully been removed", cart });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in removing this item from cart" });
  }
});

//DELETE WHOLE CART
router.delete("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ msg: "Cart doesn't exist" });
    await Cart.findOneAndDelete({ user: req.user._id });
    return res.json({ msg: "Entire cart has been removed" });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in deleting the entire cart" });
  }
});

module.exports = router;
