const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  // Retrieve username and password from the request body
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Check if the username already exists
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  // Add the new user to the 'users' array
  users.push({ username, password });

  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Function to fetch the list of books available in the shop using Promise callbacks
function getBooksUsingPromise() {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:5000/')
      .then((response) => {
        const bookList = response.data;
        resolve(bookList);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Route to send the list of books
public_users.get('/', function (req, res) {
  getBooksUsingPromise()
    .then((bookList) => {
      // Respond with the list of books received from the Promise
      return res.status(200).json(bookList);
    })
    .catch((error) => {
      console.error("Error fetching the list of books:", error);
      // Respond with an error message if there was an issue fetching the books
      return res.status(500).json({ error: "Error fetching the list of books" });
    });
});

// Function to fetch book details based on ISBN using Promise callbacks
function getBookDetailsUsingPromise(isbn) {
  return new Promise((resolve, reject) => {
    // Make an Axios GET request to fetch book details using the ISBN
    axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then((response) => {
        // If the book is found, resolve the Promise with the book details
        resolve(response.data);
      })
      .catch((error) => {
        // If there's an error or the book is not found, reject the Promise with an error message
        reject("Book not found");
      });
  });
}

// Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:bookId', function (req, res) {
  // Retrieve the book identifier (ISBN) from the request parameters
  const bookId = req.params.bookId;

  // Call the function to fetch the book details using the ISBN
  getBookDetailsUsingPromise(bookId)
    .then((bookDetails) => {
      // If the Promise is resolved, return the book details as a JSON response
      return res.status(200).json(bookDetails);
    })
    .catch((error) => {
      // If the Promise is rejected, respond with an error message
      return res.status(404).json({ error });
    });
});
  
// Function to fetch book details based on the author using Promise callbacks
function getBooksByAuthorUsingPromise(author) {
  return new Promise((resolve, reject) => {
    // Filter books based on the given author
    const booksByAuthor = [];
    for (const bookId in books) {
      if (books.hasOwnProperty(bookId)) {
        const book = books[bookId];
        if (book.author === author) {
          booksByAuthor.push(book);
        }
      }
    }

    // If books are found, resolve the Promise with the array of books
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      // If no books are found, reject the Promise with an error message
      reject("No books found for the given author");
    }
  });
}

// Get book details based on author using Promise callbacks
public_users.get('/author/:author', function (req, res) {
  // Retrieve the author from the request parameters
  const author = req.params.author;

  // Call the function to fetch the books based on the author
  getBooksByAuthorUsingPromise(author)
    .then((booksByAuthor) => {
      // If the Promise is resolved, return the array of books as a JSON response
      return res.status(200).json(booksByAuthor);
    })
    .catch((error) => {
      // If the Promise is rejected, respond with an error message
      return res.status(404).json({ error });
    });
});
function getBooksByTitleUsingPromise(title) {
  return new Promise((resolve, reject) => {
    // Filter books based on the given title
    const booksByTitle = [];
    for (const bookId in books) {
      if (books.hasOwnProperty(bookId)) {
        const book = books[bookId];
        if (book.title === title) {
          booksByTitle.push(book);
        }
      }
    }

    // If books are found, resolve the Promise with the array of books
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      // If no books are found, reject the Promise with an error message
      reject("No books found for the given title");
    }
  });
}

// Get book details based on title using Promise callbacks
public_users.get('/:title', function (req, res) {
  // Retrieve the title from the request parameters
  const title = req.params.title;

  // Call the function to fetch the books based on the title
  getBooksByTitleUsingPromise(title)
    .then((booksByTitle) => {
      // If the Promise is resolved, return the array of books as a JSON response
      return res.status(200).json(booksByTitle);
    })
    .catch((error) => {
      // If the Promise is rejected, respond with an error message
      return res.status(404).json({ error });
    });
});



// Get book review
public_users.get('/review/:bookId', function (req, res) {
  // Retrieve the book identifier (key) from the request parameters
  const bookId = req.params.bookId;

  // Find the book with the matching bookId in the 'books' object
  if (books.hasOwnProperty(bookId)) {
    const book = books[bookId];

    // Return the reviews for the book as a JSON response
    return res.status(200).json(book.reviews);
  } else {
    // If the book is not found, respond with an error message
    return res.status(404).json({ error: "Book not found" });
  }
});


module.exports.general = public_users;
