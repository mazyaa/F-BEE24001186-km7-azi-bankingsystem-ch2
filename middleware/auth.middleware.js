const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path : '.env'});

//otorisasi token user ketika sudah login
const authenticateToken  = (req, res, next) => {
    const token  = req.headers['authorization']?.split(' ')[1];
    if (!token){
        return res.status(401).json({
            message : 'Acess denied : no token provided'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) =>{
        if (err){
            return res.status(401).json({
                message : 'invalid token'
            });
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;