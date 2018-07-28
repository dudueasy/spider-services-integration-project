let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
// let logger = require('morgan');
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

let logger = require('./utils/loggers/logger')

let errorHandler = require('./middlewares/http_error_handler')
let handler = require('./middlewares/error_handler')


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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);


// error handling middleware for HTTPBaseError type errors
app.use(errorHandler);

// error handling middleware for other type of errors
app.use(handler)

process.on('uncaughtException' ,(err)=>{
  logger('error', 'uncaughtException error: %s', err.message)
})

// for testing uncaightException Event listener
// triggerUncaughtException()

process.on('unhandledRejection', (reason, p)=>{
logger('error', 'unhandledRejection error: %s', err.message)
})
module.exports = app;
