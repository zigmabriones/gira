const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const mongooseBcrypt = require('mongoose-bcrypt');

/**
 * @class User
 */
/**
 * User Mongoose Schema Object
 * @typedef {object} User
 * @property {mongoose.Schema.Types.ObjectId} _id - User document id
 * @property {String} first_name - User first name (required)
 * @property {String} last_name - User last name (required)
 * @property {String} email - User email (required, unique, lowercase, PassportJs usernameField)
 * @property {String} phone_number - User phone number
 * @property {Number} age - User age
 * @property {String} gender - User gender
 * @property {String} institution - User institution
 * @property {String} password - User password (required, hashed through Bcrypt plugin)
 * @property {String} permissions - User permissions (enum: 'user', 'member', 'leader','admin', 'dev')
 * @property {Boolean} verified - User verification status (default: false)
 * @property {Array<mongoose.Schema.Types.ObjectId>} events - User registered events
 */
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
        enum: ['user', 'member', 'leader','admin', 'dev'],
        default: 'user'
    },
    verified: {
        type: Boolean,
        default: false
    },
    events: [mongoose.Schema.Types.ObjectId]
});

userSchema.plugin(mongooseBcrypt);
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', userSchema);