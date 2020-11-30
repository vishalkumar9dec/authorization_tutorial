//jshint esversion:6
require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");


const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const port = 3000;

mongoose.connect("mongodb://localhost:27017/secretsDB", { useUnifiedTopology: true, useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


const User = mongoose.model("userdetail", userSchema);


app.route("/")
    .get(function(req, res) {
        res.render("home");
    });


app.route("/login")

.get(function(req, res) {
    res.render("login");
})

.post(function(req, res) {
    const email = req.body.username;
    // Hashing the password during login and compare two hash values. A string will always generate the same hash.
    const password = md5(req.body.password);

    User.findOne({ email: email }, function(err, foundUser) {
        if (err) {
            res.send("ERROR: " + err);
        } else {
            if (!foundUser) {
                console.log("User Not Found");
                res.send("ERROR: User Not Found !");
            } else {

                if (foundUser.password === password) {
                    res.render("secrets");
                } else {
                    res.send("ERROR: Password does not match !");
                };
            };
        }
    });
});


app.route("/register")

.get(function(req, res) {
    res.render("register");
})

.post(function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password) //Hashing the password during registration
    });

    newUser.save(function(err) {
        if (!err) {
            res.render("secrets");
        } else {
            res.send(err);
        }
    });
});




app.listen(port, function() {
    console.log("Connected to backend server successfully !")
})