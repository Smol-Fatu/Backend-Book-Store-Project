const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "user1", password: "password1" },
  { username: "user2", password: "password2" },
  // Add more user data as needed
];


const isValid = (username) => {
  // Write code to check if the username is valid
}

const authenticatedUser = (username, password) => {
  // Find the user with the matching username in the 'users' array
  const user = users.find((user) => user.username === username);

  // If the user is not found, return false
  if (!user) {
    return false;
  }

  // Check if the provided password matches the user's password
  return user.password === password;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  // Retrieve username and password from the request body
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Check if the username and password match the records
  const isUserValid = authenticatedUser(username, password);

  if (!isUserValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    // If the user is valid, sign a JWT token with the username as payload
    const secretKey = require('../index').secretKey; // Correct the path based on the actual directory structure
    const token = jwt.sign({ username }, secretKey);

    return res.status(200).json({ message: "User successfully logged in", token });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Write your code here
  const { isbn } = req.params;
  const review = req.query.review;

  // Find the book in the 'books' object based on ISBN
  const book = books[isbn];

  // If the book is not found, respond with an error
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Retrieve the username from the request object (added during authentication)
  const username = req.user.username;

  // Check if the user has already posted a review for this book
  if (book.reviews[username]) {
    // If a review already exists, modify it
    book.reviews[username] = review;
  } else {
    // If no review exists, add a new review
    book.reviews[username] = review;
  }

  // Return success message
  return res.status(200).json({ message: "Review added/modified successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Write your code here
  const { isbn } = req.params;

  // Find the book in the 'books' object based on ISBN
  const book = books[isbn];

  // If the book is not found, respond with an error
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Retrieve the username from the request object (added during authentication)
  const username = req.user.username;

  // Check if the user has posted a review for this book
  if (book.reviews[username]) {
    // If a review exists, delete it
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    // If no review exists for the user, respond with an error
    return res.status(404).json({ error: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
