const { Account } = require('../accounts');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        user: { findUnique: jest.fn() },
        bankAccount: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const mockPrisma = new PrismaClient();
Account.prototype.prisma = mockPrisma;

describe('Account Service', () => {
    describe('createAccount', () => {
        test('should create a new account for an existing user', async () => {
            const mockUser = { id: 1, name: 'Test User' };
            const newAccountData = { bankName: 'Bank ABC', bankAccountNumber: '1234567890', balance: 1000, userId: mockUser.id };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.bankAccount.create.mockResolvedValue({ id: 1, ...newAccountData });

            const createdAccount = await Account.createAccount(newAccountData);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: newAccountData.userId } });
            expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({ data: newAccountData });
            expect(createdAccount).toHaveProperty('balance', 1000);
        });

        test('should throw an error if user does not exist', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const newAccountData = { bankName: 'Bank ABC', bankAccountNumber: '1234567890', balance: 1000, userId: 1 };

            await expect(Account.createAccount(newAccountData)).rejects.toThrow('User with ID 1 not found');
        });
    });

    describe('getAllAccounts', () => {
        test('should retrieve all bank accounts', async () => {
            const mockAccounts = [
                { id: 1, bankName: 'Bank A', bankAccountNumber: '111111', balance: 500 },
                { id: 2, bankName: 'Bank B', bankAccountNumber: '222222', balance: 1000 },
            ];

            mockPrisma.bankAccount.findMany.mockResolvedValue(mockAccounts);

            const accounts = await Account.getAllAccounts();

            expect(accounts).toEqual(mockAccounts);
            expect(mockPrisma.bankAccount.findMany).toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        test('should retrieve an account by ID', async () => {
            const mockAccount = { id: 1, bankName: 'Bank A', bankAccountNumber: '1234567890', balance: 500 };

            mockPrisma.bankAccount.findUnique.mockResolvedValue(mockAccount);

            const account = await Account.getById(1);

            expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { user: true } });
            expect(account).toEqual(mockAccount);
        });

        test('should throw an error if account does not exist', async () => {
            mockPrisma.bankAccount.findUnique.mockResolvedValue(null);

            await expect(Account.getById(999)).rejects.toThrow('Account with ID 999 not found');
        });
    });

    describe('deposit', () => {
        test('should deposit amount into account', async () => {
            const mockAccount = { id: 1, bankName: 'Bank A', bankAccountNumber: '1234567890', balance: 500 };

            mockPrisma.bankAccount.findUnique.mockResolvedValue(mockAccount);
            mockPrisma.bankAccount.update.mockResolvedValue({ ...mockAccount, balance: 600 });

            const updatedAccount = await Account.deposit(1, 100);

            expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { balance: 600 } });
            expect(updatedAccount.balance).toBe(600);
        });

        test('should throw an error if account does not exist', async () => {
            mockPrisma.bankAccount.findUnique.mockResolvedValue(null);

            await expect(Account.deposit(1, 100)).rejects.toThrow('Account with ID 1 not found');
        });
    });

    describe('withdraw', () => {
        test('should withdraw amount from account', async () => {
            const mockAccount = { id: 1, bankName: 'Bank A', bankAccountNumber: '1234567890', balance: 500 };

            mockPrisma.bankAccount.findUnique.mockResolvedValue(mockAccount);
            mockPrisma.bankAccount.update.mockResolvedValue({ ...mockAccount, balance: 400 });

            const updatedAccount = await Account.withdraw(1, 100);

            expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { balance: 400 } });
            expect(updatedAccount.balance).toBe(400);
        });

        test('should throw an error if account does not exist', async () => {
            mockPrisma.bankAccount.findUnique.mockResolvedValue(null);

            await expect(Account.withdraw(1, 100)).rejects.toThrow('Account with ID 1 not found');
        });

        test('should throw an error if balance is insufficient', async () => {
            const mockAccount = { id: 1, bankName: 'Bank A', bankAccountNumber: '1234567890', balance: 50 };

            mockPrisma.bankAccount.findUnique.mockResolvedValue(mockAccount);

            await expect(Account.withdraw(1, 100)).rejects.toThrow('Insufficient balance');
        });
    });
});
