// this module is used to get html data from resourceUrl,
// return an array of text & img src from retrieved dom
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const RedisService = require('./redis_service');
const {MongoClient} = require('mongodb');


// init mongodb connection options
const mongodbUrl = process.env.DB_URL;
const DBName = process.env.DB_RESOURCE_DB;
const collectionName = process.env.DB_COLLECTION;

// init spider config
const resourceUrlPrefix = process.env.RESOURCE_URL_PREFIX;
const spideringInterval = process.env.INTERVAL;

// a function to begin spider, this function does following task:
// 1. get multiple random resource ids from redis source_id_set
// 2. retrieve html data for each id
// 3.
async function spideringArticles(count) {

  const ids = await RedisService.getRandomResourceIds(count);
  let succeedCount = 0;
  let errCount = 0;

  for (let id of ids) {
    console.log('id: ', id);
    let currentArticleData = await getSingleArticle(id)
      .then(r => {
        succeedCount += 1;
      })
      .catch(e => {
        errCount += 1;
        throw e;
      });

    // do something with fetched html data
    console.log(currentArticleData || null);

    // set an interval of 1second (equivalent to time.sleep)
    await new Promise(resolve => {
      setTimeout(resolve, parseInt(spideringInterval));
    });
  }

  return {
    succeedCount,
    errCount,
  };

}

// fetch data from resource Url and store it into mongodb database
async function getSingleArticle(articleId) {
  const client = await MongoClient.connect(mongodbUrl, {useNewUrlParser: true})
    .catch(e => console.log(e));

  //init mongodb collection
  const db = client.db(DBName);
  const articleCollection = db.collection(collectionName);
  const userCollection = db.collection('users');

  // let resourceUrl ='http://localhost:/a/ac4714604'
  let resourceUrl = `${resourceUrlPrefix}${articleId}`;
  console.log('target url:', resourceUrl);

  const HTMLData = await axios(resourceUrl)
    .catch(e => {
      if (e.response) {
        console.log('get respond with ', e.response.status);

        if (e.response.status === 404) {
          const error = new Error('Not Found');
          error.errorCode = 4040000;
          throw error;
        } else if (e.response.status >= 500) {

          const error = new Error('Internal Server Error');
          error.errorCode = 5000000;
          throw error;
        }
        else {
          throw e;
        }
      }
      else if (e.request) {
        throw new Error("no response was received");
      }
    });

  const $ = cheerio.load(HTMLData.data);

  let articleContent = $('.article-content')[0];

  // if .aiticleContent not exist  (url doesn't link to an article)
  if (!articleContent) {
    // if url link to video, do something
    const isVideoResource = $('#player');
    if (isVideoResource) {
      console.log('this is video resource');
    }
    else {
      console.log('.articleContent not exist');
    }
    return false;
  }
  else {
    /*  successfully get resource data
    *   store two data into database: one with original Node object
    *     another one only with text and img.src
    * */

    let HTMLTextAndImg = getTextOrImg($, articleContent, []);
    let articleContentHTML = $(articleContent).toString();


    console.log('articleContent: ', articleContent);
    // insert original article content HTML & HTML text and imgs into mongodb collection
    const insertedData = await articleCollection.findOneAndUpdate(
      {resourceId: articleId},
      {
        $set: {
          resourceId: articleId,
          content: HTMLTextAndImg,
          articleContentHTML: articleContentHTML,
          createAt: Date.now().valueOf(),
        },
      },
      {
        upsert: true,
        returnOriginal: false,
      },
    );

    await RedisService.markArticleIdSucceed(articleId);
    console.log('data inserted to mongodb', insertedData);
    return insertedData;
  }
}


// Insert text and img src from received DOM to received container
function getTextOrImg($, Dom, container) {
  let cheerioDom = $(Dom);
  // get children element 
  const children = cheerioDom.children();
  if (children.length === 0) {
    if (cheerioDom.text()) {
      container.push(cheerioDom.text());
    }
    else if (cheerioDom[0].name === 'img') {
      container.push(cheerioDom[0].attribs.src);
    }
  }
  else {
    children.map((index, child) => {
      getTextOrImg($, child, container);
    });
  }

  return container;
}

module.exports = {
  spideringArticles,
  getSingleArticle,
};
