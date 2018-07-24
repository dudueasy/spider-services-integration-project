var express = require('express');
var router = express.Router();
var UserService = require('../services/user_service.js')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let allUsers = await UserService.getAllUsers()
  res.render('users', {users:allUsers} )
});

router.post('/', async (req, res)=>{
  const { name, age} = req.body;
  const u = await UserService.addNewUsers(name, age)

  let allUsers = await UserService.getAllUsers()
  res.render('users', {users:allUsers} )


})
router.get('/:userId', async (req, res) => {
  let userId = Number(req.params.userId)

  try {
    let user = await UserService.getUserById(userId)
    console.log('userId: ', userId)
    let result = new Array(UserService.findUser(userId))
    res.render('User', {users: result})
  } catch (error) {
    res.end('找不到用户')
  }
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
