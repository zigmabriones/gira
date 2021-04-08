/**
 * userController.js is the main driver for all the routes within "routes/users.js", prefixed by "/usuarios".
 * @module userController
 * @author Emilio Popovits Blake
 */

// Require models
const User = require('../models/user');
const Event = require('../models/event');

// Require middleware
const Passport = require('passport');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// Modules for JSDoc
const e = require('express');

// Setup AWS
AWS.config.update({ region: 'us-east-1' });

// Setup SES
const ses = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
});

/******************************************/
/************* Login/Signup ***************/
/******************************************/
/**
 * Renders signup page.
 * 
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 */
exports.signUpGet = (req, res) => {
    res.render('users/register', { title: 'Gira: Registro' });
};

/**
 * Registers user to database through PassportJs, or returns if a validation error happens.
 * 
 * @param {Array<object>} validationErrors - Validation errors returned by validation middleware
 * @param {e.Request<{}, {}, User.User, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.signUpPost = (validationErrors, req, res, next) => {
    // If any validation errors occurred, return with validation errors
    if (validationErrors.length) return res.render('users/register', { title: 'Gira: Registro', errors: validationErrors });

    // Create a new User object and register it through PassportJs. If error, log it in console and pass it to error handler. Else, proceed to next middleware function.
    const newUser = new User(req.body);
    User.register(newUser, req.body.password, function (err) {
        if (err) {
            console.log('Error while registering.', err);
            return next(err);
        }
        next();
    });
};

/**
 * Renders login page.
 * 
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 */
exports.loginGet = (req, res) => {
    res.render('users/login', { title: 'Gira: Log In' });
};

/**
 * Authenticates user through PassportJs local strategy and redirects.
 */
exports.loginPost = Passport.authenticate('local', {
    successRedirect: '/usuarios',
    failureRedirect: '/login'
});

/**
 * Logs user out and redirects to '/inicio'.
 * 
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 */
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/inicio');
};

/**
 * Verifies if user is authenticated and redirects to appropriate route. Else, returns to '/login'. If user is not verified, renders verification page.
 * 
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.isAuth = (req, res, next) => {
    // If user is not logged in, return to '/login'
    if(!req.isAuthenticated()) return res.redirect('/login');

    // If user is not verified, render verification page
    if (!req.user.verified) return res.render('users/verify', { title: 'Gira: Verifica tu Cuenta', verified: req.user.verified });

    // If user is dev or admin, redirect to '/admin'. Else, proceed to next middleware function.s
    req.user.permissions == 'dev' || req.user.permissions == 'admin'
        ? res.redirect('/admin')
        : next();
};

/******************************************/
/************* Verification ***************/
/******************************************/
/**
 * Sends verification email to user after signup.
 * 
 * @async
 * @param {e.Request<{}, {}, User.User, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.sendVerificationEmail = async (req, res, next) => {
    try {
        // Queries database for user through email field, returns email, first_name, and last_name fields
        const user = await User.findOne({ email: req.body.email }, { email: 1, first_name: 1, last_name: 1 });

        // Sign JWT email token with user id and concatenate it into a URL
        const emailToken = jwt.sign({ user: user._id }, process.env.EMAIL_SECRET, { expiresIn: '24h' });
        const url = `https://mexicogira.com/v/${emailToken}`;

        // Create/Update verificationEmail SES email template
        // const vJSON = require('../emails/verification.json');
        // // const vTemp = await ses.createTemplate(vJSON).promise();
        // const vTemp = await ses.updateTemplate(vJSON).promise();
        // console.log(vTemp)

        // Build SES params object for sending email to the user
        const params = {
            Destination: {
                ToAddresses: [`${user.email}`]
            },
            Source: 'Gira Notificaciones <no-reply@mexicogira.com>',
            Template: 'verificationEmail',
            TemplateData: `{ \"name\":\"${user.first_name} ${user.last_name}\",\"link\":\"${url}\" }`,
            ReturnPath: "returned@mexicogira.com"
        };

        // Send email to user through SES
        const sendPromise = ses.sendTemplatedEmail(params).promise();
        await sendPromise;

        // Proceed to next middleware function
        next();
    } catch(error) {
        next(error);
    }
};

/**
 * Verifies user's account and email, or return if JWT is invalid.
 * 
 * @async
 * @param {e.Request<{token: String}, {}, {}, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.verify = async (req, res, next) => {
    try {
        /**  JWT used for password reset in email @var {String} */
        const token = req.params.token;
        
        // Synchronously verify JWT email token. If invalid, return with error.
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.EMAIL_SECRET);
        } catch (err) {
            if (err && err.name == 'TokenExpiredError') return res.render('users/verify', { title: 'Gira: Verifica tu Cuenta', verified: false, expiredToken: true });
            if (err && err.name != 'TokenExpiredError') return res.render('users/verify', { title: 'Gira: Verifica tu Cuenta', ferified: false, tokenError: true });
        }
        if (decoded == undefined) return res.render('users/verify', { title: 'Gira: Verifica tu Cuenta', ferified: false, tokenError: true });

        // Find user from JWT in database, return verified field
        const query = await User.findOne({ _id: decoded.user }, { verified: 1 });

        // If user is verified, return to '/usuarios'.
        if(query.verified) return res.redirect('/usuarios');

        // Verify the user in the database
        await User.findByIdAndUpdate(decoded.user, { verified: true }, { new: true });
        res.render('users/verify', { title: 'Gira: Usuario verificado!', verified: true });
    } catch(error) {
        next(error);
    }
};

