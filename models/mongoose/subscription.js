let mongoose = require('mongoose');
// build mongoose connection
require("../../services/mongoose_db_connection");

const {Schema} = mongoose;


// get ObjectId constructor
let {ObjectId} = Schema.Types;

let SubSchema = new Schema({
  userId: {type: String, required: true, index: true},
  type: {
    type: String,
    enum: ['spider_services', 'tag'],
    required: true,
  },
  sourceId: {
    type: ObjectId,
    required: true,
  },
});

let SubModel = mongoose.model('Sub', SubSchema);

async function upsert(sub) {
  return await SubModel.findOneAndUpdate(sub, sub, {
    new: true,
    upsert: true,
  });
}

async function list(params) {
  return await SubModel.find({});
}

async function findByUserId(userId) {
  return await SubModel.find({userId: userId}, {password: 0});
}

module.exports = {
  model: SubModel,
  upsert,
  list,
  findByUserId,
};
