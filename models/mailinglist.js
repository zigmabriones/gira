const mongoose = require('mongoose');

/**
 * @class MailingList
 */
/**
 * MailingList Mongoose Schema Object
 * @typedef {object} MailingList
 * @property {mongoose.Schema.Types.ObjectId} _id - Person document id
 * @property {String} first_name - Person first name (required)
 * @property {String} last_name - Person last name (required)
 * @property {String} email - Person email (required, unique, lowercase)
 * @property {String} phone_number - Person phone number
 * @property {Number} age - Person age
 * @property {String} gender - Person gender
 * @property {String} institution - Person institution
 */

const mailingListSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: 'First name is required',
        trim: true,
    },
    last_name: {
        type: String,
        required: 'Last name is required',
        trim: true,
    },
    email: {
        type: String,
        required: 'Email is required',
        trim: true,
        unique: true,
        lowercase: true
    },
    phone_number: {
        type: String,
        trim: true
    },
    age: Number,
    gender: {
        type: String,
        trim: true
    },
    institution: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('MailingList', mailingListSchema);