/******************************************/
/************* User Events ****************/
/******************************************/
/**
 * Render user registered events in myevents view.
 * 
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 *  
 * @todo Query for user registered events and display them sorted descending by date. Pass events to myevents Pug view
 * @todo Update myevents Pug view to have registered events functionality
 */
exports.misEventos = (req, res) => {
    // Render 'Site under construction' Page
    // res.render('users/construction', { title: 'Gira: Cuenta' });

    res.render('users/myevents', { title: 'Gira: Cuenta' });
};


/******************************************/
/********** User Account Info *************/
/******************************************/
/**
 * Render user edit account info page.
 * 
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * 
 * @todo Add delete user functionality
 */
exports.accountGet = (req, res) => {
    res.render('users/account', { title: 'Gira: Mi Cuenta' });
};

/**
 * Updates user's accont information, or returns if there were validation errors
 * 
 * @async
 * @param {Array<object>} validationErrors - Validation errors returned by validation middleware
 * @param {e.Request<{}, {}, User.User, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.accountPost = async (validationErrors, req, res, next) => {
    try {
        // If any validation errors occurred, return with validation errors
        if (validationErrors.length) return res.render('users/account', { title: 'Gira: Mi Cuenta', errors: validationErrors });

        // Find user and update information through PassportJs
        User.findByUsername(req.user.email).then(async user => {
            // If user changed email, set user's verification status to false
            if (user.email != req.body.email) {
                user.email = req.body.email;
                user.verified = false;
            }
            if (req.body.password) await user.setPassword(req.body.password);
            user.first_name = req.body.first_name;
            user.last_name = req.body.last_name;
            user.phone_number = req.body.phone_number;
            user.age = req.body.age;
            user.institution = req.body.institution;

            // If user is not verified, send a verification email to its new email
            if(!user.verified) sendVerificationEmail(user._id, user.email, user.first_name, user.last_name);

            // Try to save user. If user email already exists in database, return with error and don't save.
            try {
                await user.save();
            } catch (error) {
                if (error.code === 11000) {
                    const errorObj = { msg: 'Correo Inválido: El correo ya existe.' };
                    res.render('users/account', { title: 'Gira: Mi Cuenta', errors: [errorObj] });
                    return
                } else {
                    next(error);
                    return;
                }
            }
        });

        /**
         * Send verification email to user
         * 
         * @async
         * @function
         * @param {String} id - User id
         * @param {String} email - User email
         * @param {String} first_name - User first name
         * @param {String} last_name - User last name
         */
        async function sendVerificationEmail(id, email, first_name, last_name) {
            // Sign JWT email token with user id and concatenate it into a URL
            const emailToken = jwt.sign({ user: id }, process.env.EMAIL_SECRET, { expiresIn: '24h' });
            const url = `https://mexicogira.com/v/${emailToken}`;

            // Build SES params object for sending email to the user
            const params = {
                Destination: {
                    ToAddresses: [`${email}`]
                },
                Source: 'Gira Notificaciones <no-reply@mexicogira.com>',
                Template: 'verificationEmail',
                TemplateData: `{ \"name\":\"${first_name} ${last_name}\",\"link\":\"${url}\" }`,
                ReturnPath: "returned@mexicogira.com"
            };

            // Send email to user through SES
            const sendPromise = ses.sendTemplatedEmail(params).promise();
            await sendPromise;
        };

        // If user is admin or dev, redirect to '/admin/cuenta'. Else, redirect to '/usuarios/cuenta'
        req.user.permissions == 'admin' || req.user.permissions == 'dev'
            ? res.redirect('/admin/cuenta')
            : res.redirect('/usuarios/cuenta');
    } catch(error) {
        next(error);
    }
};