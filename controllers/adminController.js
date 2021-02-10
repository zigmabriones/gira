// Require Modules
const MailingList = require('../models/mailinglist');
const Event = require('../models/event');

// Require middleware
const Multer = require('multer');
const AWS = require('aws-sdk');

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
exports.pushToS3 = async (req, res, next) => {
    if (req.files) {
        async function s3Upload(imgpath, imgname, folder, errorHandle) {
            const fileContent = fs.readFileSync(imgpath);
            
            const uploadParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `${folder}/${req.body._id}/${imgname}`,
                Body: fileContent,
                ACL: 'public-read'
            };

            s3.upload(uploadParams, (err, data) => {
                if (err) {
                    console.log(`Error: Event ${errorHandle.file}`);
                    // throw err;
                    if (errorHandle.type == 'new') res.redirect('/admin/event/new');
                    return;
                }
                // console.log(`File uploaded successfully. ${data.Location}`);
            });
            return `https://gira-mediadb.s3.amazonaws.com/${uploadParams.Key}`
        };

        if (res.locals.url.endsWith('event/new')) {
            const fileKeys = Object.keys(req.files);
            for (let i = 0; i < fileKeys.length; i++) {
                const fileKey = fileKeys[i];
                const imagePath = req.files[fileKey][0].path;
                const imageName = req.files[fileKey][0].originalname;
                if (fileKey == 'image0') { req.body.images[0] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                if (fileKey == 'image1') { req.body.images[1] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                if (fileKey == 'image2') { req.body.images[2] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                if (fileKey == 'image3') { req.body.images[3] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
                if (fileKey == 'image4') { req.body.images[4] = await s3Upload(imagePath, imageName, 'events', { type: 'new', file: fileKey }); }
            }
        }

        next();
    } else {
        next();
    }
};

exports.account = (req, res, next) => {
    res.render('admins/dashboard', { title: 'Gira: Cuenta' });
};

exports.mailingListGet = async (req, res, next) => {
    try {
        const mailingList = await MailingList.find();
        res.render('admins/mailing_list', { title: 'Gira: Mailing List', mailingList });
    } catch(error) {
        next(error);
    }
};

exports.newEventGet = (req, res, next) => {
    try {
        const event = new Event();
        res.render('admins/event_crud', { title: 'Gira: Crear Evento', eventId: event._id });
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