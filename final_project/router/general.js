const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



// function to check if user exist
const doesExist = (username) => {
  let sameUser = users.filter((user) => {
    return user.username === username;
  })
  if (sameUser.length > 0) {
    return true;
  } else {
    return false;
  }
}

// register user
public_users.post("/register", (req,res) => {
  // const {username, password} = req.body;
  const username = req.body.username
  const password = req.body.password

  if (!username || username.length < 1 || !password || password.length < 1) { 
    return res.status(400).json({ message: "Invalid input: Username and password are required and must meet minimum length requirements." });
  }
  if (doesExist(username)) {
    return res.status(409).json({message: "User already exists."})
  } 
    
  users.push({username, password})
  return res.status(200).json({message: "User succesfully registered."})
  
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   res.send(JSON.stringify(books, null, 4))
// });

// using Promise callbacks
public_users.get('/', function (req, res) {
  // Simulate fetching data (replace with actual API call in the future)
  const fetchBooksPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books); // Resolve with the books data
    }, 500); // Simulate a 500ms delay 
  });

  fetchBooksPromise
    .then(booksData => {
      res.json(booksData); // Send books as JSON on success
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching books" }); // Handle errors
    });
});


// Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//   const isbn = req.params.isbn;

//   if (!books[isbn]) {
//     return res.status(404).json({message: "Book not found with this ISBN."})
//   } 
//   res.send(books[isbn])
//  });
  
// USing Promise
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const fetchBookPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
          if (books[isbn]) {
              resolve(books[isbn]);
          } else {
              reject({ message: "Book not found with this ISBN." });
          }
      }, 500); // Simulating a 500ms delay 
  });

  fetchBookPromise
      .then(book => {
          res.json(book); 
      })
      .catch(error => {
          res.status(404).json(error); 
      });
});



// Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//   const author = req.params.author;

//   const matchBooks = [];
//   const bookId = Object.keys(books)

// Using Promise
public_users.get('/author/:author', (req, res) => {
  const authorToFind = req.params.author.toLowerCase(); 
  const matchingBooks = []; // Array to store matching books

  // Iterate through the book IDs
  for (const bookId of Object.keys(books)) { 
    const book = books[bookId];

    // Check if the author matches (case-insensitive)
    if (book.author.toLowerCase() === authorToFind) {
      matchingBooks.push({
        isbn: bookId,  // Include the ISBN in the response
        title: book.title,
        reviews: book.reviews // Include reviews if needed
      }); 
    }
  }

  // Handle the response
  if (matchingBooks.length > 0) {
    res.json(matchingBooks); // Send the matching books
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   const title = req.params.title;

//   const matchBooks = [];
//   const bookId = Object.keys(books)

//   // Iterate through each book and find the matching book for requested title
//   for (const id of bookId) {
//     const book = books[id];
//     if (book.title.toLowerCase() === title.toLowerCase() ) {
//       return matchBooks.push({id, ...book})
//     }
//   }
//   // response with matched books
//   if (matchBooks.length > 0) {
//     return res.json(matchBooks)
//   } else {
//     return res.status(404).json({message: "No books found in this title."})
//   }
// });

// Using Promise 
public_users.get('/title/:title', function (req, res) {
  const requestedTitle = req.params.title.toLowerCase();
  const matchingBooks = [];

  for (const bookId of Object.keys(books)) {
    const book = books[bookId];
    if (book.title.toLowerCase() === requestedTitle) {
      matchingBooks.push({ isbn: bookId, ...book }); // Include the ISBN
    }
  }

  if (matchingBooks.length > 0) {
    res.json(matchingBooks);
  } else {
    res.status(404).json({ message: "No books found with this title." });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found with this ISBN."})
  } 

  const reviews = books[isbn].reviews

  if (Object.keys(reviews).length === 0) {
    return res.status(404).json({message: "No reviews available for this book yet"})
  }
  res.send(reviews)
});

module.exports.general = public_users;
