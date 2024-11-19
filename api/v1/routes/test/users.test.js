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