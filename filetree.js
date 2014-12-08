// creates the filetree view

var eejs = require('ep_etherpad-lite/node/eejs');
var fs = require('fs');
var ext = require('ep_codepad/extensions');
var settings = require('ep_etherpad-lite/node/utils/Settings');

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

var canRead = function(path) {
    if (process.getgid && process.getuid) {
        // make sure files can be read ...
        var stats = fs.statSync(path);
        var perm = parseInt(stats.mode.toString(8), 10);
        var user = (perm % 1000) >= 400;
        var userx = (perm % 1000) >= 500;
        var group = (perm % 100) >= 40;
        var groupx = (perm % 100) >= 50;
        var world = (perm % 10) >= 4;
        var worldx = (perm % 10) >= 5;
        var inuid = stats.uid == process.getuid();
        var ingid = stats.gid == process.getgid();
        // directories must have an execute
        if (stats.isDirectory())
            return ((userx && ingid) || (groupx && ingid) || worldx);
        else
            return ((user && ingid) || (group && ingid) || world);

    } else {
        return true;
    }
};

exports.expressCreateFileTreeServer = function(hook_name, args, cb) {

    args.app.get('/files', function(req, res) {
        res.send(eejs.require("ep_codepad/templates/filetree.ejs", {
            abs: abs,
            theme: theme
        }));
    });

    args.app.get('/files_connector', function(req, res) {

        var dir = req.query.dir;

        var r = '<ul class="jqueryFileTree" style="display: none;">';
        try {

            if (canRead(abs + dir)) {
                var files = fs.readdirSync(abs + dir);
                files.forEach(function(f) {
                    var ff = dir + f;
                    if (canRead(abs + ff)) {
                        var stats = fs.statSync(abs + ff);
                        var ft = f;
                        if (ft.length > 25) ft = f.substring(0, 22) + "...";
                        if (stats.isDirectory()) {
                            r += '<li class="directory collapsed"><a href="/files" rel="' + ff + '/" title="' + ff + '">' + ft + '</a></li>';
                        } else {
                            r += '<li class="file ext_' + ext.getBrush(f) + '"><a href="/v' + ff + '" rel=' + ff + ' title="' + ff + '">' + ft + '</a></li>';
                        }
                    }
                });
                r += '</ul>';
            }
        } catch (e) {
            console.log("FileTreeServer error: " + e);
            r += 'ERR: ' + e;
            r += '</ul>';
        }

        res.send(r);
    });
};