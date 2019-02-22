const ElasticSearch = require('elasticsearch'); 
const INDEX = 'acfun_test_index';
const TYPE = 'acfun_test_type';

(async()=>{
  global.client = new ElasticSearch.Client({
    host: "localhost:9200",
  });

  await client.ping({
    requestTimeout: 30000,
  }, function (error) {
    if (error) {
      console.error('elasticsearch cluster is down!');
    } else {
      console.log('All is well');
    }
  });


  await client.indices.delete({ 
    index: INDEX, 
  })

  await client.create({
    index: INDEX,
    type: TYPE,
    id: '1',
    body: {
      name: 'apolo',
      hobbies: ["video games", "swimming"],
      age: 30,
    },
  });

  // await new Promise(resv=>setTimeout(resv, 1000))

  const userfound = await client.search( {
    index:INDEX,
    type: TYPE,
    body:{
      query:{
        match:{
          name:'apolo'
        } 
      }
    }
  })

  console.log('userfound: ', userfound) 
})()
