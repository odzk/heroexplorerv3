module.exports = function(heroBooking) {

var viator = require('../../server/constants');

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
 * Get list admin booking
 * @param {string} email
 * @param {number} offset offset : 0, 10, 20...
 * @param {number} limit limit: 10, 20...
 * @param {Function(Error)} callback
 */

heroBooking.getListAllBookingAdmin = function(offset, limit, callback) {
  var fresult = {};
  var currentDate = new Date();
  heroBooking.count({"travelDate": {gte: currentDate}}, function(err, countResult) {
      if (err) {
          callback(null, err);
      } else {
          fresult["total"] = countResult;
          var sqlQuery = "SELECT * FROM HeroBooking " + 
                          `WHERE travelDate >= '${currentDate.toISOString().slice(0, 19).replace('T', ' ')}' AND isCancel = 0 ` +
                          "GROUP BY itineraryId ORDER BY id DESC " + 
                          `LIMIT ${limit} OFFSET ${offset}`;
          heroBooking.dataSource.connector.query(sqlQuery, function(err, findResult) {
              if (err) {
                  callback(null, err);
              } else {
                  var promises = [];
                  var listBooking = []
                  var addField = function(booking){
                      return new Promise(function(resolve){
                          resolve();
                      });
                  };
                  for(var i = 0; i < findResult.length; i++){ 
                      var booking = findResult[i]
                      promises.push(addField(booking)); 
                  }
                  Promise.all(promises).then(function(){
                      fresult["results"] = findResult
                      callback(null, fresult)
                  });
              }
          });
      }
  });
};

/**
 * Get list admin prev booking
 * @param {string} email
 * @param {number} offset offset : 0, 10, 20...
 * @param {number} limit limit: 10, 20...
 * @param {Function(Error)} callback
 */

 heroBooking.getListAllPrevBookingAdmin = function(offset, limit, callback) {
  var fresult = {};
  var currentDate = new Date();
  heroBooking.count({"travelDate": {gte: currentDate}}, function(err, countResult) {
      if (err) {
          callback(null, err);
      } else {
          fresult["total"] = countResult;
          var sqlQuery = "SELECT * FROM HeroBooking " + 
                          `WHERE travelDate < '${currentDate.toISOString().slice(0, 19).replace('T', ' ')}' OR isCancel = 1 ` +
                          "GROUP BY itineraryId ORDER BY id DESC " + 
                          `LIMIT ${limit} OFFSET ${offset}`;
          heroBooking.dataSource.connector.query(sqlQuery, function(err, findResult) {
              if (err) {
                  callback(null, err);
              } else {
                  var promises = [];
                  var listBooking = []
                  var addField = function(booking){
                      return new Promise(function(resolve){
                              resolve();
                          });
                          
                      };
                  };
                  for(var i = 0; i < findResult.length; i++){ 
                      var booking = findResult[i]
                      promises.push(addField(booking)); 
                  }
                  Promise.all(promises).then(function(){
                      fresult["results"] = findResult
                      callback(null, fresult)
                  });
              });
            }
        });
};

heroBooking.cancelBookingDB = function (bookingId, callback) {
  // SQL query to check if the booking exists
  const checkQuery = `
      SELECT * 
      FROM HeroBooking 
      WHERE itineraryId = '${bookingId}';
  `;

  // Execute the query to check if the booking exists
  heroBooking.dataSource.connector.query(checkQuery, function (err, findResult) {
      if (err) {
          callback(null, err);
      } else if (findResult.length === 0) {
          // No booking found
          callback(null, "No booking found with the provided ID");
      } else {
          // Booking found, proceed to update isCancel column
          const updateQuery = `
              UPDATE HeroBooking 
              SET isCancel = 1 
              WHERE itineraryId = '${bookingId}';
          `;

          heroBooking.dataSource.connector.query(updateQuery, function (err, updateResult) {
              if (err) {
                  callback(null, err);
              } else {
                  callback(null, "Booking canceled successfully");
              }
          });
      }
  });
};


heroBooking.getListAllBooking = function(sub, offset, limit, callback) {
  var fresult = {};
  var currentDate = new Date();
  heroBooking.count({"bookingSource":sub, "isCancel": 0, "travelDate": {gte: currentDate}}, function(err, countResult) {
      if (err) {
          callback(null, err);
      } else {
          fresult["total"] = countResult;
          var sqlQuery = "SELECT * FROM HeroBooking " + 
                          `WHERE travelDate >= '${currentDate.toISOString().slice(0, 19).replace('T', ' ')}' ` +
                                'AND isCancel = 0 ' +
                                `AND bookingSource = '${sub}' ` +
                          "GROUP BY itineraryId " + 
                          `LIMIT ${limit} OFFSET ${offset}`;
          heroBooking.dataSource.connector.query(sqlQuery, function(err, findResult) {
              if (err) {
                  callback(null, err);
              } else {
                  var promises = [];
                  var listBooking = []
                  var addField = function(booking){
                      return new Promise(function(resolve){
                          var request = require('request');
                          const options = {
                            url: viator.url + '/service/booking/mybookings?email=' + booking.email + '&itineraryOrItemId=' + booking.itineraryId,
                            method:'GET',
                            headers: {
                              'exp-api-key': viator.api,
                              'Accept': 'application/json',
                              'Accept-Charset': 'utf-8'
                            }
                          };
                          request(options, function(err, httpResponse, body) {
                            if (err) {
                              callback(null, err);
                            } else {
                              var recv =  JSON.parse(body);
                              recv["isRequestCancel"] = booking["isRequestCancel"]
                              recv["isRequestEditTraveller"] = booking["isRequestEditTraveller"]
                              recv["isRequestChangeTour"] = booking["isRequestChangeTour"]
                              recv["isRequestChangeDate"] = booking["isRequestChangeDate"]
                              recv["isRequestChangeName"] = booking["isRequestChangeName"]
                              listBooking.push(recv)
                              resolve();
                            }
                          });
                          
                      });
                  };
                  for(var i = 0; i < findResult.length; i++){ 
                      var booking = findResult[i]
                      promises.push(addField(booking)); 
                  }
                  Promise.all(promises).then(function(){
                      fresult["results"] = listBooking
                      callback(null, fresult)
                  });
              }
          });
      }
  });
};

heroBooking.getListAllBookingPrev = function(sub, offset, limit, callback) {
  var fresult = {};
  var currentDate = new Date();
  heroBooking.count({where: {and: [{"bookingSource":sub}, {or: [{"isCancel": 1}, {"travelDate": {lt: currentDate}}]}]}}, function(err, countResult) {
      if (err) {
          callback(null, err);
      } else {
          fresult["total"] = countResult;
          var sqlQuery = "SELECT * FROM HeroBooking " + 
                          `WHERE bookingSource = '${sub}' ` +
                                'AND (isCancel = 1 ' +
                                `OR travelDate < '${currentDate.toISOString().slice(0, 19).replace('T', ' ')}') ` +
                          "GROUP BY itineraryId " + 
                          `LIMIT ${limit} OFFSET ${offset}`;
            heroBooking.dataSource.connector.query(sqlQuery, function(err, findResult) {
                if (err) {
                    callback(null, err);
                } else {
                  var promises = [];
                  var listBooking = []
                  var addField = function(booking){
                      return new Promise(function(resolve){
                          var request = require('request');
                          const options = {
                            url: viator.url + '/service/booking/mybookings?email=' + booking.email + '&itineraryOrItemId=' + booking.itineraryId,
                            method:'GET',
                            headers: {
                              'exp-api-key': viator.api,
                              'Accept': 'application/json',
                              'Accept-Charset': 'utf-8'
                            }
                          };
                          request(options, function(err, httpResponse, body) {
                            if (err) {
                              callback(null, err);
                            } else {
                              var recv =  JSON.parse(body);
                              recv["isRequestCancel"] = booking["isRequestCancel"]
                              recv["isRequestEditTraveller"] = booking["isRequestEditTraveller"]
                              recv["isRequestChangeTour"] = booking["isRequestChangeTour"]
                              recv["isRequestChangeDate"] = booking["isRequestChangeDate"]
                              recv["isRequestChangeName"] = booking["isRequestChangeName"]
                              listBooking.push(recv)
                              resolve();
                            }
                          });
                          
                      });
                  };
                  for(var i = 0; i < findResult.length; i++){ 
                      var booking = findResult[i]
                      promises.push(addField(booking)); 
                  }
                  Promise.all(promises).then(function(){
                      fresult["results"] = listBooking
                      callback(null, fresult)
                  });
              }
          });
      }
  });
};

heroBooking.getListMyBooking = function(email, offset, limit, callback) {
    var fresult = {};
    var currentDate = new Date();
    heroBooking.count({"email":email, "isCancel": 0, "travelDate": {gte: currentDate}}, function(err, countResult) {
        if (err) {
            callback(null, err);
        } else {
            fresult["total"] = countResult;
            var sqlQuery = "SELECT * FROM HeroBooking " + 
                            `WHERE travelDate >= '${currentDate.toISOString().slice(0, 19).replace('T', ' ')}' ` +
                                  'AND isCancel = 0 ' +
                                  `AND email = '${email}' ` +
                            "GROUP BY itineraryId " + 
                            `LIMIT ${limit} OFFSET ${offset}`;
            heroBooking.dataSource.connector.query(sqlQuery, function(err, findResult) {
                if (err) {
                    callback(null, err);
                } else {
                    var promises = [];
                    var listBooking = []
                    var addField = function(booking){
                        return new Promise(function(resolve){
                                resolve();
                            });
                          }
                        };
                    for(var i = 0; i < findResult.length; i++){ 
                        var booking = findResult[i]
                        promises.push(addField(booking)); 
                    }
                    Promise.all(promises).then(function(){
                        fresult["results"] = listBooking
                        callback(null, findResult)
                    });
                });
           }
    });
  };

/**
 * Get list Past booking
 * @param {string} email
 * @param {number} offset offset : 0, 10, 20...
 * @param {number} limit limit: 10, 20...
 * @param {Function(Error, array)} callback
 */

heroBooking.listPastBooking = function(email, offset, limit, callback) {
    var fresult = {};
    var currentDate = new Date();
    heroBooking.count({or:[{"email":email, "isCancel": 1},{"email":email, "travelDate": {lt: currentDate}}]}, function(err, countResult) {
        if (err) {
            callback(null, err);
        } else {
            fresult["total"] = countResult;
            var sqlQuery = "SELECT * FROM HeroBooking " + 
                            `WHERE (email = '${email}' AND isCancel = 1) ` +
                                  `OR (email = '${email}' AND travelDate < '${currentDate.toISOString().slice(0, 19).replace('T', ' ')}') ` +
                            "GROUP BY itineraryId " + 
                            `LIMIT ${limit} OFFSET ${offset}`;
            heroBooking.dataSource.connector.query(sqlQuery, function(err, findResult) {
                if (err) {
                    callback(null, err);
                } else {
                    var promises = [];
                    var listBooking = []
                    var addField = function(booking){
                        return new Promise(function(resolve){                           
                               resolve();
                            });
                    };
                    for(var i = 0; i < findResult.length; i++){ 
                        var booking = findResult[i]
                        promises.push(addField(booking)); 
                    }
                    Promise.all(promises).then(function(){
                        fresult["results"] = listBooking
                        callback(null, findResult)
                    });
                }
            });
        }
    });
  }

/**
 * Get cancel booking reasons
 * @param {Function(Error, object)} callback
 */

heroBooking.getCancelBookingReasons = function(callback) {
  const options = {
    url: viator.bookingUrl + '/cancel-reasons',
    method:'GET',
    headers: {
      'exp-api-key': viator.api,
      'Accept': 'application/json',
      'Accept-Language': 'en-US'
    }
  };
  var request = require('request');
  request(options, function(err, httpResponse, body) {
    if (err) {
      callback(null, err);
    } else {
      var recv =  JSON.parse(body);
      callback(null, recv['reasons']);
    }
  });
}

/**
 * Cancle a booking
 * @param {object} data
 * @param {Function(Error, object)} callback
 */

heroBooking.cancelABooking = function(data, callback) {
    console.log('Cancel Data: ', data);

    var bookingRef = data['cancelItems'];
    var reasonCode = {
      reasonCode: bookingRef[0].cancelCode
    }
    var request = require('request');
    var options = {
      method:'POST',
      url: viator.bookingUrl + '/BR-' + bookingRef[0].itemId + '/cancel',
      headers: {
        'exp-api-key': viator.api,
        'Content-Type' : 'application/json',
        'Accept-Language': 'en-US'
      },
      body: JSON.stringify(reasonCode)
    };

    // request(options, function(err, httpResponse, body) {
    //   if (err) {
    //     callback(null, err);
    //   } else {
    //     var recv =  JSON.parse(body);
    //     heroBooking.findOne({"where":{"itineraryId": data["itineraryId"]}}, function(err, object) {
    //         if (err) {
    //             callback(null, err)
    //         } else {
    //             object.updateAttributes({"isCancel": 1}, function(err, booking) {
    //             })
    //         } 
    //     });
    //     callback(null, recv);
    //   } 
    // });
  };

/**
 * Get Voucher Data
 * @param {string} voucherKey
 * @param {Function(Error, object)} callback
 */

heroBooking.getVoucherData = function(voucherKey, callback) {
    var request = require('request');
    const options = {
      url: viator.url + '/service/booking/voucher?voucherKey=' + voucherKey,
      method:'GET',
      headers: {
        'exp-api-key': viator.api,
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8'
      }
    };
    request(options, function(err, httpResponse, body) {
      if (err) {
        callback(null, err);
      } else {
        var recv =  JSON.parse(body);
        callback(null, recv['data']);
      }
    });                        
  };



/**
 * Request Edit booking --> email
 * @param {string} itineraryId
 * @param {string} title
 * @param {string} content
 * @param {Function(Error, object)} callback
 */

heroBooking.requestEditBooking = function(itineraryId, title, content, callback) {
    heroBooking.findOne({"where":{"itineraryId": itineraryId}}, function(err, booking) {
        if (err) {
            callback(null, err)
        } else {
            heroBooking.app.models.HeroUser.findOne({"where":{"email": booking["email"]}}, function(err, user) {
                var titleE = "[Booking:" + booking["itineraryId"] + "]" + " " + title
                var html1 = '<div style="background-color:#e0dbd5"><div style="text-align:center;background-color:#e0dbd5;padding:1em 0"><table width="600" cellspacing="0" cellpadding="0" border="0" align="center"><tbody><tr><td style="background-color:#00759a; padding: 1rem"><img src="http://www.heroexplorer.com/assets/images/home-logo.png" width="200" alt="Verify HeroExplorer Account" class="CToWUd"></td></tr><tr><td style="padding:15px 25px;font-family:"Arial","Helvetica","Verdana",sans-serif;font-size:12px;line-height:1.5;text-align:left;background-color:#fff;color:#333"><h1 style="font-size:16px;margin:0 0 1em;padding:0;font-weight:normal">'  
                var html2 = '</h1>'
                var starth2 = '<h2 style="font-size:14px;margin:0 0 1em;padding:0;font-weight:normal">'
                var endh2 = '</h2>'
                var userTitle = '<h1 style="font-size:16px;margin:0 0 1em;padding:0;font-weight:normal"> User:</h1>'
                var userDetail = starth2 + user["email"] + " | " + user["firstname"] + " " + user["lastname"] + " | " + user["city"] + " | " + user["mobile"] + endh2
                var bookindTitle = '<h1 style="font-size:16px;margin:0 0 1em;padding:0;font-weight:normal"> Booking:</h1>'
                var bookingDetail =  starth2 + "itineraryId: " + itineraryId + endh2
                var mailOptions = {
                    from: booking["email"], // sender address
                    to: "hello@heroexplorer.com", // receiver
                    subject: titleE, // Subject 
                    html: html1 + content + html2 + userTitle + userDetail + bookindTitle + bookingDetail
                  };
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                      callback(null, error)
                    }else{
                      if (title == "Cancel my booking") {
                        booking.updateAttributes({"isRequestCancel": 1}, function(err, bookingR) {  
                            if (err) {
                                callback(null, err)
                            } else {
                                callback(null, bookingR)
                            }
                        })
                      } else if (title == "Add or Remove travelers") {
                        booking.updateAttributes({"isRequestEditTraveller": 1}, function(err, bookingR) {
                            if (err) {
                                callback(null, err)
                            } else {
                                callback(null, bookingR)
                            }
                        })
                      } else if (title == "Change tour option") {
                        booking.updateAttributes({"isRequestChangeTour": 1}, function(err, bookingR) {
                            if (err) {
                                callback(null, err)
                            } else {
                                callback(null, bookingR)
                            }
                        })
                      } else if (title == "Change the date of my booking") {
                        booking.updateAttributes({"isRequestChangeDate": 1}, function(err, bookingR) {
                            if (err) {
                                callback(null, err)
                            } else {
                                callback(null, bookingR)
                            }
                        })
                      } else {
                        booking.updateAttributes({"isRequestChangeName": 1}, function(err, bookingR) {
                            if (err) {
                                callback(null, err)
                            } else {
                                callback(null, bookingR)
                            }
                        })
                      }
                    };
                }); 
            });
        } 
    });
};

