'use strict';

module.exports = function(Userphoto) {
 /**
   * Hidden un-used api
   */
  Userphoto.disableRemoteMethodByName('create', true);
  Userphoto.disableRemoteMethodByName('upsert', true);
  Userphoto.disableRemoteMethodByName('deleteById', true);
  Userphoto.disableRemoteMethodByName('updateAll', true);
  Userphoto.disableRemoteMethodByName('replaceOrCreate', true);
  Userphoto.disableRemoteMethodByName('findById', true);
  Userphoto.disableRemoteMethodByName('find', true);
  Userphoto.disableRemoteMethodByName('findOne', true);
  Userphoto.disableRemoteMethodByName('count', true);
  Userphoto.disableRemoteMethodByName('createChangeStream', true);
  Userphoto.disableRemoteMethodByName('patchAttributes', true);
  Userphoto.disableRemoteMethodByName('replaceById', true);
  Userphoto.disableRemoteMethodByName('exists', true);
  Userphoto.disableRemoteMethodByName('upsertWithWhere', true);
  Userphoto.disableRemoteMethodByName('prototype.patchAttributes', true);
 /**
   * Get User Reviews for a product, or destination
   * destId=357&topX=1-15
   */
  Userphoto.getUserPhotosOfAProductOrDestination = function(destId, topX, sortOrder, cb) {
    var url = 'http://prelive.viatorapi.sandbox.viator.com/service/content/user/photos?apiKey=552392240092477167';
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

  Userphoto.remoteMethod(
    'getUserPhotosOfAProductOrDestination', {
      http: {path: '/getUserPhotosOfAProductOrDestination', verb: 'get'},
      accepts: [{arg: 'destId', type: 'string', require: true, description: 'The destination Id for all Reviews for a destination for ex: 357'}, {arg: 'topX', type: 'string', require: true, description: '1-15'},
      {arg: 'sortOrder', type: 'string', require: false, description: 'PHOTO_EDITORS_PICK - Editors pick photos|PHOTO_LATEST - Latest photos first|PHOTO_LATEST_EDITORS_PICK - Latest Upload time / editors pick (default)|PHOTO_LASTUPDATED_EDITORS_PICK - Last updated / editors pick'}],
      returns: {arg: 'results', type: '[UserPhoto]', root: true},
      description: 'Get User Review for a user review, or destination',
    }
  );
};
