const router = require('express').Router();
const { User } = require('../../services/users');

<<<<<<< HEAD
//regist
const registerSchema = joi.object({
    name: joi.string().min(3).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
});

router.post('/register', async (req, res, next) => {
    try {
      const { value, error } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: false,
          message: 'Validation Error',
          error: error.details[0].message,
          data: null
        });
      }
  
      const user = new User(value.name, value.email, value.password);
      await user.register(); 
  
      res.status(201).json({
        status: true,
        message: 'User created successfully',
        data: {
          id: user.getID(),
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
        res.status(500).json({ message: err.message });
    }
  });
  


//login
const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(5).required(),
});

router.post('/login', async (req, res) => {
    try {
        const { value, error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation Error",
                error: error.details[0].message,
                data: null
            });
        }

        const user = new User(null, value.email, value.password);
        const loginResponse = await user.login();



        res.status(200).json({
            status: true,
            message: "Login successful",
            data: {
                token: loginResponse.token,
                user: {
                    name: loginResponse.user.name,
                    email: loginResponse.user.email,
                }
            }
        });
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return res.status(400).json({
                status: false,
                message: 'Invalid email or password',
                data: null
            });
        }

        console.log('Server error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

=======
>>>>>>> ba5e30f1a21ec73d1201cf479c9f475c5559bf2e

// GET all data ftom table User
router.get('/', async (req, res, next) =>{
    try{
        const users = await User.getAllData();  
        res.status(200).json(users);
    } catch(error){
<<<<<<< HEAD
=======
        next(error);
>>>>>>> ba5e30f1a21ec73d1201cf479c9f475c5559bf2e
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
<<<<<<< HEAD
=======
        next(error);
>>>>>>> ba5e30f1a21ec73d1201cf479c9f475c5559bf2e
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
<<<<<<< HEAD
=======
        next(error);
>>>>>>> ba5e30f1a21ec73d1201cf479c9f475c5559bf2e
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
<<<<<<< HEAD
=======
            next(error);
>>>>>>> ba5e30f1a21ec73d1201cf479c9f475c5559bf2e
            res.status(500).json({
                message: 'Server error'
            });
        }
    }
});


module.exports = router;