/**
 * Get list of bookings for report
 * @param {date} startDate startDate : Mon dd, yyyy
 * @param {date} endDate endDate: Mon dd, yyyy
 * @param {number} offset offset : 0, 10, 20...
 * @param {number} limit limit: 10, 20...
 * @param {Function(Error)} callback
 */

 heroBooking.getReportBookings = function(startDate, endDate, offset, limit, callback) {
  var fresult = {};
  heroBooking.count({"travelDate": {gte: startDate}, "travelDate": {lte: endDate}}, function(err, countResult) {
      if (err) {
          callback(null, err);
      } else {
          fresult["total"] = countResult;
          var sqlQuery = "SELECT * FROM HeroBooking " + 
                          `WHERE travelDate >= '${startDate.toISOString().slice(0, 19).replace('T', ' ')}' ` +
                          `AND travelDate <= '${endDate.toISOString().slice(0, 19).replace('T', ' ')}' ` +
                          "GROUP BY itineraryId ORDER BY id DESC " + 
                          `LIMIT ${limit} OFFSET ${offset}`;
          heroBooking.dataSource.connector.query(sqlQuery, function(err, findResult) {
              if (err) {
                  callback(null, err);
              } else {
                  var promises = [];
                  var listBooking = []
                  var addField = function(booking){
                      return new Promise(function(resolve){
                          var request = require('request');
                          const options = {
                            url: viator.url + '/service/booking/mybookings?email=' + booking.email + '&itineraryOrItemId=' + booking.itineraryId,
                            method:'GET',
                            headers: {
                              'exp-api-key': viator.api,
                              'Accept': 'application/json',
                              'Accept-Charset': 'utf-8'
                            }
                          };
                          request(options, function(err, httpResponse, body) {
                            if (err) {
                              callback(null, err);
                            } else {
                              var recv =  JSON.parse(body);
                              recv["isRequestCancel"] = booking["isRequestCancel"]
                              recv["isRequestEditTraveller"] = booking["isRequestEditTraveller"]
                              recv["isRequestChangeTour"] = booking["isRequestChangeTour"]
                              recv["isRequestChangeDate"] = booking["isRequestChangeDate"]
                              recv["isRequestChangeName"] = booking["isRequestChangeName"]
                              recv["bookingSource"] = booking["bookingSource"]
                              listBooking.push(recv)
                              resolve();
                            }
                          });
                          
                      });
                  };
                  for(var i = 0; i < findResult.length; i++){ 
                      var booking = findResult[i]
                      promises.push(addField(booking)); 
                  }
                  Promise.all(promises).then(function(){
                      fresult["results"] = listBooking
                      callback(null, fresult)
                  });
              }
          });
      }
  });
};

