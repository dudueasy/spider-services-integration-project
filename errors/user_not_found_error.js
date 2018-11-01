const HttpBaseError = require('./http_base_error')

const ERROR_CODE = 30001

class UserNotFoundError extends HttpBaseError {
  constructor(paramName, desc) {
    super(404, `参数错误 : ${desc}`, ERROR_CODE, `${paramName} wrong: ${desc}`)
  }
}

module.exports = UserNotFoundError
