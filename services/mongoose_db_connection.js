// this module build mongoose db connection for user data storage & models/*
const path = require('path');
const mongoose = require('mongoose');
let logger = require('../utils/loggers/logger');

require('dotenv').config({path: path.join(__dirname, '../.env')});
mongoose.Promise = Promise;

const DB_RESOURCE_DB = process.env.DB_RESOURCE_DB;

const uri = `mongodb://localhost:27017/${DB_RESOURCE_DB}`;
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
