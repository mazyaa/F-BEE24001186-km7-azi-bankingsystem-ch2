const { PrismaClient } = require('@prisma/client');
const Transaction = require('../transactions'); 

// Mocking PrismaClient
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        bankAccount: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        transaction: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(mockPrismaClient)),
    };
    return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const prisma = new PrismaClient();

describe('Transaction Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('transfer', () => {
        test('should transfer amount between accounts successfully', async () => {
            const sourceAccountId = 1;
            const destinationAccountId = 2;
            const amount = 100;

            prisma.bankAccount.findUnique
                .mockResolvedValueOnce({ id: sourceAccountId, balance: 200 }) // Akun sumber ditemukan
                .mockResolvedValueOnce({ id: destinationAccountId, balance: 50 }); // Akun tujuan ditemukan

            prisma.bankAccount.update
                .mockResolvedValueOnce({ id: sourceAccountId, balance: 100 }) // Update saldo sumber
                .mockResolvedValueOnce({ id: destinationAccountId, balance: 150 }); // Update saldo tujuan

            prisma.transaction.create.mockResolvedValue({
                id: 1,
                amount,
                sourceAccountId,
                destinationAccountId,
            });

            const result = await Transaction.transfer(sourceAccountId, destinationAccountId, amount);

            expect(result).toEqual({
                id: 1,
                amount,
                sourceAccountId,
                destinationAccountId,
            });
            expect(prisma.bankAccount.update).toHaveBeenCalledTimes(2);
            expect(prisma.transaction.create).toHaveBeenCalled();
        });

        test('should throw an error if source account has insufficient balance', async () => {
            prisma.bankAccount.findUnique
                .mockResolvedValueOnce({ id: 1, balance: 50 }) // Saldo sumber tidak cukup
                .mockResolvedValueOnce({ id: 2, balance: 100 }); // Akun tujuan ditemukan

            await expect(Transaction.transfer(1, 2, 100)).rejects.toThrow('Insufficient balance');
        });
    });

    describe('getAll', () => {
        test('should retrieve all transactions', async () => {
            const mockTransactions = [
                { id: 1, amount: 100, sourceAccountId: 1, destinationAccountId: 2 },
                { id: 2, amount: 50, sourceAccountId: 1, destinationAccountId: 3 },
            ];

            prisma.transaction.findMany.mockResolvedValue(mockTransactions);

            const transactions = await Transaction.getAll();

            expect(transactions).toEqual(mockTransactions);
            expect(prisma.transaction.findMany).toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        test('should retrieve transaction by ID', async () => {
            const mockTransaction = {
                id: 1,
                amount: 100,
                sourceAccountId: 1,
                destinationAccountId: 2,
                sourceAccount: { id: 1, balance: 200 },
                destinationAccount: { id: 2, balance: 300 },
            };

            prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

            const transaction = await Transaction.getById(1);

            expect(transaction).toEqual(mockTransaction);
            expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { sourceAccount: true, destinationAccount: true },
            });
        });

        test('should return null if transaction not found', async () => {
            prisma.transaction.findUnique.mockResolvedValue(null);

            const transaction = await Transaction.getById(999);

            expect(transaction).toBeNull();
            expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
                where: { id: 999 },
                include: { sourceAccount: true, destinationAccount: true },
            });
        });
    });
});
