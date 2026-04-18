const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
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

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
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

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(403).json({message: "Error loging in!"});
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

    return res.status(200).json({message: 'User successfully logged in!'});
  } else {
    return res.status(403).json({message: "Invalid login. Check username and password."});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let filtered_book = books[req.params.isbn];
  const newReview = req.body.review;
  const userInSession = req.session.authorization['username'];
  console.log(newReview);
  console.log(userInSession);

  if (filtered_book && newReview) {
    let existingReviews = filtered_book['reviews'];
    existingReviews[userInSession] = newReview;
    return res.status(200).json({message: `New review by ${username} added to book ${filtered_book['title']}.`})
  }

  return res.status(403).json({message: `Book of ISBN ${req.params.isbn} not found!`})
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
