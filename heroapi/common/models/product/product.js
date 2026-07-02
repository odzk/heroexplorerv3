'use strict';

const e = require('cors');
const debug = require('redis/lib/debug');

module.exports = function(Product) {

var viator = require('../../../server/constants');
 
  /**
   * Hidden un-used api
   */
  Product.disableRemoteMethodByName('create', true);
  Product.disableRemoteMethodByName('upsert', true);
  Product.disableRemoteMethodByName('deleteById', true);
  Product.disableRemoteMethodByName('updateAll', true);
  Product.disableRemoteMethodByName('replaceOrCreate', true);
  Product.disableRemoteMethodByName('findById', true);
  Product.disableRemoteMethodByName('find', true);
  Product.disableRemoteMethodByName('findOne', true);
  Product.disableRemoteMethodByName('count', true);
  Product.disableRemoteMethodByName('createChangeStream', true);
  Product.disableRemoteMethodByName('patchAttributes', true);
  Product.disableRemoteMethodByName('replaceById', true);
  Product.disableRemoteMethodByName('exists', true);
  Product.disableRemoteMethodByName('upsertWithWhere', true);
  Product.disableRemoteMethodByName('prototype.patchAttributes', true);

  // Setup 
  var nodemailer = require('nodemailer');
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'hello@heroexplorer.com',
        pass: 'G+t8958!'
    }
  });

  /**
   * Searches for Products AKA Things To Do. WARNING dealsOnly works only for no date lookups
   * {"startDate":"2017-02-01","endDate":"2017-10-10", "topX":"1-15","destId":684, "currencyCode":"EUR", "catId":0, "subCatId":0, "dealsOnly":false}
   */
  Product.searchForProducts = function(data, cb) {
    //console.log('Json request:', data);
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url + '/products/search',
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


  Product.remoteMethod(
        'searchForProducts', {
          http: {path: '/searchForProducts', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"startDate":"2017-02-01","endDate":"2017-10-10", "topX":"1-15","destId":684, "currencyCode":"EUR", "catId":0, "subCatId":0, "dealsOnly":false}', http: {source: 'body'}}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Searches for Products AKA Things To Do. WARNING dealsOnly works only for no date lookups',
        }
  );

  Product.searchForProductsByTextAndCodeSB = function(data, cb) {
    var redis = require('redis')
    , jsonify = require('redis-jsonify')
    , client = jsonify(redis.createClient())
    ;
    console.log('Data SB: ', data);
      var request = require('request');
          var options = {
            method:'POST',
            url: viator.url + '/service/search/freetext',
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
 
        Product.remoteMethod(
          'searchForProductsByTextAndCodeSB', {
            http: {path: '/searchForProductsByTextAndCodeSB', verb: 'post'},
            accepts: [{arg: 'data', type: 'object', description: '{"topX":"1-100","destId":684, "currencyCode":"EUR", "catId":0, "subCatId":0, "text":"helicoper", "sortOrder":"PRICE_FROM_A"|REVIEW_AVG_RATING_A|REVIEW_AVG_RATING_D|TOP_SELLERS|PRICE_FROM_D}', http: {source: 'body'}}],
            returns: {arg: 'results', type: 'array', root: true},
            description: 'Search Box Keyword Search',
          }
    );

  /**
   * Searches for Products use destination & Category & text
   * {"topX":"1-50","destId":684, "currencyCode":"EUR", "catId":0, "subCatId":0, "text":"helecoper"}
   */
  Product.searchForProductsByTextAndCodeHP = function(data, cb) {
    // var redis = require('redis')
    // , jsonify = require('redis-jsonify')
    // , client = jsonify(redis.createClient())
    // ;  
      var request = require('request');
      // if (client.exists('productsByTextAndCode=' + data["destId"], function(err, reply) { 
        // disabled redis due to issues with filters
          var options = {
            method:'POST',
            url: viator.url + '/products/search',
            headers: {
              'exp-api-key': viator.api,
              'Accept-Charset': 'utf-8',
              'Content-Type' : 'application/json',
              'Accept-Language' : 'en-US',
              'Accept' : 'application/json;version=2.0',
              'Access-Control-Allow-Origin' : '*'
          },
            body: JSON.stringify(data),
          };
          console.log('Options: ', options);
          console.log('Data: ', data);
          request(options, function(err, httpResponse, body) {
            if (err) {
              console.log('Error: ', err);
              cb(null, err);
            } else {
              var recv =  JSON.parse(body);
              console.log(recv);
              //client.set('productsByTextAndCode=' + data["destId"], JSON.stringify(recv['data']));
              cb(null, recv);
            }
          });
      // }));
  };

  Product.remoteMethod(
        'searchForProductsByTextAndCodeHP', {
          http: {path: '/searchForProductsByTextAndCodeHP', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"topX":"1-100","destId":684, "currencyCode":"EUR", "catId":0, "subCatId":0, "text":"helicoper", "sortOrder":"PRICE_FROM_A"|REVIEW_AVG_RATING_A|REVIEW_AVG_RATING_D|TOP_SELLERS|PRICE_FROM_D}', http: {source: 'body'}}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Searches for Products AKA Things To Do. WARNING dealsOnly works only for no date lookups',
        }
  );
  
  Product.searchForProductsByTextAndCode = function(data, cb) {
    console.log('execute', data);
    // var redis = require('redis')
    // , jsonify = require('redis-jsonify')
    // , client = jsonify(redis.createClient())
    // ;
    
    if (data["text"] == "") {
      delete data["text"]
      delete data["searchTypes"]
      var request = require('request');
        // disabled redis due to issues with filters
          var options = {
            method:'POST',
            url: viator.url + '/products/search',
            headers: {
              'exp-api-key': viator.api,
              'Accept-Charset': 'utf-8',
              'Content-Type' : 'application/json',
              'Accept-Language' : 'en-US',
              'Accept' : 'application/json;version=2.0',
              'Access-Control-Allow-Origin' : '*'
          },
            body: JSON.stringify(data),
          };
          console.log('Options: ', options);
          request(options, function(err, httpResponse, body) {
            if (err) {
              cb(null, err);
            } else {
              var recv =  JSON.parse(body);
              //client.set('productsByTextAndCode=' + data["destId"], JSON.stringify(recv['data']));
              cb(null, recv['products']);
            }
          });
    } else {
      console.log('search text executed!');
      console.log(data["text"]);
      //delete data["sortOrder"]
      //console.log('Json request:', data);
      var request = require('request');
      var text = data.text;
      var options = {
        method: 'POST',
        url: viator.url + '/service/search/freetext',
        headers: {
          'exp-api-key': viator.api,
          'Accept-Charset': 'utf-8',
          'Content-Type' : 'application/json',
          'Accept-Language' : 'en-US',
          'Accept' : 'application/json;version=2.0',
          'Access-Control-Allow-Origin' : '*'
        },
        body: JSON.stringify(data),
      };
      console.log('Data: ', data);
      request(options, function(err, httpResponse, body) {
        if (err) {
          cb(null, err);
        } else {
          var recv = JSON.parse(body);
          cb(null, recv['products']);
        }
      });
    }
  };

  Product.remoteMethod(
        'searchForProductsByTextAndCode', {
          http: {path: '/searchForProductsByTextAndCode', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"topX":"1-100","destId":684, "currencyCode":"EUR", "catId":0, "subCatId":0, "text":"helicoper", "sortOrder":"PRICE_FROM_A"|REVIEW_AVG_RATING_A|REVIEW_AVG_RATING_D|TOP_SELLERS|PRICE_FROM_D}', http: {source: 'body'}}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Searches for Products AKA Things To Do. WARNING dealsOnly works only for no date lookups',
        }
  );
  /**
   * Searches for Products By CODES
   * {"currencyCode":"EUR", "productCodes":["2280SUN","229016","5010SYDNEY"]}
   */
  Product.searchForProductsByCode = function(data, cb) {
    //console.log('Json request:', data);
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url + '/products/search/codes',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Content-Type' : 'application/json',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
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

  Product.remoteMethod(
        'searchForProductsByCode', {
          http: {path: '/searchForProductsByCode', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"currencyCode":"EUR", "productCodes":["2280SUN","229016","5010SYDNEY"]}', http: {source: 'body'}}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Searches for Products By CODES',
        }
  );

  /**
   * Updated to V2
   */
  Product.searchForProductByText = function(data, cb) {
    console.log('Json request:', data);
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url + '/search/freetext',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Content-Type' : 'application/json',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      },
      body: JSON.stringify(data)
    };

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv);
      }
    });
  };

  Product.remoteMethod(
        'searchForProductByText', {
          http: {path: '/searchForProductByText', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"topX":"1-15", "destId":684, "currencyCode":"EUR", "searchTypes":["PRODUCT","DESTINATION"], "text":"helicopter"}', http: {source: 'body'}}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Free text search',
        }
  );

  /**
   * API: V2
   * Get a products detailed information
   * code=5010SYDNEY&currencyCode=EUR&excludeTourGradeAvailability=false&showUnavailable=false
   */
  Product.getProductsDetails = function(code, cb) {
    const options = {
      url: viator.url + '/products/' + code,
      // url: viator.url + '/partner/product?' + '&code=' + code + '&currencyCode=' + currencyCode + '&excludeTourGradeAvailability=' + excludeTourGradeAvailability + '&showUnavailable=' + showUnavailable,
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      }
    };
    var request = require('request');
    console.log('Input Data: ', options);
    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        console.log('Product Details: ', recv.description);
        cb(null, recv);
      }
    });
  };

  Product.remoteMethod(
        'getProductsDetails', {
          http: {path: '/getProductsDetails', verb: 'get'},
          accepts: {arg: 'code', type: 'string', require: true},
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Get a products detailed information',
        }
  );

  Product.getProductsDetailsPrice = function(code, cb) {
    const options = {
      url: viator.url + '/availability/schedules/' + code,
      // url: viator.url + '/partner/product?' + '&code=' + code + '&currencyCode=' + currencyCode + '&excludeTourGradeAvailability=' + excludeTourGradeAvailability + '&showUnavailable=' + showUnavailable,
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      }
    };
    var request = require('request');
    console.log('Input Data: ', options);
    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        console.log('Product Details: ', recv.description);
        cb(null, recv);
      }
    });
  };

  Product.remoteMethod(
        'getProductsDetailsPrice', {
          http: {path: '/getProductsDetailsPrice', verb: 'get'},
          accepts: {arg: 'code', type: 'string', require: true},
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Get a products detailed pricing information',
        }
  );

  Product.getProductsDetailsLocation = function(data, cb) {
    console.log('Data: ', data);
    const options = {
      url: viator.url + '/locations/bulk',
      method:'POST',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Language' : 'en-US',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      },
      body: JSON.stringify(data)
    };
    var request = require('request');
    console.log('Input Data Location: ', options);
    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        console.log('Product Location: ', recv);
        cb(null, recv);
      }
    });
  };

  Product.remoteMethod(
        'getProductsDetailsLocation', {
          http: {path: '/getProductsDetailsLocation', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"Locations":"LOC-f698f2a1-a53a-46bb-8708-3d45bf740f59"}', http: {source: 'body'}}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Get a products detailed location information',
        }
  );

  /**
   * Get hotel pickup options of a product
   * code=5010SYDNEY
   */
  Product.getHotelPickupOfProduct = function(code, cb) {
    // var url = 'http://prelive.viatorapi.sandbox.viator.com/service/booking/hotels?apiKey=552392240092477167';
    //var urlRequest = url + '&productCode=' + code ;
    //console.log('url request :', urlRequest);
    var request = require('request');
    const options = {
      url: viator.url + '/service/booking/hotels?productCode='+ code,
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      }
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

  Product.remoteMethod(
        'getHotelPickupOfProduct', {
          http: {path: '/getHotelPickupOfProduct', verb: 'get'},
          accepts: [{arg: 'code', type: 'string', require: true}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Get hotel pickup options of a product',
        }
  );

 /**
   * Get a products USER reviews
   * code=5010SYDNEY&topX=1-15&sortOrder=REVIEW_RATING_D&showUnavailable=false
   */
  Product.getProductReviews = function(code, topX, sortOrder, showUnavailable, cb) {
    const options = {
      url: viator.url + '/service/product/reviews?' + '&code=' + code + '&topX=' + topX + '&sortOrder=' + sortOrder + '&showUnavailable=' + showUnavailable,
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      }
    };
    var request = require('request');

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };
  
  Product.remoteMethod(
    'getProductReviews', {
      http: {path: '/getProductReviews', verb: 'get'},
      accepts: [{arg: 'code', type: 'string', require: true, description: '5010SYDNEY'}, {arg: 'topX', type: 'string', require: true, description: '1-15'},
      {arg: 'sortOrder', type: 'string', require: true, description: 'REVIEW_RATING_A - Traveler Rating (low→high) (not averages), REVIEW_RATING_D - Traveler Rating (high→low) (not averages), REVIEW_RATING_SUBMISSION_DATE_D - Most recent review'},
      {arg: 'showUnavailable', type: 'boolean', require: true, description: 'true: Return both available and unavailable products.false: Return only available products. This is the default.'}],
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Get a products USER reviews',
    }
    );

    const request = require('request');

   
    // API V2
    Product.postProductReviewsV2 = function(productCode, provider, count, start, showMachineTranslated, reviewsForNonPrimaryLocale, ratings, sortBy, cb) {
        const options = {
          url: viator.url + '/reviews/product',
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
              productCode: productCode,
              provider: provider,
              count: count,
              start: start,
              showMachineTranslated: showMachineTranslated,
              reviewsForNonPrimaryLocale: reviewsForNonPrimaryLocale,
              ratings: ratings,
              sortBy: sortBy}
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
    
    // API V2
        Product.remoteMethod(
          'postProductReviewsV2', {
            http: {path: '/postProductReviewsV2', verb: 'post'},
            accepts: [
           /*  {arg: 'data', type: 'object', require: true, description: '{"productCode":"5010SYDNEY","provider":"ALL","count":10,"start":1,"showMachineTranslated":true,"reviewsForNonPrimaryLocale":true,"ratings":[1,2,3,4,5],"sortBy":"MOST_RECENT_PER_LOCALE"}'}, */
            {arg: 'productCode', type: 'string', require: true, description: '88020P13'}, 
            {arg: 'provider', type: 'string', require: true, description: 'VIATOR, TRIPADVISOR, ALL'}, 
            {arg: 'count', type: 'integer', require: true, description: '10 for pagination'}, 
            {arg: 'start', type: 'integer', require: true, description: '1'},  
            {arg: 'showMachineTranslated', type: 'boolean', require: true, description: 'Set to true to include machine-translated reviews.'},
            {arg: 'reviewsForNonPrimaryLocale', type: 'boolean', require: true, description: 'Set to true to include reviews submitted by users from locales that are not the primary locale as given in the Accept-Language header parameter.'},
            {arg: 'ratings', type: 'array', require: true, description: '[1,2,3,4,5] = displays reviews with 1 to 5 stars.'},
            {arg: 'sortBy', type: 'string', require: true, description: 'HIGHEST_RATING_PER_LOCALE - sort by rating (descending) for each locale, MOST_RECENT_PER_LOCALE - sort by publication date (descending) for each locale, MOST_HELPFUL_PER_LOCALE - sort by the number of helpful votes (descending) for each locale, HIGHEST_RATING - sort by rating (descending) across all locales, MOST_RECENT - sort by publication date (descending) across all locales, MOST_HELPFUL - sort by the number of helpful votes (descending) across all locales'},
          ],
            returns: {arg: 'results', type: 'array', root: true},
            description: 'Get a products USER reviews',}
          );

      //API V2
  // Product.searchForProductByTextV2 = function(data, cb) {
  //   var request = require('request');
  //   var options = {
  //     method: 'POST',
  //     url: viator.url + '/search/freetext',
  //     headers: {
  //       'exp-api-key': viator.api,
  //       'Accept-Charset': 'utf-8',
  //       'Content-Type': 'application/json',
  //       'Accept-Language': 'en-US',
  //       'Accept': 'application/json;version=2.0',
  //       'Access-Control-Allow-Origin': '*'
  //     },
  //     body: JSON.stringify(data),
  //   };
  //   request(options, function(err, httpResponse, body) {
  //     if (err) {
  //       cb(err, null);
  //     } else {
  //       cb(null, body);
  //       const res=JSON.parse(body);
  //       console.log(res);
  //     }
  //   });
  // };

  // Product.remoteMethod(
  //       'searchForProductByTextV2', {
  //         http: {path: '/searchForProductByTextV2', verb: 'post'},
  //         accepts: [
  //           {arg: 'data', type: 'object', require: true, description: '{"searchTerm":"ripper","productFiltering":{"destination":"22","dateRange":{},"price":{},"rating":{},"durationInMinutes":{},"flags":["LIKELY_TO_SELL_OUT"],"includeAutomaticTranslations":true},"productSorting":{"sort":"PRICE","order":"DESCENDING"},"searchTypes":[{"searchType":"PRODUCTS","pagination":{"start":1,"count":3}},{"searchType":"ATTRACTIONS","pagination":{"start":1,"count":1}},{"searchType":"DESTINATIONS","pagination":{"start":1,"count":1}}],"currency":"USD"}', http: {source: 'body'}}, 
  //         /*   {arg:'searchTerm', type: 'string', require:true,  } */

  //         ],         
  //         returns: {arg: 'results', type: 'array', root: true},
  //         description: 'Free text search V2',
  //       }
  // );

  Product.availabilitySchedule = function(productCode, cb) {
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url +'/availability/schedules/bulk',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Content-Type' : 'application/json',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      },
      body: JSON.stringify(productCode)
    };
  
    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(err, null);
      } else {
        try {
          const parsedBody = JSON.parse(body); // Parse the JSON string
          cb(null, parsedBody);
          console.log(parsedBody);
        } catch (parseError) {
          cb(parseError, null);
        }
      }
    });
  };  
  
  Product.remoteMethod(
    'availabilitySchedule', {
      http: {path: '/availabilitySchedule', verb: 'post'},
      accepts: [{arg: 'data', type: 'object', description: '{"productCodes":["137052P1"]}', http: {source: 'body'}}],
      returns: {arg: 'results', type: 'object', root: true},
      description: 'Check schedule of available product',
    }
);





