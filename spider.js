// a customized CLI tool
// used to generate resource id or start fetch data
// usage: node spider command minId maxId
// example1: node spider generate_ids 1 12
// example2: node spider start_getting_articles

const RedisService = require('./redis_service');
const spiderService = require('./spider_service');
let logger = require('./utils/loggers/logger');

switch (process.argv[2]) {
  case 'generate_ids':
    RedisService.generateResourceIdToRedis(Number(process.argv[3]), Number(process.argv[4]))
      .then((success) => {
          console.log('done', success);
          process.exit(0);
        },
      )
      .catch(e => {
        console.log(e);
        process.exit(1);
      });
    break;

  //
  case 'start_getting_articles':
    getArticleInBG(process.argv[3])
      .then(r => {
        console.log('done');
      })
      .catch(e => {
        console.log('error happen during task start_getting_articles: ', e.message);
        // process.exit(1);
      });
    break;

  case 'get_single_article':
    spiderService.getSingleArticle(process.argv[3])
      .then(r => {
        console.log('job done!');
      })
      .catch(e => {
        console.log('error happen during task get_single_article: ', e);
        throw e;
        // process.exit(1);
      });
    break;
}

// run Spider.spideringArticles on the background
async function getArticleInBG(totalAmount) {
  const remainingCount = totalAmout ? totalAmout : RedisService.getRemainingIdCount();

  const numbersPerTime = 5;
  while (remainingCount >= numbersPerTime) {
    await spiderService.spideringArticles(numbersPerTime)
      .then(({succeedCount, errCount}) => {
        console.log(succeedCount, errCount);
      })
      .catch(e => errCount += 1);
  }
}

process.on('uncaughtException', (err) => {
  logger('error', 'uncaughtException error: %s', err.message, err.stack);
});

