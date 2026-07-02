'use strict';

module.exports = function(Attraction) {

var viator = require('../../../server/constants');

 /**
   * Hidden un-used api
   */
  Attraction.disableRemoteMethodByName('create', true);
  Attraction.disableRemoteMethodByName('upsert', true);
  Attraction.disableRemoteMethodByName('deleteById', true);
  Attraction.disableRemoteMethodByName('updateAll', true);
  Attraction.disableRemoteMethodByName('replaceOrCreate', true);
  Attraction.disableRemoteMethodByName('findById', true);
  Attraction.disableRemoteMethodByName('find', true);
  Attraction.disableRemoteMethodByName('findOne', true);
  Attraction.disableRemoteMethodByName('count', true);
  Attraction.disableRemoteMethodByName('createChangeStream', true);
  Attraction.disableRemoteMethodByName('patchAttributes', true);
  Attraction.disableRemoteMethodByName('replaceById', true);
  Attraction.disableRemoteMethodByName('exists', true);
  Attraction.disableRemoteMethodByName('upsertWithWhere', true);
  Attraction.disableRemoteMethodByName('prototype.patchAttributes', true);
  /**
   * Retrieve a list of summary attraction data destination
   * {"destId":684, "topX":"1-15", "sortOrder":"SEO_ALPHABETICAL"}
   */
  Attraction.listAttractionOfADestination = function(data, cb) {
    var redis = require('redis')
    , jsonify = require('redis-jsonify')
    , client = jsonify(redis.createClient())
    ;
      var request = require('request');
          var options = {
            method:'POST',
            url: viator.url + '/service/taxonomy/attractions',
            headers: {
              'exp-api-key': viator.api,
              'Accept-Charset': 'utf-8',
              'Content-Type' : 'application/json',
              'Access-Control-Allow-Origin' : '*'
          },
            body: JSON.stringify(data),
          };
          request(options, function(err, httpResponse, body) {
            if (err) {
              cb(null, err);
            } else {
              var recv =  JSON.parse(body);
              //client.set('productsByTextAndCode=' + data["destId"], JSON.stringify(recv['data']));
              cb(null, recv['data']);
            }
          });
        }

  Attraction.remoteMethod(
        'listAttractionOfADestination', {
          http: {path: '/listAttractionOfADestination', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"destId":684, "topX":"1-15", "sortOrder":"SEO_ALPHABETICAL"} sortOrder:Optional. Valid sort orders are:SEO_PUBLISHED_DATE_D - Publish Date (Descending)|SEO_PUBLISHED_DATE_A - Publish Date (Ascending)|SEO_REVIEW_AVG_RATING_D - Traveler Rating (high→low)SEO_REVIEW_AVG_RATING_A - Traveler Rating (low→high)|SEO_ALPHABETICAL - Alphabetical (A→Z)', http: {source: 'body'}}],
          returns: {arg: 'results', type: '[Attraction]', root: true},
          description: 'Retrieve a list of summary attraction data destination',
        }
  );

  /**
   * Top Attractions search
   * API: V2
   * { "destId": 684, "topX": "1-3", "sortOrder": "RECOMMENDED"}
   */
  Attraction.listTopAttractionOfADestination = function(data, cb) {
    var request = require('request');
    var options = {
        method: 'POST',
        url: viator.url + '/v1/taxonomy/attractions',
        headers: {
            'exp-api-key': viator.api,
            'Accept-Charset': 'utf-8',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data),
    };
    
    request(options, function(err, httpResponse, body) {
        if (err) {
            cb(null, err);
        } else {
            var recv = JSON.parse(body);
            cb(null, recv['data']);
        }
    });
};


  Attraction.remoteMethod(
        'listTopAttractionOfADestination', {
          http: {path: '/listTopAttractionOfADestination', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"destId":684, "topX":"1-15", "sortOrder":"SEO_ALPHABETICAL", "top":false, "seoType" : "ATTRACTION", "providerType": "ALL"}', http: {source: 'body'}}],
          returns: {arg: 'results', type: '[Attraction]', root: true},
          description: 'Top Attractions search',
        }
  );

  /**
   * get All Attrraction
   */
  Attraction.getAllAttractionsFromSeoIdAndCurrencyCode = function(seoId, currencyCode, cb) {
    var url = 'http://viatorapi.viator.com/service/attraction?apiKey=4530519468461314';
    url = url + '&seoId=' + seoId + "&currencyCode=" + currencyCode;
    console.log('Url request :', url);
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

  Attraction.remoteMethod(
    'getAllAttractionsFromSeoIdAndCurrencyCode', {
      http: {path: '/getAllAttractionsFromSeoIdAndCurrencyCode', verb: 'get'},
      accepts: [{arg: 'seoId', type: 'string', description: 'for ex: 299'},{arg: 'currencyCode', type: 'string', description: 'for ex: EUR'}],
      returns: {arg: 'results', type: '[Attraction]', root: true},
      description: 'Retrieve a list of attraction from seoId & currencyCode',
    }
  );

  //API V2
  Attraction.postAllAttractionsFromDestIdAndTopXV2 = function(destId, topX, sortOrder, cb) {
    var request = require('request');
    var options = {
      url: viator.url + '/v1/taxonomy/attractions',
      method: 'POST',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US',
        'Accept': 'application/json;version=2.0',
        'Access-Control-Allow-Origin': '*'
      },
      json: true, 
      body: {
          destId: destId,
          topX: topX,
          sortOrder: sortOrder
          }
      };
      request(options, function(err, httpResponse, body) {
        if (err) {
          cb(err, null);
        } else {
          cb(null, body);
          console.log(body);
         /*  var recv =  JSON.parse(body);
          cb(null, recv['data']); */
    }
  });
};

  Attraction.remoteMethod(
    'postAllAttractionsFromDestIdAndTopXV2', {
      http: {path: '/postAllAttractionsFromDestIdAndTopXV2', verb: 'post'},
      accepts:[
        {arg: 'destId', type: 'integer', description: '5172'},
        {arg: 'topX', type: 'string', description: '1-100'},
        {arg: 'sortOrder', type: 'string', description: 'RECOMMENDED'}
       /*  {arg:'data', type:'object', description:'{"destId":"17024","topX":"1-100","sortOrder":"RECOMMENDED"}'} */
      ],
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Retrieve a list of attraction from destId & topX',
    }
  );

  /**
   * get products related to attraction
   */
  Attraction.getAllProductsRelatedToAttraction = function(seoId, currencyCode, topX, sortOrder, cb) {
    var url = 'http://viatorapi.viator.com/service/attraction/products?apiKey=4530519468461314';
    url = url + '&seoId=' + seoId + "&currencyCode=" + currencyCode + '&topX' + topX + '&sortOrder' + sortOrder;
    console.log('Url request :', url);
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

  Attraction.remoteMethod(
    'getAllProductsRelatedToAttraction', {
      http: {path: '/getAllProductsRelatedToAttraction', verb: 'get'},
      accepts: [{arg: 'seoId', type: 'string', description: 'for ex: 299'},
      {arg: 'currencyCode', type: 'string', description: 'for ex: EUR'},
      {arg: 'topX', type: 'string', description: 'for ex: 1-15'},
      {arg: 'sortOrder', type: 'string', description: 'SEO_PRODUCT_TOP_SELLERS - Top Sellers|SEO_PRODUCT_REVIEW_AVG_RATING_A - Traveller Rating (low→high)|SEO_PRODUCT_REVIEW_AVG_RATING_D - Traveller Rating (high→low)|SEO_PRODUCT_PRICE_FROM_A - Price (low→high)|SEO_PRODUCT_PRICE_FROM_D - Price (high→low)'}],
      returns: {arg: 'results', type: '[Product]', root: true},
      description: 'Get products related to attraction',
    }
  );

   /**
   * get reviews related to attraction
   */
  Attraction.getAllReviewsRelatedToAttraction = function(seoId, topX, sortOrder, cb) {
    var url = 'http://viatorapi.viator.com/service/attraction/reviews?apiKey=4530519468461314';
    url = url + '&seoId=' + seoId + '&topX' + topX + '&sortOrder' + sortOrder;
    console.log('Url request :', url);
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

  Attraction.remoteMethod(
    'getAllReviewsRelatedToAttraction', {
      http: {path: '/getAllReviewsRelatedToAttraction', verb: 'get'},
      accepts: [{arg: 'seoId', type: 'string', description: 'for ex: 299'},
      {arg: 'topX', type: 'string', description: 'for ex: 1-15'},
      {arg: 'sortOrder', type: 'string', description: 'SEO_REVIEW_RATING_A - Traveler Rating (low→high)|SEO_REVIEW_RATING_D - Traveler Rating (high→low)|SEO_REVIEW_RATING_PUBLISHED_DATE_D - Most recent review|SEO_REVIEW_RATING_LANGUAGE_ORDER_D - Requested language first followed by other languages'}],
      returns: {arg: 'results', type: '[UserReview]', root: true},
      description: 'Get reviews related to attraction',
    }
  );

  /**
   * get photos related to attraction
   */
  Attraction.getAllPhotosRelatedToAttraction = function(seoId, topX, cb) {
    var url = 'http://viatorapi.viator.com/service/attraction/photos?apiKey=4530519468461314';
    url = url + '&seoId=' + seoId + '&topX' + topX;
    console.log('Url request :', url);
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

  Attraction.remoteMethod(
    'getAllPhotosRelatedToAttraction', {
      http: {path: '/getAllReviewsRelatedToAttraction', verb: 'get'},
      accepts: [{arg: 'seoId', type: 'string', description: 'for ex: 299'},
      {arg: 'topX', type: 'string', description: 'for ex: 1-15'}],
      returns: {arg: 'results', type: '[UserPhoto]', root: true},
      description: 'Get photos related to attraction',
    }
  );

    /**
   * get panoramas related to attraction
   */
  Attraction.getAllPanoramasRelatedToAttraction = function(seoId, topX, cb) {
    var url = 'http://viatorapi.viator.com/service/attraction/panoramas?apiKey=4530519468461314';
    url = url + '&seoId=' + seoId + '&topX' + topX;
    console.log('Url request :', url);
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

  Attraction.remoteMethod(
    'getAllPanoramasRelatedToAttraction', {
      http: {path: '/getAllPanoramasRelatedToAttraction', verb: 'get'},
      accepts: [{arg: 'seoId', type: 'string', description: 'for ex: 299'},
      {arg: 'topX', type: 'string', description: 'for ex: 1-15'}],
      returns: {arg: 'results', type: '[Attraction]', root: true},
      description: 'Get panoramas related to attraction',
    }
  );

  /**
   * Retrieve all top attractions
   */
  Attraction.getTopAttractions = function(cb) {

    // Hard code here 
    var listTopAttractions = [
      {
        "sortOrder": 1,
        "webURL": null,
        "pageUrlName": "Alcatraz",
        "primaryDestinationUrlName": "Alcatraz",
        "publishedDate": "2016-05-31",
        "title": "Alcatraz",
        "destinationId": 651,
        "seoId": 23624,
        "productCount": 1,
        "photoCount": 0,
        "primaryDestinationId": 651,
        "primaryDestinationName": "San Francisco",
        "thumbnailURL": "http://cache-graphicslib.viator.com/graphicslib/page-images/339647_Viator_Unknown_171632.jpg",
        "rating": 0,
        "thumbnailHiResURL": "http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/339647_Viator_Unknown_171632.jpg",
        "attractionLatitude": 36.13784,
        "attractionLongitude": -115.16544,
        "attractionStreetAddress": "",
        "attractionCity": "San Francisco",
        "attractionState": "San Francisco"
      },
      {
        "sortOrder": 2,
        "webURL": null,
        "pageUrlName": "Colosseum",
        "primaryDestinationUrlName": "Colosseum",
        "publishedDate": "2015-06-10",
        "title": "Colosseum",
        "destinationId": 511,
        "seoId": 17456,
        "productCount": 2,
        "photoCount": 27,
        "primaryDestinationId": 511,
        "primaryDestinationName": "Rome",
        "thumbnailURL": "",
        "rating": 5,
        "thumbnailHiResURL": "",
        "attractionLatitude": 36.13784,
        "attractionLongitude": -115.16544,
        "attractionStreetAddress": "",
        "attractionCity": "Rome",
        "attractionState": "Rome"
      },
      {
        "sortOrder": 3,
        "webURL": null,
        "pageUrlName": "Eiffel Tower",
        "primaryDestinationUrlName": "Eiffel Tower",
        "publishedDate": "2015-12-21",
        "title": "Bally's",
        "destinationId": 479,
        "seoId": 18979,
        "productCount": 5,
        "photoCount": 0,
        "primaryDestinationId": 479,
        "primaryDestinationName": "Eiffel Tower",
        "thumbnailURL": "",
        "rating": 3,
        "thumbnailHiResURL": "",
        "attractionLatitude": 36.13784,
        "attractionLongitude": -115.16544,
        "attractionStreetAddress": "Paris",
        "attractionCity": "Paris",
        "attractionState": "Paris"
      },
      {
        "sortOrder": 4,
        "webURL": null,
        "pageUrlName": "Grand Canyon",
        "primaryDestinationUrlName": "Grand Canyon",
        "publishedDate": "2016-02-12",
        "title": "Grand Canyon",
        "destinationId": 815,
        "seoId": 15697,
        "productCount": 1,
        "photoCount": 0,
        "primaryDestinationId": 815,
        "primaryDestinationName": "Grand Canyon National Park",
        "thumbnailURL": "",
        "rating": 0,
        "thumbnailHiResURL": "",
        "attractionLatitude": 36.139313,
        "attractionLongitude": -115.168525,
        "attractionStreetAddress": "Grand Canyon National Park",
        "attractionCity": "Grand Canyon National Park",
        "attractionState": "Grand Canyon National Park"
      },
      {
        "sortOrder": 5,
        "webURL": null,
        "pageUrlName": "La Sagrada Familia",
        "primaryDestinationUrlName": "La Sagrada Familia",
        "publishedDate": "2016-02-12",
        "title": "La Sagrada Familia",
        "destinationId": 562,
        "seoId": 1243,
        "productCount": 4,
        "photoCount": 44,
        "primaryDestinationId": 562,
        "primaryDestinationName": "Las Vegas",
        "thumbnailURL": "",
        "rating": 4,
        "thumbnailHiResURL": "",
        "attractionLatitude": 36.111209,
        "attractionLongitude": -115.173197,
        "attractionStreetAddress": "Barcelona",
        "attractionCity": "Barcelona",
        "attractionState": "Barcelona"
      },
      {
        "sortOrder": 6,
        "webURL": null,
        "pageUrlName": "Louvre",
        "primaryDestinationUrlName": "Louvre",
        "publishedDate": "2015-11-16",
        "title": "Louvre",
        "destinationId": 684,
        "seoId": 14229,
        "productCount": 2,
        "photoCount": 7,
        "primaryDestinationId": 684,
        "primaryDestinationName": "Paris",
        "thumbnailURL": "",
        "rating": 3,
        "thumbnailHiResURL": "",
        "attractionLatitude": 36.13784,
        "attractionLongitude": -115.16544,
        "attractionStreetAddress": "Paris",
        "attractionCity": "Paris",
        "attractionState": "Paris"
      },
      {
        "sortOrder": 7,
        "webURL": null,
        "pageUrlName": "Moulin Rouge",
        "primaryDestinationUrlName": "Moulin Rouge",
        "publishedDate": "2015-06-04",
        "title": "Moulin Rouge",
        "destinationId": 684,
        "seoId": 15186,
        "productCount": 5,
        "photoCount": 119,
        "primaryDestinationId": 684,
        "primaryDestinationName": "Paris",
        "thumbnailURL": "",
        "rating": 3,
        "thumbnailHiResURL": "",
        "attractionLatitude": 36.13784,
        "attractionLongitude": -115.16544,
        "attractionStreetAddress": "Paris",
        "attractionCity": "Paris",
        "attractionState": "Paris"
      },
      {
        "sortOrder": 8,
        "webURL": null,
        "pageUrlName": "Mt. Fuji",
        "primaryDestinationUrlName": "Mt. Fuji",
        "publishedDate": "2015-07-31",
        "title": "Mt. Fuji",
        "destinationId": 334,
        "seoId": 4437,
        "productCount": 5,
        "photoCount": 11,
        "primaryDestinationId": 334,
        "primaryDestinationName": "Tokyo",
        "thumbnailURL": "",
        "rating": 4.5,
        "thumbnailHiResURL": "",
        "attractionLatitude": 36.13784,
        "attractionLongitude": -115.16544,
        "attractionStreetAddress": "Tokyo",
        "attractionCity": "Tokyo",
        "attractionState": ""
      },
      {
        "sortOrder": 9,
        "webURL": null,
        "pageUrlName": "Stonehenge",
        "primaryDestinationUrlName": "Stonehenge",
        "publishedDate": "2015-06-04",
        "title": "Stonehenge",
        "destinationId": 731,
        "seoId": 14228,
        "productCount": 1,
        "photoCount": 1,
        "primaryDestinationId": 731,
        "primaryDestinationName": "England",
        "thumbnailURL": "",
        "rating": 5,
        "thumbnailHiResURL": "",
        "attractionLatitude": 36.13784,
        "attractionLongitude": -115.16544,
        "attractionStreetAddress": "England",
        "attractionCity": "England",
        "attractionState": "England"
      },
      {
        "sortOrder": 10,
        "webURL": null,
        "pageUrlName": "Vatican",
        "primaryDestinationUrlName": "Vatican",
        "publishedDate": "2016-05-05",
        "title": "Vatican",
        "destinationId": 511,
        "seoId": 17456,
        "productCount": 2,
        "photoCount": 27,
        "primaryDestinationId": 511,
        "primaryDestinationName": "Rome",
        "thumbnailURL": "",
        "rating": 5,
        "thumbnailHiResURL": "",
        "attractionLatitude": 36.13784,
        "attractionLongitude": -115.16544,
        "attractionStreetAddress": "",
        "attractionCity": "Rome",
        "attractionState": "Rome"
      }];
    cb(null, listTopAttractions)
  };

  Attraction.remoteMethod(
    'getTopAttractions', {
      http: {path: '/getTopAttractions', verb: 'get'},
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Retrieve all top destination',
    }
  );
};
