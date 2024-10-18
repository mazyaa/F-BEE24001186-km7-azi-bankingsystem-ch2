const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Account {
    static async createAccount({ bankName, bankAccountNumber, balance, userId }) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        
        const newAccount = await prisma.bankAccount.create({
            data: {
                bankName,
                bankAccountNumber,
                balance,
                userId,
            },
        });

        return newAccount;
    }

     static async getAllAccounts(){
        return await prisma.bankAccount.findMany({
        });   
    }

    static async getById(accountId) {
        return await prisma.bankAccount.findUnique({
            where: { 
                id: parseInt(accountId)
             },
            include: { 
                user: true
             }, 
        });
    }


    static async deposit(accountId, balance) {  
        const account = await prisma.bankAccount.findUnique({
            where: {
                id: accountId,
            },
        });

        if (!account) {
            throw new Error(`Account with ID ${accountId} not found`);
        }

        // Update balance
        const updatedAccount = await prisma.bankAccount.update({
            where: {
                id: accountId,
            },
            data: {
                balance: account.balance + balance,  
            },
        });

        return updatedAccount;
    }


    //withdraw
    static async withdraw(accountId, balance) {
        const account = await prisma.bankAccount.findUnique({
            where: {
                id: accountId,
            },
        });

        if (!account) {
            throw new Error(`Account with ID ${accountId} not found`);
        }

        
        if (account.balance < balance) {
            throw new Error('Insufficient balance');
        }

        // Update balance
        const updatedAccount = await prisma.bankAccount.update({
            where: {
                id: accountId,
            },
            data: {
                balance: account.balance - balance,  
            },
        });

        return updatedAccount;
    }
}


module.exports = { Account };
