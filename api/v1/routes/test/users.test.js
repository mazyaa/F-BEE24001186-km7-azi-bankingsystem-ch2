const request = require('supertest');
const express = require('express');
const router = require('../../routes/users'); 
const { User } = require('../../../services/users'); 

jest.mock('../../../services/users'); 

const app = express();
app.use(express.json());
app.use('/users', router);


let server;

beforeAll(() => {
  server = app.listen(3000);
});

afterAll((done) => {
  server.close(done);
});

describe('User Routes', () => {
  const sampleUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'securePassword123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe('POST /users/register', () => {
    it('should register a new user', async () => {
        User.prototype.register = jest.fn().mockResolvedValue({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashedPassword', 
        });
        User.prototype.getID = jest.fn().mockReturnValue(1);

        const res = await request(server)
            .post('/users/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'securePassword123',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            status: true,
            message: 'User created successfully',
            data: {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
            },
        });
    });

    it('should return validation error for invalid input', async () => {
        const res = await request(server)
            .post('/users/register')
            .send({
                name: '', 
                email: 'invalid-email', 
                password: '', 
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            status: false,
            message: 'Validation Error',
            error: expect.any(String),
            data: null, 
        });
    });




    it('should handle server error on registration', async () => {
      User.prototype.register = jest.fn().mockRejectedValue(new Error('Server error'));

      const res = await request(server) 
        .post('/users/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: 'securePassword123',
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });



  describe('POST /users/login', () => {
    const sampleUser = { email: 'test@example.com', password: 'password123', name: 'Test User' };

    it('should login a user with valid credentials', async () => {
        const loginResponse = {
            token: 'fake-jwt-token',
            user: sampleUser,
        };

        User.prototype.login = jest.fn().mockResolvedValue(loginResponse);

        const res = await request(app)
            .post('/users/login')
            .send({
                email: sampleUser.email,
                password: sampleUser.password,
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Login successful');
        expect(res.body.data.token).toBe('fake-jwt-token');
        expect(res.body.data.user.email).toBe(sampleUser.email);
        expect(res.body.data.user.name).toBe(sampleUser.name);
    });

   
    it('should return error for invalid credentials', async () => {
        User.prototype.login = jest.fn().mockRejectedValue(new Error('Invalid credentials'));

        const res = await request(app)
            .post('/users/login')
            .send({
                email: sampleUser.email,
                password: 'wrongpassword',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid email or password');
        expect(res.body.data).toBeNull();
    });
});


  describe('GET /users', () => {
    it('should get all users', async () => {
      User.getAllData = jest.fn().mockResolvedValue([sampleUser]);

      const res = await request(app).get('/users');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([sampleUser]);
    });

    it('should handle server error on getting all users', async () => {
      User.getAllData = jest.fn().mockRejectedValue(new Error('Server error'));

      const res = await request(app).get('/users');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('GET /users/:userId', () => {
    it('should get a user by ID', async () => {
      User.getById = jest.fn().mockResolvedValue(sampleUser);

      const res = await request(app).get('/users/1');

      expect(res.statusCode).toBe(202);
      expect(res.body).toEqual(sampleUser);
    });

    it('should return 404 if user not found', async () => {
      User.getById = jest.fn().mockResolvedValue(null);

      const res = await request(app).get('/users/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found!!!');
    });

    it('should handle server error on getting user by ID', async () => {
      User.getById = jest.fn().mockRejectedValue(new Error('Server error'));

      const res = await request(app).get('/users/1');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('PUT /users/:userId', () => {
    it('should update a user by ID', async () => {
      User.updateUser = jest.fn().mockResolvedValue({
        ...sampleUser,
        name: 'Updated User',
      });

      const res = await request(app)
        .put('/users/1')
        .send({
          name: 'Updated User',
          email: sampleUser.email,
          password: sampleUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Update succesfuly!');
      expect(res.body.user.name).toBe('Updated User');
    });

    it('should handle server error on updating user', async () => {
      User.updateUser = jest.fn().mockRejectedValue(new Error('Server error'));

      const res = await request(app)
        .put('/users/1')
        .send({
          name: 'Updated User',
          email: sampleUser.email,
          password: sampleUser.password,
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('DELETE /users/:userId', () => {
    it('should delete a user by ID', async () => {
      User.deleteUser = jest.fn().mockResolvedValue();

      const res = await request(app).delete('/users/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('user with id : 1, deleted succesfully!');
    });

    it('should return 404 if user to delete is not found', async () => {
      User.deleteUser = jest.fn().mockRejectedValue(new Error('User not found'));

      const res = await request(app).delete('/users/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should handle server error on deleting user', async () => {
      User.deleteUser = jest.fn().mockRejectedValue(new Error('Server error'));

      const res = await request(app).delete('/users/1');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });
});