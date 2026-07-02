var path = require('path'),
fs = require("fs");

// lets encrypt keys for live API

// exports.privateKey = fs.readFileSync(path.join(__dirname, '../../../../etc/letsencrypt/live/prodapi.heroexplorer.com/privkey.pem')).toString();
// exports.certificate = fs.readFileSync(path.join(__dirname, '../../../../etc/letsencrypt/live/prodapi.heroexplorer.com/fullchain.pem')).toString();

exports.privateKey = fs.readFileSync(path.join(__dirname, './private/privatekey.pem')).toString();
exports.certificate = fs.readFileSync(path.join(__dirname, './private/certificate.pem')).toString();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" // Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certs