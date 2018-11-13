const HTTPBaseError = require('../errors/http_base_error')
let logger = require('../utils/loggers/logger')


function httpErrorHandler(err, req, res, next) {
  console.log('进入http错误处理中间件')

// 定义http请求错误处理中间件
  if (err instanceof HTTPBaseError) {

    // ---------- logger starts here ----------
    // 定制日志要记录的错误信息
    let errorMeta = {
      query: req.query,
      url: req.originalUrl,
      userInfo: req.user,
    }

    // logger(level, msg,...[,meta,callback])
    logger('error', 'http error: %s', err.message, errorMeta)
    // ---------- logger ends here ----------

    res.httpStatusCode = err.httpStatusCode
    res.json({
      code: err.errorCode,
      msg: err.httpMsg
    })
  } else {
    next(err)
  }
}

module.exports = httpErrorHandler
