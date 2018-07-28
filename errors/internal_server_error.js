const HTTPBaseError = require('./http_base_error')

const ERROR_CODE = 50000

class InternalServerError extends HTTPBaseError{
  constructor(msg){
    super(500, '服务器好像出小差了', ERROR_CODE, `something went wrong on server ${msg}`)
  }
}

module.exports = InternalServerError
