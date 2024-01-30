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
  const cart = await Cart.findOne({ email: req.user.email }); //find the user who added cart by the user's personal id

  try {
    if (quantity > product.quantity) {
      return res.json({ msg: "This product has sold out" });
    }

    if (!cart) {
      const myCart = await Cart.create({
        email: req.user.email,
        items: [
          {
            product: productId,
            quantity: parseInt(quantity),
          },
        ],
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
        console.log(similarProductInCart.quantity); //1
        similarProductInCart.quantity += quantity;
        console.log(similarProductInCart.quantity); //2
        if (similarProductInCart.quantity > product.quantity) {
          return res.json({ msg: "This product has sold out" });
        }
      } else {
        cart.items.push({
          product: productId,
          quantity,
        });
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
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("mainCart.items.product");
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
    const cart = await Cart.findOne({ email: req.user.email });

    let findDonut = cart.items.find((item) => item.product == req.params.id); //findDonut now holds the targeted product._id

    //now we are accessing the targeted product._id's quantity
    if (findDonut.quantity > 1) {
      cart.items.map((item) => {
        if (item.product === findDonut.product) {
          item.quantity -= 1;
        }
        return item;
      });
    } else {
      cart.items = cart.items.filter((item) => item.product != req.params.id);
    }

    await cart.save();
    return res.json({ msg: "This item has successfully been removed", cart });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in removing this item from cart" });
  }
});

router.delete("/main/:idx", auth, async (req, res) => {
  try {
    let idx = req.params.idx;
    const userCart = await Cart.findOne({ email: req.user.email });
    // const singleCartItem = await userCart.mainCart.find((item) => item == idx);

    // const updatedUserCart = [...userCart]
    // updatedUserCart.mainCart.splice(singleCartItem, 1);

    userCart.mainCart.splice(idx, 1);

    await userCart.save();
    return res.json({ msg: "Cart item deleted successfully" });
    // await updatedUserCart.mainCart.save();
    // find the cart
    // splice the mainCart base on the given index
    // save the cart
  } catch (e) {
    return res.status(400).json({
      error: e.message,
      msg: "Error in removing this item from MAIN CART",
    });
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

//PUSH ITEMS INTO MAIN CART
router.put("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ email: req.user.email });
    const toBePushed = {
      items: [...cart.items],
    };
    cart.mainCart.push(toBePushed);
    cart.items = [];
    cart.save();
    return res.json({ msg: "Cart added successfully" });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in adding to cart" });
  }
});

router.put("/main/:idx", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ email: req.user.email });

    console.log(cart);
    if (cart.mainCart.quantity > 1) {
      cart.mainCart.quantity -= 1;
    } else {
      cart.mainCart.quantity += 1;
    }

    cart.save();
    return res.json({ msg: "Quantity updated successfully" });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in adding to cart" });
  }
});

module.exports = router;
