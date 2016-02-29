// to quick-run files a single click on a filetree element
//exports.expressCreateFileRunServer = function(hook_name, args, cb) {};
//  -- UNDER CONSTRUCTION --
/*
var eejs = require('ep_etherpad-lite/node/eejs');
var fs = require('fs');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var ext = require('ep_codepad/extensions');

var sys = require('sys');
var execFile = require('child_process').execFile;
var exec = require('child_process').exec;
var child;

// abs - absolute part of the files path - the project path
var abs = '/tmp/';
// theme from settings
var theme = 'Default';

var run_cmd_prefix = '';
var run_cmd_postfix = '';

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
*/

exports.expressCreateFileRunServer = function(hook_name, args, cb) {
    /*
    args.app.get('/r/*', function(req, res) {

        // file path slice last character index
        var fpslc = req.url.length;

        // GET parameters not needed in path
        if (req.url.indexOf('?') > -1) fpslc = req.url.indexOf('?');

        // timeslider not needed in path
        if (req.url.substring(req.url.lastIndexOf('/'), fpslc) == "/timeslider") fpslc = req.url.lastIndexOf('/');

        // file path slice - folders/file only    
        var fps = req.url.slice(3, fpslc);

        var file = decodeURIComponent(fps);
        var path = abs + '/' + file;

        //  -- UNDER CONSTRUCTION -- 

        try {
            fs.exists(path, function(exists) {
                if (exists) {

                    var fxt = ext.getExtension(file);
                    if (fxt !== '') {
                        var cmd = '';

                        if (fxt == "js") cmd = "/bin/node";
                        if (fxt == "sh") cmd = "/bin/bash";
                        if (fxt == "php") cmd = "/bin/php";
                        if (fxt == "java") cmd = "/bin/java";
                        if (fxt == "rb" || fxt == "ruby") cmd = "/usr/bin/ruby-mri";

                        console.log("EXEC " + cmd, path);

                        if (cmd !== '') {
                            child = execFile(cmd, [path], {
                                timeout: 100,
                                uid: 1000,
                                gid: 1000
                            }, function(exec_error, stdout, stderr) {
                                console.log("CODEPAD EXEC " + exec_error + " " + stdout + " " + stderr);
                                var display = stdout;
                                if (stderr) display += "\n \n _____________ err ____________\n \n" + stderr;
                                if (exec_error !== stderr && exec_error !== null) display += "\n" + exec_error;

                                if (exec_error === null) {
                                    res.send(eejs.require("ep_codepad/templates/view.ejs", {
                                        uri: "/p/" + req.url.substring(3),
                                        code: display,
                                        file: file + " OK",
                                        theme: theme,
                                        cif: cif,
                                        brush: "plain"
                                    }));
                                } else {
                                    res.send(eejs.require("ep_codepad/templates/view.ejs", {
                                        uri: "/p/" + req.url.substring(3),
                                        code: display,
                                        file: file + " ERROR " + cmd + " " + path,
                                        theme: theme,
                                        cif: cif,
                                        brush: "plain"
                                    }));
                                }
                            });
                        } else {
                            res.send(eejs.require("ep_codepad/templates/view.ejs", {
                                uri: "#",
                                code: "Error! No interpreter assigned for " + fxt,
                                file: file,
                                theme: theme,
                                cif: cif,
                                brush: "plain"
                            }));
                        }
                    } else {
                        res.send(eejs.require("ep_codepad/templates/view.ejs", {
                            uri: "#",
                            code: "Error! No extension! Unable to determine interpreter.",
                            file: file,
                            theme: theme,
                            brush: "plain"
                        }));
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
            console.log("CODEPAD FileRunServer error: " + e);
            res.send(eejs.require("ep_codepad/templates/view.ejs", {
                uri: "#",
                code: "FileRunServer - Error! " + e,
                file: file,
                theme: theme,
                cif: cif,
                brush: "plain"
            }));
        }

    });
    */
};
//
//