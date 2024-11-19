const joi = require('joi');
const router = require('express').Router();
const { User } = require('../../services/users');



//regist
const registerSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(5).required(),
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
        const createdUser = await user.register();

   
        res.status(201).json({
            status: true,
            message: 'User is created and has been sent a notification!',
            data: {
                id: createdUser.id,
                name: createdUser.name,
                email: createdUser.email
            },
        });

    } catch (error) {
        next(error);
        res.status(500).json({
            status: false,
            message: 'Server error',
            error: error.message,
            data: null,
        });
    }
});



//login
const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(5).required(),
});

router.post('/login', async (req, res, next) => {
    try {
        const { value, error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: false,
                message: 'Validation Error',
                error: error.details[0].message,
                data: null
            });
        }

        const user = new User(null, value.email, value.password);
        const loginResponse = await user.login();

        res.status(200).json({
            status: true,
            message: 'Login successful',
            data: {
                token: loginResponse.token,
                user: {
                    name: loginResponse.user.name,
                    email: loginResponse.user.email,
                }
            }
        });
    } catch (error) {
        next(error);
        res.status(400).json({
            status: false,
            message: 'Invalid email or password',
            data: null,
        });
    }
});

//for forgot password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
      const response = await User.forgotPw(email);

      res.status(200).json(response);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Router untuk reset password
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and newPassword are required' });
    }

      const response = await User.resetPw(token, newPassword);
  
      res.status(200).json({ message : 'reset Password Successfully!'});

      return response;
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });



  module.exports = router;