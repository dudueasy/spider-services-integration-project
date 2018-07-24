const mongoose = require('mongoose')

mongoose.Promise = Promise

const uri = 'mongodb://localhost:27017/apolo'
mongoose.connect(uri,{ useNewUrlParser: true } )
let db = mongoose.connection

db.on('open', ()=>{
console.log('connected')
})

db.on('error', (e)=>{
  console.log(e)
})

module.exports = db
