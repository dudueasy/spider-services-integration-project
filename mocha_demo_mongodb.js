const assert = require('assert');
const ElasticSearch = require('elasticsearch');

const {MongoClient} = require('mongodb');


describe('mongodb test', () => {
  before('build mongodb connection', async () => {
    client = await MongoClient.connect("mongodb://localhost:27017", {useNewUrlParser: true})
      .catch(e => console.log(e));

    db = client.db('test');
    userCollection = db.collection('users');

// create a document
    await userCollection.insertOne({name: 'apolo', desc: "swimming"});
  });

  it('search for created user', async () => {
    let r = await userCollection.findOne({desc: 'swimming'});
    console.log(r)

    return r;
  });


  after('clear inserted document', async () => {
    await userCollection.deleteMany({
      desc: 'swimming',
    });
  });
});


