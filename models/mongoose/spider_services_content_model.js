const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

// build mongoose connection
require("../../services/mongoose_db_connection");

const ContentSchema = new Schema({
  spiderServiceContentId: String, // resource _id in it's spider service mongodb database
  spiderServiceId: {
    type: ObjectId,
    index: true,
    required: true,
  },
  content: {
    resourceId: String, // resource id (articleId)
    articleContentHtml: String,
    articleContentText: Object,
    createdAt: {type: String, default: new Date(Date.now().valueOf())},
    originalCreatedAt: String,
  },
  title: {type: String, required: true},
  tags: [{name: String, value: String, score: Number}],
});

const ContentModel = mongoose.model('serviceContent', ContentSchema);
module.exports = ContentModel;
