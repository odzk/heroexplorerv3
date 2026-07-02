'use strict';
module.exports = function(Destination) {
var viator = require('../../../server/constants');
  
/**
   * Hidden un-used api
   */

  Destination.disableRemoteMethodByName('create', true);
  Destination.disableRemoteMethodByName('upsert', true);
  Destination.disableRemoteMethodByName('deleteById', true);
  Destination.disableRemoteMethodByName('updateAll', true);
  Destination.disableRemoteMethodByName('replaceOrCreate', true);
  Destination.disableRemoteMethodByName('findById', true);
  Destination.disableRemoteMethodByName('count', true);
  Destination.disableRemoteMethodByName('createChangeStream', true);
  Destination.disableRemoteMethodByName('patchAttributes', true);
  Destination.disableRemoteMethodByName('replaceById', true);
  Destination.disableRemoteMethodByName('exists', true);
  Destination.disableRemoteMethodByName('upsertWithWhere', true);
  Destination.disableRemoteMethodByName('prototype.patchAttributes', true);
 
  /**
   * New API
   */
  Destination.getAllProducts = function(cb) {
    var url = viator.url + '/service';
    var request = require('request');

    request.get(url, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        console.log(recv);
        cb(null, recv['data']);
      }
    });
  };

  /**
   * Get all destimations - New API
   */
  Destination.getAllDestinations = function(cb) {
    var redis = require('redis')
	, jsonify = require('redis-jsonify')
	, client = jsonify(redis.createClient())
	;
    var request = require('request');
    const options = {
      url: viator.url + '/v1/taxonomy/destinations',
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json;version=2.0',
        'Accept-Charset': 'utf-8',
        'Aceept-Language': 'en-US',
        'Access-Control-Allow-Origin' : '*'
      }
    };
    
    if (client.exists('destination', function(err, reply){ 
      if(reply === 1) {
        client.get('destination', function(err, data){
          cb(null, data['data']);
        })
      } else {
        request(options, function(err, httpResponse, body) {
          if (err) {
            cb(null, err);
          } else {
            var recv =  JSON.parse(body);
            client.set('destination', recv);
            cb(null, recv['data']);
          }
        });
      }
    }));
  }
  

  Destination.remoteMethod(
    'getAllDestinations', {
      http: {path: '/getAllDestinations', verb: 'get'},
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Get all destimations - New API',
    }
  );


  /**
   * Get all desinations and update to DB
   */
  Destination.getAllDestinationsAndUpdate = function(cb) {
    var url = 'http://prelive.viatorapi.sandbox.viator.com/service/taxonomy/destinations?apiKey=552392240092477167';
    var request = require('request');

    request.get(url, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var rec =  JSON.parse(body);
        var recv = rec['data'];
        for(var i=0; i < recv.length - 1; i++) {
           var values = [];
           let json = recv[i];
           values.push([recv[i]["selectable"],recv[i]["destinationUrlName"],recv[i]["defaultCurrencyCode"], recv[i]["lookupId"], recv[i]["parentId"], recv[i]["timeZone"],recv[i]["iataCode"],recv[i]["destinationName"],recv[i]["destinationType"], recv[i]["destinationId"],recv[i]["longitude"], recv[i]["latitude"]]);
       
            //Bulk insert using nested array [ [a,b],[c,d] ] will be flattened to (a,b),(c,d)
            Destination.dataSource.connector.query('INSERT INTO Destination (selectable, destinationUrlName, defaultCurrencyCode,lookupId, parentId, timeZone, iataCode, destinationName, destinationType, destinationId, longitude, latitude) VALUES ?', [values], function(err,result) {
              if(err) {
                 cb(null, err);
              } 
          });
        }
        cb(null, "Success");
      }
    });
  };

  Destination.remoteMethod(
    'getAllDestinationsAndUpdate', {
      http: {path: '/getAllDestinationsAndUpdate', verb: 'get'},
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Get all desinations and update to DB',
    }
  );

  /**
   * Get top destinations (hardcode)
   */
  Destination.getTopDestination = function(cb) {
    var json = [{"sortOrder":2,"selectable":true,"destinationUrlName":"Amsterdam","defaultCurrencyCode":"EUR","lookupId":"6.60.525","parentId":60,"timeZone":"Europe/Amsterdam","iataCode":"AMS","destinationType":"CITY","destinationName":"Amsterdam","destinationId":525,"latitude":52.376856714,"longitude":4.9053955078},{"sortOrder":1,"selectable":true,"destinationUrlName":"Athens","defaultCurrencyCode":"EUR","lookupId":"6.53.496","parentId":53,"timeZone":"Europe/Athens","iataCode":"ATH","destinationType":"CITY","destinationName":"Athens","destinationId":496,"latitude":37.9439267525,"longitude":23.695192337},{"sortOrder":2,"selectable":true,"destinationUrlName":"Australia","defaultCurrencyCode":"AUD","lookupId":"3.22","parentId":3,"timeZone":"Australia/Sydney","iataCode":null,"destinationType":"COUNTRY","destinationName":"Australia","destinationId":22,"latitude":-25.2743980001,"longitude":133.775136},{"sortOrder":3,"selectable":true,"destinationUrlName":"Barcelona","defaultCurrencyCode":"EUR","lookupId":"6.67.25883.562","parentId":25883,"timeZone":"Europe/Madrid","iataCode":"BCN","destinationType":"CITY","destinationName":"Barcelona","destinationId":562,"latitude":41.387917,"longitude":2.1699187},{"sortOrder":3,"selectable":true,"destinationUrlName":"Dubai","defaultCurrencyCode":"USD","lookupId":"1.743.828","parentId":743,"timeZone":"Asia/Dubai","iataCode":"DXB","destinationType":"CITY","destinationName":"Dubai","destinationId":828,"latitude":25.2644444,"longitude":55.3116667},{"sortOrder":6,"selectable":true,"destinationUrlName":"Dublin","defaultCurrencyCode":"EUR","lookupId":"6.56.503","parentId":56,"timeZone":"Europe/Dublin","iataCode":"DUB","destinationType":"CITY","destinationName":"Dublin","destinationId":503,"latitude":53.3481944965,"longitude":-6.2237548828},{"sortOrder":27,"selectable":true,"destinationUrlName":"Florence","defaultCurrencyCode":"EUR","lookupId":"6.57.206.519","parentId":206,"timeZone":"Europe/Rome","iataCode":"FLR","destinationType":"CITY","destinationName":"Florence","destinationId":519,"latitude":43.768582,"longitude":11.255669},{"sortOrder":5,"selectable":true,"destinationUrlName":"Italy","defaultCurrencyCode":"EUR","lookupId":"6.57","parentId":6,"timeZone":"Europe/Rome","iataCode":null,"destinationType":"COUNTRY","destinationName":"Italy","destinationId":57,"latitude":41.87194,"longitude":12.56738},{"sortOrder":120,"selectable":true,"destinationUrlName":"Las-Vegas","defaultCurrencyCode":"USD","lookupId":"8.77.22171.684","parentId":22171,"timeZone":"America/Los_Angeles","iataCode":"LAS","destinationType":"CITY","destinationName":"Las Vegas","destinationId":684,"latitude":36.114646,"longitude":-115.172816},{"sortOrder":24,"selectable":true,"destinationUrlName":"London","defaultCurrencyCode":"GBP","lookupId":"6.731.737","parentId":731,"timeZone":"Europe/London","iataCode":"LON","destinationType":"CITY","destinationName":"London","destinationId":737,"latitude":51.5001524,"longitude":-0.1262362},{"sortOrder":18,"selectable":true,"destinationUrlName":"Madrid","defaultCurrencyCode":"EUR","lookupId":"6.67.566","parentId":67,"timeZone":"Europe/Madrid","iataCode":"MAD","destinationType":"CITY","destinationName":"Madrid","destinationId":566,"latitude":40.4166909,"longitude":-3.7003454},{"sortOrder":47,"selectable":true,"destinationUrlName":"Milan","defaultCurrencyCode":"EUR","lookupId":"6.57.25822.512","parentId":25822,"timeZone":"Europe/Rome","iataCode":"MIL","destinationType":"CITY","destinationName":"Milan","destinationId":512,"latitude":45.4636889,"longitude":9.1881408},{"sortOrder":154,"selectable":true,"destinationUrlName":"New-York-City","defaultCurrencyCode":"USD","lookupId":"8.77.5560.687","parentId":5560,"timeZone":"America/New_York","iataCode":"NYC","destinationType":"CITY","destinationName":"New York City","destinationId":687,"latitude":40.7163629124,"longitude":-74.0132188797},{"sortOrder":157,"selectable":true,"destinationUrlName":"Oahu","defaultCurrencyCode":"USD","lookupId":"8.77.278.672","parentId":278,"timeZone":"Pacific/Honolulu","iataCode":"HNL","destinationType":"CITY","destinationName":"Oahu","destinationId":672,"latitude":21.3923440712,"longitude":-157.9820251465},{"sortOrder":47,"selectable":true,"destinationUrlName":"Paris","defaultCurrencyCode":"EUR","lookupId":"6.51.5636.479","parentId":5636,"timeZone":"Europe/Paris","iataCode":"CDG","destinationType":"CITY","destinationName":"Paris","destinationId":479,"latitude":48.8566667,"longitude":2.3509871},{"sortOrder":67,"selectable":true,"destinationUrlName":"Rome","defaultCurrencyCode":"EUR","lookupId":"6.57.511","parentId":57,"timeZone":"Europe/Rome","iataCode":"ROM","destinationType":"CITY","destinationName":"Rome","destinationId":511,"latitude":41.8954656,"longitude":12.4823243},{"sortOrder":191,"selectable":true,"destinationUrlName":"San-Francisco","defaultCurrencyCode":"USD","lookupId":"8.77.272.651","parentId":272,"timeZone":"America/Los_Angeles","iataCode":"SFO","destinationType":"CITY","destinationName":"San Francisco","destinationId":651,"latitude":37.7947962975,"longitude":-122.4000549316},{"sortOrder":24,"selectable":true,"destinationUrlName":"Tokyo","defaultCurrencyCode":"USD","lookupId":"2.16.23404.334","parentId":23404,"timeZone":"Asia/Tokyo","iataCode":"TYO","destinationType":"CITY","destinationName":"Tokyo","destinationId":334,"latitude":35.6894875,"longitude":139.6917064},{"sortOrder":27,"selectable":true,"destinationUrlName":"Vancouver","defaultCurrencyCode":"CAD","lookupId":"8.75.261.616","parentId":261,"timeZone":"America/Vancouver","iataCode":"YVR","destinationType":"CITY","destinationName":"Vancouver","destinationId":616,"latitude":49.2874029705,"longitude":-123.0845546722},{"sortOrder":227,"selectable":true,"destinationUrlName":"Washington-DC","defaultCurrencyCode":"USD","lookupId":"8.77.657","parentId":77,"timeZone":"America/New_York","iataCode":"WAS","destinationType":"CITY","destinationName":"Washington DC","destinationId":657,"latitude":38.8951118,"longitude":-77.0363658}];
    cb(null, json);
  };

  Destination.remoteMethod(
    'getTopDestination', {
      http: {path: '/getTopDestination', verb: 'get'},
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Get top destinations',
    }
  );

  /**
   * Get all destination base on current code
   */
  Destination.getAllDestinationsBaseOnCurrentCode = function(currentCode, cb) {
    const options = {
      url: viator.url + '/service/taxonomy/destinations',
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Access-Control-Allow-Origin' : '*'
      }
    };
    // var url = 'http://prelive.viatorapi.sandbox.viator.com/service/taxonomy/destinations?apiKey=552392240092477167';
    // //console.log('Url request :', url);
    var request = require('request');

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        var result = [];
        for (var i = 0; i < recv['data'].length ; i++) {
          // //console.log("defaultCurrencyCode ",recv['data'][i]['defaultCurrencyCode'])
           if (recv['data'][i]['defaultCurrencyCode'].indexOf(currentCode) > - 1) {
            result.push(recv['data'][i]);
            }
        }
        cb(null, result);
      }
    });
  };

  Destination.remoteMethod(
    'getAllDestinationsBaseOnCurrentCode', {
      http: {path: '/getAllDestinationsBaseOnCurrentCode', verb: 'get'},
      accepts: [{arg: 'currentCode', type: 'string', require: true, description: 'AUD'}],
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Get all destination base on current code',
    }
  );


  /**
   * Get list cities of australia
   */
  Destination.getListCitiesAustralia = function(cb) {
    var url = 'https://awsapi.heroexplorer.com/api/Destinations';
    // //console.log('Url request :', url);
    var request = require('request');
    
    request.get(url, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var thumbArr = [{"destinationId":358,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/135572_Alice-Springs_AliceSpringsDesertPark_301.jpg","title":"Alice Springs Desert Park"},{"destinationId":376,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/100887_Adelaide_Adelaide%20Botanic%20Gardens_d376-10.JPG","title":"Adelaide Botanic Gardens"},{"destinationId":359,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/100584_Ayers%20Rock_Ayers%20Rock%20(Uluru)_d359-11.jpg","title":"Ayers Rock (Uluru)"},{"destinationId":25941,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/286917_Viator_TripAdvisor_UGC_168418.jpg","title":"Ballarat Wildlife Park"},{"destinationId":5623,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/178933_Viator_TripAdvisor_UGC_141574.jpg","title":"Barossa Chateau"},{"destinationId":5402,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/146238_AustraliaNewSouthWalesBlueMountains_WaterfallValleyNationalParkForest_thinkstock_178373096.jpg","title":"Blue Mountains National Park"},{"destinationId":363,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/286958_Viator_TripAdvisor_UGC_168126.jpg","title":"Anzac Square"},{"destinationId":754,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/144491_Cairns_AthertonTablelands_11820.jpg","title":"Atherton Tablelands"},{"destinationId":23522,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/272828_Viator_Thinkstock_149724.jpg","title":"Busselton Jetty"},{"destinationId":5259,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/141347_Byron%20Bay_BelongilBeach_11238.jpg","title":"Belongil Beach"},{"destinationId":789,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/44337_Broome_Beagle%20Bay_d789-10.jpg","title":"Beagle Bay"},{"destinationId":360,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/160314_Viator_Shutterstock_120746.jpg","title":"Adelaide River"},{"destinationId":4752,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/286996_Viator_TripAdvisor_UGC_168415.jpg","title":"Turquoise Bay"},{"destinationId":22027,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/301498_Viator_Alamy_170249.jpg","title":"Fremantle Arts Centre"},{"destinationId":367,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/272768_Viator_TripAdvisor_UGC_165885.jpg","title":"Best Of All Lookout"},{"destinationId":379,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/148581_AustraliaTasmaniaHobart_BatteryPointFogRainbowNeighborhood_thinkstock_135486514.jpg","title":"Battery Point"},{"destinationId":4863,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/131171_Kangaroo%20Island_Admirals%20Arch_thinkstock_117490634.jpg","title":"Admirals Arch"},{"destinationId":939,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/166925_shutterstock_154307171.jpg","title":"Bay of Fires"},{"destinationId":24851,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/285546_Viator_Alamy_168417.jpg","title":"Mammoth Cave"},{"destinationId":384,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/176149_filename-120405-aamipark.jpg","title":"AAMI Park"},{"destinationId":22999,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/270256_Viator_TripAdvisor_UGC_166533.jpg","title":"Enchanted Adventure Garden"},{"destinationId":374,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/114584_australia-zoo-photo_988938-770tall.jpg","title":"Australia Zoo"},{"destinationId":754,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/100575_Cairns_Cairns%20Tribulation_d754-34.JPG","title":"Cape Tribulation"},{"destinationId":389,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/135379_Perth_AQWAAquariumofWesternAustralia_407.jpg","title":"AQWA - Aquarium of Western Australia"},{"destinationId":125,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/166765_Viator_Thinkstock_19026.jpg","title":"A Maze'N Things"},{"destinationId":787,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/168567_Viator_Thinkstock_125385.jpg","title":"Agincourt Reef"},{"destinationId":22738,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/180180_Viator_TripAdvisor_UGC_142170.jpg","title":"Infinity"},{"destinationId":357,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/165738_Viator_User_Generated_51209.jpg","title":"360 Bar and Dining at Sydney Tower"},{"destinationId":753,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/46007_Whitsundays_Airlie%20Beach_d753-10.JPG","title":"Airlie Beach"},{"destinationId":22734,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/269724_Viator_TripAdvisor_UGC_166536.jpg","title":"Dominique Portet Winery"},{"destinationId":4739,"thumbnailHiResURL":"http://cache-graphicslib.viator.com/graphicslib/page-images/742x525/206662_Viator_TripAdvisor_UGC_150364.jpg","title":"Army Museum of North Queensland"}]
        var recv =  JSON.parse(body);
        var arrayParent = [120, 121, 122, 123, 124, 125, 126, 819];
        var result = [];
        for (var i = 0; i < recv.length ; i++) {
           if (!(arrayParent.indexOf(recv[i]['parentId']) === -1)) {
              for (var j = 0; j < thumbArr.length; j++) {
                if (thumbArr[j]["destinationId"] == recv[i]["destinationId"]) {
                  recv[i]["thumbnailUrl"] = thumbArr[j]["thumbnailHiResURL"];
                  break;
                }
              }
                result.push(recv[i]);
            }
        }

        cb(null, result);
      }
    });
  };

  Destination.remoteMethod(
    'getListCitiesAustralia', {
      http: {path: '/getListCitiesAustralia', verb: 'get'},
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Get list cities of australia',
    }
  );

  /**
   * Get list fathers of destination
   */
  Destination.getListFatherOfADestination = function(destId, cb) {
    const options = {
      url: viator.url + '/service/taxonomy/destinations',
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Access-Control-Allow-Origin' : '*'
      }
    };
   // var url = 'http://prelive.viatorapi.sandbox.viator.com/service/taxonomy/destinations?apiKey=552392240092477167';
   // //console.log('Url request :', url);
    var request = require('request');

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        var list = []
        for (var i = 0; i < recv['data'].length ; i++) {
          if (recv['data'][i]['destinationId'] == destId) {
            var destination = recv['data'][i]
            list.push(recv['data'][i]);
            if (recv['data'][i]['parentId']) {
              if (destination['parentId'] != destination['destinationId']) {
                for (var j = 0; j < recv['data'].length ; j++) {
                  if (recv['data'][j]['destinationId'] == destination['parentId']) {
                    var destination1 = recv['data'][j]
                    list.push(recv['data'][j]);
                    if (destination1['parentId']) {
                      if (destination1['parentId'] != destination1['destinationId']) {
                        for (var k = 0; k < recv['data'].length ; k++) {
                          if (recv['data'][k]['destinationId'] == destination1['parentId']) {
                            list.push(recv['data'][k]);
                            break;
                          }
                        }
                      }
                    } 
                    break;
                  }
                }
                
              }
            }
            break;
          }
        }
        cb(null, list);
      }
    });
  };

  Destination.remoteMethod(
    'getListFatherOfADestination', {
      http: {path: '/getListFatherOfADestination', verb: 'get'},
      accepts: [{arg: 'destId', type: 'string', require: true, description: '376'}],
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Get list fathers of destination',
    }
  );

  /**
   * Get list father of a destination and catId subId
   */

 
