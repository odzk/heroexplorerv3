'use strict';

module.exports = function(Recommendation) {
/**
   * Hidden un-used api
   */
  Recommendation.disableRemoteMethodByName('create', true);
  Recommendation.disableRemoteMethodByName('upsert', true);
  Recommendation.disableRemoteMethodByName('deleteById', true);
  Recommendation.disableRemoteMethodByName('updateAll', true);
  Recommendation.disableRemoteMethodByName('replaceOrCreate', true);
  Recommendation.disableRemoteMethodByName('findById', true);
  Recommendation.disableRemoteMethodByName('find', true);
  Recommendation.disableRemoteMethodByName('findOne', true);
  Recommendation.disableRemoteMethodByName('count', true);
  Recommendation.disableRemoteMethodByName('createChangeStream', true);
  Recommendation.disableRemoteMethodByName('patchAttributes', true);
  Recommendation.disableRemoteMethodByName('replaceById', true);
  Recommendation.disableRemoteMethodByName('exists', true);
  Recommendation.disableRemoteMethodByName('upsertWithWhere', true);
  Recommendation.disableRemoteMethodByName('prototype.patchAttributes', true);
  
  /**
   * Top Recomendation search
   * {"destId":684, "topX":"1-15", "sortOrder":"SEO_ALPHABETICAL", "top":false, "seoType" : "RECOMMENDATION", "providerType": "ALL"}
   */
  Recommendation.listTopRecommendationOfADestination = function(data, cb) {
    var url = 'http://prelive.viatorapi.sandbox.viator.com/service/search/recommendation?apiKey=552392240092477167';
    //console.log('Json request:', data);
    var request = require('request');

    var options = {
      url: url,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    };

    request.post(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };

  Recommendation.remoteMethod(
        'listTopRecommendationOfADestination', {
          http: {path: '/listTopRecommendationOfADestination', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"destId":684, "topX":"1-15", "sortOrder":"SEO_ALPHABETICAL", "top":false, "seoType" : "RECOMMENDATION", "providerType": "ALL"}', http: {source: 'body'}}],
          returns: {arg: 'results', type: '[Recommendation]', root: true},
          description: 'Top Recommendation search',
        }
  );

  /**
   * Retrieve a list of recommendation from seoId & currencyCode
   */
  Recommendation.getAllRecommendationsFromSeoIdAndCurrencyCode = function(seoId, currencyCode, cb) {
    var url = 'http://prelive.viatorapi.sandbox.viator.com/service/recommendation?apiKey=552392240092477167';
    url = url + '&seoId=' + seoId + "&currencyCode=" + currencyCode;
    //console.log('Url request :', url);
    var request = require('request');

    request.get(url, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };

  Recommendation.remoteMethod(
    'getAllRecommendationsFromSeoIdAndCurrencyCode', {
      http: {path: '/getAllRecommendationsFromSeoIdAndCurrencyCode', verb: 'get'},
      accepts: [{arg: 'seoId', type: 'string', description: 'for ex: 299'},{arg: 'currencyCode', type: 'string', description: 'for ex: EUR'}],
      returns: {arg: 'results', type: '[Recommendation]', root: true},
      description: 'Retrieve a list of recommendation from seoId & currencyCode',
    }
  );

  /**
   * Get products related to Recommendation
   */
  Recommendation.getAllProductsRelatedToRecommendation = function(seoId, currencyCode, topX, sortOrder, cb) {
    var url = 'http://prelive.viatorapi.sandbox.viator.com/service/recommendation/products?apiKey=552392240092477167';
    url = url + '&seoId=' + seoId + "&currencyCode=" + currencyCode + '&topX' + topX + '&sortOrder' + sortOrder;
    //console.log('Url request :', url);
    var request = require('request');

    request.get(url, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };

  Recommendation.remoteMethod(
    'getAllProductsRelatedToRecommendation', {
      http: {path: '/getAllProductsRelatedToRecommendation', verb: 'get'},
      accepts: [{arg: 'seoId', type: 'string', description: 'for ex: 299'},
      {arg: 'currencyCode', type: 'string', description: 'for ex: EUR'},
      {arg: 'topX', type: 'string', description: 'for ex: 1-15'},
      {arg: 'sortOrder', type: 'string', description: 'SEO_PRODUCT_TOP_SELLERS - Top Sellers|SEO_PRODUCT_REVIEW_AVG_RATING_A - Traveller Rating (low→high)|SEO_PRODUCT_REVIEW_AVG_RATING_D - Traveller Rating (high→low)|SEO_PRODUCT_PRICE_FROM_A - Price (low→high)|SEO_PRODUCT_PRICE_FROM_D - Price (high→low)'}],
      returns: {arg: 'results', type: '[Product]', root: true},
      description: 'Get products related to Recommendation',
    }
  );

  /**
   * Get review related to recommendation
   */
  Recommendation.getAllReviewsRelatedToRecommendation = function(seoId, topX, sortOrder, cb) {
    var url = 'http://prelive.viatorapi.sandbox.viator.com/service/Recommendation/reviews?apiKey=552392240092477167';
    url = url + '&seoId=' + seoId + '&topX' + topX + '&sortOrder' + sortOrder;
    //console.log('Url request :', url);
    var request = require('request');

    request.get(url, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };

  Recommendation.remoteMethod(
    'getAllReviewsRelatedToRecommendation', {
      http: {path: '/getAllReviewsRelatedToRecommendation', verb: 'get'},
      accepts: [{arg: 'seoId', type: 'string', description: 'for ex: 299'},
      {arg: 'topX', type: 'string', description: 'for ex: 1-15'},
      {arg: 'sortOrder', type: 'string', description: 'SEO_REVIEW_RATING_A - Traveler Rating (low→high)|SEO_REVIEW_RATING_D - Traveler Rating (high→low)|SEO_REVIEW_RATING_PUBLISHED_DATE_D - Most recent review|SEO_REVIEW_RATING_LANGUAGE_ORDER_D - Requested language first followed by other languages'}],
      returns: {arg: 'results', type: '[UserReview]', root: true},
      description: 'Get review related to recommendation',
    }
  );

  /**
   * Get photos related to Recommendation
   */
  Recommendation.getAllPhotosRelatedToRecommendation = function(seoId, topX, cb) {
    var url = 'http://prelive.viatorapi.sandbox.viator.com/service/recommendation/photos?apiKey=552392240092477167';
    url = url + '&seoId=' + seoId + '&topX' + topX;
    //console.log('Url request :', url);
    var request = require('request');

    request.get(url, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };

  Recommendation.remoteMethod(
    'getAllPhotosRelatedToRecommendation', {
      http: {path: '/getAllReviewsRelatedToRecommendation', verb: 'get'},
      accepts: [{arg: 'seoId', type: 'string', description: 'for ex: 299'},
      {arg: 'topX', type: 'string', description: 'for ex: 1-15'}],
      returns: {arg: 'results', type: '[UserPhoto]', root: true},
      description: 'Get photos related to Recommendation',
    }
  );

   /**
   * Get panoramas related to Recommendation
   */
  Recommendation.getAllPanoramasRelatedToRecommendation = function(seoId, topX, cb) {
    var url = 'http://prelive.viatorapi.sandbox.viator.com/service/recommendation/panoramas?apiKey=552392240092477167';
    url = url + '&seoId=' + seoId + '&topX' + topX;
    //console.log('Url request :', url);
    var request = require('request');

    request.get(url, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };

  Recommendation.remoteMethod(
    'getAllPanoramasRelatedToRecommendation', {
      http: {path: '/getAllPanoramasRelatedToRecommendation', verb: 'get'},
      accepts: [{arg: 'seoId', type: 'string', description: 'for ex: 299'},
      {arg: 'topX', type: 'string', description: 'for ex: 1-15'}],
      returns: {arg: 'results', type: '[Recommendation]', root: true},
      description: 'Get panoramas related to Recommendation',
    }
  );
};
