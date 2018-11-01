const assert = require('assert');
const mongoose = require('mongoose')
mongoose.Promise = Promise
const {Schema} = mongoose
const pbkdf2Sync = require('crypto').pbkdf2Sync

// import an Error Class for user data validation
const HTTPReqParamError = require('../../errors/http_request_param_error')

const UserSchema = Schema({
  name: {type: String, required: true, index: 1},
  age: {type: Number, min: 0, max: 120},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
})

const UserModel = mongoose.model('users', UserSchema)


async function getOneById(userId) {
  return await UserModel.findOne({_id: userId}, {password: 0})
}

async function getOneByName(name) {
  return await UserModel.findOne({name}, {password: 0})
}

async function list(params) {

  let userList = await UserModel.find({}, {password: 0})
  return userList
}

// 用户注册
async function createUserByNamePwd(userData) {
  // check if user.username or user.name is duplicated
  const {name, username, password} = userData
  const duplicatedUser = await UserModel.findOne({$or: [{'username': username}, {'name': name}]}, {_id: 1})

  if (duplicatedUser) {
    throw new HTTPReqParamError('name or username', 'name or username has been taken')
  }

  const hashPassword = await pbkdf2Sync(
    password,
    process.env.SALT,
    parseInt(process.env.ITERATION_TIMES),
    parseInt(process.env.KEY_LEN),
    process.env.DIGEST,
    (error, derivedKey) => {
      if (error) {
        console.log('error happen during pbkdf2')
      }
      console.log('derivedKey:', derivedKey.toString())
    }
  )
  console.log('hashPassword :', hashPassword)

  const created = await UserModel.insert({name, username, password: hashPassword})
  console.log('user created: ', created)
  return {_id: created._id, name: created.name, username: created.username}

}

// 用户登录
async function getUserByNamePwd(username, password) {
  // hash password before querying database
  const hashPassword = pbkdf2Sync(
    password,
    process.env.SALT,
    parseInt(process.env.ITERATION_TIMES),
    parseInt(process.env.KEY_LEN),
    process.env.DIGEST,
    (error, derivedKey) => {
      if (error) {
        console.log('error happen during pbkdf2')
      }
      console.log('derivedKey:', derivedKey.toString())
    }
  )

  const userFound = await UserModel.findOne({username, password: hashPassword}, {password: 0}) // omit user password

  assert(userFound.username, 'assertion failed getUserByNamePwd')
  return userFound
}

module.exports = {
  getOneById,
  getOneByName,
  list,
  createUserByNamePwd,
  getUserByNamePwd
}
