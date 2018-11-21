const mongoose = require('mongoose');
let logger = require('../utils/loggers/logger');

mongoose.Promise = Promise;

const uri = 'mongodb://localhost:27017/apolo';
mongoose.connect(uri, {useNewUrlParser: true});
let db = mongoose.connection;

db.on('open', () => {
  logger('info', 'info', `mongodb connection built through mongoose`);
});

db.on('error', (e) => {
  logger('error', 'Mongodb connection error: %s', e.message, {stack: e.stack});
  process.exit(1);
});

module.exports = db;
