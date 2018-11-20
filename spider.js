// a customized CLI tool
// used to generate resource id or start fetch data
// usage: node spider command minId maxId
// example1: node spider generate_ids 1 12
// example2: node spider start_getting_articles

const RedisServer = require('./redis_service');
const Spider = require('./spider_demo');

switch (process.argv[2]) {
  case 'generate_ids':
    RedisServer.generateResourceIdToRedis(Number(process.argv[3]), Number(process.argv[4]))
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

  case 'start_getting_articles':
    Spider.spideringArticles(10)
      .then(r => {
        console.log('done');
      })
      .catch(e => {
        console.log('error happen during task start_getting_articles: ', e.message);
        // process.exit(1);
      });
    break;

  case 'get_single_article':
    Spider.getSingleArticle(process.argv[3])
      .then(r => {
        console.log('job done!');
      })
      .catch(e => {
        console.log('error happen during task get_single_article: ', e);
        // throw e;
        // process.exit(1);
      });
    break;
}