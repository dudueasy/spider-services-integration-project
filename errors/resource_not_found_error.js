const HTTPBaseError = require('./http_base_error')

// constructor(httpStatusCode, httpMsg, errorCode, msg){

const ERROR_CODE = 40400
class ResourceNotFoundError extends HTTPBaseError{
  constructor(resourceName, resourceId,httpMsg ){
    super(404, httpMsg , ERROR_CODE, `${resourceName} not found, id: ${resourceId}`)
  }
}

module.exports = ResourceNotFoundError
