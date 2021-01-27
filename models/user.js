const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const mongooseBcrypt = require('mongoose-bcrypt');

const userSchema = new mongoose.Schema({
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
    },
    password: {
        type: String,
        required: 'Password is required',
        bcrypt: true
    },
    permissions: {
        type: String,
        required: 'Permission level is required',
        trim: true,
        lowercase: true,
        default: 'user'
    }
});

userSchema.plugin(mongooseBcrypt);
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', userSchema);