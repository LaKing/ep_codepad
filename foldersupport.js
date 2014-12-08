// foldersupport enables to use folder[s]/file adressing in URLs and internally in pads, by urlencoding slashes.

var eejs = require('ep_etherpad-lite/node/eejs');
var hooks = require('ep_etherpad-lite/static/js/pluginfw/hooks');
var toolbar = require("ep_etherpad-lite/node/utils/toolbar");

exports.expressCreateFolderServer = function(hook_name, args, cb) {
    args.app.get('/p/*', function(req, res) {
        // file path slice     
        var fps = req.url.slice(3, 250);
        // file path urlencoded     
        var fpu = encodeURIComponent(fps);
        // file path redirection     
        var fpr = '/p/' + fpu;

        hooks.callAll("padInitToolbar", {
            toolbar: toolbar
        });

        if (fps.indexOf('/') === -1) res.send(eejs.require("ep_etherpad-lite/templates/pad.html", {
            req: req,
            toolbar: toolbar
        }));
        else res.send(eejs.require("ep_codepad/templates/redirect.html", {
            url: fpr
        }));
    });
};