/**
 * Download list of bookings for report
 * @param {date} startDate startDate : Mon dd, yyyy
 * @param {date} endDate endDate: Mon dd, yyyy
 * @param {Function(Error)} callback
 */

 heroBooking.downloadReportBookings = function(startDate, endDate, callback) {
  var fresult = {};
  heroBooking.count({"travelDate": {gte: startDate}, "travelDate": {lte: endDate}}, function(err, countResult) {
      if (err) {
          callback(null, err);
      } else {
          fresult["total"] = countResult;
          var sqlQuery = "SELECT * FROM HeroBooking " + 
                          `WHERE travelDate >= '${startDate.toISOString().slice(0, 19).replace('T', ' ')}' ` +
                          `AND travelDate <= '${endDate.toISOString().slice(0, 19).replace('T', ' ')}' ` +
                          "GROUP BY itineraryId ORDER BY id DESC";
          heroBooking.dataSource.connector.query(sqlQuery, function(err, findResult) {
              if (err) {
                  callback(null, err);
              } else {
                  var promises = [];
                  var listBooking = []
                  var addField = function(booking){
                      return new Promise(function(resolve){
                          var request = require('request');
                          const options = {
                            url: viator.url + '/service/booking/mybookings?email=' + booking.email + '&itineraryOrItemId=' + booking.itineraryId,
                            method:'GET',
                            headers: {
                              'exp-api-key': viator.api,
                              'Accept': 'application/json',
                              'Accept-Charset': 'utf-8'
                            }
                          };
                          request(options, function(err, httpResponse, body) {
                            if (err) {
                              callback(null, err);
                            } else {
                              var recv =  JSON.parse(body);
                              recv["isRequestCancel"] = booking["isRequestCancel"]
                              recv["isRequestEditTraveller"] = booking["isRequestEditTraveller"]
                              recv["isRequestChangeTour"] = booking["isRequestChangeTour"]
                              recv["isRequestChangeDate"] = booking["isRequestChangeDate"]
                              recv["isRequestChangeName"] = booking["isRequestChangeName"]
                              recv["bookingSource"] = booking["bookingSource"]
                              listBooking.push(recv)
                              resolve();
                            }
                          });
                          
                      });
                  };
                  for(var i = 0; i < findResult.length; i++){ 
                      var booking = findResult[i]
                      promises.push(addField(booking)); 
                  }
                  Promise.all(promises).then(function(){
                      fresult["results"] = listBooking
                      callback(null, fresult)
                  });
              }
          });
      }
  });
};

}