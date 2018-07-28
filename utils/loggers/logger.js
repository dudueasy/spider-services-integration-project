const winston = require('winston')
require('winston-daily-rotate-file')

let {Logger, transports} = winston
let {Console, DailyRotateFile} = transports

const winstonLogger = new Logger({
  transports:[
    new Console,
    new DailyRotateFile({
      name: 'info_logger',
      filename: './logs/%DATE%.info.log',
      datePattern:'YYYY_MM_DD',
      level:'info'
    }),
    new DailyRotateFile({
      name: 'error_logger',
      filename: './logs/%DATE%.error.log',
      datePattern:'YYYY_MM_DD',
      level:'error'
    }),
  ]
})

// logger(level, msg,meta)
function logger(...args) {

  // log(level, msg, meta) {
  winstonLogger.log(...args)
}

module.exports = logger


