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
      await myCart.save();
      return res.json({
        msg: "First product added to cart successfully",
        cart: myCart,
      });
    }

    if (cart) {
      const similarProductInCart = cart.items.find(
        (item) => item.product._id == productId
      );

      if (similarProductInCart) {
        console.log(similarProductInCart.quantity);
        similarProductInCart.quantity += quantity;
        console.log(similarProductInCart.quantity);
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
    
    userCart.mainCart.splice(idx, 1);

    await userCart.save();
    return res.json({ msg: "Cart item deleted successfully" });
  } catch (e) {
    return res.status(400).json({
      error: e.message,
      msg: "Error in removing this item from MAIN CART",
    });
  }
});

//DELETE CART.ITEMS
router.delete("/", auth, async (req, res) => {
  try {
   const cart = await Cart.findOneAndUpdate(
     { email: req.user.email },
     { $unset: { items: "" } },
     { new: true }
   );

   if (!cart) return res.json({ msg: "Cart doesn't exist" });
    return res.json({ msg: "Cart.items has been removed" });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in deleting the entire cart" });
  }
});

// router.delete("/", auth, async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user._id });
//     if (!cart) return res.json({ msg: "Cart doesn't exist" });
//     await Cart.findOneAndDelete({ user: req.user._id });
//     return res.json({ msg: "Entire cart has been removed" });
//   } catch (e) {
//     return res
//       .status(400)
//       .json({ error: e.message, msg: "Error in deleting the entire cart" });
//   }
// });

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

router.put("/main/:idx/:act", auth, async (req, res) => {
  try {
    let { idx, act } = req.params;
    const cart = await Cart.findOne({ email: req.user.email });

    if (act === "inc") {
      cart.mainCart[idx].quantity += 1;
    } else {
      if (cart.mainCart[idx].quantity >= 2) cart.mainCart[idx].quantity -= 1;
    }

    await cart.save();
    return res.json({ msg: "Quantity updated successfully" });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in adding to cart" });
  }
});

module.exports = router;
