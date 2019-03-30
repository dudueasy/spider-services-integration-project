const SubscriptionModel = require('../models/mongoose/subscription');
const SpiderServicesContentModel = require('../models/mongoose/spider_services_content_model');

// 目前仅支持用户订阅一个微服务
async function createSubscription(userId, subscriptionType, sourceId) {
  return await SubscriptionModel.upsert({
    userId,
    type: subscriptionType,
    sourceId,
  });
}

async function getSpiderServiceContents(userId, page = 0, pageSize = 10) {
  // get user subscribed spider service
  const spiderServices = await SubscriptionModel.model.find(
    {userId: userId, type: 'spider_services'},
    {_id: 0, sourceId: 1});

  const spiderServicesId = spiderServices.map(s => s.sourceId);

  // get spider service content
  const contents = await SpiderServicesContentModel
    .find(
      {spiderServiceId: {$in: spiderServicesId}},
      null,
      {skip: page * pageSize})
    .limit(pageSize);

  const amount = await SpiderServicesContentModel
    .count({spiderServiceId: {$in: spiderServicesId}});

  return {contents, totalAmount: amount, page, pageSize};
}


module.exports = {createSubscription, getSpiderServiceContents};