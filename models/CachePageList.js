'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const Q = require('q');

let CachePageListSchema = new Schema({

  website_public_key: {type: String},

  tag_name: {type: String},

  content: {type: Schema.Types.Mixed, required: true},

  valid: {type: Boolean, default: true, required: true},

  offset : {type: Number},

  limit: {type: Number},

  sort: {type: String, required: true},

  created_at: {type: Date, default: Date.now},

  updated_at: {type: Date, default: Date.now, expires: 600}

});

CachePageListSchema.pre('save', function (next) {

  if (this.isNew) {
    // first time the object is created
    return next();
  }

  this.updated_at = Date.now();

  return next();

});

CachePageListSchema.index({'website_public_key': 1, 'tag_name': 1, 'offset': 1, 'limit':1, 'sort': 1}, {
  name: 'website_public_key_offset_limit_sort',
  unique: true,
  background: true,
  dropDups: true
});


CachePageListSchema.statics.cachePageListRequest = function(website_public_key, tag_name, offset, limit, sort) {

  let cacheRequestDeferred = Q.defer();

  this.findOne({
    website_public_key: website_public_key,
    tag_name: tag_name,
    offset: offset,
    limit: limit,
    sort: sort
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

CachePageListSchema.statics.cachePageListUpdateOrCreate = function(website_public_key, tag_name, offset, limit, sort, content) {

  let cacheRequestDeferred = Q.defer();

  this.findOneAndUpdate({
      website_public_key: website_public_key,
      tag_name: tag_name,
      offset: offset,
      limit: limit,
      sort: sort
    }, {
      website_public_key: website_public_key,
      tag_name: tag_name,
      offset: offset,
      limit: limit,
      sort: sort,
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

let CachePageList = mongoose.model('CachePageList', CachePageListSchema); // jshint ignore:line

module.exports = function () {
  return CachePageList;
};