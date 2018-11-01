const JWT = require('jsonwebtoken')
const NoAuthError = require('../errors/no_auth')


const JWTSecretKey = process.env.JWT_SECRETKEY

// this middle get JWTToken from request header
function auth(req, res, next) {

  const authInfo = req.get('Authorization')
  console.log('authInfo:', authInfo)
  if (!authInfo || authInfo.indexOf('Bearer') < 0) {
    throw new NoAuthError('用户未登陆')
  }

  let JWTToken = authInfo.split('Bearer')[1].trim()
  console.log('JWTToken: ', JWTToken)
  if (!JWTToken) {
    throw new NoAuthError('no JWTToken found')
  }

  let user
  try {
    console.log('JWTSecretKey: ', JWTSecretKey)
    user = JWT.verify(JWTToken, JWTSecretKey)
    console.log('user ', user)
  }
  catch (e) {
    throw new NoAuthError(e)
  }
  req.user = user
  next()
}

module.exports = auth
