//jshint esversion:6
require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');


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
    password: String,
    googleId: String,
    facebookId: String,
    name: String
});

//To be used for passwords
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("userdetail", userSchema);

//Passport Configuration
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        profileFields: ['id', 'email', 'first_name', 'last_name']
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log("Profile from google: " + profile.id);
        User.findOrCreate({ googleId: profile.id }, function(err, user) {
            return cb(err, user);
        });
    }
));


passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/secrets",
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log("Facebook Profile :" + profile.id + " Facebook Display name " + profile.displayName);
        User.findOrCreate({ facebookId: profile.id }, { name: profile.displayName }, function(err, user) {
            return cb(err, user);
        });
    }
));


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


//GOOGLE Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ["profile"] })
);

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: "/login" }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect("/secrets");
    });

///// FACEBOOK Routes
app.get('/auth/facebook',
    passport.authenticate('facebook'));


app.get('/auth/facebook/secrets',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/secrets');
    });



app.listen(port, function() {
    console.log("Connected to backend server successfully !")
})