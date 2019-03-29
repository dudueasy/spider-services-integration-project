const SubscriptionModel = require('../models/mongoose/subscription');

async function createSubscription(userId, subscriptionType, sourceId) {
  const createdSub = await SubscriptionModel.upsert({
    userId,
    type: subscriptionType,
    sourceId,
  });

  return createdSub;
}

module.exports = {createSubscription}