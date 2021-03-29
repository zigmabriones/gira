// Require Middleware
const { body, validationResult } = require('express-validator');

exports.ctaVS = [
    body('first_name').isLength({ min: 2, max: 20 }).withMessage('Tu nombre puede ser sólo de 3 a 20 caracteres de largo').trim().escape(),
    body('last_name').isLength({ min: 2, max: 32 }).withMessage('Tu apellido puede ser sólo de 3 a 32 caracteres de largo').trim().escape(),
    body('email').isEmail({ allow_utf8_local_part: false, ignore_max_length: false, domain_specific_validation: true }).withMessage('Correo inválido').trim().blacklist('<|>|\'|"|\/'),
    body('phone_number').isMobilePhone('any', { strictMode: false }).withMessage('Teléfono inválido').trim().escape(),
    body('age').trim().escape(),
    body('gender').trim().escape(),
    body('institution').trim().blacklist('<|>'),

    (req, res, next) => {
        const errors = validationResult(req);
        next(errors.array());
    }
];

exports.signupVS = [
    body('first_name').isLength({ min: 2, max: 20 }).withMessage('Tu nombre puede ser sólo de 3 a 20 caracteres de largo').trim().escape(),
    body('last_name').isLength({ min: 2, max: 32 }).withMessage('Tu apellido puede ser sólo de 3 a 32 caracteres de largo').trim().escape(),
    body('email').isEmail({ allow_utf8_local_part: false, ignore_max_length: false, domain_specific_validation: true }).withMessage('Correo inválido').trim().blacklist('<|>|\'|"|\/'),
    body('phone_number').isMobilePhone('any', { strictMode: false }).withMessage('Teléfono inválido').trim().escape(),
    body('age').trim().escape(),
    body('gender').trim().escape(),
    body('institution').trim().blacklist('<|>'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña inválida, las contraseñas deben ser por lo menos 6 caracteres de largo').trim().escape(),
    body('confirm_password')
        .custom((value, { req }) => value === req.body.password).withMessage('Las contraseñas no coinciden').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        next(errors.array());
    }
];

exports.loginVS = [
    body('email').trim().blacklist('<|>|\'|"|\/'),
    body('password').trim().escape(),
    (req, res, next) => next()
];

exports.pwrequestVS = [
    body('email').isEmail({ allow_utf8_local_part: false, ignore_max_length: false, domain_specific_validation: true }).withMessage('Correo inválido').trim().blacklist('<|>|\'|"|\/'),
    (req, res, next) => {
        const errors = validationResult(req);
        next(errors.array());
    }
];

exports.pwresetVS = [
    body('password').isLength({ min: 6 }).withMessage('Contraseña inválida, las contraseñas deben ser por lo menos 6 caracteres de largo').trim().escape(),
    body('confirm_password')
        .custom((value, { req }) => value === req.body.password).withMessage('Las contraseñas no coinciden').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        next(errors.array());
    }
];

exports.eventVS = [
    body('name').isLength({ min:2, max: 80 }).withMessage('El nombre del evento puede ser sólo de 3 a 80 caracteres de largo.').trim().blacklist('<|>|&'),
    body('date').isDate().withMessage('La fecha es inválida'),
    body('exhibitor').isLength({ min:2, max: 40 }).withMessage('El nombre del expositor puede ser sólo de 3 a 20 caracteres de largo').trim().blacklist('<|>|\/'),
    body('description').trim(),
    body('videos.*').optional({ checkFalsy: true }).isURL().withMessage('URL del video inválido').trim(),

    (req, res, next) => {
        const errors = validationResult(req);
        next(errors.array());
    }
];

exports.editAccountVS = [
    body('first_name').isLength({ min: 2, max: 20 }).withMessage('Tu nombre puede ser sólo de 3 a 20 caracteres de largo').trim().escape(),
    body('last_name').isLength({ min: 2, max: 32 }).withMessage('Tu apellido puede ser sólo de 3 a 32 caracteres de largo').trim().escape(),
    body('email').isEmail({ allow_utf8_local_part: false, ignore_max_length: false, domain_specific_validation: true }).withMessage('Correo inválido').trim().blacklist('<|>|\'|"|\/'),
    body('phone_number').isMobilePhone('any', { strictMode: false }).withMessage('Teléfono inválido').trim().escape(),
    body('age').trim().escape(),
    body('institution').trim().blacklist('<|>'),

    body('password')
    .custom((value, { req }) => {
        if(value && value.length >= 6){ return true; }
        else if(!value) { return true; }
        else { return false; }
    }).withMessage('Contraseña inválida, las contraseñas deben ser por lo menos 6 caracteres de largo').trim().escape(),
    body('confirm_password')
        .custom((value, { req }) => value === req.body.password).withMessage('Las contraseñas no coinciden').trim().escape(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        next(errors.array());
    }
];