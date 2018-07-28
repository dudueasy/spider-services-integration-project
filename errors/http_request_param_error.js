const HTTPBaseError = require('./http_base_error')


const ERROR_CODE = 40000
class HTTPReqParamError extends HTTPBaseError{
  constructor(paramName, desc){

// super.constructor(httpStatusCode, httpMsg, errorCode, msg){
    super(200, `参数错误 : ${desc}`, ERROR_CODE, `${paramName} wrong: ${desc}`)
  }
}

module.exports = HTTPReqParamError
