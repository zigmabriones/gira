// Require models
const User = require('../models/user');
const Event = require('../models/event');

// Require middleware
const Passport = require('passport');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

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
};
exports.loginGet = (req, res) => {
    res.render('users/login', { title: 'Gira: Log In' });
};

exports.loginPost = Passport.authenticate('local', {
    successRedirect: '/usuarios',
    failureRedirect: '/login'
});

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/inicio');
};

exports.isAuth = (req, res, next) => {
    // req.isAuthenticated()
    //     ? next()
    //     : res.redirect('/login');
    if(!req.isAuthenticated()) return res.redirect('/login');
    if (!req.user.verified) return res.render('users/verify', { title: 'Gira: Verifica tu Cuenta', verified: req.user.verified });

  req.user.permissions == 'dev' || req.user.permissions == 'admin'
    ? res.redirect('/admin')
    : next();
};

exports.sendVerificationEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email }, { email: 1, first_name: 1, last_name: 1 });

        const emailToken = jwt.sign({ user: user._id }, process.env.EMAIL_SECRET, { expiresIn: '24h' });
        const url = `https://mexicogira.com/v/${emailToken}`;

        // const vJSON = require('../emails/verification.json');
        // // const vTemp = await ses.createTemplate(vJSON).promise();
        // const vTemp = await ses.updateTemplate(vJSON).promise();
        // console.log(vTemp)

        const params = {
            Destination: {
                ToAddresses: [`${user.email}`]
            },
            Source: 'Gira Notificaciones <no-reply@mexicogira.com>',
            Template: 'verificationEmail',
            TemplateData: `{ \"name\":\"${user.first_name} ${user.last_name}\",\"link\":\"${url}\" }`,
            ReturnPath: "returned@mexicogira.com"
        };

        const sendPromise = ses.sendTemplatedEmail(params).promise();
        await sendPromise;

        next();
    } catch(error) {
        next(error);
    }
};

exports.verify = async (req, res, next) => {
    try {
        const token = req.params.token;
        
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.EMAIL_SECRET);
        } catch (err) {
            if (err && err.name == 'TokenExpiredError') return res.render('users/verify', { title: 'Gira: Verifica tu Cuenta', verified: false, expiredToken: true });
            if (err && err.name != 'TokenExpiredError') return res.render('users/verify', { title: 'Gira: Verifica tu Cuenta', ferified: false, tokenError: true });
        }
        if (decoded == undefined) return res.render('users/verify', { title: 'Gira: Verifica tu Cuenta', ferified: false, tokenError: true });

        const query = await User.findOne({ _id: decoded.user }, { verified: 1 });
        if(query.verified) return res.redirect('/usuarios');

        await User.findByIdAndUpdate(decoded.user, { verified: true }, { new: true });
        res.render('users/verify', { title: 'Gira: Usuario verificado!', verified: true });
    } catch(error) {
        next(error);
    }
};

/******************************************/
/************* Account View ***************/
/******************************************/

exports.misEventos = async (req, res, next) => {
    try {
        // res.render('users/construction', { title: 'Gira: Cuenta' });
        const events = await Event.aggregate([ { $sort: { date: -1 } } ]);
        res.render('users/myevents', { title: 'Gira: Cuenta', events });
    } catch(error) {
        next(error);
    }
};

exports.accountGet = async (req, res, next) => {
    try {
        res.render('users/account', { title: 'Gira: Mi Cuenta' })
    } catch(error) {
        next(error);
    }
};

exports.accountPost = async (validationErrors, req, res, next) => {
    try {
        if (validationErrors.length) return res.render('users/account', { title: 'Gira: Mi Cuenta', errors: validationErrors });

        User.findByUsername(res.locals.user.email).then(async user => {
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

            if(!user.verified) sendVerificationEmail(user._id, user.email, user.first_name, user.last_name);

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

        async function sendVerificationEmail(id, email, first_name, last_name) {
            const emailToken = jwt.sign({ user: id }, process.env.EMAIL_SECRET, { expiresIn: '24h' });    // oth 24h
            const url = `https://mexicogira.com/v/${emailToken}`;

            const params = {
                Destination: {
                    ToAddresses: [`${email}`]
                },
                Source: 'Gira Notificaciones <no-reply@mexicogira.com>',
                Template: 'verificationEmail',
                TemplateData: `{ \"name\":\"${first_name} ${last_name}\",\"link\":\"${url}\" }`,
                ReturnPath: "returned@mexicogira.com"
            };

            const sendPromise = ses.sendTemplatedEmail(params).promise();
            await sendPromise;
        };

        req.user.permissions == 'admin' || req.user.permissions == 'dev'
            ? res.redirect('/admin/cuenta')
            : res.redirect('/usuarios/cuenta');
    } catch(error) {
        next(error);
    }
};