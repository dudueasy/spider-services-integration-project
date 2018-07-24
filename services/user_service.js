const User = require('../models/mongoose/user.js')
const Subscription  = require('../models/in_memo/subscription.js')

module.exports.getAllUsers = async function(){
  let users = await User.list()
  return users
}

module.exports.addNewUsers = async function(name, age){
  let user = await User.insert({name, age})
  return  user
}

module.exports.getUserById = User.getOneById


module.exports.createSubscription =  async function(userId){
  const user = User.getUserById(userId)
  if(!user) throw Error('no such user')
  const subscription = Subscription.insert(userId, url)
  return subscription
}

