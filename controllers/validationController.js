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