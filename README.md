# 项目说明
An Universal Express & Mongodb & JWT & Redis Spider App<br>
一个通用的Express Mongodb JWT Redis 爬虫应用

## 爬取规则
适用于使用了有序的, 递增 id 的资源\
通过范围内的随机 id 以及可定义的爬取间隙来对应反爬虫策略

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
* 日志文件: /logs
* 路由: /routes
* 中间服务层: /services
* Model: /models

## 启动前配置
### 数据库依赖:  MongoDB & Redis

### 所需配置项
启用项目前, 用户需要使用 dotenv 并且通过 .env 文件定义以下环境变量:

~~~
# Database config for sipder
DB_RESOURCE_DB
DB_COLLECTION
DB_URL

# Configuration for spider
RESOURCE_URL
CONTENT_SELECTOR
INTERVAL

# Pbkdf2 password hash params
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

#### GET '/'
Return users list

#### POST 'login'
For user login\
Require username & password in request body


### under '/api/user'
#### POST '/'

For registering an user\
Require name, username, password in request body

#### GET '/:userId'

Return corresponded user data

#### POST '/:userId/subscription'

Create a subscription for corresponded user\
Login is required\
Require url in request body

#### GET '/:userId/subscription'

Return corresponded user subscription info
Login is required



## 错误处理和日志
  * 通过 winston 完成错误日志的记录
  * 流程图:
![Error handling flow](./error-handling-flow.png)



