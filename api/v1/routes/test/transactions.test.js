const request = require('supertest');
const express = require('express');
const transactionsRouter = require('../transactions');
const Transaction = require('../../../services/transactions');

jest.mock('../../../../middleware/auth.middleware', () => {
    return jest.fn((req, res, next) => next());
});

jest.mock('../../../services/transactions', () => ({
    transfer: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/transactions', transactionsRouter);

describe('Transactions API', () => {
    describe('POST /', () => {
        test('should create a new transaction and return it', async () => {
            const newTransaction = {
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 1000,
            };

            Transaction.transfer.mockResolvedValue({ id: 1, ...newTransaction });

            const response = await request(app)
                .post('/api/transactions')
                .send(newTransaction);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ id: 1, ...newTransaction });
        });

        test('should return 400 if validation fails', async () => {
            const response = await request(app)
                .post('/api/transactions')
                .send({ amount: 1000 });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('"sourceAccountId" is required');
        });

        test('should return 400 if transfer amount is invalid', async () => {
            const response = await request(app)
                .post('/api/transactions')
                .send({ sourceAccountId: 1, destinationAccountId: 2, amount: -100 });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('"amount" must be a positive number');
        });

        test('should handle internal server error during transaction creation', async () => {
            Transaction.transfer.mockRejectedValue(new Error('Internal server error'));

            const response = await request(app)
                .post('/api/transactions')
                .send({ sourceAccountId: 1, destinationAccountId: 2, amount: 1000 });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal server error');
        });
    });

    describe('GET /', () => {
        test('should return all transactions', async () => {
            const transactions = [
                { id: 1, sourceAccountId: 1, destinationAccountId: 2, amount: 1000 },
                { id: 2, sourceAccountId: 2, destinationAccountId: 3, amount: 1500 },
            ];

            Transaction.getAll.mockResolvedValue(transactions);

            const response = await request(app).get('/api/transactions');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(transactions);
        });

        test('should handle internal server error when fetching transactions', async () => {
            Transaction.getAll.mockRejectedValue(new Error('Internal server error'));

            const response = await request(app).get('/api/transactions');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal server error');
        });
    });

    describe('GET /:transactionId', () => {
        test('should return a transaction by id', async () => {
            const transaction = { id: 1, sourceAccountId: 1, destinationAccountId: 2, amount: 1000 };
            Transaction.getById = jest.fn().mockResolvedValue(transaction); // Define the mock function
    
            const response = await request(app).get('/api/transactions/1');
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual(transaction);
            expect(Transaction.getById).toHaveBeenCalledWith(1); // Check that getById is called with the correct ID
        });
    
        test('should return 404 if transaction not found', async () => {
            Transaction.getById = jest.fn().mockResolvedValue(null); // Mock return value as null for not found
    
            const response = await request(app).get('/api/transactions/999');
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Transaction not found' });
        });
    
        test('should handle internal server error when fetching transaction by id', async () => {
            Transaction.getById = jest.fn().mockRejectedValue(new Error('Internal server error')); // Mock to throw an error
    
            const response = await request(app).get('/api/transactions/1');
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Internal server error' });
        });
    });    
});