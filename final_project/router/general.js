const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

async function getBooks() {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject({message: "No book list found."});
        }
    });
}

async function getBooksByISBN(isbn) {
    return new Promise((resolve, reject) => {
        const searched_book = books[isbn];

        // If provided ISBN parameter isn't an integer greater than 0, send invalidation message
        if (!Number.isInteger(Number(isbn)) || parseInt(isbn) <= 0) {
            reject({message: "Invalid ISBN. Must be an integer greater than 0"});
        }

        if (searched_book) {
            resolve(searched_book);
        } else {
            reject({message: `No book with ISBN ${isbn} found.`});
        }
    });
}

async function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        // Find and collect books from DB matching queried title name
        const title_books = [];
        for (const [isbn, book] of Object.entries(books)) {
            if (book['title'] === title) {
                title_books.push(book);
            }
        }

        if (title_books.length > 0) {
            // If there are matching books
            resolve(title_books);
        } else {
            // If there aren't any matching books
            reject({message: `No books with title '${title}' found!`});
        }
    });
}

async function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        // Find and collect books from DB matching queried author
        const books_written_by_author = [];
        for (const [isbn, book] of Object.entries(books)) {
            if (book['author'] === author) {
                books_written_by_author.push(book);
            }
        }

        if (books_written_by_author.length > 0) {
            // If any matching books found
            resolve(books_written_by_author);  
        } else {
            // If there aren't any matching books
            reject({message: `No books written by ${author} found!`});
        }
    });
}


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

// Get the book list available in the shop
public_users.get('/', async (req, res, then) => { 
    getBooks()
        .then(book_list => {
            return res.status(200).send(book_list);
        })
        .catch(error => {
            return res.status(403).json(error);
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res,next) => {
    const isbn = req.params.isbn;
    getBooksByISBN(isbn)
        .then(found_books => {
            return res.status(200).send(found_books);
        })
        .catch(error => {
            return res.status(200).json(error);
        });
 });
  
// Get book details based on author
public_users.get('/author/:author', async (req, res, next) => {
    const filtered_author = req.params.author;
    getBooksByAuthor(filtered_author)
        .then(book_list => {
            return res.status(200).json(book_list);
        })
        .catch(error => {
            return res.status(403).json(error);
        });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const filtered_title = req.params.title;
    getBooksByTitle(filtered_title)
        .then(book_list => {
            return res.status(200).send(book_list);
        })
        .catch(error => {
            return res.status(403).json(error);
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
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
        return res.status(200).json({message: `No reviews for the book '${isbn_book['title']}'.`});
    }
});

module.exports.general = public_users;
