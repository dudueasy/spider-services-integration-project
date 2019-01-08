### 数据结构约定 ###

#### 单条内容的数据结构 ####
符合本平台推荐内容的数据, 结构应该如下: 
~~~
// Mongoose Schema
  resourceId: {type: String, required: true },
  title: {type: String, required: true},
  content: {type: Mixed},
  articleContentHtml: Strnig,
  createAt: {type: Number, default: Date.now().valueOf()},
  tags: [{name: String, value: String, score: Number}],
  source: {type: String, required: true} // 资源的来源, 例如 zhihu.com
~~~

### 协议 ###
  本协议使用 HTTP/1.1 协议进行通讯, 通过约定一系列的接口, 实现爬虫微服务的接入与聚合推荐系统的数据同步\
  爬虫协议名: FULL_FLEDGED_NET_SPIDER_PROTOCOL/0.1

#### 协议中的基本概念 ####
  服务发现: 为满足聚合推荐服务发现符合规定的爬虫, 并且进行数据获取的操作, 所需要的服务发现和注册功能.\
  数据同步: 本服务规定了一系列的数据同步规则, 用于在聚合推荐服务和爬虫之间交换数据.

#### 聚合服务接口约定 ####

注册服务接口: 
~~~ 
  PATH: /api/service 
  METHOD: POST 
  CONTENT-TYPE: application/json 
  REQUEST-BODY:{
    service: {
      name: String, // 服务名, 不能与项目中现有的服务重名
      validationUrl,  // 验证 URL, 爬虫服务需要在这个 URL 被访问时返回正确的数据
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

修改服务注册信息接口:
~~~
  PATH: /api/service/:serviceName
  METHOD: PATCH 
  CONTENT-TYPE: application/json 
  REQUEST-BODY:{
    service: {
      name: String, // 服务名, 不能与项目中现有的服务重名
      validationUrl,    // 验证 URL, 爬虫服务需要在这个 URL 被访问时返回正确的数据
    } 
  } 
~~~

注销服务接口

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

#### 爬虫服务接口约定  ####
验证接口: 通过调用该接口, 爬虫服务应该返回符合规范的内容, 以标识爬虫能够兼容聚合服务的协议
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
        frequencyLimit: Number,
        pageSizeLimit: Number 
      } 
    } 
  } 

  ERROR-RESPONSE-BODY:
  {
    code: errorCode,
    msg: errorMessage 
  }
~~~ 

获取多条内容的接口: 
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
