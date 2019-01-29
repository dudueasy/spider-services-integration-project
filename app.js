let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser')
let session = require('express-session')

let indexRouter = require('./routes/api/index_route');
let logger = require('./utils/loggers/logger')
let HttpErrorHandler = require('./middlewares/http_error_handler')
let errorHandler = require('./middlewares/error_handler')
let overallErrorHandler = require('./middlewares/overall_error_handler')

// build mongoose database connection for user data
require('./services/mongoose_db_connection')

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// apply express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie:{secure: true}
}))


app.use(express.static(path.join(__dirname, 'public')));

const requestInfoTeller = (req, res, next) => {
  const requestInformation = {method: req.method, path: req.path, body: req.body}
  console.log('request information: ', requestInformation)
  next()
}

// app.use('*', requestInfoTeller)

app.get('/', function (req, res, next) {
  res.render('index', { title: "Apolo's Intergrated Spider Project" });
});

app.use('/api', indexRouter);


/* -- error handling starts here -- */
// error handling middleware for HTTPBaseError type errors
app.use(HttpErrorHandler);

// error handling middleware for other type of errors
app.use(errorHandler)


// app.use((req, res, next) => {
//   next(createError(404)); // trigger error handler
// });
/* -- error handling ends here -- */

process.on('uncaughtException', (err) => {
  logger('error', 'uncaughtException error: %s', err.message, err.stack)
})

module.exports = app;
