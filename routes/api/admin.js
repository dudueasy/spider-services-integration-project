const express = require('express');
const router = express.Router();
const apiRes = require("../../utils/api_response");
const spiderService = require('../../services/spider_service');

// 注册爬虫服务, 调用 spider_service_model
router.post('/spider', async (req, res, next) => {
  console.log('进入 admin 中间件');
  try {
    const {service} = req.body;
    const createdSpider = await spiderService.registerSpider(service);
    req.data = {spiderService: createdSpider};
    apiRes(req, res);
  } catch (e) {
    req.err = e;
    apiRes(req, res);
  }
});


router.get('/showservices', async(req, res, next)=>{
  const spiderServices = await spiderService.showSpiders()
  req.data = {services:spiderServices}
  apiRes(req, res);
})

module.exports = router;
