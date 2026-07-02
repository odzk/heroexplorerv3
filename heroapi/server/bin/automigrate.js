var path = require('path');
var app = require(path.resolve(__dirname, '../server'));

var dataSource = app.dataSources.herodb;

dataSource.automigrate('User', function(err) {
  if (err) throw err;

  //console.log('User model migrated');
  // dataSource.disconnect();
});
dataSource.automigrate('AccessToken', function(err) {
  if (err) throw err;

  //console.log('AccessToken model migrated');
  // dataSource.disconnect();
});
dataSource.automigrate('ACL', function(err) {
  if (err) throw err;

  //console.log('ACL model migrated');
  // dataSource.disconnect();
});
dataSource.automigrate('RoleMapping', function(err) {
  if (err) throw err;

  //console.log('RoleMapping model migrated');
  // dataSource.disconnect();
});
dataSource.automigrate('Role', function(err) {
  if (err) throw err;

  //console.log('Role model migrated');
  dataSource.disconnect();
});

dataSource.automigrate('Product', function(err) {
  if (err) throw err;

  //console.log('Product model migrated');
  dataSource.disconnect();
});

dataSource.automigrate('UserReview', function(err) {
  if (err) throw err;

  //console.log('UserReview model migrated');
  dataSource.disconnect();
});

dataSource.automigrate('UserPhoto', function(err) {
  if (err) throw err;

  //console.log('UserPhoto model migrated');
  dataSource.disconnect();
});

dataSource.automigrate('Destination', function(err) {
  if (err) throw err;

  //console.log('Destination model migrated');
  dataSource.disconnect();
});

dataSource.automigrate('Subcategory', function(err) {
  if (err) throw err;

  //console.log('Subcategory model migrated');
  dataSource.disconnect();
});

dataSource.automigrate('Category', function(err) {
  if (err) throw err;

  //console.log('Category model migrated');
  dataSource.disconnect();
});

dataSource.automigrate('Attraction', function(err) {
  if (err) throw err;

  //console.log('Attraction model migrated');
  dataSource.disconnect();
});

dataSource.automigrate('Recommendation', function(err) {
  if (err) throw err;

  //console.log('Recommendation model migrated');
  dataSource.disconnect();
});