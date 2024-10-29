const router = require('express').Router();
const Transaction = require('../../services/transactions');
const authenticateToken = require('../../../middleware/auth.middleware');
const Joi = require('joi');


const transactionSchema = Joi.object({
    sourceAccountId: Joi.number().integer().required(),
    destinationAccountId: Joi.number().integer().required(),
    amount: Joi.number().positive().required(),
});

// transaction 
router.post('/', authenticateToken, async (req, res, next) => {
    try {
        const { value, error } = transactionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const { sourceAccountId, destinationAccountId, amount } = value;

        
        const transaction = await Transaction.transfer(sourceAccountId, destinationAccountId, amount);

        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
});

// get all history
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const transactions = await Transaction.getAll();
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
});

//get history byId
router.get('/:transactionId', authenticateToken, async (req, res, next) => {
    try {
        const transactionId = parseInt(req.params.transactionId, 10); 
        const transaction = await Transaction.getById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
