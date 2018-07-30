let express = require('express');
let router = express.Router();
let JWT = require('jsonwebtoken')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/login', (req, res,next)=>{
  // 从查询参数中获取 username
  let {username} = req.query
  let user = {username}

  // 向 express-session session对象存储数据, 访问 '/hello-session' 来测试
  req.session.user = {username}

  // 创建JWT token
  JWTSecretKey = 'this is a secret key'
  let token = JWT.sign(user, JWTSecretKey)
  res.send(token)
})

router.post('/login', (req, res,next)=>{

})


// 由于使用了 JWT , 这个中间件需要用 postman 来发起请求. 在header 中加入
// Authorization  Bearer ${token} 才能起到测试效果

router.get('/hello', (req, res,next)=>{
  // 获得请求头中 Authorization 字段的值
  let auth = req.get('Authorization')
  if(!auth) {res.send('no auth, please request with a proper header which includes Authorization information')}
  else{

    // 检查请求头中 Authorization 字段值是否包含 Bearer 数据
    if(auth.indexOf('Bearer') <0 ) res.send('no auth')
    else{
      // 去除Bearer 字段(这里有一个空格)
      let token = auth.split('Bearer ')[1]
      console.log(token)

      JWTSecretKey = 'this is a secret key'
      let user = JWT.verify(token, JWTSecretKey)
      res.send(user)
    }
  }
})

// 从 express-session session对象 获取数据
router.get('/hello-session', (req, res,next)=>{
  let {username} = req.session.user
  if(username){
    res.send(`user in session: ${JSON.stringify(username)}`)
  }else{
    res.send('no user data registered')
  }

})

router.post('/login', (req, res, next)=>{
  (async()=>{

  })()
    .then(r=>{

    })
    .catch(e=>{

    })

})

module.exports = router;
