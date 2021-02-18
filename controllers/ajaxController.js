// Require Models
const Event = require('../models/event');
const MailingList = require('../models/mailinglist');

// Require Middleware
const AWS = require('aws-sdk');

// Setup S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
});

exports.ctaRegister = async (validationErrors, req, res, next) => {
    try {
        if (validationErrors.length) {
            res.status(409).send(validationErrors);
            return;
        }
        const registrant = new MailingList(req.body);
        await registrant.save()
        res.status(201).send(registrant);
    } catch (error) {
        next(error);
    }
};

exports.deleteEventImage = async (req, res, next) => {
    try {
        const id = req.body.id;
        const key = req.body.key;

        await Event.findByIdAndUpdate(id, { $pull: { images: key } }, { new: true });

        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        };

        s3.deleteObject(deleteParams, err => {
            if (err) {
                throw err;
            } else {
                res.status(200).send('Success!');
            }
        });

    } catch (error) {
        console.log(error)
        next(error);
    }
}