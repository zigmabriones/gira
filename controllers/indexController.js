// Require models
const MailingList = require('../models/mailinglist');

exports.ctaPost = async (req, res, next) => {
    try {
        const registrant = new MailingList(req.body);
        await registrant.save();
        res.redirect('/inicio');
    } catch(error) {
        next(error);
    }
};