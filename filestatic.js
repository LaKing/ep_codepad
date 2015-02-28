// to quick-view files a single click on a filetree element

var eejs = require('ep_etherpad-lite/node/eejs');
var fs = require('fs');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var ext = require('ep_codepad/extensions');

// abs - absolute part of the files path - the project path
var abs = '/tmp/';
// theme from settings
var theme = 'Default';

if (settings.ep_codepad) {
    if (settings.ep_codepad.project_path) {
        abs = settings.ep_codepad.project_path;
    }
    if (settings.ep_codepad.theme) {
        theme = settings.ep_codepad.theme;
    }
}


//https://github.com/broofa/node-mime
var mime = require('mime');
exports.expressCreateFileStaticViewServer = function(hook_name, args, cb) {

    args.app.get('/s/*', function(req, res) {
        // file path slice     
        var fps = req.url.slice(3, 250);
        // file path urlencoded     
        var fpu = encodeURIComponent(fps);
        // file path read url
        var fpr = '/s/' + fpu;

        var file = decodeURIComponent(fps);
        var path = abs + '/' + file;

        try {
            fs.exists(path, function(exists) {
                if (exists) {
                    if (!ext.getBrush(path) && mime.lookup(path) !== 'application/octet-stream') {
                        fs.readFile(path, function(err, data) {
                            if (err) throw err;
                            res.set('Content-Type', mime.lookup(path));
                            res.send(data);
                        });

                    } else {
                        fs.readFile(path, {
                            encoding: 'utf-8'
                        }, function(err, data) {
                            if (err) throw err;
                            res.send(data);
                        });
                    }

                } else {
                    res.send(eejs.require("ep_codepad/templates/view.ejs", {
                        uri: "#",
                        code: "Error! No such file.",
                        file: file,
                        theme: theme,
                        brush: "plain"

                    }));
                }
            });
        } catch (e) {
            console.log("FileViewServer error: " + e);
            res.send(eejs.require("ep_codepad/templates/view.ejs", {
                uri: "#",
                code: "FileStaticViewServer - Error! " + e,
                file: file,
                theme: theme,
                brush: "plain"
            }));
        }
    });
};