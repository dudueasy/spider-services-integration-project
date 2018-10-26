let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser')

let session = require('express-session')
let indexRouter = require('./routes/api/index');
let usersRouter = require('./routes/api/users');

let logger = require('./utils/loggers/logger')

let HttpErrorHandler = require('./middlewares/http_error_handler')
let errorHandler = require('./middlewares/error_handler')


// connect to mongodb
require('./services/mongodb_connection.js')

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// apply express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie:{secure: true}
}))


app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use('/api/user', usersRouter);


// error handling middleware for HTTPBaseError type errors
app.use(HttpErrorHandler);

// error handling middleware for other type of errors
app.use(errorHandler)

process.on('uncaughtException' ,(err)=>{
  logger('error', 'uncaughtException error: %s', err.message)
})

// for testing uncaightException Event listener
// triggerUncaughtException()

process.on('unhandledRejection', (reason, p)=>{
logger('error', 'unhandledRejection error: %s', err.message)
})
module.exports = app;
