var eejs = require('ep_etherpad-lite/node/eejs');
var padManager = require('ep_etherpad-lite/node/db/PadManager');
var padMessageHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler");
var api = require('ep_etherpad-lite/node/db/API');
var express = require('ep_etherpad-lite/node_modules/express');
var settings = require('ep_etherpad-lite/node/utils/Settings'); // Extend index for folder support. It will redirect to urlencoded path names. 
var fs = require('fs');
var util = require('util');
var ext = require('ep_codepad/extensions');

// abs - absolute part of the files path - the project path
var abs = '';
// theme from settings
var theme = 'Default';
// path for logfile
var log_path = '/var/log/http/error_log';

if (settings.ep_codepad) {
    if (settings.ep_codepad.project_path) {
        abs = settings.ep_codepad.project_path;
    }
    if (settings.ep_codepad.theme) {
        theme = settings.ep_codepad.theme;
    }
    if (settings.ep_codepad.log_path) {
        log_path = settings.ep_codepad.log_path;
    }
}

var canRead = function(path) {
    if (process.getgid && process.getuid) {
        // make sure files can be read ...
        stats = fs.statSync(path);
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



exports.expressCreateFolderServer = function(hook_name, args, cb) {
    args.app.get('/p/*', function(req, res) {
        // file path slice     
        var fps = req.url.slice(3, 250);
        // file path urlencoded     
        var fpu = encodeURIComponent(fps);
        // file path redirection     
        var fpr = '/p/' + fpu;
        if (fps.indexOf('/') === -1) res.send(eejs.require("ep_etherpad-lite/templates/pad.html", {
            req: req
        }));
        else res.send(eejs.require("ep_codepad/templates/redirect.html", {
            url: fpr
        }));
    });
};

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
                        if (stats.isDirectory()) {
                            r += '<li class="directory collapsed"><a href="/files" rel="' + ff + '/">' + f + '</a></li>';
                        } else {
                            var href = '/p' + ff;
                            if (!ext.extensionBrush(f)) href = '/v' + ff;
                            r += '<li class="file ext_' + ext.getExtension(f) + '"><a href="' + href + '" rel=' + ff + '>' + f + '</a></li>';
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

//https://github.com/broofa/node-mime
var mime = require('mime');
exports.expressCreateFileViewServer = function(hook_name, args, cb) {

    args.app.get('/v/*', function(req, res) {
        // file path slice     
        var fps = req.url.slice(3, 250);
        // file path urlencoded     
        var fpu = encodeURIComponent(fps);
        // file path read url
        var fpr = '/v/' + fpu;

        var file = decodeURIComponent(fps);
        var path = abs + '/' + file;

        try {
            fs.exists(path, function(exists) {
                if (exists) {

                    //var regex = '/png|jpg|jpeg|gif|bmp/';
                    //var match = regex.test(getExtension(file));
                    //if (['png', 'jpg', 'jpeg', 'gif'].indexOf(ext.getExtension(file)) >= 0) {
                    if (!ext.getBrush(path)) {
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
                            res.send(eejs.require("ep_codepad/templates/view.ejs", {
                                uri: '/p/' + fpu,
                                code: data,
                                file: file,
                                theme: theme,
                                brush: ext.getBrush(file)
                            }));
                        });
                    }

                } else {
                    res.send(eejs.require("ep_codepad/templates/view.ejs", {
                        uri: "/files",
                        code: "Error! No such file.",
                        file: file,
                        theme: theme,
                        brush: "plain"

                    }));
                }
            });
        } catch (e) {
            console.log("FileViewServer error: " + e);
            res.send("An error occured. " + e);
        }
    });
};

var defaultColors = ['#000', '#D00', '#00CF12', '#C2CB00', '#3100CA',
    '#E100C6', '#00CBCB', '#C7C7C7', '#686868', '#FF5959', '#00FF6B',
    '#FAFF5C', '#775AFF', '#FF47FE', '#0FF', '#FFF'
];

function term2html(text, options) {
    options = options || {};
    var colors = options.colors || defaultColors;

    // EL – Erase in Line: CSI n K.
    // Erases part of the line. If n is zero (or missing), clear from cursor to
    // the end of the line. If n is one, clear from cursor to beginning of the
    // line. If n is two, clear entire line. Cursor position does not change.
    text = text.replace(/^.*\u001B\[[12]K/mg, '');

    // CHA – Cursor Horizontal Absolute: CSI n G.
    // Moves the cursor to column n.
    text = text.replace(/^(.*)\u001B\[(\d+)G/mg, function(_, text, n) {
        return text.slice(0, n);
    });

    // SGR – Select Graphic Rendition: CSI n m.
    // Sets SGR parameters, including text color. After CSI can be zero or more
    // parameters separated with ;. With no parameters, CSI m is treated as
    // CSI 0 m (reset / normal), which is typical of most of the ANSI escape
    // sequences.
    var state = {
        bg: -1,
        fg: -1,
        bold: false,
        underline: false,
        negative: false
    };
    text = text.replace(/\u001B\[([\d;]+)m([^\u001B]+)/g, function(_, n, text) {
        // Update state according to SGR codes.
        n.split(';').forEach(function(code) {
            code = code | 0;
            if (code === 0) {
                state.bg = -1;
                state.fg = -1;
                state.bold = false;
                state.underline = false;
                state.negative = false;
            } else if (code === 1) {
                state.bold = true;
            } else if (code === 4) {
                state.underline = true;
            } else if (code === 7) {
                state.negative = true;
            } else if (code === 21) {
                state.bold = false;
            } else if (code === 24) {
                state.underline = false;
            } else if (code === 27) {
                state.negative = false;
            } else if (code >= 30 && code <= 37) {
                state.fg = code - 30;
            } else if (code === 39) {
                state.fg = -1;
            } else if (code >= 40 && code <= 47) {
                state.bg = code - 40;
            } else if (code === 49) {
                state.bg = -1;
            } else if (code >= 90 && code <= 97) {
                state.fg = code - 90 + 8;
            } else if (code >= 100 && code <= 107) {
                state.bg = code - 100 + 8;
            }
        });

        // Convert color codes to CSS colors.
        var bold = state.bold * 8;
        var fg, bg;
        if (state.negative) {
            fg = state.bg | bold;
            bg = state.fg;
        } else {
            fg = state.fg | bold;
            bg = state.bg;
        }
        fg = colors[fg] || '';
        bg = colors[bg] || '';

        // Create style element.
        var css = '';
        var style = '';
        if (bg) {
            style += 'background-color:' + bg + ';';
        }
        if (fg) {
            //style += 'color:' + fg + ';';
            css = "log_" + state.fg;
        }
        if (bold) {
            style += 'font-weight:bold;';
        }
        if (state.underline) {
            style += 'text-decoration:underline';
        }
        var html = text.
        replace(/&/g, '&amp;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;');

        // Return HTML for this section of formatted text.
        if (style || css) {
            if (style) return '<span class="' + css + '" style="' + style + '">' + html + '</span>';
            else return '<span class="' + css + '">' + html + '</span>';
        } else {
            return html;
        }
    });

    return text.replace(/\u001B\[.*?[A-Za-z]/g, '');
}

var exec = require("child_process").exec;

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("&nbsp;") + num;
}

exports.expressCreateCodepadServer = function(hook_name, args, cb) {

    args.app.get('/codepad', function(req, res) {
        res.send(eejs.require("ep_codepad/templates/codepad.ejs", {
            abs: "abs",
            theme: theme
        }));
    });

    args.app.get('/log', function(req, res) {

        try {
            fs.exists(log_path, function(exists) {
                if (exists && canRead(log_path)) {
                    fs.readFile(log_path, {
                        encoding: 'utf-8'
                    }, function(err, data) {
                        if (err) throw err;
                        console.log(data);

                        // eejs templates encode < & > therefore we assemble the html here and send it directly. 
                        var res_send = '';
                        res_send += '<!DOCTYPE html><head><title>log</title>';
                        res_send += '<script src="/static/plugins/ep_codepad/static/js/cookies.js" type="text/javascript"></script>';
                        res_send += '<link href="/static/plugins/ep_codepad/static/css/logcolors.css" rel="stylesheet" type="text/css" media="screen" />';
                        res_send += '<script type="text/javascript">';
                        res_send += 'window.onload=toBottom;';
                        res_send += 'function toBottom(){window.scrollTo(0, document.body.scrollHeight);}';
                        res_send += 'var theme = "' + theme + '";';
                        res_send += 'if (getCookie("codepad_theme") != "") theme = getCookie("codepad_theme");';
                        res_send += 'document.write(\'<link rel="stylesheet" type="text/css" href="/static/plugins/ep_codepad/static/css/aceTheme\'+theme+\'.css">\');';
                        res_send += '</script></head><body>';
                        if (data.length > 50000) res_send += " Truncated ... <br />" + term2html(data.substr(data.length - 50000)).replace(/[\r\n]/g, "<br />");
                        else res_send += term2html(data).replace(/[\r\n]/g, "<br />");
                        res_send += '</body></html>';
                        res.send(res_send);

                    });

                } else {
                    res.send("No log's available.");
                }
            });
        } catch (e) {
            console.log(" CodepadServer error: " + e);
        }
    });

    args.app.get('/sr', function(req, res) {

        //res.writeHead(200, {
        //    "Content-Type": "text/plain"
        //});

        //check params
        if (req.query.search === '' || typeof req.query.search === 'undefined') {
            res.send("Error. No search term.");
            return;
        }

        var offer = '';
        var hasOffer = false;
        if (req.query.offer !== '' && typeof req.query.offer !== 'undefined') {
            hasOffer = true;
            offer = req.query.offer;
        }

        var doReplace = false;
        var replace_file = '';
        var replace_term = '';
        if (req.query.replace !== '' && typeof req.query.replace !== 'undefined' && req.query.file !== '' && typeof req.query.file !== 'undefined') {
            replace_file = req.query.file;
            replace_term = req.query.replace;
            offer = req.query.replace;
            doReplace = true;
            hasOffer = true;
        }

        var execterm = '';

        if (doReplace) execterm = "sed -i 's/" + req.query.search + "/" + replace_term + "/g' " + abs + "/" + replace_file + " && ";
        execterm += "cd " + abs + " && find . | grep -irnF '" + req.query.search + "' *";



        console.log("/sr $ " + execterm);
        exec(execterm, function(err, data, stderr) {
            //exec(' grep -rnw ' + abs + ' -e "' + req.query.search + '"', function(err, data, stderr) {

            if (err) {
                console.log('sr-err: ', err);
            }

            //Print stdout/stderr to console
            //console.log(stdout);
            console.log(stderr);
            //res.write(stdout);
            //res.end();


            // eejs templates encode < & > therefore we assemble the html here and send it directly. 
            var res_send = '';
            res_send += '<!DOCTYPE html><head><title>log</title>';
            res_send += '<script src="/static/plugins/ep_codepad/static/js/cookies.js" type="text/javascript"></script>';
            res_send += '<link href="/static/plugins/ep_codepad/static/css/logcolors.css" rel="stylesheet" type="text/css" media="screen" />';
            res_send += '<script type="text/javascript">';
            res_send += 'window.onload=toBottom;';
            res_send += 'function toBottom(){window.scrollTo(0, document.body.scrollHeight);}';
            res_send += 'var theme = "' + theme + '";';
            res_send += 'if (getCookie("codepad_theme") != "") theme = getCookie("codepad_theme");';
            res_send += 'document.write(\'<link rel="stylesheet" type="text/css" href="/static/plugins/ep_codepad/static/css/aceTheme\'+theme+\'.css">\');';
            res_send += '</script></head><body>';
            //if (data.length > 50000) DATA += " Truncated ... " + data.substr(data.length - 50000).replace(/[\r\n]/g, "<br />");
            //else DATA += data.replace(/[\r\n]/g, "<br />");

            //DATA = DATA.replace(/[\r\n]/g, "");

            var lines = data.split('\n');
            if (lines.length === '0') res_send += "<b>" + req.query.search + " not found.</b>";
            var i_s = 0;
            if (lines.length > 350) {
                i_s = lines.length - 250;
                res_send += lines.length + " matches. Truncated ...<br />";
            }

            // current folder+file
            var c = '';

            for (var i = i_s; i < lines.length; i++) {
                // current line
                var l = lines[i];
                if (l.length < 2) continue;
                // index of folder+file|#+text seperation
                var v = l.indexOf(':');
                // index of line-counter
                var w = l.substring(v + 1).indexOf(':');
                // index of folder|filename seperaion
                var g = l.substring(0, v).lastIndexOf('/');

                if (isNaN(parseInt(l.substring(v + 1, v + w + 2)))) continue;
                // line indicator
                var tt = '<b><span class="line">' + zeroPad(parseInt(l.substring(v + 1, v + w + 2)), 5) + ': </span></b>';

                //current text
                var re = new RegExp(req.query.search, 'g');
                var sw = '<b><span class="term">' + req.query.search + '</span></b>';
                var t = l.substring(v + w + 2, 250).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(re, sw);

                // actual folder+file
                var ff = l.substring(0, v);

                if (c !== ff) {
                    res_send += '<br /><a href="/v/' + ff + '">' + ff.substring(0, g) + '<b>' + ff.substring(g) + '</b></a> - ' + sw;

                    // offer the replace action
                    if (hasOffer) res_send += ' - <a href="/sr?&search=' + req.query.search + '&replace=' + offer + '&file=' + ff + '">REPLACE ALL TO:</a> <span class="term">' + offer + '</span>';

                    res_send += '<br /><br />' + tt + t + '<br />';
                    c = ff;

                } else {
                    res_send += tt + t + '<br />';
                }



            }

            res_send += '</div></body></html>';
            res.send(res_send);
            //res.end();
        });

        //res.send("req.query: " + req.query.search);
    });
};

//var padManager = require("../ep_etherpad-lite/node/db/PadManager");

exports.padCreate = function(hook, context) {

    // get the full path
    var path = abs + '/' + context.pad.id; //'

    try {
        fs.exists(path, function(exists) {
            if (exists) {
                fs.readFile(path, {
                    encoding: 'utf-8'
                }, function(err, data) {
                    if (err) throw err;
                    // load file to pad
                    context.pad.setText(data);
                    // update client(s)
                    padManager.getPad(context.pad.id, null, function(err, value) {
                        if (err) throw err;
                        padMessageHandler.updatePadClients(value, function() {
                            console.log("@callback");
                        });
                    });
                });
            }
        });
    } catch (e) {
        console.log(" PadCreate error: " + e);
    }
};