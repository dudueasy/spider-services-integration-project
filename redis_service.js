/* this module is used to connect redis-server and
 * return functions to provide and insert resource id set from/into redis
*/

require('dotenv').config();
const Redis = require('ioredis');
const redis = new Redis();

// the key of resource Ids set in redis
const ID_SET_TO_REDIS_KEY = process.env.ID_SET_TO_REDIS_KEY;

// the key of retrieved Ids set in redis
const RETRIEVED_ID_SET_TO_REDIS_KEY = process.env.RETRIEVED_ID_SET_TO_REDIS_KEY;


// this function is used to insert a range of resource ids into redis
// use redis set to prevent DUPLICATED ACF_ID  10W - 200W
// minId, maxId present X0000 ids
async function generateResourceIdToRedis(minId, maxId) {
  for (let id = minId; id < maxId; id++) {
    // create a array with 10000 as length
    const idArr = new Array(10000);

    // insert 10000 ids into redis set each time
    for (let j = 0; j < 10000; j++) {
      idArr.push(id * 10000 + j);
    }

    let success = await redis.sadd(ID_SET_TO_REDIS_KEY, ...idArr);
  }
}

async function getRandomResourceIds(count) {

  // let idList = [];
  // for (let i = 0; i < count; i++) {
  //
  //   idList.push(Math.floor(Math.random() * 4000000));
  // }
  // return idList;
  return await redis.spop(ID_SET_TO_REDIS_KEY, count);
}

async function markArticleIdSucceed(id) {
  return await redis.sadd(RETRIEVED_ID_SET_TO_REDIS_KEY, id);
}

async function idBackInPool(id) {
  return await redis.sadd(ID_SET_TO_REDIS_KEY, id);
}

module.exports = {
  generateResourceIdToRedis,
  getRandomResourceIds,
  markArticleIdSucceed,
  idBackInPool,
};
