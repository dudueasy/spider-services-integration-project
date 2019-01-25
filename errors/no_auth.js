const HTTPBaseError = require('./http_base_error')

const ERROR_CODE =  40100

class NoAuthError extends HTTPBaseError {
  constructor(msg) {
    super(401, '没有权限访问该资源', ERROR_CODE, `no auth, ${msg}`)
  }
}

module.exports = NoAuthError
