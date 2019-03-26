const ElasticSearch = require('elasticsearch');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, "../.env")});

let esHost = process.env.ES_HOST;
let esIndex = process.env.ES_INDEX;
let esType = process.env.ES_TYPE;

// build Elastic Search connection
let client = new ElasticSearch.Client({
  host: esHost,
});

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
    ps.push(createOrUpdateContent(content));
  }

  await Promise.all(ps);
}

module.exports = {createEsIndex, updateEsTypeMapping, client, createOrUpdateContent, createOrUpdateContentList};