// API V2
Product.searchForProductsByTags = function(filtering, sorting, pagination, currency, cb) {
  const options = {
    url: viator.url + '/products/search',
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
      filtering: filtering,
      sorting: sorting,
      pagination: pagination,
      currency: currency
    }
  };

  request(options, function(err, httpResponse, body) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, body);
      console.log(body); 
    }
  });
};  

 // API V2
 Product.remoteMethod(
  'searchForProductsByTags', {
    http: {path: '/searchForProductsByTags', verb: 'post'},
         accepts: [
          {arg: 'filtering', type:'object', require:true, description:'{"destination": "22","tags": [21972],"flags": ["FREE_CANCELLATION"],"lowestPrice": 5,"highestPrice": 10000000,"startDate": "2024-02-28","endDate": "2024-03-28","includeAutomaticTranslations": true,"confirmationType": "INSTANT","durationInMinutes": {"from": 0,"to": 1000},"rating": {"from": 1,"to": 5}}'},
          {arg:'sorting', type:'object', require:true, description: '{"sort": "TRAVELER_RATING","order": "DESCENDING"}'},
          {arg:'pagination', type:'object',require:true, description: '{"start": 1,"count": 100}'},
          {arg:'currency', type:'string', require:true, description:'USD'}
        ],
    returns: {arg: 'results', type: 'array', root: true},
    description: 'Get products by DestinationTagsFlagsPriceDateDurationRatingV2',
  }
  );

      
     // API V2
