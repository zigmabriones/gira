const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Event name is required',
        trim: true
    },
    date: Date,
    exhibitor: {
        type: String,
        required: 'Event exhibitor is required',
        trim: true
    },
    description: String,
    images: [String],
    videos: [String]
});

module.exports = mongoose.model('Event', eventSchema);