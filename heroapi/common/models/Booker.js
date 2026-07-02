module.exports = function(Booker) {
/**
 *
 * @param {string} subDomain
 * @param {Function(Error, object)} callback
 */

Booker.getBookerId = function(subDomain, callback) {
    Booker.findOne({"where":{"name": subDomain}}, function(err, object) {
        if (err) {
            callback(null, err)
        } else {
            callback(null, object)
        } 
    });
}; 


}