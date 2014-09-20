// hash based authentication for etherpad
// 2014 - István Király - LaKing@D250.hu

var settings = require('ep_etherpad-lite/node/utils/Settings');
var authorManager = require('ep_etherpad-lite/node/db/AuthorManager');
var crypto = require('crypto');

var hash_typ = "sha512";
var hash_dig = "hex";

if (settings.ep_hash_auth) {
    if (settings.ep_hash_auth.hash_typ) home_dir = settings.ep_hash_auth.hash_typ;
    if (settings.ep_hash_auth.hash_dig) hash_dig = settings.ep_hash_auth.hash_dig;
}

exports.authenticate = function(hook_name, context, cb) {
  console.debug('ep_hash_auth.authenticate');

  if (context.req.headers.authorization && context.req.headers.authorization.search('Basic ') === 0) {
    var userpass = new Buffer(context.req.headers.authorization.split(' ')[1], 'base64').toString().split(":")
    var username = userpass.shift();
    var password = userpass.join(':');
    var hash = crypto.createHash(hash_typ).update(password).digest(hash_dig);

    // Authenticate user via settings.json
    if (settings.users[username] != undefined) {
      // hash defined in "hash" of users
      if (settings.users[username].hash != undefined) {
        if (settings.users[username].hash == hash) {
          settings.users[username].username = username;
          context.req.session.user = settings.users[username];
          return cb([true]);
        }
      }
    }
  }
  return cb([false]);
};