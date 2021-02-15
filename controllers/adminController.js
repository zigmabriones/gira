// Require Modules
const MailingList = require('../models/mailinglist');
const Event = require('../models/event');

// Require middleware
const Multer = require('multer');
const AWS = require('aws-sdk');
const Crypto = require('crypto');

// Setup S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
});

// s3.createBucket({ Bucket: process.env.AWS_S3_BUCKET_NAME }, (err, data) => {
//     if (err) console.log(err, err.stack);
//     else console.log('Bucket Created Successfully:', data.Location);
// });

/************************/
/**** Image Handling ****/
/************************/
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
const { callbackify } = require('util');
exports.pushToS3 = async (req, res, next) => {
    if (req.files) {
        
        // Upload to S3
        async function s3Upload(imgpath, imgname, folder, errorHandle) {
            const fileContent = fs.readFileSync(imgpath);

            const imgId = Crypto.randomBytes(4).toString('hex');
            
            const uploadParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `${folder}/${req.body._id || req.params.eventId}/${imgId}-${imgname}`,
                Body: fileContent,
                ACL: 'public-read'
            };

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

        async function s3Delete(key) {
            const deleteParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: key
            };

            s3.deleteObject(deleteParams, err => {
                if (err) {
                    console.log(`Error: Event ${key} deletion`);
                    // throw err;
                    res.redirect(`/admin/eventos/editar/${req.params.eventId}`);
                }
            });
        };
        
        // Handle new events 
        if (res.locals.url.endsWith('eventos/nuevo')) {
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
        } else if (res.locals.url.includes('eventos/editar')) {
            req.body.images = req.body.images[0] == ''
                ? []
                : req.body.images;
            if (req.body.images.length) {
                const fileKeys = Object.keys(req.files);
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

        next();
    } else {
        next();
    }
};

exports.account = async (req, res, next) => {
    try {
        const events = await Event.aggregate([ { $sort: { date: -1 } } ]);
        res.render('admins/dashboard', { title: 'Gira: Cuenta', events });
    } catch(error) {
        next(error);
    }
};

exports.mailingListGet = async (req, res, next) => {
    try {
        const mailingList = await MailingList.find();
        res.render('admins/mailing_list', { title: 'Gira: Mailing List', mailingList });
    } catch(error) {
        next(error);
    }
};

exports.eventCURDGet = async (req, res, next) => {
    try {
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

exports.newEventPost = async (req, res, next) => {
    try {
        req.body.images = req.body.images.filter(image => image != '');
        req.body.videos = req.body.videos.filter(video => video != '');
        const event = new Event(req.body);
        await event.save();
        res.redirect('/admin/account');
    } catch(error) {
        next(error);
    }
};

exports.editEventPost = async (req, res, next) => {
    try {
        req.body.images = req.body.images.filter(image => image != '');
        req.body.videos = req.body.videos.filter(video => video != '');
        await Event.findByIdAndUpdate(req.params.eventId, req.body, { new: true });
        res.redirect(res.locals.url);
    } catch(error) {
        next(error);
    }
};

exports.deleteEventPost = async (req, res, next) => {
    try {
        // Delete S3 Images Folder
        const bucketParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Prefix: `events/${req.body.deleteId}`
        };

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

        await Event.findByIdAndRemove(req.body.deleteId);
        res.redirect('/admin/account');
    } catch(error) {
        next(error);
    }
};