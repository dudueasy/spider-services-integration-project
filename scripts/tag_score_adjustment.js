// 这个脚本用来归一化数据库中的资源标签的关联度评分
const path = require('path');
const logger = require('../utils/loggers/logger');

// 引入配置文件中的信息
require('dotenv').config({path: path.join(__dirname, "../.env")});
const {MongoClient} = require('mongodb');


// 建立 mongodb 连接.
require('../services/mongoose_db_connection');

async function recalculateTagScores() {
  const mongodbUrl = process.env.DB_URL;
  const DBName = process.env.DB_RESOURCE_DB;
  const collectionName = process.env.DB_COLLECTION;


  const client = await MongoClient.connect(mongodbUrl, {useNewUrlParser: true})
    .catch(e => {
      logger('error', 'Mongodb connection error: %s', e.message, {stack: e.stack});
      process.exit(1);
    });

  //init mongodb collection
  let db = client.db(DBName);
  const articleCollection = db.collection(collectionName);
  const cursor = articleCollection.find({}, {tags: 1});
  // console.log(cursor);

  let count = 0;
  while (await cursor.hasNext()) {
    recalculateTag = [];
    doc = await cursor.next();

    // 提取出 nodejieba 处理标题所生成的标签元素
    // 将所有标签对象按分值排序, 以最高分支为基准 1 , 其他标签的分值取基准相对值
    const titleTags = doc.tags.filter(tag => tag.name === "ARTICLE_TAG_TITLE")
      .sort((a, b) => b.score - a.score)
      .map((tag, index, array) => ({...tag, score: tag.score / array[0].score}));


    // 资源在网站中的分类标签 , score 定为 0.7
    const categoryTags = doc.tags.filter(tag => tag.name === "ARTICLE_CATEGORY")
      .map(t => ({
        name: t.name,
        value: t.value,
        score: 0.7,
      }));

    // 用户定义的资源标签 , score 定为 0.5
    const userDefinedTags = doc.tags.filter(tag => tag.name === "ARTICLE_TAG_USER")
      .map(t => ({
        name: t.name,
        value: t.value,
        score: 0.4,
      }));

    // console.log("titleTags ", titleTags);

    recalculateTag = [...titleTags, ...categoryTags, ...userDefinedTags];

    // 更新文档

    await articleCollection.updateOne({_id: doc._id}, {$set: {tags: recalculateTag}})
      .then(doc => {
      })
      .catch(e => {
        logger('error', 'error during updating document: %s', e.message, {stack: e.stack});
        process.exit(1);
      });

    count++;
    console.log(count);
  }
}

switch (process.argv[2]) {
  case "recalculate_score":
    recalculateTagScores().catch(e => {
      logger('error', 'Mongodb connection error: %s', e.message, {stack: e.stack});
      process.exit(1);
    });
}


