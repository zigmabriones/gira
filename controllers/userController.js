// Require models
const User = require('../models/user');

// Require middleware
const Passport = require('passport');

/******************************************/
/************* Login/Signup ***************/
/******************************************/
const { body, validationResult } = require('express-validator');

exports.signUpGet = (req, res) => {
    res.render('users/register', { title: 'Gira: Registro' });
};

exports.signUpPost = (validationErrors, req, res, next) => {
    if (validationErrors.length) {
        res.render('users/register', { title: 'Gira: Registro', errors: validationErrors });
        return;
    }

    const newUser = new User(req.body);
    User.register(newUser, req.body.password, function (err) {
        if (err) {
            console.log('Error while registering.', err);
            return next(err);
        }
        next();
    });
}

exports.loginGet = (req, res) => {
    res.render('users/login', { title: 'Gira: Log In' });
};

exports.loginPost = Passport.authenticate('local', {
    successRedirect: '/users',
    failureRedirect: '/login'
});

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/inicio');
};

exports.isAuth = (req, res, next) => {
    req.isAuthenticated()
        ? next()
        : res.redirect('/login');
};

/******************************************/
/************* Account View ***************/
/******************************************/

exports.accountView = (req, res, next) => {
    req.user.permissions == 'dev' || req.user.permissions == 'admin'
        ? res.redirect('/admin')
        : res.render('users/dashboard', { title: 'Gira: Cuenta' });
};