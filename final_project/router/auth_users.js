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

// Check if username and password match the one we have in records.
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
    return res.status(403).send("Error loging in!");
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

    console.log("Access Token: " + accessToken);

    return res.status(200).send('User successfully logged in!');
  } else {
    return res.status(403).send("Invalid login. Check username and password.");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let filtered_book = books[req.params.isbn];
  const userInSession = req.session.authorization['username'];
  const newReview = req.body.review;
  console.log("New Review: " + newReview);
  console.log("User In Session: " + userInSession);

  if (filtered_book && newReview && userInSession) {
    let existingReviews = filtered_book['reviews'];
    existingReviews[userInSession] = newReview;
    return res.status(200).send(books);
  }

  return res.status(403).send(`Book of ISBN ${req.params.isbn} not found!`)
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let filtered_book = books[req.params.isbn];
  const userInSession = req.session.authorization['username'];
  if (userInSession) {
    delete filtered_book['reviews'][userInSession];
    return res.status(200).send(books);
  }

  return res.status(403).send(`Unable to delete review for ${filtered_book['title']}!`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
