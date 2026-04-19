const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    // Throw error if neither username or password are given
    if (!username || !password) {
      return res.status(403).json({message: 'Error registering new user!'});
    }
  
    // Add new username-password pair to users array
    if (isValid(username)) {
      users.push({"username": username, "password": password});
      console.log(users);
      return res.status(200).json({message: 'New user successfully registered!'});
    }
  
    return res.status(403).json({message: 'Username already exists!'});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => { 
  try {
    const book_list = await (async function() {
      return JSON.stringify(books);
    })();
    res.send(book_list);
  } catch (error) {
    res.send(error);
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const isbn_book = await (async function() {
      if (books[isbn]) {
        return JSON.stringify(books[isbn]);
      } else {
        return `Book with ISBN ${req.params.isbn} not found!`;
      }
    })();
    res.send(isbn_book);
  } catch (error) {
    return res.status(403).json(error);
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const filtered_author = req.params.author;
  try {
    const author_books = await (async function() {
      const matching_books = [];
      for (const [isbn, book] of Object.entries(books)) {
        if (book['author'] === filtered_author) {
          matching_books.push(book);
        }
      }
      if (matching_books.length > 0) {
        JSON.stringify(matching_books);
      } else {
        res.send(`No books written by ${filtered_author} found!`);
      }
    })();

    res.send(author_books);
  } catch (error) {
    return res.status(403).json(error);
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const filtered_title = req.params.title;
    try {
      const matching_titles = await (async function() {
        const title_books = [];
        for (const [isbn, book] of Object.entries(books)) {
          if (book['title'] === filtered_title) {
            title_books.push(book);
          }
        }

        if (title_books.length > 0) {
          return JSON.stringify(title_books);
        } else {
          return `No books with title '${filtered_title}' found!`;
        }
      })();

      res.send(matching_titles);
    } catch (error) {
      return res.status(403).json(error);
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn_book = books[req.params.isbn];
  if (!isbn_book) {
    return res.status(403).json({message: `No book of ISBN ${req.params.isbn} found`});
  }
  const book_reviews = isbn_book['reviews'];
  return res.send(JSON.stringify(book_reviews));
});

module.exports.general = public_users;
