# 项目说明
一个通用的 Express + Mongodb + Elasticsearch 爬虫微服务聚合项目, 可通过聚合满足聚合协议的爬虫微服务来获取相关资源数据.

具备鉴权机制, 用户可以订阅系统中的微服务来获得数据.

提供数据搜索功能. 可以通过接口实现分页.

## 功能实现
  * 数据库: mongodb & Elasticsearch
  * 用户鉴权机制: JWT
  * Spider: axios & cheerio

## 交互逻辑
routes <-> services <-> model

## 文件结构
* 项目入口: bin/www/
* 数据库: db/
* 日志文件: logs/
* 路由: routes/
* 中间服务层: services/
* Model: models/

## 启动前配置
### 数据库依赖:  MongoDB & Elasticsearch

### 所需配置项
启用项目前, 用户需要使用 dotenv 并且通过 .env 文件定义以下环境变量:

~~~ 
# config for server
PORT 

# config for mongodb (聚合服务数据存储)
DB_RESOURCE_DB
DB_COLLECTION
DB_URL

# pbkdf2 params
SALT
ITERATION_TIMES
KEY_LEN
DIGEST

# JWT options
JWT_SECRETKEY
JWT_TOKEN_EXPIRESIN 

#elasticsearch
ES_HOST 
# ES_INDEX for content from registered spider content service
ES_INDEX 
# ES_TYPE for content from registered spider content service
ES_TYPE
~~~

## 如何启动项目:
### 启动 mongdb 数据库:
~~~
mongod --dbpath db
~~~ 

### 启动 elasticsearch 服务:
1. 请根据 elasticsearch 所在目录来启用 elasticsearch 服务

2. 初始化 elasticsearch 数据库
~~~
node scripts/es_index_init.js init_es_index
~~~


### 启动http服务器
~~~
node bin/www
~~~

### one step launch all (请自行启用 elasticsearch 服务)
~~~
npm start
~~~

### 微服务 cli
#### 从所有已注册的, 可用的微服务处持续获取资源
~~~
node scripts/start_fetch_from_validated_services.js start_fetch_from_spider_services
~~~

## CONTENT API  
#### GET 'api/search/:keyword'
关键字搜索功能
* 查询参数: 

    page: 表示资源条目所在的页数, 默认为 0 
    
    pageSize: 表示每次拉取的条目数, 默认为 10 
    
## USER API
##### GET '/api' 
返回用户列表数据

##### POST '/api/user' 
用于注册用户, 需要提交以下数据, 返回值是 jwttoken
* name
* username
* password

##### POST '/api/user/login' 
用于注册用户, 需要提交以下数据, 返回值是 jwttoken 和用户数据
* username
* password

##### GET 'api/user/:userId'
用于获取对应用户的用户数据

##### GET 'api/user/:userId/subscription'
获取对应用户的订阅信息, **需要登录**.

##### POST 'api/user/:userId/subscription'
为指定用户创建一个订阅, **需要登录**, 需要以下数据: 
* type 

    订阅的资源类型.
    type 的值是以下集合中的一个值: ['spider_services']
    
* sourceId

#### GET 'api/user/:userId/subContent'
从用户订阅的微服务拉取数据, **需要登录**. 
* 查询参数:

    page: 表示资源条目所在的页数, 默认为 0

    pageSize: 表示每次拉取的条目数, 默认为 10 

#### 如何通过登录要求?
由于本项目中使用了 JWT 来实现用户鉴权机制. 
用户需要首先通过 '/api/user/login' 接口获取登陆的 token. 
然后在请求头的 Authentication 字段中赋值, 
字段值以 Bearer 开头, 后接 token 字符串.
```
Authentication: Bearer xxxxxxxxxxxxx 
```

## SERVICES API
##### GET '/api/admin/showservices' 
返回项目已聚合的微服务信息

##### POST '/api/admin/spider'
向聚合项目提交一个微服务
* 请求体: 
 ~~~
 service: {
      name: String, // 服务名, 不能与项目中现有的服务重名
      validationUrl,  // 验证 URL, 爬虫服务需要在这个 URL 被访问时返回正确的数据, 包含了从微服务获取爬虫资源的接口
    } 
~~~

