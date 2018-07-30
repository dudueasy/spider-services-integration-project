let express = require('express');
let router = express.Router();
let UserService = require('../../services/user_service.js')
let HTTPReqParamError = require('../../errors/http_request_param_error')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  (async()=>{
    // 抛出异常的实例:
    throw new HTTPReqParamError('id', 'id not found')

    return await UserService.getAllUsers()
  })()
    .then((allUsers)=>{
      res.render('users', {users:allUsers}
      )}
    )
    // 如果发现错误就用 next(e) 传递给错误处理中间件
    .catch(e=>{next(e)})
});

router.post('/', async (req, res)=>{
  const { name, age} = req.body;
  const u = await UserService.addNewUsers(name, age)

  let allUsers = await UserService.getAllUsers()
  res.render('users', {users:allUsers} )


})

router.get('/:userId', async (req, res,next) => {

  (async()=>{
    let userId = req.params.userId
    if(userId.length < 5){
      throw new HTTPReqParamError('userId','用户id不能为空')
    }
    else{

      console.log('userId.length > 5')
      let user = await UserService.getUserById(userId)
      let result = new Array(UserService.findUser(userId))
      res.render('User', {users: result})
    }
  })()
    .then()
    .catch((e)=>{
      next(e)
    })

})

router.get('/:userId/subscription', (req, res) => {
  try {
    let result = UserService.getSubscription(req.params.userId)
    console.log(req.params.userId)
    res.render('Sub', {subscription: result})
  } catch (err) {
    res.end(err)
  }
})

router.post('/:userId/subscription', (req, res) => {
  let newSub = UserService.createSubscript(req.params.userId, req.body.url)
  res.render('Sub', {subscription: newSub})
})

module.exports = router;
