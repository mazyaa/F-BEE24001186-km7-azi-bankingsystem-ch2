const request = require('supertest');
const express = require('express');
const accountsRouter = require('../accounts');
const { Account } = require('../../../services/accounts');

// Mock the authentication middleware
jest.mock('../../../../middleware/auth.middleware', () => {
    return jest.fn((req, res, next) => next()); // Bypass middleware
});

// Mock Account service
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
            const newAccount = {
                bankName: 'Bank A',
                bankAccountNumber: '123456789',
                balance: 1000,
                userId: 1,
            };

            Account.createAccount.mockResolvedValue(newAccount);

            const response = await request(app)
                .post('/api/accounts')
                .send(newAccount);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(newAccount);
        });

        test('should return 400 if validation fails', async () => {
            const response = await request(app)
                .post('/api/accounts')
                .send({}); // Send an empty request body

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('"bankName" is required');
        });
    });

    describe('GET /', () => {
        test('should return all accounts', async () => {
            const accounts = [
                { id: 1, bankName: 'Bank A', balance: 1000 },
                { id: 2, bankName: 'Bank B', balance: 2000 },
            ];

            Account.getAllAccounts.mockResolvedValue(accounts);

            const response = await request(app).get('/api/accounts');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(accounts);
        });
    });

    describe('GET /:id', () => {
        test('should return an account by id', async () => {
            const account = { id: 1, bankName: 'Bank A', balance: 1000 };

            Account.getById.mockResolvedValue(account);

            const response = await request(app).get('/api/accounts/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(account);
        });

        test('should return 404 if account not found', async () => {
            Account.getById.mockResolvedValue(null);

            const response = await request(app).get('/api/accounts/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Account not found');
        });
    });

    describe('POST /:id/deposit', () => {
        test('should deposit money and return updated account', async () => {
            const updatedAccount = { id: 1, bankName: 'Bank A', balance: 2000 };
            Account.deposit.mockResolvedValue(updatedAccount);

            const response = await request(app)
                .post('/api/accounts/1/deposit')
                .send({ balance: 1000 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedAccount);
        });

        test('should return 400 if deposit balance is invalid', async () => {
            const response = await request(app)
                .post('/api/accounts/1/deposit')
                .send({ balance: -100 }); // Invalid balance

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid deposit balance');
        });

        test('should return 404 if account does not exist', async () => {
            Account.getById.mockResolvedValue(null); // Mocking the account to not exist

            const response = await request(app)
                .post('/api/accounts/999/deposit')
                .send({ balance: 100 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Account not found');
        });
    });

    describe('POST /:id/withdraw', () => {
        test('should withdraw money and return updated account', async () => {
            const updatedAccount = { id: 1, bankName: 'Bank A', balance: 500 };
            Account.withdraw.mockResolvedValue(updatedAccount);

            const response = await request(app)
                .post('/api/accounts/1/withdraw')
                .send({ balance: 500 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedAccount);
        });

        test('should return 400 if withdraw balance is invalid', async () => {
            const response = await request(app)
                .post('/api/accounts/1/withdraw')
                .send({ balance: -500 }); // Invalid withdraw amount

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid withdraw balance');
        });

        test('should return 404 if account does not exist', async () => {
            Account.getById.mockResolvedValue(null); // Mocking the account to not exist

            const response = await request(app)
                .post('/api/accounts/999/withdraw')
                .send({ balance: 100 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Account not found');
        });

        test('should return 400 if insufficient balance', async () => {
            const insufficientBalanceAccount = { id: 1, bankName: 'Bank A', balance: 500 };
            Account.getById.mockResolvedValue(insufficientBalanceAccount);
            Account.withdraw.mockRejectedValue(new Error('Insufficient balance'));

            const response = await request(app)
                .post('/api/accounts/1/withdraw')
                .send({ balance: 1000 }); // Trying to withdraw more than available

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Insufficient balance');
        });
    });
});
