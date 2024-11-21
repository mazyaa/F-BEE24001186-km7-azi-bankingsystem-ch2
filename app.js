require("./instrument.js");
const Sentry = require("@sentry/node");
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');
const mediaRouter = require('./api/v1/routes/media.routes');
const path = require('path');
const cors = require('cors');


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
app.use(cors());
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

app.get('/notification', (req, res) => {
  res.render('notification');
});

app.use('/api/v1/users', require('./api/v1/routes/users'));
app.use('/api/v1/auth', require('./api/v1/routes/auth.routes'));
app.use('/api/v1/accounts', require('./api/v1/routes/accounts'));
app.use('/api/v1/transactions', require('./api/v1/routes/transactions'));
app.use('/api/v1', mediaRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));



// Error handling 
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.isJoi) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Internal server error' });
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// Server start
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on ${appUrl} in ${nodeEnv} mode`);
  console.log(`API docs available at http://${appUrl}/api-docs`);
});
