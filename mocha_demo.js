// const {describe, it, before, after} = require('mocha');

const assert = require('assert');
const ElasticSearch = require('elasticsearch');

const INDEX = 'acfun_test_index';
const TYPE = 'acfun_test_type';

// describe('elasticsearch test', () => {
//
//   before('connect to elasticsearch service', async () => {
//     global.client = new ElasticSearch.Client({
//       host: "localhost:9200",
//     });
//
//     await client.ping({
//       requestTimeout: 30000,
//     }, function (error) {
//       if (error) {
//         console.error('elasticsearch cluster is down!');
//       } else {
//         console.log('All is well');
//       }
//     });
//
//     await client.create({
//       index: INDEX,
//       type: TYPE,
//       id: '1',
//       body: {
//         name: 'apolo',
//         hobbies: ["video games", "swimming"],
//         age: 30,
//       },
//     });
//
//     await new Promise(resv => setTimeout(resv, 1000));
//
//   });
//
//   describe('xx', () => {
//
//
//     before('update document ', async () => {
//       await client.update({
//         index: INDEX,
//         type: TYPE,
//         id: '1',
//         body: {
//           doc: {
//             age: 33,
//           },
//         },
//       });
//     });
//
//     it('should find a doc on search command', async () => {
//       const r = await client.search({
//         index: INDEX,
//         type: TYPE,
//         body: {
//           query: {
//             match: {
//               name: 'apolo',
//             },
//           },
//         },
//       });
//
//       console.log("search result:", r);
//       console.log(r.hits.hits[0]);
//     });
//
//   });
//
//   after("clear all data created", async () => {
//     await client.indices.delete({
//       index: INDEX,
//     });
//   });
// });


describe('elasticsearch advance test', async () => {
  before("init es connection", () => {
    global.anotherClient = new ElasticSearch.Client({
      host: "localhost:9200",
      // log: 'trace'
    });
  });

  after("close es connection", async () => {
    await anotherClient.indices.delete({
      index: INDEX,
    });
  });

  describe('create es document and test function_score', async () => {
    const doc1 = {
      title: "牛顿是一个炼金术师",
      tags: [
        {tagValue: "炼金术", tagScore: 0.3},
        {tagValue: "牛顿", tagScore: 0.7},
      ],
    };

    const doc2 = {
      title: "钢之炼金术真好玩",
      tags: [
        {tagValue: "炼金术", tagScore: 0.6},
        {tagValue: "好玩", tagScore: 0.4},
      ],
    };

    before('search docs', async () => {

      //create index
      await anotherClient.indices.create({
        index: INDEX,
      });


      // define mappings for type
      await anotherClient.indices.putMapping({
        index: INDEX,
        type: TYPE,
        body: {
          properties: {
            tags: {
              type: "nested",
              properties: {
                tagValue: {
                  "type": "text",
                },
                tagScore: {
                  "type": "float",
                },
              },
            },
          },
        },
      });

      // create two docs into es index
      await Promise.all[
        anotherClient.create({
          index: INDEX,
          type: TYPE,
          id: 1,
          body: doc1,
        }) ,
          anotherClient.create({
            index: INDEX,
            type: TYPE,
            id: 2,
            body: doc2,
          })
        ];


      await new Promise(resv => setTimeout(resv, 1000));
    });


    it('should return score for searching 炼金术', async () => {
      const r = await anotherClient.search({
        index: INDEX,
        type: TYPE,
        body: {
          "query": {
            "nested": {
              "path": "tags",
              "query": {
                "match": {
                  "tags.tagValue": "炼金术",
                },
              },
            },
          },
        },
      });


      console.log(r.hits.hits);
    });

    it('should return larger value when searching for 炼金术 ' +
      'with a boost of tag score field on doc2', async () => {
      // 对上文中的文档进行一次 function_score 查询, 用 tags.tagScore 作为 field_value_factor

      let queryBody = {
        "query": {
          "nested": {
            "path": "tags",
            "query": {
              "function_score": {
                "query": {
                  "bool": {
                    "must": {
                      "match": {
                        "tags.tagValue": "炼金术",
                      },
                    },
                  },
                },
                "field_value_factor": {
                  "field": "tags.tagScore",
                  "missing": 0,
                },
              },
            },
          },
        },
      };


      let r = await anotherClient.search({
        index: INDEX,
        type: TYPE,
        body: queryBody,
      });


      r = r.hits.hits;
      console.log(r);


      const s1 = r.find(s => s._id === '1')._score;
      const s2 = r.find(s => s._id === '2')._score;

      console.log('s1:', s1)
      console.log('s2:', s2)
      assert.equal(true, s1 < s2);
    });
  });
});
