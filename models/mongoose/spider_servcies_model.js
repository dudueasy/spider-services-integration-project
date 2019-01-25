const mongoose = require('mongoose');
const {Schema} = mongoose;

let spiderSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  validationUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: [
      "registered",
      "validated",
      "running",
      "paused",
      "stopped",
      "up_to_date",
    ],
  },
  singleContent: {
    url: String,
    frequency: Number,
  },
  contentList: {
    url: {
      type: String,
      required: true,
    },
    frequency: {
      type: Number,
      default: 10,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
  },
});

const SpiderServicesModel = mongoose.model('SpiderServices', spiderSchema);
module.exports = SpiderServicesModel

