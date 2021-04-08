const mongoose = require('mongoose');

/**
 * @class Event
 */
/**
 * Event Mongoose Schema Object
 * @typedef {object} Event
 * @property {mongoose.Schema.Types.ObjectId} _id - Event document id
 * @property {String} name - Event name (unique, required)
 * @property {Date} date - Event date
 * @property {String} exhibitor - Event exhibitor (required)
 * @property {String} description - Event description
 * @property {Array<String>} images - Event image URLs
 * @property {Array<String>} videos - Event video URLs
 * @property {String} link - Event attendee link
 * @property {Array<mongoose.Schema.Types.ObjectId>} registered_users - Event's registered users
 */

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Event name is required',
        trim: true,
        unique: true
    },
    date: Date,
    exhibitor: {
        type: String,
        required: 'Event exhibitor is required',
        trim: true
    },
    description: String,
    images: [String],
    videos: [String],
    link: String,
    registered_users: [mongoose.Schema.Types.ObjectId]
});

module.exports = mongoose.model('Event', eventSchema);