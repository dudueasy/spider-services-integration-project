let express = require('express');
let JWT = require('jsonwebtoken');
let userRouter = require('./users_route');
let adminRouter = require('./admin');
let UserService = require('../../services/user_service.js');
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


// 提交用户登录数据
router.post('/login', async (req, res, next) => {
  (async () => {
    // console.log(1)
    const {username, password} = req.body;

    // result = {token, userFound}
    const result = await UserService.loginWithNamePwd({username, password});

    // console.log(2)
    console.log('result: ', result);
    return result;
  })()
    .then(
      result => {
        console.log('result: ', result);
        req.data = result;
        apiRes(req, res);
      })
    .catch(
      e => {
        next(e);
      },
    );
});

router.use('/user', userRouter)
router.use('/admin', adminRouter)


module.exports = router;
