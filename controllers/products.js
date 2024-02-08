const express = require("express"); //import express framework to build app easier
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const singleFileUpload = require("../middleware/fileUpload");
const fs = require("fs"); //file system => allows you to read and write on the file system
const path = require("path"); //allows you to change directories . for working with file and directory paths

//ADD ITEMS
router.post("/", auth, isAdmin, singleFileUpload, async (req, res) => {
  // console.log(req.body);
  // return console.log(req.file);
  try {
    let product = new Product(req.body);
    if (req.file) product.image = req.file.filename;
    await product.save();
    return res.json({ msg: "Product added successfully" });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

//GET ALL ITEMS
router.get("/", async (req, res) => {
  try {
    let products = await Product.find();
    return res.json(products);
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in getting all items" });
  }
});

//GET ONE ITEM
router.get("/:id", async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.json({ msg: "This product doesn't exist" });
    return res.json(product);
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in getting this item" });
  }
});

//UPDATE ONE ITEM
router.put("/:id", auth, isAdmin, singleFileUpload, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.json({ msg: "This product does not exist" });

    //to delete old image
    if (product.image && req.file) {
      let filename = product.image;
      let filepath = path.join(__dirname, "../public/" + filename);
      fs.unlinkSync(filepath);
    }

    let updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: req.file ? req.file.filename : product.image,
      },
      { new: true }
    );

    return res.json({
      msg: "Product updated successfully!!",
      product: updated,
    });
  } catch (e) {
    return res.status(400).json({ msg: "Error in updating this item" });
  }
});

//DELETE ONE ITEM
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    // return console.log("here");
    if (!product) return res.json({ msg: "This product does not exist" });

    if (product.image) {
      let filename = product.image;
      let filepath = path.join(__dirname, "../public/" + filename);
      fs.unlinkSync(filepath);
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.json({ msg: "Product successfully deleted" });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Error in deleting this item" });
  }
});

//ISACTIVE
router.patch("/:id", auth, isAdmin, async (req, res) => {
  return console.log('hi');
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.json({ msg: "Product does not exist" });
    await Product.findOneAndUpdate(req.params.id, {
      ...product,
      status: !product.status,
    });

    return res.json({ msg: "Product's status successfully updated" });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Unable to update product's status" });
  }
});

module.exports = router;
