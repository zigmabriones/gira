/**
 * indexController.js is the main driver for all the routes within "routes/index.js", prefixed by "/".
 * @module indexController
 * @author Emilio Popovits Blake
 */

// Require models
const Event = require('../models/event');
const User = require('../models/user');

// Require middleware
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

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
/**************** Index *******************/
/******************************************/
/**
 * Renders homepage with events sorted descending by date.
 * 
 * @async
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.index = async (req, res, next) => {
    try {
        // Query for all events, and return only name, description, date, and exhibitor fields sorted descending by date
        const events = await Event.aggregate([
            { $sort: { date: -1 } },
            { $limit: 4 },
            { $project: {
                name: 1,
                description: 1,
                date: 1,
                exhibitor: 1
            } }
        ]);
        
        res.render('index', { title: 'Gira', events });
    } catch (error) {
        next(error);
    }
};

/******************************************/
/**************** Events ******************/
/******************************************/
/**
 * Renders events page with events sorted descending by date.
 * 
 * @async
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.events = async (req, res, next) => {
    try {
        // Query for all events, and return only name, description, date, and exhibitor fields sorted descending by date
        const events = await Event.aggregate([
            { $project: {
                name: 1,
                description: 1,
                date: 1,
                exhibitor: 1
            } },
            { $sort: { date: -1 } }
        ]);

        res.render('events', { title: 'Gira: Eventos', events });
    } catch (error) {
        next(error);
    }
};

/**
 * Renders event view page event information.
 * 
 * @async
 * @param {e.Request<{eventUri: String}, {}, {}, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.event = async (req, res, next) => {
    try {
        // Decode eventUri and query for event in database (case insensitive)
        const eventName = decodeURI(req.params.eventUri);
        const event = await Event.findOne({ name: { $regex: new RegExp(eventName, 'i') } });

        res.render('event', { title: `Gira: ${event.name}`, event });
    } catch (error) {
        next(error);
    }
};

/******************************************/
/************ Password Reset **************/
/******************************************/
/**
 * Renders password reset request view.
 * 
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 */
exports.passwordRequestGet = (req, res) => {
    res.render('pwrequest', { title: 'Gira: Recuperación de Contraseña' });
};

/**
 * Sends password reset email to user, or returns if a validation error happens.
 * 
 * @async
 * @param {Array<object>} validationErrors - Validation errors returned by validation middleware
 * @param {e.Request<{}, {}, {email: string}, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 * 
 */
exports.passwordRequestPost = async (validationErrors, req, res, next) => {
    try {
        // If any validation errors occurred, return with validation errors
        if (validationErrors.length) return res.render('pwrequest', { title: 'Gira: Recuperación de Contraseña', errors: validationErrors });

        // Query for user in database by email, if not found, return with 'User not found' error message
        const user = await User.findOne({ email: req.body.email });
        if(!user) return res.render('pwrequest', { title: 'Gira: Recuperación de Contraseña', errors: [{ msg: 'Usuario no encontrado.' }] });

        // Sign JWT email token with user id and concatenate it into a URL
        const emailToken = jwt.sign({ user: user._id }, process.env.EMAIL_SECRET, { expiresIn: '3h' });
        const url = `https://mexicogira.com/pwr/${emailToken}`;
        
        // Create/Update passwordReset SES email template
        // const rJSON = require('../emails/pwReset.json');
        // const rTemp = await ses.updateTemplate(rJSON).promise();
        // // const rTemp = await ses.createTemplate(rJSON).promise();
        // console.log(rTemp);

        // Build SES params object for sending email to the user
        const params = {
            Destination: {
                ToAddresses: [`${user.email}`]
            },
            Source: 'Gira Notificaciones <no-reply@mexicogira.com>',
            Template: 'passwordReset',
            TemplateData: `{ \"name\":\"${user.first_name} ${user.last_name}\",\"link\":\"${url}\" }`,
            ReturnPath: "returned@mexicogira.com"
        };

        // Send email to user through SES
        const sendPromise = ses.sendTemplatedEmail(params).promise();
        await sendPromise;

        res.render('pwrequest', { title: 'Gira: Recuperación de Contraseña', sent: true });
    } catch(error) {
        next(error);
    }
};

/**
 * Renders password reset view if JWT is valid, else, return with an error.
 * 
 * @async
 * @param {e.Request<{token: String}, {}, {}, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.passwordResetGet = async (req, res, next) => {
    try {
        /**  JWT used for password reset in email @var {String} */
        const token = req.params.token;

        // Asynchronously verify email JWT, if invalid, return with error. Else, return successfully.
        await jwt.verify(token, process.env.EMAIL_SECRET, err => {
            if (err && err.name == 'TokenExpiredError') return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', expiredToken: true });
            if (err && err.name != 'TokenExpiredError') return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', tokenError: true });
            if (!err) return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña' });
        });
    } catch(error) {
        next(error);
    }
};

/**
 * Reset user password and send password change notification email, or return if a validation error happens or if JWT is invalid.
 *
 * @async
 * @param {Array<object>} validationErrors - Validation errors returned by validation middleware
 * @param {e.Request<{token: String}, {}, {password: String}, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 */
exports.passwordResetPost = async (validationErrors, req, res, next) => {
    try {
        // If any validation errors occurred, return with validation errors
        if (validationErrors.length) return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', errors: validationErrors });

        /**  JWT used for password reset in email @var {String} */
        const token = req.params.token;

        // Synchronously verify JWT email token. If invalid, return with error.
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.EMAIL_SECRET);
        } catch(err) {
            if (err && err.name == 'TokenExpiredError') return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', expiredToken: true });
            if (err && err.name != 'TokenExpiredError') return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', tokenError: true });
        }
        if (decoded == undefined) return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', tokenError: true });

        // Find user from JWT in database, return email, first_name, and last_name fields
        const user = await User.findOne({ _id: decoded.user }, { email: 1, first_name: 1, last_name: 1 });

        // Update user password in database through PassportJs
        User.findByUsername(user.email).then(async user => {
            if (req.body.password) await user.setPassword(req.body.password);
            user.save();
        });

        // Create/Update passwordResetConfirmation SES email template
        // const rJSON = require('../emails/pwResetConfirmation.json');
        // const rTemp = await ses.updateTemplate(rJSON).promise();
        // // const rTemp = await ses.createTemplate(rJSON).promise();
        // console.log(rTemp);

        // Build SES params object for sending email to the user
        const params = {
            Destination: {
                ToAddresses: [`${user.email}`]
            },
            Source: 'Gira Notificaciones <no-reply@mexicogira.com>',
            Template: 'passwordResetConfirmation',
            TemplateData: `{ \"name\":\"${user.first_name} ${user.last_name}\" }`,
            ReturnPath: "returned@mexicogira.com"
        };

        // Send email to user through SES
        const sendPromise = ses.sendTemplatedEmail(params).promise();
        await sendPromise;

        res.render('pwreset', { title: 'Gira: Contraseña Recuperada', success: true });
    } catch(error) {
        next(error);
    }
};