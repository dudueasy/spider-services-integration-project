const mongoose = require('mongoose');
const {Schema} = mongoose;
let logger = require('../../utils/loggers/logger');
const InternalServerError = require('../../errors/internal_server_error');

let spiderServiceSchema = new Schema({
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

const SpiderServicesModel = mongoose.model('SpiderServices', spiderServiceSchema);

async function registerSpiderService(spider) {
  const created = await SpiderServicesModel.create(spider).catch(err => {
    logger(
      'error',
      'uncaughtException error: %s',
      err.message, err.stack,
    );

    // throw new InternalServerError('Error during creating spider service');
    throw new InternalServerError(`Error during creating spider service: ${err.message}`);
  });
  return created;
}


async function updateSpiderService(spiderModel) {
  return await SpiderServicesModel.findByIdAndUpdate(spiderModel._id, spider._doc,{new: true});
}

module.exports = {
  model: SpiderServicesModel,
  registerSpiderService,
  updateSpiderService
};