Product.getProductsTagsV2 = function(cb) {
  const options = {
    url: viator.url + '/products/tags',
    method: 'GET',
    headers: {
      'exp-api-key': viator.api,
      'Accept-Charset': 'utf-8',
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US',
      'Accept': 'application/json;version=2.0',
      'Access-Control-Allow-Origin': '*'
    },
    json: true
  };

  request(options, function(err, httpResponse, body) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, body);
      console.log(body); 
    }
  });
};

// API V2
Product.remoteMethod(
  'getProductsTagsV2', {
    http: {path: '/getProductsTagsV2', verb: 'get'},
    accepts: [],
    returns: {arg: 'results', type: 'array', root: true},
    description: 'Get tags',
  }
  );
 
 /**
   * Get a products USER photos
   * code=5010SYDNEY&topX=1-15&showUnavailable=false
   */
  Product.getProductUserPhotos = function(code, topX, showUnavailable, cb) {
    //var url = 'http://prelive.viatorapi.sandbox.viator.com/service/product/photosapiKey=552392240092477167';
    //var urlRequest = url + '&code=' + code + '&topX=' + topX + '&showUnavailable=' + showUnavailable;
    //console.log('url request :', urlRequest);
    var request = require('request');
    const options = {
      url: viator.url + '/service/product/photos?code=' + code + '&topX=' + topX + '&showUnavailable=' + showUnavailable,
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      }
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

  Product.remoteMethod(
        'getProductUserPhotos', {
          http: {path: '/getProductUserPhotos', verb: 'get'},
          accepts: [{arg: 'code', type: 'string', require: true, description: '5010SYDNEY'}, {arg: 'topX', type: 'string', require: true, description: '1-15'},
                    {arg: 'showUnavailable', type: 'boolean', require: true, description: 'true: Return both available and unavailable products.false: Return only available products. This is the default.'}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Get a products USER photos',
        }
  );

  /** WARNING: THIS ENDPOINT DOESNT EXISTS ANYMORE AND NOT ON VIATOR AS WELL
   * Get the standard terms and conditions of a product
   */
  Product.getProductStandardTermsAndConditions = function(cb) {
    //var url = 'http://prelive.viatorapi.sandbox.viator.com/service/product/standardTerms?apiKey=552392240092477167';
    //console.log('url request :', url);
    var request = require('request');
    const options = {
      url: viator.url + '/service/product/standardTerms',
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      }
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

  Product.remoteMethod(
        'getProductStandardTermsAndConditions', {
          http: {path: '/getProductStandardTermsAndConditions', verb: 'get'},
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Get the standard terms and conditions of a product',
        }
  );

  /**
   * Load available products By CODES and DATES
   * {"currencyCode":"USD","startDate":"2017-02-20","endDate":"2017-02-28","numAdults":1,"productCodes":["5010SYDNEY","2280SUN","9169P50"]}
   */
  Product.searchForProductsAvaliableByCodeAndDate = function(data, cb) {
    //var url = 'http://prelive.viatorapi.sandbox.viator.com/service/available/products?apiKey=552392240092477167';
    //console.log('Json request:', data);
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url +'/service/booking/availability',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Content-Type' : 'application/json',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      },
      body: JSON.stringify(data)
    };

    // var options = {
    //   url: url,
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify(data),
    // };

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };

  Product.remoteMethod(
        'searchForProductsAvaliableByCodeAndDate', {
          http: {path: '/searchForProductsAvaliableByCodeAndDate', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"currencyCode":"USD","startDate":"2017-02-20","endDate":"2017-02-28","numAdults":1,"productCodes":["5010SYDNEY","2280SUN","9169P50"]}, productCodes: Required. Maximum number of codes per request is 50. |startDate: Required. Travel start date. |endDate: Required. Travel end date |currencyCode: Optional. Defaults to USD. |numAdults: Optional. Number of adult travellers, defaults to 1.', http: {source: 'body'}}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Load available products By CODES and DATES',
        }
  );

  /**
   * Searches for Products by Date & PriceDuration & Category
   * {"topX":"1-50","destId":684, "currencyCode":"EUR", "text":"helecoper", "minPrice":10, "maxPrice": 20, "minDuration": 30, "maxDuration:100"}
   */
  Product.searchForProductsByDatePriceDurationAndCategory = function(data, cb) {
    if (data.destId > 0) {
      // var url = 'http://prelive.viatorapi.sandbox.viator.com/products/search?apiKey=552392240092477167';
      //console.log('Json request:', data);
      var request = require('request');
      var text = data.text;
      var minPrice = parseFloat(data.minPrice);
      var maxPrice = parseFloat(data.maxPrice);
      var minDuration = parseInt(data.minDuration);
      var maxDuration = parseInt(data.maxDuration);
      delete data["minPrice"];
      delete data["maxPrice"];
      delete data["minDuration"];
      delete data["maxDuration"];
      //console.log("Json request after delete unneeded: ", data)
      var options = {
        method:'POST',
        url: viator.url + '/products/search',
        headers: {
          'exp-api-key': viator.api,
          'Accept-Charset': 'utf-8',
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
          var result = [];
          
          if (recv['data'] != null) {
            for (var i = 0; i < recv['data'].length ; i++) {
          
              if (minPrice <= parseFloat(recv['data'][i]['price']) && parseFloat(recv['data'][i]['price']) <= maxPrice) {
                  var durationText = recv['data'][i]['duration'];
                  var days = 0;
                  var hours = 0;
                  var minutes = 0;
                  if (durationText.indexOf(" days") > -1 && durationText.length == durationText.indexOf(" days") + 5) {
                    days = Number(durationText.slice(0,durationText.indexOf(" days")));
                  }
    
                  if (durationText.indexOf(" days ") > -1) {
                      days = Number(durationText.slice(0,durationText.indexOf(" days ")));
                      var durationTextTempleft = durationText.slice(durationText.indexOf(" days ") + 6, durationText.length); 
                      if (durationText.indexOf(" hours") > -1 && durationText.length == durationText.indexOf(" hours") + 6) {
                        hours = Number(durationText.slice(0,durationText.indexOf(" hours")));
                      }
                      if (durationTextTempleft.indexOf(" hours ") > -1) {
                        hours = Number(durationTextTempleft.slice(0, durationTextTempleft.indexOf(" hours ")));
                        var durationTextTempleftMinute = durationText.slice(durationText.indexOf(" hours ") + 7, durationText.length); 
                        if (durationTextTempleftMinute.indexOf(" minutes ") > -1) {
                          minutes = Number(durationTextTempleftMinute.slice(0, durationTextTempleftMinute.indexOf(" minutes ")));
                        } 
                        if (durationTextTempleftMinute.indexOf(" minutes") > -1 && durationTextTempleftMinute.length == durationTextTempleftMinute.indexOf(" minutes") + 8) {
                          hours = Number(durationTextTempleftMinute.slice(0,durationTextTempleftMinute.indexOf(" minutes")));
                        }
                      } 
                  } else if (durationText.indexOf(" hours") > -1) {
                    if (durationText.indexOf(" hours ") > -1) {
                      hours = Number(durationText.slice(0, durationText.indexOf(" hours ")));
                      var durationTextTemp = durationText.slice(durationText.indexOf(" hours ") + 7, durationText.length); 
                        if (durationTextTemp.indexOf(" minutes") > -1) {
                          minutes = Number(durationTextTemp.slice(0, durationTextTemp.indexOf(" minutes")));
                        } 
                    } else {
                      hours = Number(durationText.slice(0, durationText.indexOf(" hours")));
                    }    
                  } else if (durationText.indexOf(" minutes") > -1) {
                      minutes = Number(durationText.slice(0, durationText.indexOf(" minutes")));
                  }
                  if (durationText.indexOf("1 day") > -1) {
                    days = 1
                  } 
                  
                  if (durationText.indexOf("1 minute") > -1) {
                    minutes = 1
                  }
                  if (durationText.indexOf("1 hour") > -1) {
                    hours = 1
                  }

                  var totalMinutes = days*24*60*60 + hours*60*60 + minutes;
                  if ((minDuration <= totalMinutes && totalMinutes <= maxDuration) | durationText.indexOf("Flexible") > -1 | durationText.indexOf("Varies") > -1 | durationText.indexOf("hrs") > -1 | durationText.indexOf("year") > -1) {
                    if (recv['data'][i]['title'].indexOf(text) > - 1) {
                      result.push(recv['data'][i]);
                      }
                  }
              }
            }
          }
  
          cb(null, result);
        }
      });
    } else {
      //console.log('Json request:', data);
      var request = require('request');
      var text = data.text;
      var minPrice = parseFloat(data.minPrice);
      var maxPrice = parseFloat(data.maxPrice);
      var minDuration = parseInt(data.minDuration);
      var maxDuration = parseInt(data.maxDuration);
      delete data["minPrice"];
      delete data["maxPrice"];
      delete data["minDuration"];
      delete data["maxDuration"];
      delete data["sortOrder"];
      delete data["catId"];
      delete data["subCatId"];
      data.searchTypes = ["PRODUCT","DESTINATION"];
      //console.log("Json request after delete unneed variables: ", data)
      var request = require('request');
      var options = {
        method:'POST',
        url: viator.url + '/service/search/freetext',
        headers: {
          'exp-api-key': viator.api,
          'Accept-Charset': 'utf-8',
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
    }

  };

  Product.remoteMethod(
        'searchForProductsByDatePriceDurationAndCategory', {
          http: {path: '/searchForProductsByDatePriceDurationAndCategory', verb: 'post'},
          accepts: [{arg: 'data', type: 'object', description: '{"topX":"1-100","destId":684, "currencyCode":"EUR", "catId":0, "subCatId":0, "text":"helicoper", "sortOrder":"PRICE_FROM_A"|REVIEW_AVG_RATING_A|REVIEW_AVG_RATING_D|TOP_SELLERS|PRICE_FROM_D}', http: {source: 'body'}}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Searches for Products by Date & PriceDuration & Category',
        }
  );

  /**
   * Get date avaliable of a product
   */
  Product.getDateAvaliableOfAProduct = function(productCode, cb) {
    // var url = 'http://prelive.viatorapi.sandbox.viator.com/service/booking/availability/dates?apiKey=552392240092477167';
    //url = url + "&productCode=" + productCode;
    //console.log('url request :', url);
    var request = require('request');
    const options = {
      url: viator.url + '/availability/schedules/' + productCode,
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      }
    };
    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv);
      }
    });
  };

  Product.remoteMethod(
        'getDateAvaliableOfAProduct', {
          http: {path: '/getDateAvaliableOfAProduct', verb: 'get'},
          accepts: [{arg: 'productCode', type: 'string', require: true, description: '5010SYDNEY'}],
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Get date avaliable of a product',
        }
  );

  /**
   * API: V2
   * Get information for booking questions
   */
    Product.getBookingQuestions = function(cb) {
      var request = require('request');
      const options = {
        url: viator.url + '/products/booking-questions',
        method:'GET',
        headers: {
          'exp-api-key': viator.api,
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8',
          'Accept-Language' : 'en-US',
          'Accept' : 'application/json;version=2.0',
          'Access-Control-Allow-Origin' : '*'
        }
      };
      request(options, function(err, httpResponse, body) {
        if (err) {
          cb(null, err);
        } else {
          var recv =  JSON.parse(body);
          cb(null, recv);
        }
      });
    };
  
    Product.remoteMethod(
      'getBookingQuestions', {
        http: {path: '/getBookingQuestions', verb: 'get'},
        returns: {arg: 'results', type: 'array', root: true},
        description: 'Get information for booking questions',
      }
);

  /**
   * API: V2
   * Retrieves a dictionary of unique identification codes (cancellationReasonCode) and their associated natural-language descriptions (cancellationReasonText). 
   */
  Product.getCancelReasons = function(cb) {
    var request = require('request');
    const options = {
      url: viator.url + '/bookings/cancel-reasons',
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      }
    };
    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv);
      }
    });
  };

  Product.remoteMethod(
    'getCancelReasons', {
      http: {path: '/getCancelReasons', verb: 'get'},
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Retrieves a dictionary of unique identification codes (cancellationReasonCode)',
    }
);

  /**
   * API: V2
   * Gets the cancellation quote for an existing booking.
   */
  Product.checkStatus = function(bookingRef, cb) {
    var request = require('request');
    const options = {
      url: viator.url + '/bookings/'+ bookingRef + '/cancel-quote',
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      }
    };
    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv);
      }
    });
  };

  Product.remoteMethod(
    'checkStatus', {
      http: {path: '/checkStatus', verb: 'get'},
      accepts: {arg: 'bookingRef', type: 'string', require: true},
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Retrieves a dictionary of unique identification codes (cancellationReasonCode)',
    }
  );

  /**
   * API: V2
   * Load options of a product
   * {"productCode":"5010SYDNEY","bookingDate":"2018-04-22", "currencyCode":"EUR", "ageBands":[{"bandId":1, "count":1}]}
   */
  Product.loadOptionsOfAProduct = function(data, cb) {
    // var url = 'http://prelive.viatorapi.sandbox.viator.com/service/booking/availability/tourgrades?apiKey=552392240092477167';
    //console.log('Json request:', data);
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url + '/availability/check',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Content-Type' : 'application/json',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      },
      body: JSON.stringify(data)
    };

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        console.log('Load Product: ', recv);
        if (recv != null) {
          cb(null, recv);
        } else {
          cb(null, recv)
        } 
      }
    });
  };

  Product.remoteMethod(
    'loadOptionsOfAProduct', {
      http: {path: '/loadOptionsOfAProduct', verb: 'post'},
      accepts: [{arg: 'data', type: 'object', description: '{"productCode": "5010SYDNEY", "travelDate": "2020-12-12","currency": "AUD", "paxMix": [{"ageBand": "ADULT", "numberOfTravelers": 2}, {"ageBand": "CHILD","numberOfTravelers": 2 }]}', http: {source: 'body'}}],
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Load options of a product',
    }
  );

    /**
   * API: V2
   * Cancels existing booking with given Viator-generated booking-reference
   */
    Product.cancelAProduct = function(data, cb) {
      console.log('Cancel Data: ', data);
      var request = require('request');
      var bookingReference = data.bookingReference;
      delete data['bookingReference'];
      var options = {
        method:'POST',
        url: viator.url + '/bookings/' + bookingReference + '/cancel',
        headers: {
          'exp-api-key': viator.api,
          'Accept-Charset': 'utf-8',
          'Content-Type' : 'application/json',
          'Accept-Language' : 'en-US',
          'Accept' : 'application/json;version=2.0',
          'Access-Control-Allow-Origin' : '*'
        },
        body: JSON.stringify(data)
      };

      console.log('Cancel Params: ', options);
  
      request(options, function(err, httpResponse, body) {
        if (err) {
          cb(null, err);
        } else {
          var recv =  JSON.parse(body);
          console.log('Cancelled Product: ', recv);
          if (recv != null) {
            cb(null, recv);
          } else {
            cb(null, recv)
          } 
        }
      });
    };
  
    Product.remoteMethod(
      'cancelAProduct', {
        http: {path: '/cancelAProduct', verb: 'post'},
        accepts: [{arg: 'data', type: 'object', description: '{"reasonCode": "Customer_Service.I_canceled_my_entire_trip"}', http: {source: 'body'}}],
        returns: {arg: 'results', type: 'array', root: true},
        description: 'Cancels existing booking with given Viator-generated booking-reference',
      }
    );
  

  /** WARNING: THIS IS ERROR AT VIATOR SIDE AS WELL
   * Load Available date & price
   * {"productCode":"5010SYDNEY","bookingDate":"2018-04-22", "currencyCode":"EUR"}
   */
  Product.loadAvailableDateAndPrice = function(data, cb) {
    //var url = 'http://prelive.viatorapi.sandbox.viator.com/service/booking/availability/tourgrades/pricingmatrix?apiKey=552392240092477167';
    console.log('Json request:', data);
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url + '/availability/check',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Content-Type' : 'application/json',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      },
      body: JSON.stringify(data)
    };

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        if (recv['data'] != null) {
          if (recv['data']['dates'] == null) {
            recv['data']['dates'] = []
          }
          cb(null, recv['data']);
        } else {
          var res = {}
          res['bookingMonth'] = data.year + '-' + data.month
          res['pricingUnit'] =  "per person",
          res['dates'] = []
          cb(null, res)
        } 
      }
    });
  };

  Product.remoteMethod(
    'loadAvailableDateAndPrice', {
      http: {path: '/loadAvailableDateAndPrice', verb: 'post'},
      accepts: [{arg: 'data', type: 'object', description: '{"productCode":"5010SYDNEY","month":"08", "year":"2018", "currencyCode":"EUR"}]}', http: {source: 'body'}}],
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Load available date & price of a product',
    }
  );

  /* API V2 */

  Product.loadAvailableDate = function(productCode, cb) {
    var request = require('request');
    const options = {
      url: viator.url + '/availability/schedules/' + productCode,
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      }
    };
    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv);
      }
    });
  };

  Product.remoteMethod(
        'loadAvailableDate', {
          http: {path: '/loadAvailableDate', verb: 'get'},
          accepts: {arg: 'productCode', type: 'string', require: true},
          returns: {arg: 'results', type: 'array', root: true},
          description: 'Get availability and pricing details for all product options of the requested product',
        }
  );

  /**
   * Load Tour Grade Availabiltiy for a month
   */
  Product.loadAvailableTourGrades = function(data, cb) {
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url + '/service/booking/availability/tourgrades/pricingmatrix',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Content-Type' : 'application/json',
        'Accept' : 'application/json;version=2.0',
        'Accept-Language' : 'en-US',
        'Access-Control-Allow-Origin' : '*'
      },
      body: JSON.stringify(data)
    };

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        if (recv['data'] != null) {
          if (recv['data']['dates'] == null) {
            cb(null, []);
          } else {
            var dateTours = recv['data']["dates"];
            var availableTourGrades = [];
            for (var i = 0; i < dateTours.length ; i++) {
              var dateTour = dateTours[i];
              var tourgrades = dateTour["tourGrades"];
              for (var j = 0; j < tourgrades.length; j++) {
                var tourgrade = tourgrades[j];
                delete tourgrade['sortOrder'];
                var pricingMatrix1 = tourgrade['pricingMatrix'][0]
                var ageBandPrices1 =  pricingMatrix1['ageBandPrices'][0]
                var price = ageBandPrices1['prices'][0]
                tourgrade["currencyCode"] = price["currencyCode"];
                tourgrade["price"] = price["currencyCode"];
                tourgrade["priceFormatted"] = price["priceFormatted"];
                tourgrade["merchantNetPrice"] = price["merchantNetPrice"];
                tourgrade["merchantNetPriceFormatted"] = price["merchantNetPriceFormatted"];
                tourgrade["minNoOfTravellersRequiredForPrice"] = price["minNoOfTravellersRequiredForPrice"];
                tourgrade["available"] = true
                delete tourgrade['pricingMatrix'];
                var checkExist = false
                for (var k = 0; k < availableTourGrades.length; k++) {
                  if (tourgrade['gradeCode'] == availableTourGrades[k]['gradeCode'] && tourgrade['gradeTitle'] == availableTourGrades[k]['gradeTitle']) {
                    checkExist = true;
                    break;
                  }
                }
                if (checkExist == false) {
                  availableTourGrades.push(tourgrade)
                }
              }
            }
            cb(null, availableTourGrades);
          }
         
        } else {
          cb(null, [])
        } 
      }
    });
  };

  Product.remoteMethod(
    'loadAvailableTourGrades', {
      http: {path: '/loadAvailableTourGrades', verb: 'post'},
      accepts: [{arg: 'data', type: 'object', description: '{"productCode":"5010SYDNEY","month":"08", "year":"2018"}', http: {source: 'body'}}],
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Load Tour Grade Availabiltiy for a month',
    }
  );


 /**
   * API: V1
   * Get Price for an option product
   * {"productCode":"5010SYDNEY","tourGradeCode":"24HOUR","bookingDate":"2018-04-22", "currencyCode":"EUR", "specialReservation":false}
   */
 Product.loadPriceForAnOptionProduct = function(data, cb) {
  // var url = 'http://prelive.viatorapi.sandbox.viator.com/service/booking/pricingmatrix?apiKey=552392240092477167';
  //console.log('Json request:', data);
  var request = require('request');
  var options = {
    method:'POST',
    url: viator.url + '/service/booking/pricingmatrix',
    headers: {
      'exp-api-key': viator.api,
      'Accept-Charset': 'utf-8',
      'Content-Type' : 'application/json',
      'Accept-Language' : 'en-US',
      'Accept' : 'application/json;version=2.0',
      'Access-Control-Allow-Origin' : '*'
    },
    body: JSON.stringify(data)
  };
  // var options = {
  //   url: url,
  //   headers: {'Content-Type': 'application/json'},
  //   body: JSON.stringify(data),
  // };

  request(options, function(err, httpResponse, body) {
    if (err) {
      cb(null, err);
    } else {
      var recv =  JSON.parse(body);
      cb(null, recv['data']);
    }
  });
};

