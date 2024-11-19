const router = require('express').Router();
const { User } = require('../../services/users');


// GET all data ftom table User
router.get('/', async (req, res, next) =>{
    try{
        const users = await User.getAllData();  
        res.status(200).json(users);
    } catch(error){
        next(error);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// GET data User by id
router.get('/:userId', async (req, res, next) =>{
    try{
        const userId = parseInt(req.params.userId, 10);
        const user = await User.getById(userId);
        if(!user){
            return res.status(404).json({ message: 'User not found!!!'});
        }
        res.status(202).json(user);
    } catch (error){
        next(error);
        res.status(500).json({
            message: 'Server error'
        });
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
        res.status(500).json({
            message: 'Server error'
        });
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
            res.status(500).json({
                message: 'Server error'
            });
        }
    }
});


module.exports = router;
