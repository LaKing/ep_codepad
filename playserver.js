// make it possible to run the project

var eejs = require('ep_etherpad-lite/node/eejs');
var settings = require('ep_etherpad-lite/node/utils/Settings');

// /play page should run the code, and display contents. 
exports.expressCreatePlayServer = function(hook_name, args, cb) {
    args.app.get('/play', function(req, res) {
        if (!settings.ep_codepad) {
            console.log("Codepad needs ep_codepad parameters in settings.json.");
            res.send(eejs.require("ep_codepad/templates/no_play_url.html", {
                url: ""
            }));
        } else {
            if (!settings.ep_codepad.play_url) {
                console.log("No ep_codepad.play_url set in settings.json.");
                res.send(eejs.require("ep_codepad/templates/no_play_url.html", {
                    url: ""
                }));
            } else res.send(eejs.require("ep_codepad/templates/redirect.html", {
                url: settings.ep_codepad.play_url
            }));
        }
    });
};