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
public_users.get('/', function (req, res) { 
    return res.status(200).send(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // If provided ISBN parameter isn't an integer greater than 0, send invalidation message
    if (!Number.isInteger(Number(isbn)) || parseInt(isbn) <= 0) {
        return res.status(403).send("Invalid ISBN. Must be an integer greater than 0");
    }

    // Send details of desired book
    return res.status(200).send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const filtered_author = req.params.author;

    // Find and collect books from DB matching queried author
    const books_written_by_author = [];
    for (const [isbn, book] of Object.entries(books)) {
        if (book['author'] === filtered_author) {
            books_written_by_author.push(book);
        }
    }

    if (books_written_by_author.length > 0) {
        // If any matching books found
        return res.status(200).send(books_written_by_author);  
    } else {
        // If there aren't any matching books
        return res.status(200).send(`No books written by ${filtered_author} found!`);
    }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const filtered_title = req.params.title;

    // Find and collect books from DB matching queried title name
    const title_books = [];
    for (const [isbn, book] of Object.entries(books)) {
        if (book['title'] === filtered_title) {
            title_books.push(book);
        }
    }

    if (title_books.length > 0) {
        // If there are matching books
        return res.status(200).send(title_books);
    } else {
        // If there aren't any matching books
        return res.status(200).send(`No books with title '${filtered_title}' found!`);
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    // If provided ISBN parameter isn't an integer greater than 0, send invalidation message
    if (!Number.isInteger(Number(isbn)) || parseInt(isbn) <= 0) {
        return res.status(403).send("Invalid ISBN. Must be an integer greater than 0.");
    }

    // If no book with matching ISBN is found, send message that no such book is in DB
    const isbn_book = books[isbn];
    if (!isbn_book) {
        return res.status(200).send(`No book of ISBN ${isbn} found!`);
    }

    const book_reviews = isbn_book['reviews'];
    console.log(Object.keys(book_reviews).length);
    if (Object.keys(book_reviews).length > 0) {
        // If there are reviews tied in with book
        return res.status(200).send(book_reviews);
    } else {
        // If there aren't any reviews tied in with book
        return res.status(200).send(`No reviews for the book '${isbn_book['title']}'.`);
    }
});

module.exports.general = public_users;
