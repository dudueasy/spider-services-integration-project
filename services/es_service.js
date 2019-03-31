const ElasticSearch = require('elasticsearch');
const spiderServicesContentModel = require('../models/mongoose/spider_services_content_model');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, "../.env")});

let esHost = process.env.ES_HOST;
let esIndex = process.env.ES_INDEX;
let esType = process.env.ES_TYPE;
const logger = require('../utils/loggers/logger');

// build Elastic Search connection
let client = new ElasticSearch.Client({
  host: esHost,
});


// test Elastic Search connection
async function testESConnection() {
  client.ping({
    requestTimeout: 3000,
  }, function (error) {
    if (error) {
      logger(
        'error',
        'error during testing Elasticsearch connection: %s',
        err.message, {stack: err.stack},
      );
      process.exit(1);
    } else {
      console.log('All is well');
    }
  });
}

// create es index
async function createEsIndex() {
  await client.indices.create({
    index: esIndex,
  });
}

function normalizeTagScore(tags) {
  const totalScore = tags.reduce((accumulator, next) => (
    accumulator + next.score
  ), 0);

  return tags.map(t => ({
    value: t.value,
    score: (t.score / totalScore),
  }));
}

// update es index type mapping
async function updateEsTypeMapping() {
  await client.indices.putMapping({
    index: esIndex,
    type: esType,
    body: {
      properties: {
        id: {type: "text"},
        title: {type: "text"},
        serviceId: {type: "text"},
        tags: {
          type: "nested",
          properties: {
            value: {
              "type": "keyword",
              "index": true,
            },
            score: {
              "type": "float",
            },
          },
        },
      },
    },
  });
}


// insert spider fetched content into local elasticsearch db
async function createOrUpdateContent(content) {

  const doc = {
    title: content.title,
    tags: normalizeTagScore(content.tags),
    serviceId: content.spiderServiceId,
  };

  await client.update({
    index: esIndex,
    type: esType,
    id: (content._id.toString()),
    body: {
      doc,
      "doc_as_upsert": true,
    },
  });
}

async function createOrUpdateContentList(contentList) {
  let ps = [];
  for (let content of contentList) {
    ps.push(createOrUpdateContent(content.toObject()));
  }

  await Promise.all(ps);
}

// 通过标签搜索 es 数据库, 用 es 数据库的查询结果搜索 mongodb 数据库
// mongodb 的返回结果需要根据 es 评分来排序
async function searchMongoDBByTag(tag = "", page, pageSize) {
  page = page || 0;
  pageSize = pageSize || 10;
  let result = await client.search({
    index: esIndex,
    type: esType,
    body: {
      from: page * pageSize,
      size: pageSize,
      "query": {
        "nested": {
          "score_mode": "sum", // 匹配的分值是 nested 字段下每次匹配的分值的和
          "path": "tags",
          "query": {
            "function_score": {
              "query": {
                "match": {
                  "tags.value": tag,
                },
              },
              "field_value_factor": {
                "field": "tags.score",
              },
            },
          },
        },
      },
    },
  });
  // console.log("es result: ", result);


  // 获取 es 中的文档
  const hits = result.hits.hits;


  // 获取 id 集合, 用于向 mongodb 进行搜索
  const ids = hits.map(document => (document._id));
  // console.log(ids);


  //  查询 mongodb 数据库并对结果进行排序 (根据 es 评分)
  let documents = await spiderServicesContentModel.find({_id: {$in: ids}});


  // 将 mongodb 文档进行排序
  documents.sort((a, b) => {
    return hits.findIndex(hit => hit._id === a._id.toString())
      - hits.findIndex(hit => hit._id === b._id.toString());
  });


  // 以下代码用于测试排序是否生效
  // for (let hit of hits) {
  //   console.log("es document : ", hit._source.title);
  // }
  //
  // for (let document of documents) {
  //   console.log("mongodb document : ", document.title);
  // }

  return documents;
}

module.exports = {
  createEsIndex,
  testESConnection,
  updateEsTypeMapping,
  createOrUpdateContentList,
  searchMongoDBByTag,
};
