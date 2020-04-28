// hash based authentication for etherpad
// 2014-2016 - István Király - LaKing@D250.hu
// Contributions by Robin Schneider <ypid@riseup.net>

var fs = require('fs');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var authorManager = require('ep_etherpad-lite/node/db/AuthorManager');
var sessionManager = require('ep_etherpad-lite/node/db/SessionManager');
var crypto = require('crypto');

// npm install bcrypt
var bcrypt = require('bcrypt-nodejs');

// ocrypt-relevant options
var hash_typ = "sha512";
var hash_dig = "hex";

// default dir to search for hash files
var hash_dir = '/var/codepad/users';
// by default the extension is actually a file, so usernames are actually folders
var hash_ext = '/.hash';
// by default peple logged in that authenticated over a hash file, are admins ?
var hash_adm = true;

// the name is taken at login, so by default we disallow namechange now
var allow_namechange = false;

if (settings.ep_hash_auth) {
    if (settings.ep_hash_auth.hash_typ) hash_typ = settings.ep_hash_auth.hash_typ;
    if (settings.ep_hash_auth.hash_dig) hash_dig = settings.ep_hash_auth.hash_dig;
    if (settings.ep_hash_auth.hash_dir) hash_dir = settings.ep_hash_auth.hash_dir;
    if (settings.ep_hash_auth.hash_ext) hash_ext = settings.ep_hash_auth.hash_ext;
    if (settings.ep_hash_auth.hash_adm) hash_adm = settings.ep_hash_auth.hash_adm;

    if (settings.ep_hash_auth.allow_namechange)
        if (settings.ep_hash_auth.allow_namechange === false) allow_namechange = false;
}

exports.authenticate = function(hook_name, context, cb) {
    if (context.req.headers.authorization && context.req.headers.authorization.search('Basic ') === 0) {
        var userpass = new Buffer(context.req.headers.authorization.split(' ')[1], 'base64').toString().split(":");
        var username = userpass.shift();
        var password = userpass.join(':');

        var hash = crypto.createHash(hash_typ).update(password).digest(hash_dig);

        // Authenticate user via settings.json
        if (settings.users[username] !== undefined && settings.users[username].hash !== undefined) {
            if (settings.users[username].hash == hash) {
                settings.users[username].username = username;
                context.req.session.user = settings.users[username];
                console.log("CODEPAD AUTH: Authenticated (crypto) " + username);
                return cb([true]);
            } else {
                bcrypt.compare(password, settings.users[username].hash, function(err, res) {
                    if (err || !res) {
                        console.log("CODEPAD AUTH: Authentication failed (bcrypt err) " + username);
                        return cb([false]);
                    } else {
                        settings.users[username].username = username;
                        context.req.session.user = settings.users[username];
                        console.log("CODEPAD AUTH: Authenticated (bcrypt) " + username);
                        return cb([true]);
                    }
                });
            }
        } else {
            // Authenticate user via hash_dir
            var path = hash_dir + "/" + username + hash_ext;
            fs.readFile(path, 'utf8', function(err, contents) {
                if (err) {
                    // file not found, or inaccessible
                    console.log("CODEPAD AUTH: File authentication failed for " + username);
                    return cb([false]);
                } else {
                    if (contents === hash) {
                        settings.users[username] = {};
                        settings.users[username].username = username;
                        settings.users[username].is_admin = hash_adm;
                        context.req.session.user = settings.users[username];
                        console.log("CODEPAD AUTH: Authenticated (crypto-file) " + username);
                        return cb([true]);
                    } else {
                        bcrypt.compare(password, contents, function(err, res) {
                            if (err || !res) {
                                console.log("CODEPAD AUTH: Authentication failed (bcrypt-file) " + username);
                                return cb([false]);
                            } else {
                                settings.users[username] = {};
                                settings.users[username].username = username;
                                settings.users[username].is_admin = hash_adm;
                                context.req.session.user = settings.users[username];
                                console.log("CODEPAD AUTH: Authenticated (bcrypt-file) " + username);
                                return cb([true]);
                            }
                        });
                    }
                }
            });
        }
    } else {
        console.log("CODEPAD AUTH: Authentication failed... ");
        return cb([false]);
    }

};

// generate the color based on the username, if not defined in settings.json
var stringToColour = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var j = 0; j < 3; j++) {
        var value = (hash >> (j * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
};

exports.handleMessage = function(hook_name, context, cb) {

    if (context.message.type === "CLIENT_READY") {
        if (context.message.token) {
            authorManager.getAuthor4Token(context.message.token, function(err, author) {
                if (err) {
                    console.log('Auth-Error, No authorID for token: ' + token);
                } else {
                    // set username
                    if (typeof context.client.request.session.user !== 'undefined') {
                        authorManager.setAuthorName(author, context.client.request.session.user.username);
                        // set color
                        if (context.client.request.session.user.color) authorManager.setAuthorColorId(author, context.client.request.session.user.color);
                        else authorManager.setAuthorColorId(author, stringToColour(context.client.request.session.user.username));
                    }
                }

            });
        }
    }

    if (context.message.type == "COLLABROOM" && context.message.data.type == "USERINFO_UPDATE") {
        if (allow_namechange) return cb([context.message]);
        else return cb([null]);
    }

    return cb([context.message]);

};
