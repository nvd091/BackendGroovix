const multer = require('multer');
const fs = require('fs-extra');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        fs.mkdirsSync("./photo");
        fs.mkdirsSync("./audio");
        fs.mkdirsSync("./lyrics");

        const fileType = file.mimetype.split('/')[0];
        let uploadPath;

        if (fileType === 'image') {
            uploadPath = './photo';
        } else if (fileType === 'audio') {
            uploadPath = './audio';
        } else if (fileType === 'text') {
            uploadPath = './lyrics';
        } else {
            uploadPath = './other';
            fs.mkdirsSync("./other");
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const userId = req.user ? req.user._id : 'unknownUser';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = file.originalname.replace(/\s+/g, '_');
        const newFilename = `${userId}-${uniqueSuffix}-${originalName}`;
        cb(null, newFilename);
        // cb(null, file.originalname);
    }
});

exports.upload = multer({ storage: storage });
