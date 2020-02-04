'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const Q = require('q');

let CacheTagListSchema = new Schema({

  website_public_key: {type: String, required: true},

  content: {type: Schema.Types.Mixed, required: true},

  valid: {type: Boolean, default: true, required: true},

  offset : {type: Number},

  limit: {type: Number},

  created_at: {type: Date, default: Date.now},

  updated_at: {type: Date, default: Date.now, expires: 3600}

});

CacheTagListSchema.pre('save', function (next) {

  if (this.isNew) {
    // first time the object is created
    return next();
  }

  this.updated_at = Date.now();

  return next();

});

CacheTagListSchema.index({'website_public_key': 1, 'offset': 1, 'limit':1}, {
  name: 'website_public_key_offset_limit',
  unique: true,
  background: true,
  dropDups: true
});


CacheTagListSchema.statics.cacheTagListRequest = function(website_public_key, offset, limit) {

  let cacheRequestDeferred = Q.defer();

  this.findOne({
    website_public_key: website_public_key,
    offset: offset,
    limit: limit
  }, function (err, cachePage) {

    if (err) cacheRequestDeferred.reject(err);

    if (cachePage) {
      cacheRequestDeferred.resolve(cachePage);
    } else {
      cacheRequestDeferred.resolve(null);
    }
  });

  return cacheRequestDeferred.promise;
};

CacheTagListSchema.statics.cacheTagListUpdateOrCreate = function(website_public_key, offset, limit, content) {

  let cacheRequestDeferred = Q.defer();

  this.findOneAndUpdate({
      website_public_key: website_public_key,
      offset: offset,
      limit: limit
    }, {
      website_public_key: website_public_key,
      offset: offset,
      limit: limit,
      content: content,
      valid: true
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true},function (err, cachePage) {

      if (err) {
        cacheRequestDeferred.reject(err);
      } else {
        cacheRequestDeferred.resolve(cachePage);
      }
    });

  return cacheRequestDeferred.promise;
};

let CacheTagList = mongoose.model('CacheTagList', CacheTagListSchema); // jshint ignore:line

module.exports = function () {
  return CacheTagList;
};