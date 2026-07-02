'use strict';

module.exports = function(Location) {
var viator = require('../../../server/constants');

/**
   * Hidden un-used api
   */
  Location.disableRemoteMethodByName('create', true);
  Location.disableRemoteMethodByName('upsert', true);
  Location.disableRemoteMethodByName('deleteById', true);
  Location.disableRemoteMethodByName('updateAll', true);
  Location.disableRemoteMethodByName('replaceOrCreate', true);
  Location.disableRemoteMethodByName('findById', true);
  Location.disableRemoteMethodByName('find', true);
  Location.disableRemoteMethodByName('findOne', true);
  Location.disableRemoteMethodByName('count', true);
  Location.disableRemoteMethodByName('createChangeStream', true);
  Location.disableRemoteMethodByName('patchAttributes', true);
  Location.disableRemoteMethodByName('replaceById', true);
  Location.disableRemoteMethodByName('exists', true);
  Location.disableRemoteMethodByName('upsertWithWhere', true);
  Location.disableRemoteMethodByName('prototype.patchAttributes', true);

  /**
   * Retrieve location from Product data using location ref
   */
  Location.getAllLocation = function(locationRef, cb) {
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url + '/locations/bulk',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Content-Type' : 'application/json',
        'Access-Control-Allow-Origin' : '*'   
      },
      body: JSON.stringify(data)
    };
    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };
  Location.remoteMethod(
    'getAllLocation', {
      http: {path: '/getAllLocation', verb: 'post'},
      accepts: [{arg: 'data', type: 'object', description: '{"startDate":"2017-02-01","endDate":"2017-10-10", "topX":"1-15","destId":684, "currencyCode":"EUR", "catId":0, "subCatId":0, "dealsOnly":false}', http: {source: 'body'}}],
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Get location based from location ref',
    }
);


};