Product.remoteMethod(
  'loadPriceForAnOptionProduct', {
    http: {path: '/loadPriceForAnOptionProduct', verb: 'post'},
    accepts: [{arg: 'data', type: 'object', description: '{"productCode":"5010SYDNEY","tourGradeCode":"24HOUR","bookingDate":"2018-04-22", "currencyCode":"EUR", "specialReservation":false}]}', http: {source: 'body'}}],
    returns: {arg: 'results', type: 'array', root: true},
    description: 'Get Price for an option product',
  }
);


  /**
   * API: V1
   * Get Price for an option product
   * {"productCode":"5010SYDNEY","tourGradeCode":"24HOUR","bookingDate":"2018-04-22", "currencyCode":"EUR", "specialReservation":false}
   */
  Product.loadPriceForAnOptionProduct = function(data, cb) {
    // var url = 'http://prelive.viatorapi.sandbox.viator.com/service/booking/pricingmatrix?apiKey=552392240092477167';
    //console.log('Json request:', data);
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url + '/service/booking/pricingmatrix',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Content-Type' : 'application/json',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      },
      body: JSON.stringify(data)
    };
    // var options = {
    //   url: url,
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify(data),
    // };

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };

  Product.remoteMethod(
    'loadPriceForAnOptionProduct', {
      http: {path: '/loadPriceForAnOptionProduct', verb: 'post'},
      accepts: [{arg: 'data', type: 'object', description: '{"productCode":"5010SYDNEY","tourGradeCode":"24HOUR","bookingDate":"2018-04-22", "currencyCode":"EUR", "specialReservation":false}]}', http: {source: 'body'}}],
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Get Price for an option product',
    }
  );

  /**
   * Re caclculate price with promote code
   * {"promoCode":"ATLAS","partnerDetail":null,"currencyCode":"AUD","items":[{ "specialReservation":false,"travelDate":"2018-04-09","productCode":"2550HOHOBODY","tourGradeCode":"24COMBO","travellers":[{"bandId":1},{"bandId":1},{"bandId":1}]}]}
   */
  Product.reclculateThePriceWithPromotionCode  = function(data, cb) {
    // var url = 'http://prelive.viatorapi.sandbox.viator.com/service/booking/calculateprice?apiKey=552392240092477167';
    //console.log('Json request:', data);
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.url + '/service/booking/calculateprice',
      headers: {
        'exp-api-key': viator.api,
        'Accept-Charset': 'utf-8',
        'Content-Type' : 'application/json',
        'Accept-Language' : 'en-US',
        'Accept' : 'application/json;version=2.0',
        'Access-Control-Allow-Origin' : '*'
      },
      body: JSON.stringify(data)
    };

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv["data"]);
      }
    });
  };

  Product.remoteMethod(
    'reclculateThePriceWithPromotionCode', {
      http: {path: '/reclculateThePriceWithPromotionCode', verb: 'post'},
      accepts: [{arg: 'data', type: 'object', description: '{"promoCode":"ATLAS","partnerDetail":null,"currencyCode":"AUD","items":[{ "specialReservation":false,"travelDate":"2018-04-09","productCode":"2550HOHOBODY","tourGradeCode":"24COMBO","travellers":[{"bandId":1},{"bandId":1},{"bandId":1}]}]}', http: {source: 'body'}}],
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Re calculate the price with promotion code',
    }
  );

  /**
   * Make a payment
   */
  Product.makeApayment  = function(data, cb) {
    //console.log('Json request:', data);
    var stripe = require("stripe")(viator.stripe);
    // console.log('Stripe Key: ', stripe);
    //console.log("stripe token:" + stripe)
    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    var token = data["token"];
    //console.log(token)
    // var productCodeArray = data["productCodes"];
    // var productCodeString = "Product Codes:";
    // for (var i = 0; i < productCodeArray.length ; i++) {
    //   var productCodeTemp = productCodeArray[i];
    //   productCodeString = productCodeString + "-" +productCodeTemp["productCode"];
    // }
    // var tourCodeArray = data["tourCodes"];
    // var tourCodeString = "Tour Codes:";
    console.log('Booking Reference Data:  ', data);
    var bookingReferenceString = "Booking Reference: ";
    var bookingRefArray = data["bookingReference"];
    for (var i = 0; i < bookingRefArray.length ; i++) {
      var bookingReferenceTemp = bookingRefArray[i].bookingReference;
      bookingReferenceString = bookingReferenceString + " " + bookingReferenceTemp;
      console.log('Booking Temp: ', bookingReferenceTemp);
      console.log('Booking String: ', bookingReferenceString);
    }
    // for (var i = 0; i < tourCodeArray.length ; i++) {
    //   var tourCodeTemp = tourCodeArray[i];
    //   tourCodeString = tourCodeString + "-" + tourCodeTemp["tourCode"];
    // }

    // var description = bookingReferenceString + ", " + productCodeString + ", " + tourCodeString + "Primary traveler: " + data["primaryTraveler"] + ", Primary Phone: " + data["phoneTraveler"];
    var description = bookingReferenceString + "Primary traveler: " + data["primaryTraveler"] + ", Primary Phone: " + data["phoneTraveler"];
    console.log("description:" + description)
    var amount = data["amount"];
    //console.log("amount:" + amount)
    var currency = data["currency"];
    //console.log("currency:" + currency)
    var charge = stripe.charges.create({
      amount: amount,
      currency: currency,
      description: description,
      source: token
    },function(err, charge) {
      if (err) {
          //console.log("stripe error:" + err)
          cb(null,err)
      } else {
        //console.log("stripe charged:" + charge)
          cb(null, charge)
      }
    });
  };

  Product.remoteMethod(
    'makeApayment', {
      http: {path: '/makeApayment', verb: 'post'},
      accepts: [{arg: 'data', type: 'object', description: '{"token": "tok_visa","amount": 123,"currency":"USD","productCodes":[{"productCode":"ABC"}, {"productCode":"DEF"}],"tourCodes":[{"tourCode":"23h"},{"tourCode":"24h"}], "primaryTraveler":"abc @gmail.com"}', http: {source: 'body'}}],
      returns: {arg: 'results', type: 'array', root: true},
      description: 'Book a product',
    }
  );

