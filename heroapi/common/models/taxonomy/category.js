'use strict';

const cors = require('cors');

module.exports = function(Category) {
var viator = require('../../../server/constants');

/**
   * Hidden un-used api
   */
  Category.disableRemoteMethodByName('create', true);
  Category.disableRemoteMethodByName('upsert', true);
  Category.disableRemoteMethodByName('deleteById', true);
  Category.disableRemoteMethodByName('updateAll', true);
  Category.disableRemoteMethodByName('replaceOrCreate', true);
  Category.disableRemoteMethodByName('findById', true);
  Category.disableRemoteMethodByName('find', true);
  Category.disableRemoteMethodByName('findOne', true);
  Category.disableRemoteMethodByName('count', true);
  Category.disableRemoteMethodByName('createChangeStream', true);
  Category.disableRemoteMethodByName('patchAttributes', true);
  Category.disableRemoteMethodByName('replaceById', true);
  Category.disableRemoteMethodByName('exists', true);
  Category.disableRemoteMethodByName('upsertWithWhere', true);
  Category.disableRemoteMethodByName('prototype.patchAttributes', true);

  /**
   * Retrieve a list of category filters for a destination
   */
  Category.getAllCategoriesOfADestination = function(destId, cb) {
    const options = {
        url: viator.url + '/service/taxonomy/categories' + '?destId=' + destId,
        method: 'GET',
        headers: {
            'exp-api-key': viator.api,
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'Access-Control-Allow-Origin': '*'
        }
    };

    const request = require('request');

    request(options, function(err, httpResponse, body) {
        if (err) {
            cb(null, err);
        } else {
            const recv = JSON.parse(body);
            cb(null, recv['data']);
        }
    });
};

  Category.remoteMethod(
    'getAllCategoriesOfADestination', {
      http: {path: '/getAllCategoriesOfADestination', verb: 'get'},
      accepts: {arg: 'destId', type: 'string', description: 'for ex: 684'},
      returns: {arg: 'results', type: '[Category]', root: true},
      description: 'Retrieve a list of category filters for a destination',
    }
  );

  /**
   * Retrieve a list of category filters for a destination
   */
  Category.getAllCategoriesOfADestinationJsonP = function(destId, cb) {
    // var url = 'http://prelive.viatorapi.sandbox.viator.com/service/taxonomy/categories?apiKey=552392240092477167';
    // url = url + '&destId=' + destId;
    // //console.log('Url request :', url);
    var request = require('request');
    var nodeJsonp = require("node-jsonp");
    const options = {
      url: viator.url + '/service/taxonomy/categories' + '?destId=' + destId,
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Access-Control-Allow-Origin' : '*'
      }
    };

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, myFunc(JSON.stringify(recv['data'])));
      }
    });
  };

  Category.remoteMethod(
    'getAllCategoriesOfADestinationJsonP', {
      http: {path: '/getAllCategoriesOfADestinationJsonP', verb: 'get'},
      accepts: {arg: 'destId', type: 'string', description: 'for ex: 684'},
      returns: {arg: 'results', type: 'myFunc([Category])', root: true},
      description: 'Retrieve a list of category filters for a destination',
    }
  );
};
