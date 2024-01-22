const express = require("express"); //Import the Express framework to create a web server
const app = express();
const cors = require("cors"); //Import the CORS middleware for handling Cross-Origin Resource Sharing. cors ensure secure sharing of resources (like data or images) between different websites.
require("dotenv").config();
const { PORT } = process.env; //to show the port number when NODEMON SERVER
const connectDB = require("./connection");

connectDB();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.use("/users", require("./controllers/users")); //sets up routing for user-related requests in your Express.js application.
app.use("/products", require("./controllers/products")); //sets up routing for product-related requests in your Express.js application.
app.use("/cart", require("./controllers/carts")); //sets up routing for product-related requests in your Express.js application.
app.use("/orders", require("./controllers/orders")); //sets up routing for product-related requests in your Express.js application.

app.listen(PORT, console.log("App is swimming on PORT: " + PORT)); //when you run this server.js file, it will send to the port number

//NEW CODE
