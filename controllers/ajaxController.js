/**
 * ajaxController.js is the main driver for all the routes within "routes/ajax.js", prefixed by "/ajax".
 * @module ajaxController
 * @author Emilio Popovits Blake
 */

// Require Models
const Event = require('../models/event');
const MailingList = require('../models/mailinglist');

// Require Middleware
const AWS = require('aws-sdk');

// Modules for JSDoc
const e = require('express');

// Setup S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
});

/**
 * Registers person to mailing list, or returns if there were validation errors
 * 
 * @async
 * @param {Array<object>} validationErrors - Validation errors returned by validation middleware
 * @param {e.Request<{}, {}, MailingList.MailingList, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.ctaRegister = async (validationErrors, req, res, next) => {
    try {
        // If any validation errors occurred, return with validation errors and a conflict status code
        if (validationErrors.length) return res.status(409).send(validationErrors);

        // Create a mailinglist object and save it to the database with body payload information
        const registrant = new MailingList(req.body);
        await registrant.save()

        // Respond with a created status code and with the registrant object
        res.status(201).send(registrant);
    } catch (error) {
        next(error);
    }
};

/**
 * Deletes event image from event S3 bucket,
 * 
 * @async
 * @param {e.Request<{}, {}, Event.Event, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.deleteEventImage = async (req, res, next) => {
    try {
        // Fetch id and key from body payload
        const id = req.body.id;
        const key = req.body.key;

        // Pull (delete) image from event image array in database and query an update to the event's document
        await Event.findByIdAndUpdate(id, { $pull: { images: key } }, { new: true });

        // Setup image delete parameters for S3 delete 
        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        };

        // Delete image from event S3 bucket
        s3.deleteObject(deleteParams, err => {
            if (err) {
                throw err;
            } else {
                res.status(200).send('Success!');   // On deletion, respond with a OK status code
            }
        });

    } catch (error) {
        // console.log(error)
        next(error);
    }
}