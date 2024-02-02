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
  //When you define a route with a parameter, like :id, Express automatically extracts that value and makes it available in req.params.id.
  try {
    let product = await Product.findById(req.params.id);
    //req.params.id is used to extract the value of the id parameter from the URL.
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
      //check if this product already has image and has a request to upload a new image
      //then DELETE THE OLD IMAGE
      let filename = product.image;
      let filepath = path.join(__dirname, "../public/" + filename);
      //__dirname => It gives you the path of the currently running file.
      fs.unlinkSync(filepath); //Deletes the existing image file synchronously.
      // fs.unlinkSync is a Node.js file system method that deletes a file. It takes the full file path (filepath) as an argument. This line deletes the existing image file associated with the product.
    }

    //Updates a document in the MongoDB database based on its ID.
    //The Product.findByIdAndUpdate function is a method provided by the Mongoose library for MongoDB. It finds a document by its ID (req.params.id) and updates it with the specified data.
    let updated = await Product.findByIdAndUpdate(
      req.params.id, //Specifies the ID of the document to be updated. req.params.id is part of the Express.js framework and represents a parameter in the URL.
      {
        ...req.body, //Contains the updated data for the document.
        //why use spread operator? => If req.body contains multiple fields, using the spread operator allows you to include all existing fields and add or update specific fields without manually listing each one. This is particularly useful when dealing with dynamic data or large objects.
        image: req.file ? req.file.filename : product.image,
        //Updates the image field of the document.
        //This part checks if there is a file (req.file) in the request. If a file is present, it sets the image field to the filename of the uploaded file (req.file.filename). If no file is uploaded (req.file is falsy), it retains the existing image filename from the product object (product.image). This is a way to handle image updates in a conditional manner.
      },
      { new: true }
      //an option that ensures the findByIdAndUpdate method returns the updated document. If { new: true } were omitted, updated would contain the document before the update.
    );

    return res.json({
      msg: "Product updated successfully!!",
      product: updated,
    });
    // product: updated => to ensure the front-end gets updated also, not only the backend. The value, updated, represents the document that has been updated and is returned by the findByIdAndUpdate method.
  } catch (e) {
    return res.status(400).json({ msg: "Error in updating this item" });
  }
});

//DELETE ONE ITEM
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.json({ msg: "This product does not exist" });

    //if the targeted product already has image, delete the image entirely even from the server's public folder
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

module.exports = router;
