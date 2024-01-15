const jwt = require("jsonwebtoken");
require("dotenv").config(); //user dotenv as a tool to get the secret datas out from the .env file and put on the public process.env where anyone can access it easily
const { SECRET_KEY } = process.env; //here is where we want to get the secret key via the process.env. thanks to dotenv, we can access the secret key, otherwise we couldn't

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.json({ msg: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY); //It checks whether the token is valid, has not been tampered with, and has not expired. If the verification is successful, the function returns a decoded representation of the token, and this decoded information is stored in the decoded variable.
    //token is the JWT that needs to be verified. SECRET_KEY is a secret key known only to the server. It is used to sign and verify the JWT, ensuring its authenticity.
    req.user = decoded.data; //extracts that user data from the decoded token (decoded.data) and assigns it to req.user. req.user=>used to store information related to the authenticated user.
    next(); //allows the request to move on to the next middleware or route handler in the application. Without calling next(), the request might get stuck, and subsequent parts of the application won't be executed.
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
};
