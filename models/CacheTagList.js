'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const Q = require('q');

let CacheTagListSchema = new Schema({

  website_public_key: {type: String, required: true},

  content: {type: Schema.Types.Mixed, required: true},

  valid: {type: Boolean, default: true, required: true},

  page : {type: Number},

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

CacheTagListSchema.index({'website_public_key': 1, 'page': 1}, {
  name: 'website_public_key_page',
  unique: true,
  background: true,
  dropDups: true
});


CacheTagListSchema.statics.exists = function(website_public_key, params) {

  let cacheRequestDeferred = Q.defer();

  this.findOne({
    website_public_key: website_public_key,
    page: params.page
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

CacheTagListSchema.statics.updateOrCreate = function(website_public_key, params, content) {

  let cacheRequestDeferred = Q.defer();

  this.findOneAndUpdate({
      website_public_key: website_public_key,
      page: params.page
    }, {
      website_public_key: website_public_key,
      page: params.page,
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

module.exports = mongoose.model('CacheTagList', CacheTagListSchema); // jshint ignore:line