# 微服务注册协议和接口 
## 单条内容的数据结构 ##
符合本平台推荐内容的数据, 结构应该如下: 
~~~
// Mongoose Schema
  resourceId: {type: String, required: true },
  title: {type: String, required: true},
  contentType: String,
  content: {type: Mixed},
  createdAt: String,
  originalCreatedAt: String,
  tags: [{name: String, value: String, score: Number}],
  source: {type: String, required: true} // 资源的来源, 例如 zhihu.com
~~~
***
## 协议 ##
  本协议使用 HTTP/1.1 协议进行通讯, 通过约定一系列的接口, 实现爬虫微服务的接入与聚合推荐系统的数据同步\
  爬虫协议名: FULL_FLEDGED_NET_SPIDER_PROTOCOL/0.1

### 协议中的基本概念 ###
##### 服务发现 #####
  为满足聚合推荐服务发现符合规定的爬虫, 并且进行数据获取的操作, 所需要的服务发现和注册功能.
##### 数据同步 ##### 
  本服务规定了一系列的数据同步规则, 用于在聚合推荐服务和爬虫之间交换数据.

***
### 聚合服务接口约定 ###

##### 注册服务接口 ##### 
~~~ 
  PATH: /api/admin/spider 
  METHOD: POST 
  CONTENT-TYPE: application/json 
  REQUEST-BODY:{
    service: {
      name: String, // 服务名, 不能与项目中现有的服务重名
      validationUrl,  // 验证 URL, 爬虫服务需要在这个 URL 被访问时返回正确的数据, 包含了从微服务获取爬虫资源的接口
    } 
  } 

  SUCCESS-RESPONSE-BODY:
  {
    code:0, 
  } 

  ERROR-RESPONSE-BODY:
  {
    code: errorCode,
    msg: errorMessage 
  }
~~~

##### 修改服务注册信息接口 #####
~~~
  PATH: /api/service/:serviceName
  METHOD: PATCH 
  CONTENT-TYPE: application/json 
  REQUEST-BODY:{
    service: {
      name: String, // 服务名, 不能与项目中现有的服务重名
      validationUrl,    // 验证 URL, 爬虫服务需要在这个 URL 被访问时返回正确的数据
      status //表示服务目前的状态: 已注册/经过验证/运行中/暂停/停止/已更新
    }
  } 
~~~
##### 注销服务接口 #####
~~~
  PATH: /api/service/:serviceName
  METHOD: DELETE 

  SUCCESS-RESPONSE-BODY:
  { 
    code:0, 
  }

  ERROR-RESPONSE-BODY: 
  { 
    code: errorCode, 
    msg: errorMessage, 
  } 
~~~

### 爬虫微服务接口约定  ###
##### 验证接口 #####
通过调用该接口, 爬虫微服务应该返回符合规范的内容,
以表示该爬虫能够兼容聚合服务的协议.
聚合服务通过这个接口返回的 config 字段中的 singleContent 和 contentList
中的参数来获得接口 url 和相关查询参数
~~~
  PATH: 由注册爬虫的服务决定
  METHOD: GET
  CONTENT-TYPE: application/json

  SUCCESS-RESPONSE-BODY:
  {
    code:0,
    protocol:{
      version: String, 
      name: 'FULL_FLEDGED_NET_SPIDER_PROTOCOL', 
    },
    config:{
      singleContent:{
        url: String,
        frequency: Number
      }, 
      contentList:{
        url: String,
        frequency: Number,
        pageSize: Number
      } 
    } 
  } 

  ERROR-RESPONSE-BODY:
  {
    code: errorCode,
    msg: errorMessage 
  }
~~~ 
##### 获取多条内容的接口 #####
~~~
  PATH: 由验证接口返回
  METHOD: GET
  CONTENT-TYPE: application/json
  REQUEST-_PARAMS: {
    pageSize: Number, 
    latestId: String  // latestID 用来表示最后一次爬取时的资源 id, 避免爬取重复资源.
  }

  SUCCESS-RESPONSE-BODY:
  {
    code:0, 
    data:{ 
      contentList: [] 
    },
  } 
~~~


## 错误处理和日志
  * 通过 winston@2 完成错误日志的记录
  * 流程图:
![Error handling flow](./error-handling-flow.png)



