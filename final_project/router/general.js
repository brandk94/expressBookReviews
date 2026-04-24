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
      return res.status(200).json({message: 'New user successfully registered!'});
    }
  
    return res.status(403).json({message: 'Username already exists!'});
});

// Get the whole book list available in the shop (redone for task 10)
public_users.get('/', async (req, res) => { 
    try {
        const book_list = await axios.get('http://localhost:5000/');
        res.status(200).json(book_list);
    } catch (error) {
        res.status(403).json({error: error.message});
    }
});

// Get book details based on ISBN (redone for task 11)
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const isbn_books = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        res.status(200).json(isbn_books);
    } catch (error) {
        res.status(403).json({error: error.message});
    }
 });

// Get book details based on author (redone for task 12)
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const author_books = await axios.get(`http://localhost:5000/author/${author}`)
        res.status(200).json(author_books);
    } catch (error) {
        res.status(403).json({error: error.message});
    }
});

// Get books details based on title (redone for task 13)
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const title_books = await axios.get(`http://localhost:5000/title/${title}`)
        res.status(200).json(title_books);
    } catch (error) {
        res.status(403).json({error: error.message});
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // If provided ISBN parameter isn't an integer greater than 0, send invalidation message
    if (!Number.isInteger(Number(isbn)) || parseInt(isbn) <= 0) {
        return res.status(403).json({message: "Invalid ISBN. Must be an integer greater than 0."});
    }

    // If no book with matching ISBN is found, send message that no such book is in DB
    const isbn_book = books[isbn];
    if (!isbn_book) {
        return res.status(200).json({message: `No book of ISBN ${isbn} found!`});
    }

    const book_reviews = isbn_book['reviews'];
    console.log(Object.keys(book_reviews).length);
    if (Object.keys(book_reviews).length > 0) {
        // If there are reviews tied in with book
        return res.status(200).send(book_reviews);
    } else {
        // If there aren't any reviews tied in with book
        return res.status(200).json({});
    }
});

module.exports.general = public_users;
