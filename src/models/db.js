'use strict';

const mongoose = require('mongoose');
const {Types: {ObjectId}} = mongoose;

mongoose.Promise = global.Promise;
let log = console.log;

function getMongoFullUrl(app) {
  return app.get('mongo_dsn');
}

module.exports = function (app) {

  let mongoFullUrl = getMongoFullUrl(app);

  const options = {
    autoIndex: true, // Don't build indexes
    useNewUrlParser: true,
    poolSize: 400, // Maintain up to 10 socket connection
    bufferMaxEntries: 0,
    connectTimeoutMS: 200000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 300000, // Close sockets after 45 seconds of inactivity
    family: 4,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  };

  log('Connecting to database ' + mongoFullUrl);

  setTimeout(function () {
    let mongoDB = mongoose.connect(mongoFullUrl, options)
      .then(function () {
        log('Successfully connected to database ' + mongoFullUrl);
      })
      .catch(function (err) {
        // Check error in initial connection. There is no 2nd param to the callback.
        log('Error when connecting to db ' + mongoFullUrl + '\n\r' + err);
      });

    mongoose.set('debug', app.get('debug'));

    //Helper to check if an ID is an object ID
    mongoose.isObjectId = function(id) {
      return (id instanceof ObjectId);
    };

//Helper to validate a string as object ID
    mongoose.isValidObjectIdRenforce = function(str) {
      if(mongoose.isValidObjectId(str)) {
        if (typeof str !== 'string') {
          return false;
        }
        return str.match(/^[a-f\d]{24}$/i);
      } else {
        return false;
      }
    };
    return mongoDB;
  }, 60);

};
