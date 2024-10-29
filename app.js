const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.set('view engine', 'ejs');

//api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes users
app.use('/api/v1/users', require('./api/v1/routes/users'));

// Routes accounts
app.use('/api/v1/accounts', require('./api/v1/routes/accounts'));

// Routes transactions
app.use('/api/v1/transactions', require('./api/v1/routes/transactions'));

//routes regis & login 
app.use('/api/v1/auth', require('./api/v1/routes/users'));



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
    console.log('API docs avaliable at http://localhost:3000/api-docs');
});
