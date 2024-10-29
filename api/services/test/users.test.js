const { User } = require('../users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        profile: {
            deleteMany: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const mockPrisma = new PrismaClient();
User.prototype.prisma = mockPrisma;

describe('User Service', () => {
    describe('register', () => {
        test('should register a new user', async () => {
            const newUser = { name: 'Test User', email: 'testuser@example.com', password: 'password123' };

            bcrypt.hash.mockResolvedValue('hashedPassword');
            mockPrisma.user.create.mockResolvedValue({ id: 1, ...newUser, password: 'hashedPassword' });

            const user = new User(newUser.name, newUser.email, newUser.password);
            const createdUser = await user.register();

            expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);
            expect(createdUser).toHaveProperty('name', newUser.name);
            expect(createdUser).toHaveProperty('email', newUser.email);
            expect(createdUser).toHaveProperty('password', 'hashedPassword');
        });
    });

    describe('login', () => {
        test('should login a user and return a token', async () => {
            const mockUser = { id: 1, name: 'Test User', email: 'testuser@example.com', password: 'hashedPassword' };

            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mockToken');
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const user = new User(null, mockUser.email, 'password123');
            const loginResponse = await user.login();

            expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
            expect(loginResponse).toHaveProperty('token', 'mockToken');
            expect(loginResponse.user).toMatchObject({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email
            });
        });

        test('should throw an error if password is incorrect', async () => {
            bcrypt.compare.mockResolvedValue(false);
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'hashedPassword'
            });

            const user = new User(null, 'testuser@example.com', 'wrongPassword');
            await expect(user.login()).rejects.toThrow('Incorrect password');
        });
    });

    describe('getAllData', () => {
        test('should retrieve all users', async () => {
            const mockUsers = [
                { id: 1, name: 'User One', email: 'userone@example.com' },
                { id: 2, name: 'User Two', email: 'usertwo@example.com' }
            ];

            mockPrisma.user.findMany.mockResolvedValue(mockUsers);

            const users = await User.getAllData();

            expect(users).toEqual(mockUsers);
        });
    });

    describe('deleteUser', () => {
        test('should delete a user and their profile', async () => {
            const mockUser = { id: 1, name: 'User to Delete', email: 'delete@example.com' };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.profile.deleteMany.mockResolvedValue({ count: 1 });
            mockPrisma.user.delete.mockResolvedValue(mockUser);

            const deletedUser = await User.deleteUser(1);

            expect(mockPrisma.profile.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
            expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(deletedUser).toEqual(mockUser);
        });
    });
});
