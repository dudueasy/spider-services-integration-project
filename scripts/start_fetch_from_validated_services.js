const spiderService = require('../services/spider_service');
const logger = require('../utils/loggers/logger');


switch (process.argv[2]) {
  case "start_fetch_from_spider_services":
    console.log('开始从微服务获取数据')
    spiderService.startFetchFromSpiderServices()
      .catch(err => {
        logger(
          'error',
          'error during function initSpider: %s',
          err.message, {stack: err.stack},
        );
      });
    break;

  default:
    console.log('unknown command');
}
