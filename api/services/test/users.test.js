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


beforeAll(() => {
    // eslint-disable-next-line no-undef
    global.io = {
        emit: jest.fn(),
    };
});

describe('User Service', () => {
    describe('register', () => {
        test('should register a new user', async () => {
            const newUser = { name: 'Test User', email: 'testuser@example.com', password: 'password123' };
<<<<<<< HEAD

            bcrypt.hash.mockResolvedValue('hashedPassword');
            mockPrisma.user.findUnique.mockResolvedValue(null); // Simulate no existing user
            mockPrisma.user.create.mockResolvedValue({ id: 1, ...newUser, password: 'hashedPassword' });

=======
    
            bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
            mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null); // Simulate no existing user
            mockPrisma.user.create = jest.fn().mockResolvedValue({ id: 1, ...newUser, password: 'hashedPassword' });
    
>>>>>>> ba5e30f1a21ec73d1201cf479c9f475c5559bf2e
            const user = new User(newUser.name, newUser.email, newUser.password);
            const createdUser = await user.register();
    
            expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: newUser.email } });
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: { name: newUser.name, email: newUser.email, password: 'hashedPassword' },
            });
            expect(createdUser).toEqual({ id: 1, ...newUser, password: 'hashedPassword' });
            // eslint-disable-next-line no-undef
            expect(global.io.emit).toHaveBeenCalledWith('notification', `Halo ${newUser.name}!, Welcome!`);
        });
    
        test('should throw an error if user already exists', async () => {
            const existingUser = { id: 1, name: 'Test User', email: 'testuser@example.com', password: 'hashedPassword' };
            
            mockPrisma.user.findUnique = jest.fn().mockResolvedValue(existingUser); 
    
            const user = new User(existingUser.name, existingUser.email, 'password123');
            await expect(user.register()).rejects.toThrow('User already exists');
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: existingUser.email } });
        });
    
        test('should throw an error if hashing password fails', async () => {
            const newUser = { name: 'Test User', email: 'testuser@example.com', password: 'password123' };
    
            bcrypt.hash = jest.fn().mockRejectedValue(new Error('Hashing error'));
            mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null); 
    
            const user = new User(newUser.name, newUser.email, newUser.password);
            await expect(user.register()).rejects.toThrow('Hashing error');
            expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);
        });

        test('should throw an error if user already exists', async () => {
            const existingUser = { id: 1, name: 'Test User', email: 'testuser@example.com', password: 'hashedPassword' };
            mockPrisma.user.findUnique.mockResolvedValue(existingUser); // Simulate existing user

            const user = new User(existingUser.name, existingUser.email, 'password123');
            await expect(user.register()).rejects.toThrow('User already exists');
        });

        test('should throw an error if hashing password fails', async () => {
            const newUser = { name: 'Test User', email: 'testuser@example.com', password: 'password123' };

            bcrypt.hash.mockRejectedValue(new Error('Hashing error'));
            mockPrisma.user.findUnique.mockResolvedValue(null); // Simulate no existing user

            const user = new User(newUser.name, newUser.email, newUser.password);
            await expect(user.register()).rejects.toThrow('Hashing error');
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

        test('should throw an error if user does not exist', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const user = new User(null, 'nonexistent@example.com', 'password123');
            await expect(user.login()).rejects.toThrow('User not found');
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

        test('should throw an error if retrieval fails', async () => {
            mockPrisma.user.findMany.mockImplementation(() => {
                throw new Error('Internal server error');
            });

            await expect(User.getAllData()).rejects.toThrow('Internal server error');
        });
<<<<<<< HEAD
    });
    

    describe('updateUser', () => {
        test('should update a user successfully', async () => {
            const userId = 1;
            const updateData = { name: 'Updated User', email: 'updated@example.com', password: 'newPassword' };

            mockPrisma.user.findUnique.mockResolvedValue({ id: userId, ...updateData });
            bcrypt.hash.mockResolvedValue('hashedNewPassword');
            mockPrisma.user.update.mockResolvedValue({ ...updateData, password: 'hashedNewPassword' });

            const updatedUser = await User.updateUser(userId, updateData);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { name: updateData.name, email: updateData.email, password: 'hashedNewPassword' },
            });
            expect(updatedUser).toEqual({ ...updateData, password: 'hashedNewPassword' });
        });

        test('should throw an error if user does not exist', async () => {
            const userId = 1;
            const updateData = { name: 'Updated User', email: 'updated@example.com', password: 'newPassword' };

            mockPrisma.user.findUnique.mockResolvedValue(null); 

            await expect(User.updateUser(userId, updateData)).rejects.toThrow('User not found');
        });
=======
>>>>>>> ba5e30f1a21ec73d1201cf479c9f475c5559bf2e
    });
    

    describe('updateUser', () => {
        test('should update a user successfully', async () => {
            const userId = 1;
            const updateData = { name: 'Updated User', email: 'updated@example.com', password: 'newPassword' };
    
            mockPrisma.user.findUnique = jest.fn().mockResolvedValue({ id: userId, ...updateData });
            bcrypt.hash = jest.fn().mockResolvedValue('hashedNewPassword');
            mockPrisma.user.update = jest.fn().mockResolvedValue({ ...updateData, password: 'hashedNewPassword' });
    
            const updatedUser = await User.updateUser(userId, updateData);
    
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { name: updateData.name, email: updateData.email, password: 'hashedNewPassword' },
            });
            expect(updatedUser).toEqual({ ...updateData, password: 'hashedNewPassword' });
        });
    
        test('should throw an error if user does not exist', async () => {
            const userId = 1;
            const updateData = { name: 'Updated User', email: 'updated@example.com', password: 'newPassword' };
    
            mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);
    
            await expect(User.updateUser(userId, updateData)).rejects.toThrow('User not found');
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
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

        test('should throw an error if user does not exist', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null); 

            await expect(User.deleteUser(1)).rejects.toThrow('User not found');
        });

        test('should throw an error if user deletion fails', async () => {
            const mockUser = { id: 1, name: 'User to Delete', email: 'delete@example.com' };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.profile.deleteMany.mockResolvedValue({ count: 1 });
            mockPrisma.user.delete.mockImplementation(() => {
                throw new Error('Deletion failed');
            });

            await expect(User.deleteUser(1)).rejects.toThrow('Deletion failed');
        });
    });
});