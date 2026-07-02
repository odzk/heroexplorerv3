var config = require('../../server/config.json');
var path = require('path');

module.exports = function(heroUser) {

  // Setup 
  var nodemailer = require('nodemailer');
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'hello@heroexplorer.com',
        pass: 'G+t8958!'
    }
  });

  //send verification email after registration
  heroUser.afterRemote('create', function(context, user, next) {
    var verifyNum = Math.floor(100000 + Math.random() * 900000);
    user.updateAttributes({"verificationtoken": verifyNum, "createdAt": Date(), "updatedAt": Date()}, function(err, userUpdated) {
      if (!err) {
        var link = "https://www.heroexplorer.com/verify/"+ user.email + "/" + verifyNum;
        var html1 = '<div style="background-color:#e0dbd5"><div style="text-align:center;background-color:#e0dbd5;padding:1em 0"><table width="600" cellspacing="0" cellpadding="0" border="0" align="center"><tbody><tr><td style="background-color:#00759a; padding: 1rem"><img src="http://www.heroexplorer.com/assets/images/home-logo.png" width="200" alt="Verify HeroExplorer Account" class="CToWUd"></td></tr><tr><td style="padding:15px 25px;font-family:"Arial","Helvetica","Verdana",sans-serif;font-size:12px;line-height:1.5;text-align:left;background-color:#fff;color:#333"><h1 style="font-size:16px;margin:0 0 1em;padding:0;font-weight:normal">Thanks for joining HeroExplorer!</h1><p style="margin:0 0 1em">Please verify your email address by <a href="'
        var html2 = '" style="color:#00759a" >Click here</a>.</p><p style="margin:0 0 1em">Alternatively, if the above link is not working,<a href="https://www.heroexplorer.com/verify" title="Verify your account" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://www.heroexplorer.com/verify&amp;source=gmail&amp;ust=1530160455085000&amp;usg=AFQjCNGtGZSLyJ2ouiVHLKxnfkwzh2AlAQ">go here</a> and enter the following verification code:<br><strong>'
        var html3 = '</strong></p><p style="margin:0 0 1em"> <strong>Not you?</strong><br>If you did not recently update your email address on HeroExplorer.com, please let us know by forwarding this email to <a href="mailto:hello@heroexplorer.com" style="color:#00759a" target="_blank">hello@heroexplorer.com</a>.</p></td></tr><tr><td style="background-color:#e0dbd5;color:#777;text-align:center;font-size:11px;font-family:"Arial","Helvetica","Verdana",sans-serif;line-height:1.5"><p style="margin:0;padding:8px 0"><a href="https://support.heroexplorer.com/about/" title="About Us" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/about&amp;source=gmail&amp;ust=1530160455085000&amp;usg=AFQjCNHBM9HymdfrXD8FJ2Ub_gyna0jCIg">About Us</a> | <a href="https://support.heroexplorer.com/support/" title="Customer Care" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/support&amp;source=gmail&amp;ust=1530160455086000&amp;usg=AFQjCNEZWeXxdBpcn05amKhfSgEIt7KlMw">Customer Care</a> | <a href="https://support.heroexplorer.com/privacy-policy/" title="Privacy Policy" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/privacy-policy&amp;source=gmail&amp;ust=1530160455086000&amp;usg=AFQjCNHPwu1A4FomjYU2DPQmpSPoo1oQYw">Privacy Policy</a><br></p> </td></tr> </tbody></table><div class="yj6qo"></div><div class="adL"></div></div><div class="adL"></div></div>'
        var mailOptions = {
            from: 'hello@heroexplorer.com', // sender address
            to: user.email, // receiver
            subject: 'Thanks for joining HeroExplorer!', // Subject 
            html: html1 + link + html2 + verifyNum + html3
          };
        transporter.sendMail(mailOptions, function(error, info){
          if(error){
              //console.log(error);
          }else{
              next();
          };
        });

        var adminhtml1 = '<div style="background-color:#e0dbd5"><div style="text-align:center;background-color:#e0dbd5;padding:1em 0"><table width="600" cellspacing="0" cellpadding="0" border="0" align="center"><tbody><tr><td style="background-color:#00759a; padding: 1rem"><img src="http://www.heroexplorer.com/assets/images/home-logo.png" width="200" alt="Verify HeroExplorer Account" class="CToWUd"></td></tr><tr><td style="padding:15px 25px;font-family:"Arial","Helvetica","Verdana",sans-serif;font-size:12px;line-height:1.5;text-align:left;background-color:#fff;color:#333"><h1 style="font-size:16px;margin:0 0 1em;padding:0;font-weight:normal">New user sign up!</h1><p style="margin:0 0 1em">User email address:<br><strong>';
        var adminhtml2 = '</strong></p></td></tr><tr><td style="background-color:#e0dbd5;color:#777;text-align:center;font-size:11px;font-family:"Arial","Helvetica","Verdana",sans-serif;line-height:1.5"><p style="margin:0;padding:8px 0"><a href="https://support.heroexplorer.com/about/" title="About Us" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/about&amp;source=gmail&amp;ust=1530160455085000&amp;usg=AFQjCNHBM9HymdfrXD8FJ2Ub_gyna0jCIg">About Us</a> | <a href="https://support.heroexplorer.com/support/" title="Customer Care" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/support&amp;source=gmail&amp;ust=1530160455086000&amp;usg=AFQjCNEZWeXxdBpcn05amKhfSgEIt7KlMw">Customer Care</a> | <a href="https://support.heroexplorer.com/privacy-policy/" title="Privacy Policy" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/privacy-policy&amp;source=gmail&amp;ust=1530160455086000&amp;usg=AFQjCNHPwu1A4FomjYU2DPQmpSPoo1oQYw">Privacy Policy</a><br></p> </td></tr> </tbody></table><div class="yj6qo"></div><div class="adL"></div></div><div class="adL"></div></div>';

        var adminMailOptions = {
          from: 'hello@heroexplorer.com', // sender address
          to: 'hello@heroexplorer.com, odysseus.ambut@herobe.com, stephanie.yu@herobe.com, jude.bolger@herobe.com', // receiver
          subject: 'New user sign up!', // Subject 
          html: adminhtml1 + user.email + adminhtml2
        };
        transporter.sendMail(adminMailOptions, function(error, info){
          if(error){
              //console.log(error);
          }else{
              next();
          };
        });
      }
    });
  });


  heroUser.verifyCode = function(verifyCode, email, cb) {
    heroUser.findOne({where: {email: email}}, (err, user) => {
      if (err || !user) {
        cb(null,err)
      } else {
        if (user.verificationtoken == verifyCode) {
          user.updateAttributes({"emailverified": 1, "updatedAt": Date()}, function(err, userUpdated) {
            if (err) {
              cb(null, err)
            } else {
              cb(null, userUpdated)
            }
          });
        } else {
          var error = new Error();
          error.status = 401;
          error.message = 'Verify code was wrong';
          error.code = 'ERROR VERIFYING CODE';
          cb(null, error)
        }
      }
    })
  };

  heroUser.remoteMethod(
        'verifyCode', {
          http: {path: '/verifyCode', verb: 'post'},
          accepts: [{arg: 'verifyCode', type: 'number', description: 123456},{arg: 'email', type: "string", description: 1}],
          returns: {arg: 'results', type: '[HeroUser]', root: true},
          description: 'Verify 6 digits',
        }
  );

  heroUser.linkVerifyCode = function(verifyCode, email, cb) {
    heroUser.findOne({where: {email: email}}, (err, user) => {
      if (err || !user) {
        cb(null,err)
      } else {
        if (user.verificationtoken == verifyCode) {
          user.updateAttributes({"emailverified": 1, "updatedAt": Date()}, function(err, userUpdated) {
            if (err) {
              cb(null, err)
            } else {
              cb(null, userUpdated)
            }
          });
        } else {
          var error = new Error();
          error.status = 401;
          error.message = 'Verify code was wrong';
          error.code = 'ERROR VERIFYING CODE';
          cb(null, error)
        }
      }
    })
  };

  heroUser.remoteMethod(
        'linkVerifyCode', {
          http: {path: '/linkVerifyCode', verb: 'get'},
          accepts: [{arg: 'verifyCode', type: 'number', description: 123456},{arg: 'email', type: "string", description: 1}],
          returns: {arg: 'results', type: '[HeroUser]', root: true},
          description: 'Verify 6 digits',
        }
  );

 /**
 * Reset Password With email
 * @param {string} email
 * @param {string} password
 * @param {Function(Error, object)} callback
 */

