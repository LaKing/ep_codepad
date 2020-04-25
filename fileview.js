// to quick-view files a single click on a filetree element

var eejs = require('ep_etherpad-lite/node/eejs');
var fs = require('fs');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var ext = require('ep_codepad/extensions');

// abs - absolute part of the files path - the project path
var abs = '/tmp/';
// theme from settings
var theme = 'Default';
var cif = '';
if (settings.ep_codepad) {
    if (settings.ep_codepad.project_path) {
        abs = settings.ep_codepad.project_path;
    }
    if (settings.ep_codepad.theme) {
        theme = settings.ep_codepad.theme;
    }
    if (settings.ep_codepad.installation_folder) {
        cif = settings.ep_codepad.installation_folder;
    }
}


//https://github.com/broofa/node-mime
var mime = require('mime');
exports.expressCreateFileViewServer = function(hook_name, args, cb) {

    args.app.get('/v/*', function(req, res) {
        // file path slice
        var fps = req.url.slice(3, 250);

        // TODO remove GET params

        // file path urlencoded
        var fpu = encodeURIComponent(fps);
        // file path read url
        var fpr = '/v/' + fpu;

        var file = decodeURIComponent(fps);
        var path = abs + '/' + file;

        try {
            fs.exists(path, function(exists) {
                if (exists) {
                    if (!ext.getBrush(path) && mime.lookup(path) !== 'application/octet-stream') {
                        fs.readFile(path, function(err, data) {
                            if (err) throw err;
                            res.set('Content-Type', mime.lookup(path) || ".txt");
                            res.send(data);
                        });

                    } else {
                        fs.readFile(path, {
                            encoding: 'utf-8'
                        }, function(err, data) {
                            if (err) throw err;
                            res.send(eejs.require("ep_codepad/templates/view.ejs", {
                                uri: '/p/' + fpu,
                                code: data,
                                file: file,
                                theme: theme,
                                cif: cif,
                                brush: ext.getBrush(file)
                            }));
                        });
                    }

                } else {
                    res.send(eejs.require("ep_codepad/templates/view.ejs", {
                        uri: "#",
                        code: "Error! No such file.",
                        file: file,
                        theme: theme,
                        cif: cif,
                        brush: "plain"

                    }));
                }
            });
        } catch (e) {
            console.log("FileViewServer error: " + e);

            res.send(eejs.require("ep_codepad/templates/view.ejs", {
                uri: "#",
                code: "FileViewServer - Error! " + e,
                file: file,
                theme: theme,
                cif: cif,
                brush: "plain"
            }));
        }
    });
};
