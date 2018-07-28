const User = require('../models/mongoose/user.js')
const Subscription  = require('../models/in_memo/subscription.js')

module.exports.getAllUsers = async function(){
  return await User.list()
}

module.exports.addNewUsers = async function(name, age){
  return await User.insert({name, age})

}

module.exports.getUserById = User.getOneById


module.exports.createSubscription =  async function(userId){
  const user = User.getUserById(userId)
  if(!user) throw Error('no such user')
  return await Subscription.insert(userId, url)
}

module.exports.getSubscription = async function (userId) {
 return await Subscription.findByUserId(userId)
}