//API V2
  Destination.getListFatherOfADestinationAndSubCatInfo = function(destId,catId, subId, cb) {
    const options = {
    /*   url:viator.url + '/service/taxonomy/destinations', */
      url:viator.url + '/v1/taxonomy/destinations',
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Language': 'en-US',
        'Access-Control-Allow-Origin' : '*'
      }
    };
    //var url = 'http://prelive.viatorapi.sandbox.viator.com/service/taxonomy/destinations?apiKey=552392240092477167';
    // //console.log('Url request :', url);
    var request = require('request');

    request(options, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        var list = [];      
        console.log(recv);
        for (var i = 0; i < recv['data'].length ; i++) {
          if (recv['data'][i]['destinationId'] == destId) {
            var destination = recv['data'][i]
            list.push(recv['data'][i]);
            if (recv['data'][i]['parentId']) {
              if (destination['parentId'] != destination['destinationId']) {
                for (var j = 0; j < recv['data'].length ; j++) {
                  if (recv['data'][j]['destinationId'] == destination['parentId']) {
                    var destination1 = recv['data'][j]
                    list.push(recv['data'][j]);
                    if (destination1['parentId']) {
                      if (destination1['parentId'] != destination1['destinationId']) {
                        for (var k = 0; k < recv['data'].length ; k++) {
                          if (recv['data'][k]['destinationId'] == destination1['parentId']) {
                            list.push(recv['data'][k]);
                            break;
                          }
                        }
                      }
                    } 
                    break;
                  }
                }
                
              }
            }
            break;
          }
        }

        var list = list.reverse();

        if (catId != 0) {
            // Get all categories of a destination
          const options = {
            url:'https://viatorapi.sandbox.viator.com/service/taxonomy/destinations' + '&destId=' + destId,
            method:'GET',
            headers: {
              'exp-api-key':'8fed96d3-2cb6-49aa-b232-4816b01debe7',
              'Accept': 'application/json',
              'Accept-Charset': 'utf-8',
              'Access-Control-Allow-Origin' : '*'
            }
          };
          //var url1 = 'http://prelive.viatorapi.sandbox.viator.com/service/taxonomy/categories?apiKey=552392240092477167';
          //url1 = url1 + '&destId=' + destId;
          // //console.log('Url request :', url1);
          var request1 = require('request');
          
          request1(options, function(err1, httpResponse1, body1) {
            if (err1) {
              //console.log(err1, null)
            } else {
              var recv1 =  JSON.parse(body1);
              var data1 = recv1["data"]
              for (var k = 0; k < data1.length ; k++) {
                var catT = data1[k];
                if (catT["id"] == catId) {
                  list.push(catT);
                  var subTArray = data1[k]["subcategories"];
                  for (var l = 0; l < subTArray.length; l++) {
                    var subT = subTArray[l];
                    if (subT["subcategoryId"] == subId) {
                      list.push(subT);
                      break;
                    }
                  }
                  break;
                }
              }
            } 
            cb(null, list);
          });
        } else {
          cb(null, list);
        }  
      }
    });
  };

  Destination.remoteMethod(
    'getListFatherOfADestinationAndSubCatInfo', {
      http: {path: '/getListFatherOfADestinationAndSubCatInfo', verb: 'get'},
      accepts: [{arg: 'destId', type: 'string', require: true, description: '376'}, {arg: 'catId', type: 'string', require: true, description: '376'}, {arg: 'subId', type: 'string', require: true, description: '376'}],
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Get list father of a destination and catId subId',
    }
  );

  /**
   * Get all destinations JSONP Version 1
   */
  Destination.getAllDestinationsJsonP = function(cb) {
    var url = 'http://prelive.viatorapi.sandbox.viator.com/service/taxonomy/destinations?apiKey=552392240092477167';
    // //console.log('Url request :', url);
    var request = require('request');

    request.get(url, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null,  JSON.stringify(recv['data']));
      }
    });
  };

  Destination.remoteMethod(
    'getAllDestinationsJsonP', {
      http: {path: '/getAllDestinationsJsonP', verb: 'get'},
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Get all destinations JSON P',
    }
  );

  /**
   * Get all destinations JSONP version2
   */
  Destination.getAllDestinationsJsonP1 = function(cb) {
    var nodeJsonp = require("node-jsonp")
    var nodeJsonp = require("node-jsonp")
    nodeJsonp('http://localhost:3000/api/Destinations/getAllDestinations',function(json){
      //console.log(json)
      cb(null, json);
    })
  };

  Destination.remoteMethod(
    'getAllDestinationsJsonP1', {
      http: {path: '/getAllDestinationsJsonP1', verb: 'get'},
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Get all destinations JSONP version2',
    }
  );

  /**
   * Get destination near you by city and region
   */
  Destination.getDestinationNearYouByCityAndRegion = function(data, cb) {
    var city = data["city"];
    var region = data["region"];
    // //console.log("region is", region)
    var destinationIdDefault = 22;
    var url = 'https://prodapi.heroexplorer.com/api/Destinations';
    // //console.log('Url request :', url);
    var request = require('request');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" 

    request.get(url, function(err, httpResponse, body) {
      if (err) {
        cb(err, null);
      } else {
        var recv =  JSON.parse(body);
        if (city != null | region != null) {
          for (var i = 0; i < recv.length ; i++) {
            if (city != null & recv[i]["destinationName"] != null) {
              if (recv[i]["destinationName"] == city | recv[i]["destinationName"].indexOf(city) > -1 | city.indexOf(recv[i]["destinationName"]) > -1 ){
                destinationIdDefault = recv[i]["destinationId"];
                break;
              }
            }
            if (region != null & recv[i]["destinationName"] != null) {
              if (recv[i]["destinationName"] == region | recv[i]["destinationName"].indexOf(region) > -1 | region.indexOf(recv[i]["destinationName"]) > -1 ){
                destinationIdDefault = recv[i]["destinationId"];
                break;
              }
            }
            
         }
        }
        cb(null, destinationIdDefault);
      }
    });
  };

  Destination.remoteMethod(
    'getDestinationNearYouByCityAndRegion', {
      http: {path: '/getDestinationNearYouByCityAndRegion', verb: 'post'},
      accepts: [{arg: 'data', type: 'object', description: '{"city":"Sydney", "region":"New South Wales"}', http: {source: 'body'}}],
      returns: {arg: 'results', type: 'Destination', root: true},
      description: 'Get destination near you by input City or Region',
    }
  );

  /**
   * Get top destinations
   */
  Destination.getTopDestinations = function(cb) {
    Destination.dataSource.connector.query('SELECT * FROM Destination WHERE isTop = true;', function(err,result) {
      if(err) {
        cb(null, err);
      } else {
        cb(null, result)
      }
  });
  };

  Destination.remoteMethod(
    'getTopDestinations', {
      http: {path: '/getTopDestinations', verb: 'get'},
      returns: {arg: 'results', type: '[Destination]', root: true},
      description: 'Retrieve all top destination',
    }
  );

  /**
   * Pre search text destination & product for search field
   */
  Destination.preSearchTextDestinationAndProduct = function(text, cb) {
    var destAndProResult = {};
    var selectQuery = 'SELECT * FROM Destination WHERE destinationName LIKE "%' + text + '%"';
    Destination.dataSource.connector.query(selectQuery , function(err,result) {
      if(err) {
        cb(null, err);
      } else {
        destAndProResult['destination'] = result
        var url = viator.url + '/service/search/freetext';
        var data = {"topX":"1-5", "destId":0, "currencyCode":"AUD", "searchTypes":["PRODUCT"]}
        data.text = text;
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
            console.log('search data: ', recv);
            destAndProResult['product'] = recv['data'];
            cb(null, destAndProResult);
          }
        });
      }
    });
  };

  Destination.remoteMethod(
    'preSearchTextDestinationAndProduct', {
      http: {path: '/preSearchTextDestinationAndProduct', verb: 'get'},
      accepts: [{arg: 'text', type: 'string', require: true, description: 'abc'}],
      returns: {arg: 'results', type: ['Destination','Product'], root: true},
      description: 'Pre search text destination & product for search field',
    }
  );

  /**
   * Get list region of a destination
   */
  const request = require('request');
  Destination.getListRegionOfADestination = function(text, cb) {
      var jsonRequest = {"topX": "1-100", "destId": text, "sortOrder": "RECOMMENDED"};
      console.log('Json request:', jsonRequest);
  
      var options = {
          method: 'POST',
          url: viator.url + '/v1/taxonomy/attractions',
          headers: {
              'exp-api-key': viator.api,
              'Content-Type': 'application/json',
              'Accept-Language': 'en-US',
              'Access-Control-Allow-Origin' : '*'
          },
          body: JSON.stringify(jsonRequest),
      };
  
      console.log('Request options: ', options);
  
      request(options, function(err, httpResponse, body) {
          if (err) {
              cb(null, err);
          } else {
              try {
                  var recv = JSON.parse(body);
                  console.log('Received Data: ', recv);
                  cb(null, recv['data']);
              } catch (parseError) {
                  cb(null, parseError);
              }
          }
      });
  };
  
  Destination.remoteMethod(
    'getListRegionOfADestination', {
      http: {path: '/getListRegionOfADestination', verb: 'get'},
      accepts: [{arg: 'text', type: 'string', require: true, description: 'abc'}],
      returns: {arg: 'results', type: ['Destination'], root: true},
      description: 'New API - list search',
    }); 
  }
