const mongoose = require('mongoose')
mongoose.Promise = Promise
const {Schema} = mongoose

const UserSchema = Schema({
  name: {type: String, required: true, index: 1},
  age:{type: Number, min:0, max: 120},
})

const UserModel = mongoose.model('users', UserSchema)

async function insert(user){
  return await UserModel.create(user).then((r)=>{return r})
}

async function getOneById(userId){
  return await UserModel.findOne({_id : userId} )
}

async function getOneByName(name){
  return await UserModel.findOne({name})
}

async function list(params){
  let match = {}
  let flow = UserModel.find(match)
  flow =  await flow.exec().then((r)=>{return r})
  console.log(flow)
  return flow
}

module.exports =  {
  insert,
  getOneById,
  getOneByName,
  list
}