/**
   * API: V2
   * Book a product and put on hold
   */
Product.bookAProductHold = function(data, cb) {
  var request = require('request');
  var options = {
    method:'POST',
    url: viator.url + '/bookings/hold',
    headers: {
      'exp-api-key': viator.api,
      'Accept-Charset': 'utf-8',
      'Content-Type' : 'application/json',
      'Accept-Language' : 'en-US',
      'Accept' : 'application/json;version=2.0',
      'Access-Control-Allow-Origin' : '*'
    },
    body: JSON.stringify(data)
  };

  console.log('Book Hold Params: ', options);

  request(options, function(err, httpResponse, body) {
    if (err) {
      cb(null, err);
    } else {
      var recv =  JSON.parse(body);
      console.log('Load Product: ', recv);
      if (recv != null) {
        cb(null, recv);
      } else {
        cb(null, recv)
      } 
    }
  });
};

Product.remoteMethod(
  'bookAProductHold', {
    http: {path: '/bookAProductHold', verb: 'post'},
    accepts: [{arg: 'data', type: 'object', description: '{"productCode":"3857NYCNIA","productOptionCode":"NIA","travelDate":"2024-04-01","currency":"AUD","startTime":"06:30","paxMix":[{"ageBand":"ADULT","numberOfTravelers":2}]}', http: {source: 'body'}}],
    returns: {arg: 'results', type: 'array', root: true},
    description: 'Requests the creation of a booking-hold - a guarantee that either the price or availability (or both) of the product will be retained until a booking request is made using the /bookings/book endpoint.',
  }
);

 /**
   * Book a product
   * Book a product after booking hold
   * API: V2 */
 Product.bookAProduct  = function(data, cb) {
  console.log('Book Data: ', data);
  var dataInfo = data;

  // not included in Final Booking - internal use
  var request = require('request');
  var stripeToken =  data["stripeToken"];
  var homeCity = data["bookerhomeCity"];
  // var bookerId = data["bookerId"];
  var bookingSource = data["bookingSource"];
  
  delete data["bookerId"];
  delete data["stripeToken"];
  delete data["bookerhomeCity"];
  delete data["bookingSource"];

  data["productOptionCode"] = data["productOptionCode"];
  data["bookingRef"] = data["bookingRef"];
  data["bookingQuestionAnswers"] = data["bookingQuestionAnswers"];

  var prices = []
  console.log('Check Data: ', data);
  const options = {
    url: viator.url + '/bookings/book',
    method:'POST',
    headers: {
      'exp-api-key': viator.api,
      'Accept-Charset': 'utf-8',
      'Content-Type' : 'application/json',
      'Accept-Language' : 'en-US',
      'Accept' : 'application/json;version=2.0',
      'Access-Control-Allow-Origin' : '*'
    },
    body: JSON.stringify(data),
  };
  request(options, function(err, httpResponse, body) {
    if (err) {
      cb(null, err);
    } else {
      console.log('Booking Res: ', body);
     console.log('Parse Body: ', JSON.parse(body));
      var rev = JSON.parse(body);
      var booking = JSON.parse(httpResponse.request.body);
      // this is false
      if (rev.status !== 'CONFIRMED') {
        cb(null, rev)
      } else {
        var promises = [];
        //save to db here
        var app = Product.app;
        var heroBooking = app.models.HeroBooking;
        var heroBookingBooker = app.models.HeroBookingBooker;
        var heroBookingDetail = app.models.HeroBookingDetail;
        var heroBookingTraveller = app.models.HeroBookingTraveller;
        var heroBookingQuestion = app.models.HeroBookingQuestion;
        var promises = [];

        console.log('Rev: ', rev);
        console.log('Data Info: ,', dataInfo);
                
        var addField = function(revDetail, bookingDetail){
          console.log('Rev Detail: ', revDetail);
          return new Promise(function(resolve){
            var name = dataInfo["bookerInfo"]["firstName"] + " " + dataInfo["bookerInfo"]["lastName"]
            heroBooking.create({
              "itineraryId": dataInfo["bookingRef"],
              "email": dataInfo["communication"]["email"],
              "phone": dataInfo["communication"]["phone"],
              "productCode": dataInfo["productCode"], 
              "travelDate": dataInfo["travelDate"], 
              "stripeCode": stripeToken, 
              "retailPrice": revDetail["totalPrice"]["price"]["recommendedRetailPrice"], 
              "merchantPrice": revDetail["totalPrice"]["price"]["partnerTotalPrice"], 
              "tourGradeCode": dataInfo["productOptionCode"], 
              "name": name, 
              "productTitle": dataInfo["title"], 
              "distributorItemRef": dataInfo["partnerBookingRef"], 
              "homeCity": homeCity, 
              "bookerId": 0, 
              "bookingSource": bookingSource, 
              "voucherKey": revDetail["voucherInfo"]["url"], 
              "chargedPrice": revDetail["totalPrice"]["price"]["recommendedRetailPrice"], 
              "currency": revDetail["currency"]
            }, function(err, object) {
              if (err) {
                cb(null, err)
              } else {
                 // Sent confirm email 
                var link = revDetail["voucherURL"] 
                var html1 = '<div style="background-color:#e0dbd5"><div style="text-align:center;background-color:#e0dbd5;padding:1em 0"><table width="600" cellspacing="0" cellpadding="0" border="0" align="center"><tbody><tr><td style="background-color:#00759a; padding: 1rem"><img src="http://www.heroexplorer.com/assets/images/home-logo.png" width="200" alt="Verify HeroExplorer Account" class="CToWUd"></td></tr><tr><td style="padding:15px 25px;font-family:"Arial","Helvetica","Verdana",sans-serif;font-size:12px;line-height:1.5;text-align:left;background-color:#fff;color:#333"><h1 style="font-size:16px;margin:0 0 1em;padding:0;font-weight:normal">Thanks for booking on HeroExplorer!</h1><p style="margin:0 0 1em">Your reservation is confirmed. Please note this email is not your voucher. Click the following link to access your voucher, which contains important details about your activity <a href="'
                var html2 = '" style="color:#00759a" >Click here</a>.</p><p style="margin:0 0 1em">If you have questions or changes about your tour, please go to <a href="https://www.heroexplorer.com/login" title="Manage booking" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://www.heroexplorer.com/verify&amp;source=gmail&amp;ust=1530160455085000&amp;usg=AFQjCNGtGZSLyJ2ouiVHLKxnfkwzh2AlAQ">Manage bookings</a>. Please note that you have to register or login with the same email which you used to make a booking <br><strong>'
                var html3 = '</strong></p><p style="margin:0 0 1em"> <strong>Not you?</strong><br>If you did not recently update your email address on HeroExplorer.com, please let us know by forwarding this email to <a href="mailto:hello@heroexplorer.com" style="color:#00759a" target="_blank">hello@heroexplorer.com</a>.</p></td></tr><tr><td style="background-color:#e0dbd5;color:#777;text-align:center;font-size:11px;font-family:"Arial","Helvetica","Verdana",sans-serif;line-height:1.5"><p style="margin:0;padding:8px 0"><a href="https://support.heroexplorer.com/about/" title="About Us" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/about&amp;source=gmail&amp;ust=1530160455085000&amp;usg=AFQjCNHBM9HymdfrXD8FJ2Ub_gyna0jCIg">About Us</a> | <a href="https://support.heroexplorer.com/support/" title="Customer Care" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/support&amp;source=gmail&amp;ust=1530160455086000&amp;usg=AFQjCNEZWeXxdBpcn05amKhfSgEIt7KlMw">Customer Care</a> | <a href="https://support.heroexplorer.com/privacy-policy/" title="Privacy Policy" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/privacy-policy&amp;source=gmail&amp;ust=1530160455086000&amp;usg=AFQjCNHPwu1A4FomjYU2DPQmpSPoo1oQYw">Privacy Policy</a><br></p> </td></tr> </tbody></table><div class="yj6qo"></div><div class="adL"></div></div><div class="adL"></div></div>'
                var mailOptions = {
                  from: 'hello@heroexplorer.com', // sender address
                  to: dataInfo["communication"]["email"], // receiver
                  subject: 'Thanks for booking on HeroExplorer!', // Subject 
                  html: html1 + link + html2 + html3
                };
                transporter.sendMail(mailOptions, function(error, info){
                  if(error){
                    console.log(error);
                  }else{
                    next();
                  };
                }); 
                // Resove
                resolve();
              }
            })

            // heroBookingDetail.create({
            //   // "itemId": revDetail["itemId"],
            //   // "itineraryId": revDetail["itineraryId"],
            //   "distributorItemRef": revDetail["distributorItemRef"],
            //   "hotelId": bookingDetail["hotelId"],
            //   "pickupPoint": bookingDetail["pickupPoint"],
            //   "productCode": bookingDetail["productCode"],
            //   "tourGradeCode": bookingDetail["tourGradeCode"],
            //   "languageOptionCode": bookingDetail["languageOptionCode"],
            //   "specialRequirements": bookingDetail["specialRequirements"]
            // });

            // for(var i = 0; i < bookingDetail["travellers"].length; i++){
            //   heroBookingTraveller.create({
            //     "itemId": revDetail["itemId"],
            //     "title": bookingDetail["travellers"][i]["title"],
            //     "firstName": bookingDetail["travellers"][i]["firstname"],
            //     "surName": bookingDetail["travellers"][i]["surname"]
            //   });
            // }

            // for(var i = 0; i < bookingDetail["bookingQuestionAnswers"].length; i++){
            //   heroBookingQuestion.create({
            //     "itemId": revDetail["itemId"],
            //     "questionId": bookingDetail["bookingQuestionAnswers"][i]["questionId"],
            //     "answer": bookingDetail["bookingQuestionAnswers"][i]["answer"]
            //   });
            // }
          });
      }

      // heroBookingBooker.create({
      //   // "itineraryId": rev["data"]["itineraryId"], 
      //   // "title": booking['booker']['title'],
      //   "firstName": booking['booker']['firstname'],
      //   "surName": booking['booker']['surname'],
      //   "email": booking['booker']['email'],
      //   "phone": booking['booker']['homePhone'],
      //   "homeCity": homeCity
      // });
      
      // for(var i = 0; i < rev["data"]["itemSummaries"].length; i++){ 
      //   var revDetail = rev["data"]["itemSummaries"][i];
      //   var bookingDetail = booking['items'][i];
      //   if (prices.length > i) {
      //     revDetail['chargedPrice'] = prices[i];
      //   }
      var revDetail = rev;
      var bookingDetail = dataInfo;
      promises.push(addField(revDetail, bookingDetail)); 
      // }

      Promise.all(promises).then(function(){
        cb(null, rev)
       });
      }
      // Update user information
      // heroBooking.app.models.HeroUser.findOne({"where":{"email": dataInfo["additionalBookingDetails"]["voucherDetails"]["email"]}}, function(err, object) {
      //   if (object) {
      //     object.updateAttributes({"firstname": data["booker"]["firstname"], "lastname": data["booker"]["surname"],  "city": homeCity, "mobile": data["booker"]["homePhone"]},  function(err, bndrUser) {
      //     })
      //   }
      // });
    }
  });
}

