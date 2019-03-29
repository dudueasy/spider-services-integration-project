const UserModel = require('../models/mongoose/user_model.js')
const Subscription = require('../models/mongoose/subscription.js')
const HttpRequestParamError = require('../errors/http_request_param_error')
const UserNotFoundError = require('../errors/user_not_found_error')
const JWT = require('jsonwebtoken')

module.exports.getAllUsers = UserModel.list

// 用户注册
module.exports.addNewUsers = async function (userData) {
  console.log("data of post('/') :", userData)

  const {name, username, password} = userData
  if (!userData || !name || !username || !password) {
    throw new HttpRequestParamError('user', '用户昵称, 用户名或密码不能为空')
  }
  const createdUser = await UserModel.createUserByNamePwd(userData)


  const secretKey = process.env.JWT_SECRETKEY
  const token = JWT.sign(
    {
      _id: createdUser._id.toString(),
      expireAt: parseInt(Date.now()) + process.env.JWT_TOKEN_EXPIRESIN
    },
    secretKey,
    {expiresIn: process.env.JWT_TOKEN_EXPIRESIN}
  )

  return {user: createdUser, token}
}

// 用户登录
module.exports.loginWithNamePwd = async function ({username, password}) {
  if (!username || !password) {
    throw new HttpRequestParamError('user', ' 用户名或密码不能为空')
  }

  const userFound = await UserModel.getUserByNamePwd(username, password)
  if (!userFound) throw new UserNotFoundError('username or password', 'user not found')

  // 生成 JWTToken
  const secretKey = process.env.JWT_SECRETKEY
  const token = JWT.sign(
    {
      _id: userFound._id.toString(),
      expireAt: Date.now().value + process.env.JWT_TOKEN_EXPIRESIN
    },
    secretKey,
    {expiresIn: process.env.JWT_TOKEN_EXPIRESIN}
  )
  return {token, userFound}
}

module.exports.getUserById = UserModel.getOneById


module.exports.createSubscription = async function (userId, url) {
  const user = UserModel.getOneById(userId)
  if (!user) throw Error('no such user')
  return await Subscription.upsert(userId, url)

  // 用户注册
}

module.exports.getSubscription = async function (userId) {
  return await Subscription.findByUserId(userId)
}

