const util = require("util");
const multer = require("multer");
const  path = require('path');
const maxSize = 2 * 1024 * 1024;

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, app__basedir + "/public/uploads/");
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    },
});

const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

let uploadFile = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {fileSize: maxSize},
}).single("file");

let uploadFiles = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {fileSize: maxSize},
}).fields([
    {
        name: 'logo', maxCount: 1
    }, {
        name: 'banner', maxCount: 1
    }
]);

let uploadFileMiddleware = util.promisify(uploadFile);
let uploadFilesMiddleware = util.promisify(uploadFiles);

module.exports = {
    uploadFileMiddleware,
    uploadFilesMiddleware
};
