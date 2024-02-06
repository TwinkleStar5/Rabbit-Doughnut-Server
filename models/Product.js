const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, require: true },
  price: { type: Number, require: true },
  description: { type: String, require: true },
  allergens: { type: String, require: true },
  vegan: { type: Boolean, default: false },
  glutenFree: { type: Boolean, default: false },
  isActive: { type: Boolean, require: true },
  ingredients: { type: String, require: true },
  quantity: { type: Number, require: true },
  image: { type: String, require: true },
});

module.exports = mongoose.model("Product", ProductSchema);

//how and where the product generate it's own id from?
//MongoDB automatically generates a unique _id for each document by default, even if you don't explicitly define it in the schema. The _id field is a unique identifier for a document in a collection.
// The _id field is a special field in MongoDB documents that serves as a primary key.

//When you create a new document and save it to the MongoDB collection, if you don't explicitly provide a value for a field of type mongoose.Types.ObjectId, MongoDB will automatically generate a unique ObjectId for that field.
