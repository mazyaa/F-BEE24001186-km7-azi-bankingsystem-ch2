const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const imagekit = require('../libs/imagekit');
const multer = require('multer');
const upload = multer(); //midleware



module.exports = {
    storageImage : async (req, res, next) =>{
        try{
            const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

            const { title, description } = (req.body);
            const image = prisma.media.create({
                data : {
                    title,
                    description,
                    url : imageUrl,
                }
            });
            res.status(201).json({
                status: true,
                message: 'Success',
                data: {
                    title,
                    description,
                    url : imageUrl,
                }
            });
            return image;
        }catch(err){
            next(err);
        }
    },
    storageVideo : async (req, res, next) =>{
        try{
            const videoUrl = `${req.protocol}://${req.get('host')}/videos/${req.file.filename}`;

            const { title, description } = req.body;
            const video = await prisma.media.create({
                data : {
                    title,
                    description,
                    url : videoUrl,
                }
            });
            res.status(201).json({
                status: true,
                message: 'Success',
                data: {
                    title,
                    description,
                    url : videoUrl,
                }
            });
            return video;
        }catch(err){
            next(err);
        }
    },
    storageFile : async (req, res, next) =>{
        try{
            const fileUrl = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
    
                const { title, description } = (req.body);
                const file = await prisma.media.create({
                    data : {
                        title,
                        description,
                        url : fileUrl,
                    }
                });
                res.status(201).json({
                    status: true,
                    message: 'Success',
                    data: {
                        title,
                        description,
                        url : fileUrl,
                    }
                });
                return file;
        }catch(err){
            next(err);
        }
    },

    getAll : async (req, res, next) => {
        try{
            const all = await prisma.media.findMany();
            res.status(200).json(all);
        }catch(err){
            next(err);
        }
    },

    getById : async (req, res, next) =>{
        try{
            const mediaId = parseInt(req.params.id, 10);
            const media = await prisma.media.findUnique({
                where : {
                    id : mediaId
                }
            });


            if(!media){
                return res.status(404).json({ message : 'Media Not Found!' });
            }

            res.status(200).json(media);
            return media;
        }catch(err){
            next(err);
        }
    },

    putMedia : [
        upload.none(), 
        async (req, res, next) =>{
        try{
            const mediaId = parseInt(req.params.id, 10);
            const { title, description } = (req.body);

            if (!title || !description) {
                return res.status(400).json({ message: 'Title and description are required!' });
            }

            const media = await prisma.media.findUnique({
                where: { 
                    id: mediaId 
                },
            });
    
            if (!media) {
                return res.status(404).json({ message: 'Media not found!' });
            }

            const updateMedia = await prisma.media.update({
                where : {
                    id : mediaId
                },
                data :{
                    title,
                    description,
                }
            });

            
            res.status(200).json({
                message : 'Update Succes!',
                data : updateMedia
            });   

        }catch(err){
            console.log(err);
            return(next);
        }
    },
],

deleteMedia : async (req, res, next) =>{
    try{
        const mediaId = parseInt(req.params.id, 10);

        const media = await prisma.media.findUnique({
            where: { 
                id: mediaId 
            },
        });

        if (!media) {
            return res.status(404).json({ message: 'Media not found!' });
        }
        const deleteMedia = await prisma.media.delete({
            where : {
                id : mediaId
            }
        });

        return res.status(200).json({
            message : 'Delete Succes!',
            data : deleteMedia
        });

    }catch(err){
        next(err);
    }
},

    
    imagekitUpload : async (req, res) =>{
        try {
            const stringFile = req.file.buffer.toString('base64');
    
            const uploadFile = await imagekit.upload({
                fileName: req.file.originalname,
                file: stringFile
            });
    
            return res.json({
                status: true,
                message: 'succes',
                data: {
                    name: uploadFile.name,
                    url: uploadFile.url,
                    type: uploadFile.fileType
                }
            });
    
        }catch (err){
            throw err;
        }
    }
};
