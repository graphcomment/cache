const mongoose = require('mongoose')
const CachePage = require('./models/CachePage')
const Q = require('q')

function start(mongoDsn, debug) {

  const options = {
    autoIndex: true, // Don't build indexes
    useNewUrlParser: true,
    poolSize: 20, // Maintain up to 10 socket connection
    bufferMaxEntries: 0,
    connectTimeoutMS: 200000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 300000, // Close sockets after 45 seconds of inactivity
    family: 4,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }

  setTimeout(function () {
    mongoose.set('debug', debug)

    const mongoDB = mongoose.connect(mongoDsn, options)
      .then(() => console.log('connected to mongo'))
      .catch((err) => console.log('error connecting to mongo\n\r' + err))
  })
}

function test(type, websiteId, params) {
  return CachePage.cachePageRequest(websiteId, params)
}

function update(type, websiteId, params, content) {
  return CachePage.cachePageUpdateOrCreate(websiteId, params, content)
}

function get(type, websiteId, params, generate) {
  const deferred = Q.defer()

  test(type, websiteId, params).then(cached => {
    if (cached && cached.valid) {
      deferred.resolve(cached.content)
    }
    else {
      generate().then(content => {
        update(type, websiteId, params, content)
        deferred.resolve(content)
      })
    }
  })

  return deferred.promise
}

module.exports = { start, test, update, get }
