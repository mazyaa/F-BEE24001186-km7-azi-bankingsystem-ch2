const joi = require('joi');
const router = require('express').Router();
const { User } = require('../../services/users');
const { Prisma } = require('@prisma/client');



const schema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(10).required(),
});


// INSERT data on table User
router.post('/', async (req, res, next) => {
    try {
        const { value, error } = schema.validate(req.body);
        if (error) {
            next(error);
        }

        const user = new User(value.name, value.email, value.password);
        await user.register();

        res.status(201).json({
            id: user.getID(),
            name: user.name,
            email: user.email,
            password: user.getPassword(),
        });
    } catch (error) {
        next(error);
    }
});

// GET all data ftom table User
router.get('/', async (req, res, next) =>{
    try{
        const users = await User.getAllData();  
        res.status(200).json(users);
    } catch(error){
        next(error);
    }
});

// GET data User by id
router.get('/:userId', async (req, res, next) =>{
    try{
        const userId = parseInt(req.params.userId, 10)
        const user = await User.getById(userId);
        if(!user){
            return res.status(404).json({ message: 'User not found!!!'})
        }
        res.status(202).json(user)
    } catch (error){
        next(error);
    }
});



// update data user 
router.put('/:userId', async(req, res, next) =>{
    try{
        const userId = parseInt(req.params.userId, 10);
        const { name, email, password } = req.body;

        
        const updateUser = await User.updateUser(userId, { name, email, password } );
        res.status(200).json({
            message : 'Update succesfuly!',
            user : updateUser
        });

    } catch (error){
        next(error);
    }

});


// delete data user 
router.delete('/:userId', async (req, res, next) =>{
    try{
        const userId = parseInt(req.params.userId, 10);
        await User.deleteUser(userId);
        res.status(200).json({
            message : `user with id : ${userId}, deleted succesfully!`
        });
    } catch (error){
        if (error.message.includes('not found')) {
            res.status(404).json({
                message: error.message
            });
        } else {
            next(error);
        }
    }
});


module.exports = router;
