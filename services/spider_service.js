const axios = require('axios');

const SpiderServicesModel = require('../models/mongoose/spider_servcies_model');
const HTTPReqParamError = require('../errors/http_request_param_error');
const HTTPBaseError = require('../errors/http_base_error');
let logger = require('../utils/loggers/logger');

/*
* @param spiderService 爬虫服务对象(注册微服务时提供的请求体)
* @param spiderService.name 服务名, 唯一
* @param spiderService.url 服务校验地址
*/

// 这里进行爬虫服务的注册
async function registerSpider(spiderService = {name: '', validationUrl: ''}) {
  const {name, validationUrl} = spiderService;
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
    .catch(e => {
      throw(e);
    })
  ;


  // 调用微服务的验证 url
  const res = await axios(createdService.validationUrl)
    .catch(err => {
      logger(
        'error',
        'uncaughtException error: %s',
        err.message, err.stack,
      );

      throw new HTTPBaseError(
        400,
        '服务验证失败, 请检查爬虫访问是否可用',
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
    createdService._doc.config = res.data.config;
    createdService._doc.status = 'validated';
    const updatedService = await SpiderServicesModel.updateSpiderService(createdService);
    return updatedService;
  }
}

module.exports = {registerSpider};

