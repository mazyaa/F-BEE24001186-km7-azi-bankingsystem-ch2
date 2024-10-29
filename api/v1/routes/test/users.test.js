const request = require('supertest');
const express = require('express');
const usersRouter = require('../users');
const { User } = require('../../../services/users');

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

jest.mock('../../../services/users');

describe('User Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /users/register', () => {
        test('should create a new user and return 201', async () => {
            const mockUser = { name: 'John Doe', email: 'john@example.com', password: 'password' };
            User.mockImplementation(() => {
                return {
                    register: jest.fn().mockResolvedValue(true),
                    getID: jest.fn().mockReturnValue(1),
                    name: mockUser.name,
                    email: mockUser.email,
                };
            });

            const response = await request(app).post('/users/register').send(mockUser);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                status: true,
                message: 'User created successfully',
                data: {
                    id: 1,
                    name: mockUser.name,
                    email: mockUser.email,
                },
            });
        });

        test('should return 400 for validation error', async () => {
            const response = await request(app).post('/users/register').send({ email: 'john@example.com' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation Error');
        });
    });

    describe('POST /users/login', () => {
        test('should login user and return 200', async () => {
            const mockLoginData = { email: 'john@example.com', password: 'password' };
            User.mockImplementation(() => {
                return {
                    login: jest.fn().mockResolvedValue({ token: 'abcd1234', user: { name: 'John Doe', email: mockLoginData.email } }),
                };
            });

            const response = await request(app).post('/users/login').send(mockLoginData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: true,
                message: 'Login successful',
                data: {
                    token: 'abcd1234',
                    user: {
                        name: 'John Doe',
                        email: mockLoginData.email,
                    },
                },
            });
        });

        test('should return 400 for validation error', async () => {
            const response = await request(app).post('/users/login').send({ email: 'john@example.com' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation Error');
        });
    });

    describe('GET /users', () => {
        test('should return all users and 200', async () => {
            const mockUsers = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
            User.getAllData.mockResolvedValue(mockUsers);

            const response = await request(app).get('/users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUsers);
        });
    });

    describe('GET /users/:userId', () => {
        test('should return user by ID and 200', async () => {
            const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
            User.getById.mockResolvedValue(mockUser);

            const response = await request(app).get('/users/1');

            expect(response.status).toBe(202);
            expect(response.body).toEqual(mockUser);
        });

        test('should return 404 if user not found', async () => {
            User.getById.mockResolvedValue(null);

            const response = await request(app).get('/users/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found!!!');
        });
    });

    describe('PUT /users/:userId', () => {
        test('should update user and return 200', async () => {
            const mockUpdateData = { name: 'John Doe Updated', email: 'john_updated@example.com', password: 'newpassword' };
            User.updateUser.mockResolvedValue(mockUpdateData);

            const response = await request(app).put('/users/1').send(mockUpdateData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Update succesfuly!');
            expect(response.body.user).toEqual(mockUpdateData);
        });
    });

    describe('DELETE /users/:userId', () => {
        test('should delete user and return 200', async () => {
            User.deleteUser.mockResolvedValue();

            const response = await request(app).delete('/users/1');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('user with id : 1, deleted succesfully!');
        });

        test('should return 404 if user not found', async () => {
            User.deleteUser.mockImplementation(() => {
                throw new Error('not found');
            });

            const response = await request(app).delete('/users/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('not found');
        });
    });
});
