const mongoose = require('mongoose');

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