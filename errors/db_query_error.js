const HTTPBaseError = require('./http_base_error');

const ERROR_CODE = 40009;

/*
 * @param paraName 字段名, 内部使用
 * @param desc  描述, 对用户展示
 *
 */
class HTTPReqParamError extends HTTPBaseError {
  constructor(paramName, desc) {

// super.constructor(httpStatusCode, httpMsg, errorCode, msg){
    super(400, `查询数据库时参数错误 : ${desc}`, ERROR_CODE, `${paramName} wrong: ${desc}`);
  }
}

module.exports = HTTPReqParamError;
