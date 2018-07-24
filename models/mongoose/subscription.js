let mongoose = require('mongoose')

const {Schema} = mongoose

// get ObjectId constructor
let {ObjectId} = Schema.Types

let SubSchema = new Schema({
  userId :{type: ObjectId, required: true, index: 1},
  url:{String, required: true}
})

let SubModel = mongoose.model('Sub', SubSchema)

async function insert(sub){
  return SubModel.create(sub)
}

async function list(params) {
  let match = {}
  let flow = SubModel.find(match)
  let subs = await flow.exec()
  return subs
}

async function findByUserId(userId) {
  return await SubModel.findOne({ userId })
}

module.exports = {
 insert,
  list,
  findByUserId,
}
