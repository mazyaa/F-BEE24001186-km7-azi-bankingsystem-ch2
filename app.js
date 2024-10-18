const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.set('view engine', 'ejs');

// Routes users
app.use('/api/v1/users', require('./api/v1/routes/users'));

// Routes accounts
app.use('/api/v1/accounts', require('./api/v1/routes/accounts'));

// Routes transactions
app.use('/api/v1/transactions', require('./api/v1/routes/transactions'));



// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.isJoi) {
        res.status(400).json({
            message: err.message,
        });
    }

    res.status(500).json({
        message: 'Internal server error',
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
