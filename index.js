const mongoose = require('mongoose')
const CachePage = require('models/CachePage')
const { Types: { ObjectId } } = mongoose

module.exports.start = function(mongoDsn, debug) {

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
    mongoose.set('debug', debug)

    const mongoDB = mongoose.connect(mongoDsn, options)
      .then(() => console.log('Successfully connected to database'))
      .catch((err) => console.log('Error when connecting to db\n\r' + err))
  })
}
