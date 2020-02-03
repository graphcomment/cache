'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const Q = require('q');

let CachePageSchema = new Schema({

  page_id: {type: String},

  website_public_key: {type: String},

  content: {type: Schema.Types.Mixed, required: true},

  limit: {type: Number, required: false},

  offset: {type: Number, required: false},

  valid: {type: Boolean, default: true, required: true},

  sort: {type: String, required: true},

  created_at: {type: Date, default: Date.now},

  updated_at: {type: Date, default: Date.now}

});

CachePageSchema.pre('save', function (next) {

  if (this.isNew) {
    // first time the object is created
    return next();
  }

  this.updated_at = Date.now();

  return next();

});

CachePageSchema.index({'website_public_key': 1, 'page_id': 1, 'offset': 1, 'limit': 1, 'sort': 1}, {
  name: 'website_username_1',
  unique: true,
  background: true,
  dropDups: true
});


CachePageSchema.static.cachePageRequest = function(page_id, website_public_key, limit, offset, sort) {

  let cacheRequestDeferred = Q.defer();

  this.findOne({
    page_id: page_id,
    website_public_key: website_public_key,
    limit: limit,
    offset: offset,
    sort: sort
  }, function (err, cachePage) {

    if (err) cacheRequestDeferred.reject(err);

    if (cachePage) {
      cacheRequestDeferred.resolve(cachePage);
    } else {
      cacheRequestDeferred.resolve({cache: 'to_generate'});
    }
  });
};

CachePageSchema.static.cachePageUpdateOrCreate = function(page_id, website_public_key, limit, offset, sort, content) {

  let cacheRequestDeferred = Q.defer();

  this.findOneAndUpdate({
    page_id: page_id,
    website_public_key: website_public_key,
    limit: limit,
    offset: offset,
    sort: sort
  }, {
      page_id: page_id,
      website_public_key: website_public_key,
      limit: limit,
      offset: offset,
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
};

let CachePage = mongoose.model('CachePage', CachePageSchema); // jshint ignore:line

module.exports = function () {
  return CachePage;
};