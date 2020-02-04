'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const Q = require('q')

let CacheGroupSchema = new Schema({

  group_slug: {type: String, required: true},

  website_public_key: {type: String, required: true},

  content: {type: Schema.Types.Mixed, required: true},

  valid: {type: Boolean, default: true, required: true},

  created_at: {type: Date, default: Date.now},

  updated_at: {type: Date, default: Date.now, expires: 172800}

});

CacheGroupSchema.pre('save', function (next) {

  if (this.isNew) {
    // first time the object is created
    return next();
  }

  this.updated_at = Date.now();

  return next();

});

CacheGroupSchema.index({'website_public_key': 1, 'group_slug': 1}, {
  name: 'website_public_key_group_slug',
  unique: true,
  background: true,
  dropDups: true
});


CacheGroupSchema.statics.exists = function(website_public_key, params) {

  let cacheRequestDeferred = Q.defer();

  this.findOne({
    website_public_key: website_public_key,
    group_slug: params.group_slug,
    sort: params.sort
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

CacheGroupSchema.statics.updateOrCreate = function(website_public_key, params, content) {

  let cacheRequestDeferred = Q.defer();

  this.findOneAndUpdate({
      website_public_key: website_public_key,
      group_slug: params.group_slug,
      sort: params.sort
    }, {
      website_public_key: website_public_key,
      group_slug: params.group_slug,
      sort: params.sort,
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

module.exports = mongoose.model('CacheGroup', CacheGroupSchema); // jshint ignore:line