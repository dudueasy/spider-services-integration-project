let express = require('express');
let JWT = require('jsonwebtoken');
let userRouter = require('./users_route');
let adminRouter = require('./admin');
let UserService = require('../../services/user_service.js');
let esService = require('../../services/es_service');
let HTTPReqParamError = require('../../errors/http_request_param_error');
const auth = require('../../middlewares/auth');
const apiRes = require('../../utils/api_response');

let router = express.Router();

//! routers in this module is under '/api'  path

/* GET home page. GET users list. */
router.get('/', async function (req, res, next) {
  (async () => {
    return await UserService.getAllUsers();
  })()
    .then((allUsers) => {
        req.data = {userList: allUsers};
        apiRes(req, res);
      },
    )
    // 如果发现错误就用 next(e) 传递给错误处理中间件
    .catch(e => {
      next(e);
    });
});

/* Search  content */

//   searchMongoDBByTag(tag = "", page = 0, pageSize = 10)
router.get('/search/:keyword', async (req, res, next) => {
  // console.log("enter api/search/:keyword middleware")
  const {keyword} = req.params;
  // console.log(keyword)
  let {page, pageSize} = req.query;
  page = page || 0;
  pageSize = pageSize || 0;

  await esService.searchMongoDBByTag(keyword, page, pageSize)
    .then((contents) => {

        req.data = {contents};
        apiRes(req, res);
      },
    )
    // 如果发现错误就用 next(e) 传递给错误处理中间件
    .catch(e => {
      next(e);
    });
});

router.use('/user', userRouter);
router.use('/admin', adminRouter);


module.exports = router;
