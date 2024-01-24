const express = require("express"); //Imports the Express framework, a tool for building web applications with Node.js.
const router = express.Router(); //Creates a router object using Express. Routers are used to handle different routes (URLs) in your app.
const User = require("../models/User");
const bcrypt = require("bcryptjs"); //store passwords in hashed version
const jwt = require("jsonwebtoken"); //generate token to user whenever they sign in
require("dotenv").config(); //config will read your .env file, parse the contents, assign it to process.env, and return an Object with a parsed key containing the loaded content or an error key if it failed.
const { SECRET_KEY } = process.env; //it is through process.env, the program can access those secret datas. .env => dotenv => process.env => to anywhere to want

router.post("/register", async (req, res) => {
  //req: request object =>  It's an object that contains information about the incoming request from the client. When a user submits a form on a website, for example, the data from that form is included in the req.body property.
  //res: response object => It's an object that you use to send a response back to the client. (eg: res.send() or res.json())
  try {
    const { fullname, username, email, password } = req.body;
    //the variables put in curly braces means we are using OBJECT DESTRUCTURING => to access the EXACT property names in the req.body (form in the front-end)
    const userFound = await User.findOne({ username }); // Find a user in the database with the specified username, and once you find it, store the result in the variable userFound.

    if (userFound)
      return res.json({ msg: "You have already registered", status: 400 });

    if (fullname.length < 3) {
      return res
        .status(400)
        .json({ msg: "Fullname should be at least 3 characters", status: 400 });
    }
    if (email.length < 8) {
      return res
        .status(400)
        .json({ msg: "Password should be at least 8 characters", status: 400 });
    }
    if (fullname.length < 3) {
      return res
        .status(400)
        .json({ msg: "Fullname should be at least 3 characters", status: 400 });
    }

    let user = new User(req.body); //like constructor function. basically filling in the form (User blueprint) with the answers from the user in front-end.
    let salt = bcrypt.genSaltSync(10); //generates a salt using the bcrypt library. A salt is a random string that is used to enhance the security of password hashing.
    let hash = bcrypt.hashSync(password, salt); //a hash of the user's password is generated using the bcrypt library. The bcrypt.hashSync function takes two arguments: the password to be hashed (password) and the salt generated in the previous step (salt).
    user.password = hash;
    user.save();

    return res.json({ msg: "Registered successfully" });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body; //get the username and password from the login form
    const userFound = await User.findOne({ username }); //find the user's details in database via the username

    if (!userFound)
      //if user can't be found in database
      return res.json({ msg: "You have not registered", status: 400 });

    const isMatch = bcrypt.compareSync(password, userFound.password); //compare the password in form vs password in database. => all based on the same username
    if (!isMatch)
      return res.json({ msg: "Credentials not matched", status: 400 });

    jwt.sign(
      { data: userFound },
      SECRET_KEY,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) {
          return json({
            error: e.message,
            msg: "Failed to login",
            status: 400,
          });
        }
        //if there's no error, It sends a JSON response with the generated token, information about the user (userFound), and a success message.
        return res.json({ token, user: userFound, msg: "Login successfully" });
      }
    );
  } catch (e) {
    return res.status(400).json({ msg: "Invalid Credentials" });
  }
});

router.post("/generate", (req, res) => {
  try {
    jwt.sign(
      { data: req.body },
      SECRET_KEY,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) {
          return json({
            error: e.message,
            msg: "Failed to generate token",
            status: 400,
          });
        }
        //if there's no error, It sends a JSON response with the generated token, information about the user (userFound), and a success message.
        return res.json({ token });
      }
    );
  } catch (e) {
    return res.status(400).json({ msg: "Cannot generate token" });
  }
});

module.exports = router;
