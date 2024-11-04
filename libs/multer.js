const multer = require('multer');
const path = require('path');




const fileName = (req, file, callback) =>{
    const fileName = Date.now() + path.extname(file.originalname);
    callback(null, fileName);
};

const generateStorage = (destination) =>{
    return multer.diskStorage({
        destination : (req, file, callback) =>{
            callback(null, destination);
        },
        filename: fileName
    });
};

module.exports = {
    image : multer({
        storage : generateStorage(path.join(__dirname, '../public/images')),
        fileFilter :  (req, file, callback) =>{
            const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg' ];

            if (allowedMimeTypes.includes(file.mimetype)){
                callback(null, true);
            } else {
                const err = new Error (`only ${allowedMimeTypes.join(', ')} allowed to upload`);
                callback(err, false);
            }
        },
        onError : (err, next) =>{
            next(err);
        }
    }),

    video : multer({
        storage : generateStorage(path.join(__dirname, '../public/videos')),
        fileFilter :  (req, file, callback) =>{
            const allowedMimeTypes2 = ['video/mp4', 'video/x-msvideo', 'video/quicktime' ];

            if (allowedMimeTypes2.includes(file.mimetype)){
                callback(null, true);
            } else {    
                const err = new Error (`only ${allowedMimeTypes2.join(', ')} allowed to upload`);
                callback(err, false);
            }
        },
        onError : (err, next) =>{
            next(err);
        }
    }),

    file : multer({
        storage : generateStorage(path.join(__dirname, '../public/files')),
        fileFilter :  (req, file, callback) =>{
            const allowedMimeTypes3 = [ 'application/pdf' ];

            if (allowedMimeTypes3.includes(file.mimetype)){
                callback(null, true);
            } else {
                const err = new Error (`only ${allowedMimeTypes3.join(', ')} allowed to upload`);
                callback(err, false);
            }
        },
        onError : (err, next) =>{
            next(err);
        }
    })
};

