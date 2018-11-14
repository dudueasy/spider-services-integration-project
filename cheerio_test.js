// this file is used to test cheerio API
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

require('dotenv').config();

const app = express();
const PORT = 8001;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});


app.get('/', async (req, res) => {
  const resourceUrl = `https://zhuanlan.zhihu.com/p/49652556`;
  const HTMLData = await axios(resourceUrl);
  let $ = cheerio.load(HTMLData.data);
  global.$ = $;

  let container = [];
  const DOMSelector = '.Post-Main';
  let articleContent = $(DOMSelector)[0];

  let resourceContent = getTextOrImg($, articleContent, container);

  global.resourceContent = resourceContent;
  res.send(container);
});


// 递归地获取选择器中每一个元素的 text, 如果是 <img> 那么获得 img[src]
function getTextOrImg($, Dom, container) {
  let cheerioDom = $(Dom);
  // get children element
  const children = cheerioDom.children();
  if (children.length === 0) {
    if (cheerioDom.text()) {
      container.push(cheerioDom.text());
    }
    else if (cheerioDom[0].name === 'img') {
      // console.log('current cheerioDom ', cheerioDom);
      // console.log('this is a img tag');
      container.push(cheerioDom[0].attribs.src);
    }
  }
  else {
    children.map((index, child) => {
      getTextOrImg($, child, container);
    });
  }
}

