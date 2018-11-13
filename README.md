# 项目说明
An Express & Mongoose & JWT & Redis & Spider Project

## 功能实现
  * 数据库: mongodb + mongoose
  * 用户鉴权: JWT
  * Spider: axios & cheerio
  * 测试
    * 获取用户列表 'localhost:3000/api/'

## 交互逻辑
routes <-> services <-> model

## 文件结构
* 项目入口: /bin/www
* 数据库: /db
    * 用户数据库名: process.env.DB_USERTABLE
* 日志文件: /logs
* 路由: /routes
* 中间服务层: /services
* Model: /models

## 启动前配置
### 依赖:  mongoDB

### 所需配置项
启用项目前, 用户需要通过 dotenv 和 .env 文件定义以下环境变量:

~~~
# database name
DB_USERTABLE

# configuration for spider
RESOURCE_URL
CONTENT_SELECTOR

# pbkdf2 password hash params
SALT
ITERATION_TIMES
KEY_LEN
DIGEST

# JWT options
JWT_SECRETKEY
JWT_TOKEN_EXPIRESIN
~~~

## 启动项目:
* 启动 mongdb 数据库:
~~~
mongod --dbpath db
~~~
* 启动项目
~~~
node bin/www
~~~
* one step launch all
~~~
npm start
~~~

## API
### under '/api'
* GET '/'

Return users list

* POST 'login'

For user login
Require username & password in request body


### under '/api/user'
* POST '/'

For register an user
Require name, username, password in request body

* GET '/:userId'

Return corresponding user data

* POST '/:userId/subscription'

Create a subscription for corresponding user.
Login is required
Require url in request body

* GET '/:userId/subscription'

Return corresponding user subscription info
Login is required



## 错误处理和日志
  * 通过 winston 完成错误日志的记录
  * 流程图:
![Error handling flow](./error-handling-flow.png)



