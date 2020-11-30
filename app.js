//jshint esversion:6
require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: 'My Secret',
    resave: false,
    saveUninitialized: false,
}))

//Initialize the passport
app.use(passport.initialize());
app.use(passport.session());


const port = 3000;

mongoose.connect("mongodb://localhost:27017/secretsDB", { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//To be used for passwords
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("userdetail", userSchema);

//Passport Configuration
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



///HOME Routes
app.route("/")

.get(function(req, res) {
    res.render("home");
});


//LOGIN Routes
app.route("/login")

.get(function(req, res) {
    res.render("login");
})

.post(function(req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            });
        }
    })

});


//REGISTER Routes

app.route("/register")

.get(function(req, res) {
    res.render("register");
})

.post(function(req, res) {

    User.register({ username: req.body.username }, req.body.password, function(err, newUser) {

        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            });
        }
    });

});


//// SECRETS route
app.route("/secrets")

.get(function(req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});


///LOGOUT route
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});



app.listen(port, function() {
    console.log("Connected to backend server successfully !")
})