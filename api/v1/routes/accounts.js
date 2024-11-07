const express = require('express');
const router = express.Router();
const { Account } = require('../../services/accounts');
const authenticateToken = require('../../../middleware/auth.middleware');


const Joi = require('joi');
const schema = Joi.object({
    bankName: Joi.string().required().messages({
        'any.required': '"bankName" is required'
    }),
    bankAccountNumber: Joi.string().required().messages({
        'any.required': '"bankAccountNumber" is required'
    }),
    balance: Joi.number().required().messages({
        'any.required': '"balance" is required'
    }),
    userId: Joi.number().required().messages({
        'any.required': '"userId" is required'
    })
});

router.post('/', authenticateToken, async (req, res, next) => {
    try {
        const { value, error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const account = await Account.createAccount(value);
        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



// GET data all from table bankAccount
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const accounts = await Account.getAllAccounts();
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


// get all data in bankAccount by id 
router.get('/:id', authenticateToken, async (req, res, next) => {
    try {
        const accountId = parseInt(req.params.id, 10);
        const account = await Account.getById(accountId);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//deposit
router.post('/:id/deposit', authenticateToken, async (req, res, next) => {
    try {
        const accountId = parseInt(req.params.id, 10);
        const { balance } = req.body; 

        
        if (!balance || balance <= 0) {
            return res.status(400).json({ message: 'Invalid deposit balance' });
        }

      
        const account = await Account.getById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        
        const updatedAccount = await Account.deposit(accountId, balance);
        res.status(200).json(updatedAccount);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        next(error);
    }
});



//withdraw
router.post('/:id/withdraw', authenticateToken, async (req, res, next) => {
    try {
        const accountId = parseInt(req.params.id, 10);
        const { balance } = req.body;


        if (!balance || balance <= 0) {
            return res.status(400).json({ message: 'Invalid withdraw balance' });
        }

 
        const account = await Account.getById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }


        if (account.balance < balance) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

    
        const updatedAccount = await Account.withdraw(accountId, balance);
        res.status(200).json(updatedAccount);
    } catch (error) {
        next(error);
    }
});



module.exports = router;
