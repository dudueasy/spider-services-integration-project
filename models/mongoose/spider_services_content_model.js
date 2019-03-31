const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema.Types;
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '../../.env')});

// build mongoose connection
require("../../services/mongoose_db_connection");


const DB_COLLECTION = process.env.DB_COLLECTION;
console.log("DB_COLLECTION : ", DB_COLLECTION);

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

const ContentModel = mongoose.model(DB_COLLECTION, ContentSchema);
module.exports = ContentModel;
