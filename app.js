var express = require('express');
var path = require('path');
const { check, validationResult } = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'))

// BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express Session Middleware
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Express Validator Middleware
app.post('/user', [
    // username must be an email
    check('username').isEmail(),
    // password must be at least 5 chars long
    check('password').isLength({ min: 5 })
], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    User.create({
        username: req.body.username,
        password: req.body.password
    }).then(user => res.json(user));
});

// Connect-Flash Middleware
app.use(flash());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Define Routes
app.use('/', routes);
app.use('/users', users);

app.listen(3000);
console.log('Server started on port 3000');