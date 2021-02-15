// Require models
const MailingList = require('../models/mailinglist');
const Event = require('../models/event');

exports.index = async (req, res, next) => {
    try {
        const events = await Event.aggregate([ { $sort: { date: -1 } } ]);
        res.render('index', { title: 'Gira', events });
    } catch(error) {
        next(error);
    }
};

exports.ctaPost = async (req, res, next) => {
    try {
        const registrant = new MailingList(req.body);
        await registrant.save();
        res.redirect('/inicio');
    } catch(error) {
        next(error);
    }
};

exports.events = async (req, res, next) => {
    try {
        const events = await Event.aggregate([ { $sort: { date: -1 } } ]);
        res.render('events', { title: 'Gira: Eventos', events });
    } catch(error) {
        next(error);
    }
};

exports.event = async (req, res, next) => {
    try {
        const eventName = decodeURI(req.params.eventUri);
        const event = await Event.findOne({ name: { $regex: new RegExp(eventName, 'i') } });
        res.render('event', { title: `Gira: ${event.name}`, event });
    } catch(error) {
        next(error);
    }
};