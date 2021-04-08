/**
 * adminController.js is the main driver for all the routes within "routes/admins.js", prefixed by "/admin".
 * @module adminController
 * @author Emilio Popovits Blake
 */

// Require Modules
const MailingList = require('../models/mailinglist');
const Event = require('../models/event');
const User = require('../models/user');

// Require middleware
const Multer = require('multer');
const AWS = require('aws-sdk');
const Crypto = require('crypto');

// Modules for JSDoc
const e = require('express');

// Setup S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
});

// Create S3 Bucket
// s3.createBucket({ Bucket: process.env.AWS_S3_BUCKET_NAME }, (err, data) => {
//     if (err) console.log(err, err.stack);
//     else console.log('Bucket Created Successfully:', data.Location);
// });

/******************************************/
/************ Image Handling **************/
/******************************************/
// Setup Multer
const storage = Multer.diskStorage({}); // No disk storage
const upload = Multer({ storage });
exports.upload = upload.fields([
    { name: 'image0', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]);

const fs = require('fs');
/**
 * Pushes uploaded images to S3.
 * 
 * @param {e.Request<{eventId: String}, {}, Event.Event, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.pushToS3 = async (req, res, next) => {
    // If files found, proceed to push to S3. Else, proceed to next middleware function
    if (req.files) {

        /**
         * Upload image to S3 bucket.
         * 
         * @async
         * @function
         * @param {String} imgpath - Local image path 
         * @param {String} imgname - Local image name
         * @param {String} folder - S3 Bucket folder
         * @param {object} errorHandle - Error handling options
         * @returns {String} S3 image key
         */
        async function s3Upload(imgpath, imgname, folder, errorHandle) {
            // Read local file content synchronously into fileContent
            const fileContent = fs.readFileSync(imgpath);

            // Generate a random image id
            const imgId = Crypto.randomBytes(4).toString('hex');
            
            // Setup image upload parameters for S3 upload
            const uploadParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `${folder}/${req.body._id || req.params.eventId}/${imgId}-${imgname}`,
                Body: fileContent,
                ACL: 'public-read'
            };

            // Upload image to S3 Bucket and return key
            // If there's an error, and errorHandle.type is 'new', redirect to '/admin/eventos/nuevo'. Else, redirect to '/admin/eventos/editar/:eventId'
            s3.upload(uploadParams, (err, data) => {
                if (err) {
                    console.log(`Error: Event ${errorHandle.file}`);
                    // throw err;
                    if (errorHandle.type == 'new') res.redirect('/admin/eventos/nuevo');
                    else if (errorHandle.type == 'edit') res.redirect(`/admin/eventos/editar/${req.params.eventId}`);
                    return;
                }
                // console.log(`File uploaded successfully. ${data.Location}`);
            });
            return uploadParams.Key;
        };

        /**
         * Delete image from S3 bucket
         * 
         * @param {String} key - S3 image key 
         */
        async function s3Delete(key) {
            // Setup image delete parameters for S3 delete
            const deleteParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: key
            };

            // Delete image from S3 bucket. If there's errors, log image key and redirect to event edit page.
            s3.deleteObject(deleteParams, err => {
                if (err) {
                    console.log(`Error: Event ${key} deletion`);
                    // throw err;
                    res.redirect(`/admin/eventos/editar/${req.params.eventId}`);
                }
            });
        };
        
        // Handle new events' images
        if (res.locals.url.endsWith('eventos/nuevo')) {
            const fileKeys = Object.keys(req.files);
            // For every image in req.files, upload each one and retain position in event.images array
            for (let i = 0; i < fileKeys.length; i++) {
                const fileKey = fileKeys[i];
                const imagePath = req.files[fileKey][0].path;
                const imageName = req.files[fileKey][0].originalname;
                if (fileKey == 'image0') { req.body.images[0] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                else if (fileKey == 'image1') { req.body.images[1] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                else if (fileKey == 'image2') { req.body.images[2] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                else if (fileKey == 'image3') { req.body.images[3] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                else if (fileKey == 'image4') { req.body.images[4] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
            }
        } else if (res.locals.url.includes('eventos/editar')) { // Handle existing events' images
            req.body.images = req.body.images[0] == ''
                ? []
                : req.body.images;
            // If req.body.images exists, replace images by deleting and then uploading. Else, only upload images.
            if (req.body.images.length) {
                const fileKeys = Object.keys(req.files);
                // For every image in req.files, upload each one and retain position in event.images array
                for (let i = 0; i < fileKeys.length; i++) {
                    const fileKey = fileKeys[i];
                    const imagePath = req.files[fileKey][0].path;
                    const imageName = req.files[fileKey][0].originalname;
                    if (fileKey == 'image0') { if(req.body.images[0]) await s3Delete(req.body.images[0]); req.body.images[0] = await s3Upload(imagePath, imageName, 'events', { type: 'edit', file: fileKey }); }
                    else if (fileKey == 'image1') { if(req.body.images[1]) await s3Delete(req.body.images[1]); req.body.images[1] = await s3Upload(imagePath, imageName, 'events', { type: 'edit', file: fileKey }); }
                    else if (fileKey == 'image2') { if(req.body.images[2]) await s3Delete(req.body.images[2]); req.body.images[2] = await s3Upload(imagePath, imageName, 'events', { type: 'edit', file: fileKey }); }
                    else if (fileKey == 'image3') { if(req.body.images[3]) await s3Delete(req.body.images[3]); req.body.images[3] = await s3Upload(imagePath, imageName, 'events', { type: 'edit', file: fileKey }); }
                    else if (fileKey == 'image4') { if(req.body.images[4]) await s3Delete(req.body.images[4]); req.body.images[4] = await s3Upload(imagePath, imageName, 'events', { type: 'edit', file: fileKey }); }
                }
            } else {
                const fileKeys = Object.keys(req.files);
                for (let i = 0; i < fileKeys.length; i++) {
                    const fileKey = fileKeys[i];
                    const imagePath = req.files[fileKey][0].path;
                    const imageName = req.files[fileKey][0].originalname;
                    if (fileKey == 'image0') { req.body.images[0] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                    else if (fileKey == 'image1') { req.body.images[1] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                    else if (fileKey == 'image2') { req.body.images[2] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                    else if (fileKey == 'image3') { req.body.images[3] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                    else if (fileKey == 'image4') { req.body.images[4] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                }
            }
        }

        // Proceed to next middleware function
        next();
    } else {
        next();
    }
};

/******************************************/
/************ Authentication **************/
/******************************************/
/**
 * Verifies if user is authenticated and redirects to appropriate route. Else, returns to '/login'. If user is not verified, renders verification page.
 * 
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.isAuth = (req, res, next) => {
    // If user is not authenticated, return to '/login'
    if (!req.isAuthenticated()) return res.redirect('/login');

    // If user is not verified, render verification page
    if (!req.user.verified) return res.render('users/verify', { title: 'Gira: Verifica tu Cuenta', verified: req.user.verified });

    // If user is dev or admin, proceed to next middleware function. Else, redirect to '/usuarios'
    req.user.permissions == 'dev' || req.user.permissions == 'admin'
        ? next()
        : res.redirect('/usuarios');
};

/******************************************/
/************* Mailing List ***************/
/******************************************/
/**
 * Queries for all mailing list entries and renders mailing list admin page.
 * 
 * @async
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 * 
 * @todo Add mailing list functionality
 */
exports.mailingListGet = async (req, res, next) => {
    try {
        // Query for all documents in mailing list
        const mailingList = await MailingList.find();
        res.render('admins/mailing_list', { title: 'Gira: Mailing List', mailingList });
    } catch(error) {
        next(error);
    }
};

/******************************************/
/*********** Event Management *************/
/******************************************/
/**
 * Queries for all events and renders event management admin page.
 * 
 * @async
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.eventsGet = async (req, res, next) => {
    try {
        // Query for all events, sorted descending by date
        const events = await Event.aggregate([{ $sort: { date: -1 } }]);
        res.render('admins/event_manage', { title: 'Gira: Eventos', events });
    } catch(error) {
        next(error);
    }
};

/**
 * Renders event CRUD page.
 * 
 * @async
 * @param {e.Request<{eventId: String}, {}, {}, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.eventCURDGet = async (req, res, next) => {
    try {
        // If admin is creating new event, generate an event id and render event CRUD with it. Else, find the event and render event CRUD with it.
        if (res.locals.url.endsWith('/nuevo')) {
            const event = new Event();
            res.render('admins/event_crud', { title: 'Gira: Crear Evento', eventId: event._id });
        } else {
            const event = await Event.findOne({ _id: req.params.eventId });
            res.render('admins/event_crud', { title: 'Gira: Editar Evento', event });
        }
    } catch(error) {
        next(error);
    }
};

/**
 * Saves new event to database, or returns if validation errors occurred.
 * BUG: This middleware will create an S3 bucket with images even though there was a validation error.
 * 
 * @async
 * @param {Array<object>} validationErrors - Validation errors returned by validation middleware
 * @param {e.Request<{}, {}, Event.Event, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.newEventPost = async (validationErrors, req, res, next) => {
    try {
        // If any validation errors occurred, return with validation errors
        if (validationErrors.length) return res.render('admins/event_crud', { title: 'Gira: Crear Evento', errors: validationErrors });

        // Remove any gaps between events and videos (placement)
        req.body.images = req.body.images.filter(image => image != '');
        req.body.videos = req.body.videos.filter(video => video != '');

        // Create a new event object and save it to the database
        const event = new Event(req.body);
        await event.save();

        res.redirect('/admin/eventos');
    } catch(error) {
        next(error);
    }
};

/**
 * Updates event information, or returns if validation errors occurred.
 * May be inefficient, as it queries for document, then updates document locally, and finally queries document update.
 * 
 * @async
 * @param {Array<object>} validationErrors - Validation errors returned by validation middleware
 * @param {e.Request<{eventId: String}, {}, Event.Event, {}>} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.editEventPost = async (validationErrors, req, res, next) => {
    try {
        // If any validation errors occurred, return with validation errors
        if (validationErrors.length) {
            const event = await Event.findOne({ _id: req.params.eventId });
            return res.render('admins/event_crud', { title: 'Gira: Editar Evento', event, errors: validationErrors });
        }

        // Query for event in database by id
        const event = await Event.findOne({ _id: req.params.eventId });

        // If images were uploaded, replace current event images with uploaded images (positional)
        if (req.body.images) {
            req.body.images.forEach((image, idx) => {
                if (image != undefined) event.images.splice(idx, 0, image);
            });
        }
        
        // Remove any gaps between events and videos (placement)
        event.images = event.images.filter(image => image != '' && image != undefined);
        event.videos = req.body.videos.filter(video => video != '');

        event.name = req.body.name;
        event.date = req.body.date;
        event.exhibitor = req.body.exhibitor;
        event.description = req.body.description;

        // Query for event update
        await Event.findByIdAndUpdate(req.params.eventId, event, { new: true });
        
        res.redirect(res.locals.url);
    } catch(error) {
        next(error);
    }
};

/**
 * Deletes event from database.
 * 
 * @async
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.deleteEventPost = async (req, res, next) => {
    try {
        // Delete S3 Images Folder
        const bucketParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Prefix: `events/${req.body.deleteId}`
        };

        // Delete all images from event's S3 bucket
        s3.listObjects(bucketParams, (err, data) => {
            if (err) throw err;
            if (data.Contents.length == 0) return;

            const deleteParams = { Bucket: bucketParams.Bucket };
            deleteParams.Delete = { Objects: [] };

            data.Contents.forEach(file => {
                deleteParams.Delete.Objects.push({ Key: file.Key });
            });

            s3.deleteObjects(deleteParams, err => {
                if (err) throw err;
            });
        });

        // Delete event from database
        await Event.findByIdAndRemove(req.body.deleteId);
        
        res.redirect('/admin/eventos');
    } catch(error) {
        next(error);
    }
};

/******************************************/
/************ User Management *************/
/******************************************/
/**
 * Query for all users and render them in user_manage Pug view, redirect to '/admin' if req.user.permissions is not 'dev'.
 * 
 * @async
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.usersGet = async (req, res, next) => {
    try {
        // If user does not have dev permissions, redirect to '/admin'
        if (req.user.permissions != 'dev') return res.redirect('/admin');

        // Query for all users from database
        const users = await User.find();

        res.render('admins/user_manage', { title: 'Gira: Usuarios', users });
    } catch(error) {
        next(error);
    }
};

/**
 * Update all users that were updated in user_manage Pug view, or redirect to '/admin' if user does not have dev permissions.
 * 
 * @async
 * @param {e.Request} req - Express Request Object
 * @param {e.Response} res - Express Response Object
 * @param {e.NextFunction} next - Express Next Function
 */
exports.usersPost = async (req, res, next) => {
    try {
        // If user does not have dev permissions, redirect to '/admin'
        if (req.user.permissions != 'dev') return res.redirect('/admin');
        
        // For every user in req.body, if user was modified, create an update query (promise) and save to promises array
        const promises = [];
        for(const userId in req.body) {
            if (req.body[userId] != '' && req.body[userId] != undefined && req.body[userId] != null){
                const query = User.findByIdAndUpdate(userId, { permissions: req.body[userId] }, { new: true });
                promises.push(query);
            }
        }

        // Resolve all update query promises
        await Promise.all(promises);

        res.redirect(res.locals.url);
    } catch(error) {
        next(error);
    }
};