heroUser.resetPasswordWithEmail = function(email, password, callback) {
  heroUser.findOne({'where':{"email": email}}, function(err, object) {
    if (err) {
        callback(null, err)
    } else {
        object.updateAttributes({"password": password}, function(err, heroU) {
            if (err) {
                callback(null, err);
            } else {
                callback(null, heroU);
            }
        })
    } 
  });
};

/**
 * /sentCodeForgotPassword
 * @param {string} email
 * @param {Function(Error, object)} callback
 */

heroUser.sentCodeForgotPassword = function(email, callback) {
  heroUser.findOne({'where':{"email": email}}, function(err, object) {
    if (err) {
        callback(null, err)
    } else {
      var verifyNum = Math.floor(100000 + Math.random() * 900000);
      object.updateAttributes({"verificationToken": verifyNum, "updatedAt": Date()}, function(err, userUpdated) {
        if (!err) {
          var htmlLink = "https://www.heroexplorer.com/reset-password"
          var html1 = '<div style="background-color:#e0dbd5"><div style="text-align:center;background-color:#e0dbd5;padding:1em 0"><table width="600" cellspacing="0" cellpadding="0" border="0" align="center"><tbody><tr><td style="background-color:#00759a; padding: 1rem"><img src="http://www.heroexplorer.com/assets/images/home-logo.png" width="200" alt="Forgot your password?" class="CToWUd"></td></tr><tr><td style="padding:15px 25px;font-family:"Arial","Helvetica","Verdana",sans-serif;font-size:12px;line-height:1.5;text-align:left;background-color:#fff;color:#333"><br><br><p style="margin:0 0 1em">Here is the code to recovery your password: <b> ' + object.verificationToken + '</b>' + '<p style="margin:0 0 1em">Please use the above code and simply click this link to set up new password <a href="'
          var html2 = '">clicking here</a>.</p>'
          var html3 = '<p style="margin:0 0 1em"><br><strong>'
          var html4 = '</strong></p><p style="margin:0 0 1em"> <strong>Not you?</strong><br>If you did not recently update your email address on HeroExplorer.com, please let us know by forwarding this email to <a href="mailto:hello@heroexplorer.com" style="color:#00759a" target="_blank">hello@heroexplorer.com</a>.</p></td></tr><tr><td style="background-color:#e0dbd5;color:#777;text-align:center;font-size:11px;font-family:"Arial","Helvetica","Verdana",sans-serif;line-height:1.5"><p style="margin:0;padding:8px 0"><a href="https://support.heroexplorer.com/about/" title="About Us" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/about&amp;source=gmail&amp;ust=1530160455085000&amp;usg=AFQjCNHBM9HymdfrXD8FJ2Ub_gyna0jCIg">About Us</a> | <a href="https://support.heroexplorer.com/support" title="Customer Care" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/support&amp;source=gmail&amp;ust=1530160455086000&amp;usg=AFQjCNEZWeXxdBpcn05amKhfSgEIt7KlMw">Customer Care</a> | <a href="https://support.heroexplorer.com/privacy-policy/" title="Privacy Policy" style="color:#00759a" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://support.heroexplorer.com/privacy-policy/&amp;source=gmail&amp;ust=1530160455086000&amp;usg=AFQjCNHPwu1A4FomjYU2DPQmpSPoo1oQYw">Privacy Policy</a><br></p> </td></tr> </tbody></table><div class="yj6qo"></div><div class="adL"></div></div><div class="adL"></div></div>'
          var mailOptions = {
              from: 'hello@heroexplorer.com', // sender address
              to: email, // receiver
              subject: 'Recovery password HeroExplorer!', // Subject 
              html: html1 + htmlLink + html2 + html3 + html4
            };
          transporter.sendMail(mailOptions, function(error, info){
              if(error){
                callback(null, error)
              }else{
                callback(null, {"email:" : "sent"})
              };
            }); 
        } else {
          callback(null, error)
        }
      });
    } 
  });
};


/**
 * Recovery password use code
 * @param {string} email
 * @param {string} code
 * @param {string} password
 * @param {Function(Error, object)} callback
 */

heroUser.recoveryPasswordUseCode = function(email, code, password, callback) {
  heroUser.findOne({"where": {"email": email, "verificationToken": code}}, function(err, object) {
    if (err) {
        callback(null, err)
    } else {
        object.updateAttributes({"password": password}, function(err, heroU) {
            if (err) {
                callback(null, err);
            } else {
                callback(null, heroU);
            }
        })
    } 
  });
};

 /**
 * Get Hero user detail by email
 * @param {string} email
 * @param {Function(Error, object)} callback
 */

heroUser.getHeroUserDetailByEmail = function(email, callback) {
  heroUser.findOne({"where": {"email": email}}, function(err, object) {
    if (err) {
        callback(null, err)
    } else {
        callback(null, object)
    } 
  });
};

};
