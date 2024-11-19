
require('./instrument');
const sentry = require('@sentry/node');

const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');
const mediaRouter = require('./api/v1/routes/media.routes');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const appUrl = process.env.APP_URL;
const nodeEnv = process.env.NODE_ENV;
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// eslint-disable-next-line no-undef
global.io = io;

// Middleware
app.use(cors({
  origin: 'http://ec2-54-252-241-128.ap-southeast-2.compute.amazonaws.com/api-docs/'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use('/images', express.static(path.join(__dirname, '../../public/images')));
app.use('/files', express.static(path.join(__dirname, '../../public/files')));

// Routes
app.get('/', (req, res) => {
  res.render('welcome');
});


app.get('/notification', (req, res) =>{
  res.render('notification');
});

app.use('/api/v1/users', require('./api/v1/routes/users'));
app.use('/api/v1/auth', require('./api/v1/routes/auth.routes'));
app.use('/api/v1/accounts', require('./api/v1/routes/accounts'));
app.use('/api/v1/transactions', require('./api/v1/routes/transactions'));
app.use('/api/v1', mediaRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Sentry error handling
sentry.setupExpressErrorHandler(app);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.isJoi) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Internal server error' });
});

// Test error for Sentry
app.get('/debug-sentry', (req, res) => {
  throw new Error('My first Sentry error!');
});

// Server start
server.listen(port, () => {
  console.log(`Server running on ${appUrl} in ${nodeEnv} mode`);
  console.log(`API docs available at http://${appUrl}/api-docs`);
});
