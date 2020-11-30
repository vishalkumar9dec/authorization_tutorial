//jshint esversion:6
require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;


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
    const password = req.body.password;

    User.findOne({ email: email }, function(err, foundUser) {
        if (err) {
            res.send("ERROR: " + err);
        } else {
            if (!foundUser) {
                console.log("User Not Found");
                res.send("ERROR: User Not Found !");
            } else {

                bcrypt.compare(password, foundUser.password, function(err, result) {
                    // result == true
                    if (result == true) {
                        res.render("secrets");
                    } else {
                        res.send("ERROR: Password does not match !");
                    }
                });
            };
        }
    });
});


app.route("/register")

.get(function(req, res) {
    res.render("register");
})

.post(function(req, res) {

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash //using the value from callback function
        });

        newUser.save(function(err) {
            if (!err) {
                res.render("secrets");
            } else {
                res.send(err);
            }
        });
    });

});





app.listen(port, function() {
    console.log("Connected to backend server successfully !")
})