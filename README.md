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
* 爬虫命令行入口: /spider.js

## 启动前配置
### 数据库依赖:  MongoDB & Redis

### 所需配置项
启用项目前, 用户需要使用 dotenv 并且通过 .env 文件定义以下环境变量:

~~~
# config for mongodb
DB_RESOURCE_DB
DB_COLLECTION
DB_URL

# configuration for spider
DEFAULT_TASK
RESOURCE_URL_PREFIX
CONTENT_SELECTOR
TARGET_COUNT
INTERVAL

# pbkdf2 params
SALT
ITERATION_TIMES
KEY_LEN
DIGEST

# JWT options
JWT_SECRETKEY
JWT_TOKEN_EXPIRESIN

# Redis options
# -- the key of resource Ids set in redis
ID_SET_TO_REDIS_KEY

# --the key of retrieved Ids set in redis
RETRIEVED_ID_SET_TO_REDIS_KEY
~~~




## 启动项目:
* 启动 mongdb 数据库:
~~~
mongod --dbpath db
~~~
* 启动服务器
~~~
node bin/www
~~~
* one step launch all
~~~
npm start
~~~
* 启动爬虫
默认每次爬取100条数据, 单次爬取数量可以通过 .env 中的 TARGET_COUNT 字段定义.
前台启动:
~~~
node spider
~~~
后台启动
~~~
npm run run:spider
~~~
## API
##### GET '/api' 
Return users list

##### POST '/api/login'
For user login\
Post parameters:
* username 
* password 

##### POST '/api/user' 
For registering an user\
Post parameters:
* username
* password

##### GET 'api/user/:userId'
Return corresponded user data

##### POST 'api/user/:userId/subscription'
Create a subscription for corresponded user\
Login is require\
Get parameters:
* url

##### GET 'api/user/:userId/subscription'
Return corresponded user subscription info\
Login is required



## 错误处理和日志
  * 通过 winston@2 完成错误日志的记录
  * 流程图:
![Error handling flow](./error-handling-flow.png)



