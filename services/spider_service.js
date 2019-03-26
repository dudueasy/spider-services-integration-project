const axios = require('axios');
require('./mongoose_db_connection');

const SpiderServicesModel = require('../models/mongoose/spider_services_model');
const HTTPReqParamError = require('../errors/http_request_param_error');
const HTTPBaseError = require('../errors/http_base_error');
const DBQueryError = require('../errors/db_query_error');
const ContentModel = require('../models/mongoose/spider_services_content_model');
let logger = require('../utils/loggers/logger');
const esService = require('./es_service');

/*
 * @param spiderService 爬虫服务对象(注册微服务时提供的请求体)
 * @param spiderService.name 服务名, 唯一
 * @param spiderService.url 服务校验地址
 */

// 这里进行爬虫服务的注册
async function registerSpider(spiderService = {name: '', validationUrl: ''}) {
  const validators = {
    name: (name) => {
      if (!name) {
        throw new HTTPReqParamError(
          'spider service name',
          '服务名不能为空',
        );
      }
    },
    validationUrl: (validationUrl) => {
      if (!validationUrl) {
        throw new HTTPReqParamError(
          'spider service validation url',
          '验证 url 不能为空',
        );
      }
      // 如果验证 url 不以 http 开头
      if (validationUrl.indexOf('http') === -1) {
        throw new HTTPReqParamError(
          'spider service validation url',
          '非法的 url',
        );
      }
    },
  };

  // 使用 validators 中定义的函数来校验 spiderService 中的字段是否可用
  for (const key in validators) {
    validators[key](spiderService[key]);
  }

  // 通过校验后, 将 spiderService 微服务的相关数据持久化存储
  spiderService.status = "registered";

  let createdService = await SpiderServicesModel.registerSpiderService(spiderService)
    .catch(err => {
      logger('error',
        'uncaughtException error: %s',
        err.message, err.stack,
      );

      let error = new DBQueryError("查询字段异常", "查询数据库异常");
      throw(error);
    })
  ;


  // 调用微服务的验证 url
  const res = await axios(createdService.validationUrl).catch(err => {
    logger(
      'error',
      'uncaughtException error: %s',
      err.message, err.stack,
    );

    throw new HTTPBaseError(
      400,
      '服务验证失败, 请检查爬虫服务是否可用',
      40200,
      'error during requesting validation url',
    );
  });

  // 处理调用爬虫服务验证 url 获得的返回值, 结构由项目的聚合协议来规定
  if (res && res.data) {
    console.log('验证接口的返回值为: ', res.data);
    const spiderServiceResponseValidators = {
      code: (code) => {
        if (code !== 0) {
          throw new HTTPBaseError(
            400,
            `爬虫访问验证错误: code:${code}`,
            40201,
            "spider service returned a error code",
          );
        }
      },
      protocol: (protocol) => {
        if (!protocol) {
          throw new HTTPBaseError(
            400,
            "协议信息为空!",
            40202,
            "spider service returned an empty protocol information",
          );
        }
        if (!protocol.version) {
          throw new HTTPBaseError(
            400,
            `错误的版本号: ${protocol.version}`,
            40203,
            "spider service returned an invalid protocol version",
          );
        }
        if (protocol.name !== 'FULL_FLEDGED_NET_SPIDER_PROTOCOL') {
          throw new HTTPBaseError(
            400,
            `错误的协议名: ${protocol.name}`,
            40204,
            "spider service returned an invalid protocol name",
          );
        }
      },
      config: (config) => {
        if (!config) {
          throw new HTTPBaseError(
            400,
            '不符合约定: 空的配置',
            40205,
            "spider service returned empty config information",
          );
        }
        if (!config.singleContent) {
          throw new HTTPBaseError(
            400,
            '不符合约定: 配置信息不完整',
            40206,
            "invalid config information",
          );
        }

        if (!config.singleContent.url || !config.singleContent.frequency) {
          throw new HTTPBaseError(
            400,
            '不符合约定: 配置信息不完整',
            40207,
            "spider service returned empty config content list information",
          );
        }
        if (!config.contentList) {
          throw new HTTPBaseError(
            400,
            '不符合约定: 配置信息不完整',
            40208,
            "invalid config information",
          );
        }
        if (
          !config.contentList.url ||
          !config.contentList.frequency ||
          !config.contentList.pageSize
        ) {
          throw new HTTPBaseError(
            400,
            '不符合约定: 配置信息不完整',
            40208,
            "spider service returned empty config single content information",
          );
        }
      },
    };

    // use spiderServiceResponseValidators to check response
    // retrieved from validationUrl
    for (const key in spiderServiceResponseValidators) {
      spiderServiceResponseValidators[key](res.data[key]);
    }
    createdService._doc.singleContent = res.data.config.singleContent;
    createdService._doc.contentList = res.data.config.contentList;
    createdService._doc.status = 'validated';

    const updatedService = await SpiderServicesModel.updateSpiderService(createdService);
    return updatedService;
  }
}

