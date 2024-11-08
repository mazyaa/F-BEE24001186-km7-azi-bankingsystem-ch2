const router = require('express').Router();
const storage = require('../../../libs/multer');
const { 
    storageImage, 
    storageVideo, 
    storageFile, 
    imagekitUpload, 
    getAll,
    getById,
    putMedia,
    deleteMedia,

} = require('../../../controllers/media.controllers');


router.post('/images', storage.image.single('image'), storageImage);
router.post('/videos', storage.video.single('video'), storageVideo);
router.post('/files', storage.file.single('file'), storageFile);

//get media
router.get('/media', getAll);
router.get('/media/:id', getById);

//put media
router.put('/media/:id', putMedia);

//delete media
router.delete('/media/:id', deleteMedia);

const multer = require('multer')();
router.post('/imagekit', multer.single('image'), imagekitUpload);
router.post('/videokit', multer.single('video'), imagekitUpload);
router.post('/filekit', multer.single('file'), imagekitUpload);

module.exports = router;