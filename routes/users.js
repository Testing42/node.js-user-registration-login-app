var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
var validator = require('validator');
var db = mongojs('registerapp', ['users']);
var passport = require('passport'); //this could be used to incoporate facebook or twitter password for example
var LocalStrategy = require('passport-local').Strategy;


// Login Page - GET
router.get('/login', function(req, res) {
    res.render('login');
});

// Register Page - GET
router.get('/register', function(req, res) {
    res.render('register');
});



//adding the user POST
router.post('/register', [

    //validation
    check('name')
    .notEmpty().withMessage('Your name is required'),
    check('email', 'Your email is required')
    .notEmpty()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
    check('username')
    .notEmpty().withMessage('Your username is required'),
    check('password')
    .isLength({ min: 1 }).withMessage('The minimum length for a password is 1 characters')
    .custom((value, { req, loc, path }) => {
        if (value !== req.body.password2) {
            // throw error if passwords do not match
            throw new Error("Passwords don't match");
        } else {
            return value;
        }
    })

], (req, res, next) => {
    //check for errors
    const result = validationResult(req);
    var errors = result.errors;
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;


    for (var key in errors) {
        console.log(errors[key].value);
    }

    if (!result.isEmpty()) {
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            username: username,
            password: password,
            password2: password2
        })
    } else {
        var newUser = {
            name: name,
            email: email,
            username: username,
            password: password,

        }

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                newUser.password = hash;

                db.users.insert(newUser, function(err, doc) {
                    if (err) {
                        res.send(err);
                    } else {
                        console.log('user added...')

                        //success message
                        req.flash('success', 'You are registered and can now log in');

                        //redirect after registered
                        res.location('/');
                        res.redirect('/');
                    }
                });
            });
        });


    }
})

module.exports = router;