Product.remoteMethod(
  'bookAProduct', {
    http: {path: '/bookAProduct', verb: 'post'},
    accepts: [{arg: 'data', type: 'object', description: 'json book a product', http: {source: 'body'}}],
    returns: {arg: 'results', type: 'array', root: true},
    description: 'Requests a booking for a product.'
  }
);


  /**
   * Book a product
   */
//   Product.bookAProduct  = function(data, cb) {
//     // var url = 'http://prelive.viatorapi.sandbox.viator.com/service/booking/book?apiKey=552392240092477167';
//     var request = require('request');
//     var stripeToken =  data["stripeToken"];
//     var homeCity = data["booker"]["homeCity"]
//     var bookerId = data["bookerId"]
//     var bookingSource = data["bookingSource"]
    
//     delete data["bookerId"];
//     delete data["stripeToken"];
//     delete data["booker"]["homeCity"]
//     delete data["bookingSource"]
//     var prices = []
//     for (var i = 0; i < data["items"].length; i++) {
//       prices.push( data["items"][i]["price"])
//       delete data["items"][i]["price"]
//     }
//     const options = {
//       url: viator.url + '/service/booking/book',
//       method:'POST',
//       headers: {
//         'exp-api-key': viator.api,
//         'Content-Type': 'application/json',
//         'Accept-Charset': 'utf-8',
//         'Access-Control-Allow-Origin' : '*'
//       },
//       body: JSON.stringify(data),
//     };
//     request(options, function(err, httpResponse, body) {
//       if (err) {
//         cb(null, err);
//       } else {
//        console.log('Parse Body: ', JSON.parse(body));
//         var rev = JSON.parse(body);
//         var booking = JSON.parse(httpResponse.request.body);
//         if (rev["data"] == null) {
//           cb(null, rev)
//         } else {
//           var promises = [];
//           //save to db here
//           var app = Product.app;
//           var heroBooking = app.models.HeroBooking;
//           var heroBookingBooker = app.models.HeroBookingBooker;
//           var heroBookingDetail = app.models.HeroBookingDetail;
//           var heroBookingTraveller = app.models.HeroBookingTraveller;
//           var heroBookingQuestion = app.models.HeroBookingQuestion;
//           var promises = [];
          
