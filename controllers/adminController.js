// Require Modules
const MailingList = require('../models/mailinglist');
const Event = require('../models/event');

exports.account = (req, res, next) => {
    res.render('admins/dashboard', { title: 'Gira: Cuenta' });
};

exports.mailingListGet = async (req, res, next) => {
    try {
        const mailingList = await MailingList.find();
        res.render('admins/mailing_list', { title: 'Gira: Mailing List', mailingList });
    } catch(error) {
        next(error);
    }
};

exports.newEventGet = (req, res, next) => {
    try {
        const event = new Event();
        res.render('admins/event_crud', { title: 'Gira: Crear Evento', eventId: event._id });
    } catch(error) {
        next(error);
    }
};