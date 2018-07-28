// 这个文件用来定义一个我们接下来要使用的 HTTP Error基类

// httpStatusCode 是http请求的状态码, httpMsg 参数用于服务器端记录错误, errorCode 用于表示我们自定的错误码, msg 用于显示错误信息给用户
class HTTPBaseError extends Error{
  constructor(httpStatusCode, httpMsg, errorCode, msg){

    // 在JS 继承中 super() 是必须调用的,用于返回一个this给子类.
    // 由于这里的 父类是 Error, 此处 super(xx) 的作用是 this.message = xx, 是报错的第一行信息
    super(`HTTP ERROR: ${ msg }`)

    this.httpStatusCode = httpStatusCode
    this.httpMsg = httpMsg
    this.errorCode = errorCode
  } 
}

module.exports = HTTPBaseError

