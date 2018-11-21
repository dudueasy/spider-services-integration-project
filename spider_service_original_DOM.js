const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

let resourceID = ''
// let resourceID = '4716672';
const resourceUrl = `${process.env.RESOURCE_URL_PREFIX}${resourceID}`;
console.log('resourceUrl ', resourceUrl);


const contentSelector = process.env.CONTENT_SELECTOR;

const app = express();

template = '<div><p>this is test page</p>__CONTENT__</div>';

app.get('*', async (req, res, next) => {
  HTMLData = await fetchData(resourceUrl);
  template = template.replace('__CONTENT__', HTMLData);
  res.send(template);
});

async function fetchData(url) {
  const response = await axios(url);
  $ = cheerio.load(response.data);

  const HTMLDataString = $(contentSelector).toString();
  console.log(HTMLDataString);

  return HTMLDataString;
}

app.listen('8001', () => {
  console.log('server is running on 8001');
});
