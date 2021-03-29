// Require models
const MailingList = require('../models/mailinglist');
const Event = require('../models/event');
const User = require('../models/user');

// Require middleware
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const user = require('../models/user');

// Setup AWS
AWS.config.update({ region: 'us-east-1' });

// Setup SES
const ses = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
});

// Index
exports.index = async (req, res, next) => {
    try {
        const events = await Event.aggregate([{ $sort: { date: -1 } }]);
        res.render('index', { title: 'Gira', events });
    } catch (error) {
        next(error);
    }
};

exports.ctaPost = async (req, res, next) => {
    try {
        const registrant = new MailingList(req.body);
        await registrant.save();
        res.redirect('/inicio');
    } catch (error) {
        next(error);
    }
};

// Events
exports.events = async (req, res, next) => {
    try {
        const events = await Event.aggregate([{ $sort: { date: -1 } }]);
        res.render('events', { title: 'Gira: Eventos', events });
    } catch (error) {
        next(error);
    }
};

exports.event = async (req, res, next) => {
    try {
        const eventName = decodeURI(req.params.eventUri);
        const event = await Event.findOne({ name: { $regex: new RegExp(eventName, 'i') } });
        res.render('event', { title: `Gira: ${event.name}`, event });
    } catch (error) {
        next(error);
    }
};

// Password Reset
exports.passwordRequestGet = (req, res) => {
    res.render('pwrequest', { title: 'Gira: Recuperación de Contraseña' });
};

exports.passwordRequestPost = async (validationErrors, req, res, next) => {
    try {
        if (validationErrors.length) return res.render('pwrequest', { title: 'Gira: Recuperación de Contraseña', errors: validationErrors });

        const user = await User.findOne({ email: req.body.email });
        if(!user) return res.render('pwrequest', { title: 'Gira: Recuperación de Contraseña', errors: [{ msg: 'Usuario no encontrado.' }] });

        const emailToken = jwt.sign({ user: user._id }, process.env.EMAIL_SECRET, { expiresIn: '3h' });    // oth 24h
        const url = `https://mexicogira.com/pwr/${emailToken}`;
        
        // const rJSON = require('../emails/pwReset.json');
        // const rTemp = await ses.updateTemplate(rJSON).promise();
        // // const rTemp = await ses.createTemplate(rJSON).promise();
        // console.log(rTemp);

        const params = {
            Destination: {
                ToAddresses: [`${user.email}`]
            },
            Source: 'Gira Notificaciones <no-reply@mexicogira.com>',
            Template: 'passwordReset',
            TemplateData: `{ \"name\":\"${user.first_name} ${user.last_name}\",\"link\":\"${url}\" }`,
            ReturnPath: "returned@mexicogira.com"
        };

        const sendPromise = ses.sendTemplatedEmail(params).promise();
        await sendPromise;

        res.render('pwrequest', { title: 'Gira: Recuperación de Contraseña', sent: true });
    } catch(error) {
        next(error);
    }
};

exports.passwordResetGet = async (req, res, next) => {
    try {
        const token = req.params.token;

        await jwt.verify(token, process.env.EMAIL_SECRET, err => {
            if (err && err.name == 'TokenExpiredError') return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', expiredToken: true });
            if (err && err.name != 'TokenExpiredError') return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', tokenError: true });
            if (!err) return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña' });
        });
    } catch(error) {
        next(error);
    }
};

exports.passwordResetPost = async (validationErrors, req, res, next) => {
    try {
        if (validationErrors.length) return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', errors: validationErrors });

        const token = req.params.token;

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.EMAIL_SECRET);
        } catch(err) {
            if (err && err.name == 'TokenExpiredError') return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', expiredToken: true });
            if (err && err.name != 'TokenExpiredError') return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', tokenError: true });
        }
        if (decoded == undefined) return res.render('pwreset', { title: 'Gira: Recuperación de Contraseña', tokenError: true });

        const user = await User.findOne({ _id: decoded.user }, { email: 1, first_name: 1, last_name: 1 });
        console.log(user)

        User.findByUsername(user.email).then(async user => {
            if (req.body.password) await user.setPassword(req.body.password);
            user.save();
        });

        // const rJSON = require('../emails/pwResetConfirmation.json');
        // const rTemp = await ses.updateTemplate(rJSON).promise();
        // // const rTemp = await ses.createTemplate(rJSON).promise();
        // console.log(rTemp);

        const params = {
            Destination: {
                ToAddresses: [`${user.email}`]
            },
            Source: 'Gira Notificaciones <no-reply@mexicogira.com>',
            Template: 'passwordResetConfirmation',
            TemplateData: `{ \"name\":\"${user.first_name} ${user.last_name}\" }`,
            ReturnPath: "returned@mexicogira.com"
        };

        const sendPromise = ses.sendTemplatedEmail(params).promise();
        await sendPromise;

        res.render('pwreset', { title: 'Gira: Contraseña Recuperada', success: true });
    } catch(error) {
        next(error);
    }
};