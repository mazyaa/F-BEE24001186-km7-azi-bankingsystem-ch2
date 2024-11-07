const authenticateToken = require('../auth.middleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it('should call next if token is valid', () => {
        req.headers['authorization'] = 'Bearer validtoken';
        jwt.verify.mockImplementation((token, secret, callback) => callback(null, { userId: 1 }));

        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
        req.headers['authorization'] = 'Bearer invalidtoken';
        jwt.verify.mockImplementation((token, secret, callback) => callback(new Error('invalid token'), null));

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'invalid token' });
    });

    it('should return 401 if no token is provided', () => {
        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Acess denied : no token provided' });
    });
});
