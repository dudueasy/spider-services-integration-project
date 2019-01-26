const express = require('express');
const router = express.Router();
const apiRes = require("../../utils/api_response");
const spiderService = require('../../services/spider_service');

// 注册爬虫服务, 调用 spider_service_model
router.post('/spider', async (req, res, next) => {
  console.log('进入 admin 中间件');
  try {
    const {spider} = req.body;
    const createdSpider = await spiderService.registerSpider(spider);
    req.data = {spider: createdSpider,};
    apiRes(req, res);
  }
  catch (e) {
    next(e);
  }
});

module.exports = router;
