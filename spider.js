// a customized CLI tool
// used to generate resource id or start fetch data
// usage: node spider command minId maxId
// example1: node spider generate_ids 1 12
// example2: node spider start_getting_articles

const RedisService = require('./redis_service');
const spiderService = require('./spider_service');
let logger = require('./utils/loggers/logger');
let defaultTask = process.argv[2]||process.env.DEFAULT_TASK;

switch (defaultTask) {
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

  // process.argv[3] as amount of resources to process.
  case 'start_getting_articles':
    getArticleInBG(process.argv[3] || process.env.TARGET_COUNT)
      .then(r => {
        console.log('start_getting_articles job done');
        process.exit(0)
      })
      .catch(e => {
        console.log('error happen during task start_getting_articles: ', e.message);
        throw e;
        // process.exit(1);
      });
    break;

  case 'get_single_article':
    spiderService.getSingleArticle(process.argv[3])
      .then(r => {
        console.log("result: ", r)
        console.log('job done!');
      })
      .catch(e => {
        console.log('error happen during task get_single_article: ', e.stack);
        throw e;
        // process.exit(1);
      });
    break;
}

// run Spider.spideringArticles on the background
async function getArticleInBG(totalAmount) {

  let remainingCount = totalAmount ? parseInt(totalAmount) : RedisService.getRemainingIdCount();
  console.log(` 需要爬取的次数: ${ remainingCount}`);

  const numbersPerTime = 5;
  let attemptCount = 0;
  let totalErrCount = 0;
  let totalSuccedCount = 0;

  while (remainingCount >= numbersPerTime) {
    await spiderService.spideringArticles(numbersPerTime)

      .then(counter => {
        totalSuccedCount += counter.succeedCount;
        totalErrCount += counter.errCount;
      })
      .catch(err => {
        logger('error', 'uncaughtException error: %s', err.message);
      });

    remainingCount -= numbersPerTime;
    attemptCount += numbersPerTime;
  }

  // logger
  console.log('info',
    `job done, attempted fetching ${ attemptCount } resources,
success ${totalSuccedCount} times,
fail ${totalErrCount} times `);
}

process.on('uncaughtException', (err) => {
  logger('error', 'uncaughtException error: %s', err.message, err.stack);
  // process.exit(1);
});


process.on('unhandledRejection', (err) => {
  logger('error', 'uncaughtException error: %s', err.message, err.stack);
  // process.exit(1);
});
