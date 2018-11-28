// build mongodb connection with native mongodb driver for nodejs.
// without using mongoose
const {MongoClient} = require('mongodb');
const path =require('path')
require('dotenv').config({path: path.join(__dirname, '.env')});

const mongodbUrl = process.env.DB_URL;
const DBName = process.env.DB_RESOURCE_DB;
const collectionName = process.env.DB_COLLECTION

(async () => {

  const client = await MongoClient.connect(mongodbUrl, { useNewUrlParser: true })
    .catch(e => console.log(e));


  // select database
  const db = client.db(DBName);

  // select table/collection
  const userCollection = db.collection('users');

  userCollection.find({}, async (err, result) => {
    if (err) {
      console.log(err.message);
    }
    if (!err) {
      result = await result.project({password: 0}).toArray();
      console.log("result from mongodb: ", result);
    }
  });

  client.close();
})();