//           var addField = function(revDetail, bookingDetail){
//             console.log('Rev Detail: ', revDetail);
//             return new Promise(function(resolve){
//               var name = revDetail["leadTravellerFirstname"] + " " + revDetail["leadTravellerSurname"]
//               heroBooking.create({
//                 "email": rev["data"]["bookerEmail"], 
//                 "itineraryId": revDetail["itineraryId"], 
//                 "productCode": revDetail["productCode"], 
//                 "travelDate": revDetail["travelDate"], 
//                 "stripeCode": stripeToken, 
//                 "bookerId": bookerId, 
//                 "retailPrice": revDetail["price"], 
//                 "merchantPrice": revDetail["merchantNetPrice"], 
//                 "tourGradeCode": revDetail["tourGradeCode"], 
//                 "name": name , 
//                 "productTitle": revDetail["productTitle"], 
//                 "distributorItemRef": revDetail["distributorItemRef"], 
//                 "homeCity":homeCity, 
//                 "bookerId": bookerId, 
//                 "bookingSource": bookingSource, 
//                 "voucherKey": revDetail["voucherKey"], 
//                 "chargedPrice": revDetail["chargedPrice"], 
//                 "currency": data["currencyCode"]
//               }, function(err, object) {
//                 if (err) {
//                   cb(null, err)
//                 } else {
//                    // Sent confirm email 
//                   var link = revDetail["voucherURL"] 
//                   var html1 = '<div style="background-color:#e0dbd5"><div style="text-align:center;background-color:#e0dbd5;padding:1em 0"><table width="600" cellspacing="0" cellpadding="0" border="0" align="center"><tbody><tr><td style="background-color:#00759a; padding: 1rem"><img src="http://www.heroexplorer.com/assets/images/home-logo.png" width="200" alt="Verify HeroExplorer Account" class="CToWUd"></td></tr><tr><td style="padding:15px 25px;font-family:"Arial","Helvetica","Verdana",sans-serif;font-size:12px;line-height:1.5;text-align:left;background-color:#fff;color:#333"><h1 style="font-size:16px;margin:0 0 1em;padding:0;font-weight:normal">Thanks for booking on HeroExplorer!</h1><p style="margin:0 0 1em">Your reservation is confirmed. Please note this email is not your voucher. Click the following link to access your voucher, which contains important details about your activity <a href="'
//                   var html2 = '" style="color:#00759a" >Click here</a>.</p><p style="margin:0 0 1em">If you have questions or changes about your tour, please go to <a href="https://www.heroexplorer.com/login" title="Manage booking" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://www.heroexplorer.com/verify&amp;source=gmail&amp;ust=1530160455085000&amp;usg=AFQjCNGtGZSLyJ2ouiVHLKxnfkwzh2AlAQ">Manage bookings</a>. Please note that you have to register or login with the same email which you used to make a booking <br><strong>'
//                   var html3 = '</strong></p><p style="margin:0 0 1em"> <strong>Not you?</strong><br>If you did not recently update your email address on HeroExplorer.com, please let us know by forwarding this email to <a href="mailto:hello@heroexplorer.com" style="color:#00759a" target="_blank">hello@heroexplorer.com</a>.</p></td></tr><tr><td style="background-color:#e0dbd5;color:#777;text-align:center;font-size:11px;font-family:"Arial","Helvetica","Verdana",sans-serif;line-height:1.5"><p style="margin:0;padding:8px 0"><a href="https://support.heroexplorer.com/about/" title="About Us" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/about&amp;source=gmail&amp;ust=1530160455085000&amp;usg=AFQjCNHBM9HymdfrXD8FJ2Ub_gyna0jCIg">About Us</a> | <a href="https://support.heroexplorer.com/support/" title="Customer Care" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/support&amp;source=gmail&amp;ust=1530160455086000&amp;usg=AFQjCNEZWeXxdBpcn05amKhfSgEIt7KlMw">Customer Care</a> | <a href="https://support.heroexplorer.com/privacy-policy/" title="Privacy Policy" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/privacy-policy&amp;source=gmail&amp;ust=1530160455086000&amp;usg=AFQjCNHPwu1A4FomjYU2DPQmpSPoo1oQYw">Privacy Policy</a><br></p> </td></tr> </tbody></table><div class="yj6qo"></div><div class="adL"></div></div><div class="adL"></div></div>'
//                   var mailOptions = {
//                     from: 'hello@heroexplorer.com', // sender address
//                     to: rev["data"]["bookerEmail"], // receiver
//                     subject: 'Thanks for booking on HeroExplorer!', // Subject 
//                     html: html1 + link + html2 + html3
//                   };
//                   transporter.sendMail(mailOptions, function(error, info){
//                     if(error){
//                       console.log(error);
//                     }else{
//                       next();
//                     };
//                   }); 
//                   // Resove
//                   resolve();
//                 }
//               })

