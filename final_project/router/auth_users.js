const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check is the username is valid
const isValid = (username) => {
  if (!username) {
    return false;
  }

  for (const user of users) {
    if (user['username'] === username) {
      return false;
    }
  }

  return true;
}

// Check if username and password match any pair in records
const authenticatedUser = (username, password) => {

  if (!username || !password) {
    return false;
  }

  for (const user of users) {
    if (user['username'] === username && user['password'] === password) {
      return true;
    }
  }

  return false;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(403).json({error: "Error loging in! No username and/or password provided."});
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn : 60 * 60 });

    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({authorization: req.session.authorization, message: "User successfully logged in!"});
  } else {
    return res.status(403).json({error: "Invalid login. Check username and password."});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let filtered_book = books[req.params.isbn];
  const userInSession = req.session.authorization['username'];
  const newReview = req.body.review;

  if (filtered_book && newReview && userInSession) {
    let existingReviews = filtered_book['reviews'];
    existingReviews[userInSession] = newReview;
    return res.status(200).json({book: filtered_book, message: `Review successfully added to ${filtered_book['title']}`});
  }

  return res.status(403).json({message: `Book of ISBN ${req.params.isbn} not found!`});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let filtered_book = books[req.params.isbn];
  const userInSession = req.session.authorization['username'];
  if (userInSession) {
    const book_before_review_deleted = JSON.parse(JSON.stringify(filtered_book));
    delete filtered_book['reviews'][userInSession];
    return res.status(200).json({
        before_review_deleted: book_before_review_deleted, 
        after_review_deleted: filtered_book,
        message: `Review for ${filtered_book['title']} successfully deleted.`});
  }

  return res.status(403).send({message: `Unable to delete review for ${filtered_book['title']}!`});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
