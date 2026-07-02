'use strict';

module.exports = function(Userreview) {
 /**
   * Hidden un-used api
   */
  Userreview.disableRemoteMethodByName('create', true);
  Userreview.disableRemoteMethodByName('upsert', true);
  Userreview.disableRemoteMethodByName('deleteById', true);
  Userreview.disableRemoteMethodByName('updateAll', true);
  Userreview.disableRemoteMethodByName('replaceOrCreate', true);
  Userreview.disableRemoteMethodByName('findById', true);
  Userreview.disableRemoteMethodByName('find', true);
  Userreview.disableRemoteMethodByName('findOne', true);
  Userreview.disableRemoteMethodByName('count', true);
  Userreview.disableRemoteMethodByName('createChangeStream', true);
  Userreview.disableRemoteMethodByName('patchAttributes', true);
  Userreview.disableRemoteMethodByName('replaceById', true);
  Userreview.disableRemoteMethodByName('exists', true);
  Userreview.disableRemoteMethodByName('upsertWithWhere', true);
  Userreview.disableRemoteMethodByName('prototype.patchAttributes', true);
 /**
   * Get User Reviews for a product, or destination
   * destId=357&topX=1-15
   */
  Userreview.getUserReviewOfAProductOrDestination = function(destId, topX, sortOrder, cb) {
    var url = 'http://prelive.viatorapi.sandbox.viator.com/service/content/user/reviews?apiKey=552392240092477167';
    var urlRequest = url + '&destId=' + destId + '&topX=' + topX;
    if (sortOrder) {
      urlRequest = urlRequest +  '&sortOrder=' + sortOrder;
    }

    //console.log('Url request :', urlRequest);
    var request = require('request');

    request.get(urlRequest, function(err, httpResponse, body) {
      if (err) {
        cb(null, err);
      } else {
        var recv =  JSON.parse(body);
        cb(null, recv['data']);
      }
    });
  };

  Userreview.remoteMethod(
    'getUserReviewOfAProductOrDestination', {
      http: {path: '/getUserReviewOfAProductOrDestination', verb: 'get'},
      accepts: [{arg: 'destId', type: 'string', require: true, description: 'The destination Id for all Reviews for a destination for ex: 357'}, {arg: 'topX', type: 'string', require: true, description: '1-15'},
      {arg: 'sortOrder', type: 'string', require: false, description: 'REVIEW_RATING_A - Traveler Rating (low→high) Average|REVIEW_RATING_D - Traveler Rating (high→low) Average|REVIEW_RATING_SUBMISSION_DATE_D - Most recent review'}],
      returns: {arg: 'results', type: '[UserReview]', root: true},
      description: 'Get User Review for a user review, or destination',
    }
  );
};
