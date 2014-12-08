// display formatted logs 

var eejs = require('ep_etherpad-lite/node/eejs');
var fs = require('fs');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var stream = require('stream');
var readline = require('readline');
// abs - absolute part of the files path - the project path
var abs = '/tmp/';
// theme from settings
var theme = 'Default';
// path for logfile
var log_path = '/tmp/log';

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

// note, this is used in filetree too. TODO remove this duplicate
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

// TODO add to theme
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

exports.expressCreateLogViewServer = function(hook_name, args, cb) {
    args.app.get('/log', function(req, res) {

        try {
            fs.exists(log_path, function(exists) {
                if (exists && canRead(log_path)) {

                    var instream = fs.createReadStream(log_path);
                    var outstream = new stream();
                    var rl = readline.createInterface(instream, outstream);
                    var data = '';

                    rl.on('line', function(line) {
                        // process line here 
                        data += line + '\n';
                    });

                    rl.on('close', function() { // do something on finish here 


                        var res_send = '';
                        res_send += '<!DOCTYPE html><head><title>log</title>';
                        res_send += '<script src="/static/plugins/ep_codepad/static/js/cookies.js" type="text/javascript"></script>';
                        res_send += '<link href="/static/plugins/ep_codepad/static/css/logcolors.css" rel="stylesheet" type="text/css" media="screen" />';
                        res_send += '<script type="text/javascript">';
                        res_send += 'window.onload=toBottom;';
                        res_send += 'function toBottom(){window.scrollTo(0, document.body.scrollHeight);}';
                        res_send += 'var theme = "' + theme + '";';
                        res_send += 'if (getCookie("codepad_theme") != "") theme = getCookie("codepad_theme");';
                        res_send += 'document.write(\'<link rel="stylesheet" type="text/css" href="/static/plugins/ep_codepad/static/css/theme/\'+theme+\'.css">\');';
                        res_send += '</script></head><body>';
                        if (data.length > 50000) res_send += " Truncated ... <br /> ... " + term2html(data.substr(data.length - 50000)).replace(/[\r\n]/g, "<br />");
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


};