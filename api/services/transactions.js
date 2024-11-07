const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Transaction {
    // for transaction 
    static async transfer(sourceAccountId, destinationAccountId, amount) {
        return await prisma.$transaction(async (prisma) => {
            //source account
            const sourceAccount = await prisma.bankAccount.findUnique({
                where: { id: parseInt(sourceAccountId) },
            });

            //check source account in bankAccount
            if (!sourceAccount) {
                throw new Error('Source account not found');
            }

            // if the balance is not enough
            if (sourceAccount.balance < amount) {
                throw new Error('Insufficient balance');
            }

            // Take the destination account
            const destinationAccount = await prisma.bankAccount.findUnique({
                where: { 
                    id: parseInt(destinationAccountId) 
                },
            });

            if (!destinationAccount) {
                throw new Error('Destination account not found');
            }

            // Reduce the source account balance
            await prisma.bankAccount.update({
                where: { 
                    id: parseInt(sourceAccountId) 
                },
                data: { 
                    balance: { decrement: amount } 
                },
            });

            // Add balance to destination account
            await prisma.bankAccount.update({
                where: { 
                    id: parseInt(destinationAccountId) 
                },
                data: { 
                    balance: { increment: amount } 
                },
            });

            // Save the transaction to the Transactions table
            const transaction = await prisma.transaction.create({
                data: {
                    amount,
                    sourceAccountId: parseInt(sourceAccountId),
                    destinationAccountId: parseInt(destinationAccountId),
                },
            });

            return transaction;
        });
    }



    // get all history
    static async getAll() {
        return await prisma.transaction.findMany();
    }

    // get history byId
    static async getById(transactionId) {
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId,
            },
            include: {
                sourceAccount: true,
                destinationAccount: true,
            },
        });

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        return transaction;
    }
}

module.exports = Transaction;
