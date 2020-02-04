const mongoose = require('mongoose')
const Q = require('q')

const CachePage = require('./models/CachePage')
const CachePageList = require('./models/CachePageList')
const CacheTagList = require('./models/CacheTagList')
const CacheProfile = require('./models/CacheProfile')

const collections = {
  'page': CachePage,
  'pages': CachePageList,
  'tags': CacheTagList,
  'profile' : CacheProfile,
}

let isDebug
let isDisabled

function start(mongoDsn, debug, disabled) {

  isDebug = debug
  isDisabled = disabled

  //mongoose.set('debug', debug)

  const options = {
    autoIndex: false, // Don't build indexes
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
    const mongoDB = mongoose.connect(mongoDsn, options)
      .then(() => console.log('connected to mongo'))
      .catch((err) => console.log('error connecting to mongo\n\r' + err))
  })
}

function exists(type, websiteId, params) {
  return collections[type].exists(websiteId, params)
}

function update(type, websiteId, params, content) {
  return collections[type].updateOrCreate(websiteId, params, content)
}

function get(type, websiteId, params, generate) {
  const deferred = Q.defer()

  if (isDebug) console.log(`[cache ${type}] test`)

  exists(type, websiteId, params).then(cached => {
    if (cached && cached.valid && !isDisabled) {
      if (isDebug) console.log(`[cache ${type}] found`)
      deferred.resolve(cached.content)
    }
    else {
      if (isDebug) console.log(`[cache ${type}] generate`)
      generate().then(content => {
        update(type, websiteId, params, content)
        deferred.resolve(content)
      })
    }
  })

  return deferred.promise
}

module.exports = { start, exists, update, get }
