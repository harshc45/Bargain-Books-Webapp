//jshint esversion:6

const express = require("express");
const multer = require('multer');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path')
const _ = require('lodash');
const mongoose = require("mongoose");
const mailgun = require("mailgun-js");
require('dotenv').config();
// const homeStartingContent = "";
// const aboutContent = "";
// const contactContent = "";


const app = express();

var loggedUsername;
var log_fname, log_email;
app.set('view engine', 'ejs'); //We also have to set EJS as the view engine for our Express application using app.set('view engine', 'ejs');.

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/BooksDB", {
  useNewUrlParser: true
}, {
  useUnifiedTopology: true
});

const booksSchema = {
  fname: String,
  ph: String,
  email: String,
  bname: String,
  aname: String,
  catname: String,
  date: Number,
  price: Number,
  file_name: String
};

const Book = mongoose.model("Book", booksSchema);

const userSchema = {
  user_name: String,
  password: String,
  user_email: String,
  fullName: String
}

const User = mongoose.model("User", userSchema);

var storageImg = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "./public/images");
  },
  filename: function(req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + path.extname(file.originalname));
  },
});

var upload = multer({
  storage: storageImg,
}).single("image"); //Field name and max count


app.get("/", function(req, res) {
  res.render("login", {msg:""});

});

app.get("/home", function(req, res) {
  Book.find({}, function(err, foundBooks) {
    res.render("home", {
      posts: foundBooks
    });
  });
});

app.get("/about", function(req, res) {
  res.render("about", {
    aboutContent_ejs: aboutContent
  }); // contents from the homeStartingContent is passed to StartingContent.
  //res.render("whichPage",{key:value})
});

app.get("/contact", function(req, res) {
  res.render("contact", {
    contactContent_ejs: contactContent
  }); // contents from the homeStartingContent is passed to StartingContent.
  //res.render("whichPage",{key:value})
});

app.get("/sell", function(req, res) {
  res.render("sell");

});

// Showing register form
app.get("/register", function(req, res) {
  res.render("register");
});

// Handling user signup
app.post("/register", function(req, res) {

  const newUser = new User({
    user_name: req.body.username,
    password: req.body.password,
    user_email: req.body.userEmail,
    fullName: req.body.fullName
  });
  newUser.save(function(err) {
    if (!err) {
      res.redirect("/login");
    }

  });
});

//Showing login form
app.get("/login", function(req, res) {
  res.render("login", {msg:""});
});

//Handling user login
var message;
app.post("/login", function(req, res) {
  console.log(req.body);
  var userName = req.body.username;
  var userPass = req.body.password;
  var found = 0;
  User.find({}, function(err, book) {
    if (err) {
      console.log(err);
    } else {
      if (book.length != 0) {
        for (var i = 0; i < book.length; i++) {
          if (book[i].user_name === userName) {
            found = 1;
            break;
          } else {
            found = 0;
          }
        }
        if (found === 1) {
          if (book[i].password === userPass) {
            console.log("logged in");
            loggedUsername = book[i].user_name;
            log_fname = book[i].fullName;
            log_email = book[i].user_email;
            message = "Successfully Logged In!!";
            res.redirect("/home");
          } else {
            console.log("password is incorrect");
            message = "Your password is incorrect";
            res.render("login", {
              msg: message
            });
          }
        }
        if (found === 0) {
          console.log("Username not found");
          message = "Username not found";
		  res.render("login", {
			msg: message
		  });
        }
      }
    }

  });

});
var sellerEmail;
app.get('/posts/:postID', function(req, res) {
  var requestedID = req.params.postID;

  Book.findOne({
    _id: requestedID
  }, function(err, post) {

    sellerEmail = post.email;
    res.render("post", {
      title: post.bname,
      price: post.price,
      imageName: post.file_name,
      authName: post.aname,
      dateOfPub: post.date,
      sellerName: post.fname,
      phNumber: post.ph,
      eAdd: post.email
    });

  });
});


app.post("/posts", function(req, res){
    var api_key = process.env.api_key;
    var domain = process.env.domain;
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});


    var data = {
      from: 'Bargain Books <postmaster@sandboxc40cd05d2425497e92ecd26b11b62d5f.mailgun.org>',
      to: sellerEmail,
      subject: 'Bargain Books user wants to buy your book',
      text: log_fname + " wants to buy your book. You can contact the buyer with email address: " + log_email
    };

    mailgun.messages().send(data, function (err, body) {
      console.log(body);
      if(err){
          console.log(err);
      }
      else{
          console.log("mail sent");
      }
    });
    res.redirect("/home");
});

app.post("/search", function(req, res) {
  // res.redirect("/posts/req.params.search");
  console.log(req.body.search);
  let x = req.body.search;
  Book.find({
    catname: x
  }, function(err, book) {
    res.render("category", {
      posts: book,
      x: x
    });
  });

});

app.post("/sell", upload, function(req, res) {
  // console.log(req.body.postTitle);
  const book = new Book({
    fname: req.body.firstName,
    ph: req.body.phno,
    email: req.body.em,
    bname: req.body.bookName,
    aname: req.body.authorName,
    catname: req.body.category,
    date: req.body.date,
    price: req.body.price,
    file_name: req.file.filename
  });
  book.save(function(err) {
    if (!err) {
      res.redirect("/home");
    }
  });
});






app.listen(3000, function() {
  console.log("Server started on port 3000");
});