//               heroBookingDetail.create({
//                 "itemId": revDetail["itemId"],
//                 "itineraryId": revDetail["itineraryId"],
//                 "distributorItemRef": revDetail["distributorItemRef"],
//                 "hotelId": bookingDetail["hotelId"],
//                 "pickupPoint": bookingDetail["pickupPoint"],
//                 "productCode": bookingDetail["productCode"],
//                 "tourGradeCode": bookingDetail["tourGradeCode"],
//                 "languageOptionCode": bookingDetail["languageOptionCode"],
//                 "specialRequirements": bookingDetail["specialRequirements"]
//               });

//               for(var i = 0; i < bookingDetail["travellers"].length; i++){
//                 heroBookingTraveller.create({
//                   "itemId": revDetail["itemId"],
//                   "title": bookingDetail["travellers"][i]["title"],
//                   "firstName": bookingDetail["travellers"][i]["firstname"],
//                   "surName": bookingDetail["travellers"][i]["surname"]
//                 });
//               }

//               for(var i = 0; i < bookingDetail["bookingQuestionAnswers"].length; i++){
//                 heroBookingQuestion.create({
//                   "itemId": revDetail["itemId"],
//                   "questionId": bookingDetail["bookingQuestionAnswers"][i]["questionId"],
//                   "answer": bookingDetail["bookingQuestionAnswers"][i]["answer"]
//                 });
//               }
//             });
//         }

//         console.log(rev["data"]["itineraryId"]);

//         heroBookingBooker.create({
//           "itineraryId": rev["data"]["itineraryId"], 
//           "title": booking['booker']['title'],
//           "firstName": booking['booker']['firstname'],
//           "surName": booking['booker']['surname'],
//           "email": booking['booker']['email'],
//           "phone": booking['booker']['homePhone'],
//           "homeCity": homeCity
//         });
        
//         for(var i = 0; i < rev["data"]["itemSummaries"].length; i++){ 
//           var revDetail = rev["data"]["itemSummaries"][i];
//           var bookingDetail = booking['items'][i];
//           if (prices.length > i) {
//             revDetail['chargedPrice'] = prices[i];
//           }
//           promises.push(addField(revDetail, bookingDetail)); 
//         }

//         Promise.all(promises).then(function(){
//           cb(null, rev)
//          });
//         }
//         // Update user information
//         heroBooking.app.models.HeroUser.findOne({"where":{"email": data["booker"]["email"]}}, function(err, object) {
//           if (object) {
//             object.updateAttributes({"firstname": data["booker"]["firstname"], "lastname": data["booker"]["surname"],  "city": homeCity, "mobile": data["booker"]["homePhone"]},  function(err, bndrUser) {
//             })
//           }
//         });
//       }
//     });
// }

  // Product.remoteMethod(
  //   'bookAProduct', {
  //     http: {path: '/bookAProduct', verb: 'post'},
  //     accepts: [{arg: 'data', type: 'object', description: 'json book a product', http: {source: 'body'}}],
  //     returns: {arg: 'results', type: 'array', root: true},
  //     description: 'Book a product',
  //   }
  // );
  }
