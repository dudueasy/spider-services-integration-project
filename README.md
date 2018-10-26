# 项目说明
这是一个 express & mongoose & authentication boilerplate

## 功能实现
  * 数据库使用 mongodb + mongoose
  * 登陆验证通过 express-session / JWT 来实现
  * 测试
    * 模拟注册页面: ``` localhost:3000/api/login?username=apolo ```

    * 模拟登陆页面:
        * for JWT (request header is required): ``` localhost:3000/api/hello ```
        * for express-session: ``` localhost:3000/api/hello-session ```

## 文件结构
* 项目入口: /bin/www
* 数据库: /db
* 用户数据表: process.env.DB_USERTABLE

## 项目配置
通过 dotenv 和 .env 文件定义环境变量

## 启动项目:
* 启动 mongdb 数据库:
~~~
mongod --dbpath db
~~~
* 启动项目
~~~
node bin/www
~~~
* launch all
~~~
npm start
~~~

## 错误处理和日志
  * 通过 winston 完成错误日志的记录
  * 流程图:
![Error handling flow](./error-handling-flow.png)