// 从微服务 (来自spiderservices 数据库的参数对象) 上获取数据
async function startFetchingProcess(spiderService) {
  const {contentList} = spiderService;
  let {latestId} = contentList;
  let startedAt;
  let endedAt;
  const {url, pageSize, frequency} = contentList;
  const actualIntervalMills = Math.ceil(1000 / frequency) * 2;
  const upsertPromises = [];

  // 循环爬取数据, 通过 latestID 来保存位置
  while (true) {
    // 从爬虫服务获取数据并存入数据库, 请求异常时终结定时器
    latestId = latestId || '';
    startedAt = Date.now();
    const retrievedContents = await fetchingLists(url, latestId, pageSize)
      .catch(err => {
        logger(
          'error',
          'error during function fetchingLists(): %s',
          err.message, {stack: err.stack},
        );
        throw new HTTPBaseError(
          400,
          '爬虫数据服务请求异常',
          40000,
          "invalid config information",
        );
      });

    // 从微服务获取多个数据, 并单独封装每一个数据.
    // 将每个数据添加到一个 promise 列表中, 用于执行之后的 mongodb findOneAndUpdate 操作.
    const wrappedContent = retrievedContents.map((singleContent) => {
      const wrappedSingleContent = {
        spiderServiceContentId: singleContent.contentId,
        spiderServiceId: spiderService._id.toString(),
        contentType: singleContent.contentType,
        content: {
          resourceId: singleContent.resourceId,
          articleContentHtml: singleContent.content.html,
          articleContentText: singleContent.content.text,
          originalCreatedAt: singleContent.originalCreatedAt,
        },
        title: singleContent.title,
        tags: singleContent.tags,
      };

      // push one mongodb update task into a list for promise.all
      upsertPromises.push(ContentModel.findOneAndUpdate(
        {
          spiderServiceContentId: singleContent.contentId,
        },
        wrappedSingleContent,
        {
          upsert: true,
          new: true,
        }));

      return wrappedSingleContent;
    });


    const insertedList = await Promise.all(upsertPromises).catch(err => {
      logger(
        'error',
        'error during querying database: %s',
        err.message, {stack: err.stack},
      );
      throw new DBQueryError("查询异常", "查询数据库异常");
    });


    await esService.createOrUpdateContentList(insertedList)
      .catch(err => {
        logger(
          'error',
          'error during function startFetchingProcess: %s',
          err.message, {stack: err.stack},
          process.exit(1),
        );
      });


    let currentLatestId = wrappedContent[wrappedContent.length - 1].spiderServiceContentId;
    spiderService.contentList['latestId'] = currentLatestId;


    let updatedSpiderService = await SpiderServicesModel.model.findOneAndUpdate(
      {_id: spiderService._id},
      {contentList: spiderService.contentList},
      {
        new: 1,
        projection: {contentList: 1},
      },
    ).catch(e => {
      console.log("在查询数据库更新 latestId 的时候遇到出现异常:\n");
      console.log(e);
    });

    latestId = updatedSpiderService._doc.contentList.latestId;
    console.log("latestId :", latestId);


    if (wrappedContent.length < pageSize) {
      // stop fetching resource while remained resources are less than the number of pageSize
      break;
    }

    endedAt = Date.now();
    let timeCosted = endedAt - startedAt;
    if (timeCosted < actualIntervalMills) {
      console.log(`wait ${actualIntervalMills - timeCosted} ms to continue`);
      await new Promise(resv => (
        setTimeout(resv, (actualIntervalMills - timeCosted))));
    }
  }
}

// 从微服务接口获取数据, 返回获取到的数据
async function fetchingLists(url, latestId, pageSize) {
  console.log(`正在从 ${url} 获取${pageSize} 条数据`);
  return await axios.get(url, {
    params:
      {latestId: latestId, pageSize: pageSize},
  })
    .then(
      res => {
        let {contentList} = res.data;
        return contentList;
      })
    .catch(
      (err) => {
        logger(
          'error',
          'error fetching content from spider content API: %s',
          err.message, {stack: err.stack},
        );

        throw err;
      });
}

// 从聚合项目数据库中所有已注册的爬虫微服务获取文章数据
async function startFetchFromSpiderServices() {
  const spiderServices = await SpiderServicesModel.model.find({status: 'validated'});
  if (!spiderServices) {
    throw new Error('没有爬虫服务可以使用');
  } else {
    console.log('开始从爬虫服务获取数据');

    for (let i = 0; i < spiderServices.length; i++) {
      startFetchingProcess(spiderServices[i]._doc).catch(err => {
        logger(
          'error',
          'error during function startFetchingProcess: %s',
          err.message, {stack: err.stack},
        );
        process.exit(1);
      });
    }
  }
}


async function showSpiders() {
  return await SpiderServicesModel.model.find();
}

module.exports = {registerSpider, showSpiders, startFetchFromSpiderServices};
