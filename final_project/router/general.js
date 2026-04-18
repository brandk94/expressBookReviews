const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(403).json({message: 'Error registering new user!'});
    }
  
    if (isValid(username)) {
      users.push({"username": username, "password": password});
      console.log(users);
      return res.status(200).json({message: 'New user successfully registered!'});
    }
  
    return res.status(403).json({message: 'Username already exists!'});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn_book = books[req.params.isbn];
  if (isbn_book) {
    return res.send(JSON.stringify(isbn_book));
  } 

  return res.status(403).json({message: `Book with ISBN ${req.params.isbn} not found!`});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const filtered_author = req.params.author;
  const author_books = [];
  for (const [isbn, book] of Object.entries(books)) {
    if (book['author'] === filtered_author) {
      author_books.push(book);
    }
  }
  if (author_books.length > 0) {
    return res.send(JSON.stringify(author_books));
  }

  return res.status(403).json({message: `No books written by ${filtered_author} found!`});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const filtered_title = req.params.title;
    const title_books = [];
    for (const [isbn, book] of Object.entries(books)) {
      if (book['title'] === filtered_title) {
        title_books.push(book);
      }
    }
    if (title_books.length > 0) {
      return res.send(JSON.stringify(title_books));
    }
  
    return res.status(403).json({message: `No books of title '${filtered_title}' found!`});
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
