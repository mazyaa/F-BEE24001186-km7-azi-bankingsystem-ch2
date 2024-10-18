const express = require('express');
const router = express.Router();
const { Account } = require('../../services/accounts');


const Joi = require('joi');
const schema = Joi.object({
    bankName: Joi.string().required(),
    bankAccountNumber: Joi.string().required(),
    balance: Joi.number().required(),
    userId: Joi.number().required(),
});

// add new data on bankAccount
router.post('/', async (req, res, next) => {
    try {
        const { value, error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const account = await Account.createAccount(value);
        res.status(201).json(account);
    } catch (error) {
        next(error);
    }
});


// GET data all from table bankAccount
router.get('/', async (req, res, next) => {
    try {
        const accounts = await Account.getAllAccounts();
        res.status(200).json(accounts);
    } catch (error) {
        next(error);
    }
});

// get all data in bankAccount by id 
router.get('/:id', async (req, res, next) => {
    try {
        const account = await Account.getById(req.params.id);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json(account);
    } catch (error) {
        next(error);
    }
});

//deposit
router.post('/:id/deposit', async (req, res, next) => {
    try {
        const accountId = parseInt(req.params.id, 10);
        const { balance } = req.body; 

       
        if (!balance || balance <= 0) {
            return res.status(400).json({ message: 'Invalid deposit balance' });
        }

        const updatedAccount = await Account.deposit(accountId, balance);  
        res.status(200).json(updatedAccount);
    } catch (error) {
        next(error);
    }
});

//withdraw
router.post('/:id/withdraw', async (req, res, next) => {
    try {
        const accountId = parseInt(req.params.id, 10);
        const { balance } = req.body;  

       
        if (!balance || balance <= 0) {
            return res.status(400).json({ message: 'Invalid withdraw balance' });
        }

        const updatedAccount = await Account.withdraw(accountId, balance);  
        res.status(200).json(updatedAccount);
    } catch (error) {
        next(error);
    }
});



module.exports = router;
