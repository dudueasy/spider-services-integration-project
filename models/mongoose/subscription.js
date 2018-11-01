let mongoose = require('mongoose')

const {Schema} = mongoose


// get ObjectId constructor
let {ObjectId} = Schema.Types

let SubSchema = new Schema({
  userId: {type: String, required: true, index: true},
  url: {type: String, required: true}
})


let SubModel = mongoose.model('Sub', SubSchema)

async function insert(userId, url) {
  return await SubModel.create({userId, url})
}

async function list(params) {
  return await SubModel.find({})

}

async function findByUserId(userId) {
  return await SubModel.find({userId: userId}, {password: 0})
}

module.exports = {
  insert,
  list,
  findByUserId,
}
