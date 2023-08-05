const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const crypto = require('crypto');

let users = [];

const doesExist = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });
  return usersWithSameName.length > 0;
};

const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validUsers.length > 0;
};

const app = express();

app.use(express.json());

app.use(session({ secret: "fingerpint" }));

const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

const secretKey = generateSecretKey();
console.log('Generated Secret Key:', secretKey);
module.exports.secretKey = secretKey;

// Authentication middleware for /customer/auth routes
// Authentication middleware for /customer/auth routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the request has an 'Authorization' header with the token
    const authHeader = req.headers['authorization'];
  
    // Extract the token from the 'Authorization' header (Bearer token format)
    const token = authHeader && authHeader.split(' ')[1]; // Use "&&" to ensure authHeader exists before splitting
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - Missing token" });
    }
  
    try {
      // Verify the token with the secret key
      const secretKey = require('./index').secretKey; // Correct the path based on the actual directory structure
      const decodedToken = jwt.verify(token, secretKey);
  
      // If the token is valid, add the decoded user data to the request object for future use
      req.user = decodedToken;
  
      // Continue with the next middleware or route handler
      next();
    } catch (err) {
      // If the token verification fails, respond with an error
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
  });
  
  const cors = require('cors');
  app.use(cors());
  
app.use("/customer", customer_routes);

// Routes for / (General operations)
app.use("/", genl_routes);

const PORT = 5000;

app.listen(PORT, () => console.log("Server is running"));
