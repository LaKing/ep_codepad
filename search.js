// search in all files - and offer a replace

var eejs = require('ep_etherpad-lite/node/eejs');
var padManager = require('ep_etherpad-lite/node/db/PadManager');
var padMessageHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler");
var exec = require("child_process").exec;
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

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("&nbsp;") + '#' + num;
}

exports.expressCreateSearchServer = function(hook_name, args, cb) {
    args.app.get('/sr', function(req, res) {

        var search_term = req.query.search;

        //check params
        if (search_term === '' || typeof search_term === 'undefined') {
            res.send("Error. No search term.");
            return;
        }

        var offer_term = '';
        var hasOffer = false;
        if (req.query.offer !== '' && typeof req.query.offer !== 'undefined') {
            hasOffer = true;
            offer_term = req.query.offer;
        }

        var doReplace = false;
        var replace_file = '';
        var replace_term = '';
        if (req.query.replace !== '' && typeof req.query.replace !== 'undefined' && req.query.file !== '' && typeof req.query.file !== 'undefined') {
            replace_file = req.query.file;
            replace_term = req.query.replace;
            offer_term = req.query.replace;
            doReplace = true;
            hasOffer = true;
        }

        // do some things in the pads
        if (doReplace)
            padManager.getPad(replace_file, null, function(err, value) {
                if (err) {
                    //console.log('sr-err: ', err);
                }

                var text = value.atext.text;

                var rex = new RegExp(search_term, 'g');

                var matches = text.match(rex);

                //console.log("[REPLACE IN PAD]: " + text);
                value.setText(text.replace(rex, replace_term));

                padMessageHandler.updatePadClients(value, cb);
            });

        var execterm = '';
        // replace in files

        if (doReplace) execterm = "sed -i 's/" + search_term + "/" + replace_term + "/g' " + abs + "/" + replace_file + " && ";
        execterm += "cd " + abs + " && find . | grep -irnF '" + search_term + "' *";

        console.log("CODEPAD SEARCH " + execterm);
        exec(execterm, function(err, data, stderr) {
            //exec(' grep -rnw ' + abs + ' -e "' + search_term + '"', function(err, data, stderr) {

            if (err) {
                //console.log('sr-err: ', err);

            }

            //Print stdout/stderr to console
            //console.log(stdout);
            //console.log(stderr);
            //res.write(stdout);
            //res.end();


            // we assemble the html here and send it directly. 
            var res_send = ''; //'
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

            var lines = data.split('\n');
            if (lines.length === '0') res_send += "<b>" + search_term + " not found.</b>";
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

                // skip binary files (where line number is NaN)
                if (isNaN(parseInt(l.substring(v + 1, v + w + 2)))) continue;

                // actual folder+file
                var ff = l.substring(0, v);
                // actual linenumber
                var no = parseInt(l.substring(v + 1, v + w + 2));

                // line indicator
                var tt = '<b><a href="/p/' + ff + '?line=' + no + '" style="text-decoration: none">' + zeroPad(no, 5) + '</a> </b>';

                //current text
                var re = new RegExp(search_term, 'g');
                var sw = '<b><span class="term">' + search_term + '</span></b>';
                var t = l.substring(v + w + 2, 250).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(re, sw);

                if (c !== ff) {
                    res_send += '<br /><a href="/v/' + ff + '">' + ff.substring(0, g) + '<b>' + ff.substring(g) + '</b></a> - ' + sw;

                    // offer_term the replace action
                    if (hasOffer) res_send += ' - <a href="/sr?&search=' + search_term + '&replace=' + offer_term + '&file=' + ff + '">REPLACE ALL TO:</a> <span class="term">' + offer_term + '</span>';

                    res_send += '<br /><br />' + tt + t + '<br />';
                    c = ff;

                } else {
                    res_send += tt + t + '<br />';
                }
            }

            res_send += "<br /><br /> " + lines.length + " matches.";
            if (lines.length > 350) {
                res_send += " Truncated.";
            }

            res_send += '</div></body></html>';
            res.send(res_send);
            //res.end();
        });

        //res.send("req.query: " + search_term);
    });
};