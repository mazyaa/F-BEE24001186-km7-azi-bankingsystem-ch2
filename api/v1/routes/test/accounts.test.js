const request = require('supertest');
const express = require('express');
const accountsRouter = require('../accounts');
const { Account } = require('../../../services/accounts');

jest.mock('../../../../middleware/auth.middleware', () => jest.fn((req, res, next) => next()));
jest.mock('../../../services/accounts', () => ({
    Account: {
        createAccount: jest.fn(),
        getAllAccounts: jest.fn(),
        getById: jest.fn(),
        deposit: jest.fn(),
        withdraw: jest.fn(),
    },
}));

const app = express();
app.use(express.json());
app.use('/api/accounts', accountsRouter);

describe('Accounts API', () => {
    describe('POST /', () => {
        test('should create a new account and return it', async () => {
            const newAccount = { bankName: 'Bank A', bankAccountNumber: '123456789', balance: 1000, userId: 1 };
            Account.createAccount = jest.fn().mockResolvedValue(newAccount);
    
            const response = await request(app).post('/api/accounts').send(newAccount);
    
            expect(response.status).toBe(201);
            expect(response.body).toEqual(newAccount);
        });
    
        test('should return 400 if "bankName" is missing', async () => {
            const response = await request(app).post('/api/accounts').send({
                bankAccountNumber: '123456789', balance: 1000, userId: 1
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('"bankName" is required');
        });
    
        test('should return 400 if "bankAccountNumber" is missing', async () => {
            const response = await request(app).post('/api/accounts').send({
                bankName: 'Bank A', balance: 1000, userId: 1
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('"bankAccountNumber" is required');
        });
    
        test('should return 400 if "balance" is missing', async () => {
            const response = await request(app).post('/api/accounts').send({
                bankName: 'Bank A', bankAccountNumber: '123456789', userId: 1
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('"balance" is required');
        });
    
        test('should handle internal server error on account creation', async () => {
            Account.createAccount = jest.fn().mockRejectedValue(new Error('Internal server error'));
    
            const response = await request(app).post('/api/accounts').send({
                bankName: 'Bank A', bankAccountNumber: '123456789', balance: 1000, userId: 1
            });
    
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal server error');
        });
    });
    
    describe('GET /', () => {
        test('should return all accounts', async () => {
            const accounts = [{ id: 1, bankName: 'Bank A', balance: 1000 }];
            Account.getAllAccounts = jest.fn().mockResolvedValue(accounts);
    
            const response = await request(app).get('/api/accounts');
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual(accounts);
        });
    
        test('should handle server error when fetching accounts', async () => {
            Account.getAllAccounts = jest.fn().mockRejectedValue(new Error('Internal server error'));
    
            const response = await request(app).get('/api/accounts');
            
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal server error');
        });
    });
    
    describe('GET /:id', () => {
        test('should return an account by id', async () => {
            const account = { id: 1, bankName: 'Bank A', balance: 1000 };
            Account.getById = jest.fn().mockResolvedValue(account);
    
            const response = await request(app).get('/api/accounts/1');
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual(account);
        });
    
        test('should return 404 if account not found', async () => {
            Account.getById = jest.fn().mockResolvedValue(null);
    
            const response = await request(app).get('/api/accounts/999');
            
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Account not found');
        });
    
        test('should handle server error when fetching an account by ID', async () => {
            Account.getById = jest.fn().mockRejectedValue(new Error('Internal server error'));
    
            const response = await request(app).get('/api/accounts/1');
            
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal server error');
        });
    });
    

    describe('POST /:id/deposit', () => {
        test('should deposit money and return updated account', async () => {
            const updatedAccount = { id: 1, bankName: 'Bank A', balance: 2000 };
    
            
            Account.deposit = jest.fn().mockResolvedValue(updatedAccount);
            Account.getById = jest.fn().mockResolvedValue({ id: 1, bankName: 'Bank A', balance: 1000 });
    
            const response = await request(app)
                .post('/api/accounts/1/deposit')
                .send({ balance: 1000 });
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedAccount);
        });
    
        test('should return 400 if deposit balance is invalid', async () => {
            const response = await request(app)
                .post('/api/accounts/1/deposit')
                .send({ balance: -100 });
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid deposit balance');
        });
    
        test('should return 404 if account does not exist', async () => {
            Account.getById = jest.fn().mockResolvedValue(null);
    
            const response = await request(app)
                .post('/api/accounts/999/deposit')
                .send({ balance: 100 });
            
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Account not found');
        });
    
        test('should handle server error during deposit', async () => {
            Account.getById = jest.fn().mockResolvedValue({ id: 1, bankName: 'Bank A', balance: 1000 });
            Account.deposit = jest.fn().mockRejectedValue(new Error('Internal server error'));
    
            const response = await request(app)
                .post('/api/accounts/1/deposit')
                .send({ balance: 1000 });
    
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal server error');
        });
    });
    

    describe('POST /:id/withdraw', () => {
        test('should withdraw money and return updated account', async () => {
            const updatedAccount = { id: 1, bankName: 'Bank A', balance: 500 };
    
            // Mock fungsi withdraw untuk mengembalikan updatedAccount
            Account.withdraw = jest.fn().mockResolvedValue(updatedAccount);
            Account.getById = jest.fn().mockResolvedValue({ id: 1, bankName: 'Bank A', balance: 1000 });
    
            const response = await request(app)
                .post('/api/accounts/1/withdraw')
                .send({ balance: 500 });
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedAccount);
        });
    
        test('should return 400 if withdraw balance is invalid', async () => {
            const response = await request(app)
                .post('/api/accounts/1/withdraw')
                .send({ balance: -500 });
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid withdraw balance');
        });
    
        test('should return 404 if account does not exist', async () => {
            Account.getById = jest.fn().mockResolvedValue(null);
    
            const response = await request(app)
                .post('/api/accounts/999/withdraw')
                .send({ balance: 100 });
            
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Account not found');
        });
    
        test('should return 400 if insufficient balance', async () => {
            // Mock fungsi getById untuk mengembalikan akun dengan saldo lebih kecil dari yang diminta
            Account.getById = jest.fn().mockResolvedValue({ id: 1, bankName: 'Bank A', balance: 500 });
            Account.withdraw = jest.fn().mockRejectedValue(new Error('Insufficient balance'));
    
            const response = await request(app)
                .post('/api/accounts/1/withdraw')
                .send({ balance: 1000 });
    
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Insufficient balance');
        });
    });
    
});