var crypto = require('crypto');
var padManager = require("ep_etherpad-lite/node/db/PadManager");
var fs = require('fs');

var settings = require('ep_etherpad-lite/node/utils/Settings');
var authorManager = require('ep_etherpad-lite/node/db/AuthorManager');
var sessionManager = require('ep_etherpad-lite/node/db/SessionManager');

// this should be overridden in codepad conf
var project_path = '/tmp/';

if (!settings.ep_codepad) {
    console.log(" Codepad needs ep_codepad parameters in settings.json.");
} else {
    if (!settings.ep_codepad.project_path) {
        console.log(" No ep_codepad.project_path set in settings.json.");
    } else project_path = settings.ep_codepad.project_path + "/";
}

// messages constants
var msg_push = 'PUSH_TO_FILESYSTEM';
var msg_write = 'WRITE_TO_FILESYSTEM';
var msg_read = 'READ_FROM_FILESYSTEM';

// code beutifier
var beautify = require('js-beautify').js_beautify;
var beautify_css = require('js-beautify').css;
var beautify_html = require('js-beautify').html;

var exec = require("child_process").exec;

var getBrush = require('./extensions.js').getBrush;

// code syntax checker
var jshint = require('jshint').JSHINT;
        var cb = function() {};
var padMessageHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler");

                var send_ok = function(padid)
                {
                        var ok_msg = {
                            type: 'COLLABROOM',
                            data: {
                                type: "CUSTOM",
                                payload: {
                                    padId: padid,
                                    from: "codepad",
                                    errors: null
                                }
                            }
                        };
                        padMessageHandler.handleCustomObjectMessage(ok_msg, undefined, cb);       
                };

exports.handleMessage = function(hook_name, context, callback) {

    if (context.message && context.message.data) {

        var msg = context.message.data.type;
        console.log("MSG: " + msg);

        if (msg == msg_read) {
            padManager.getPad(context.message.data.padId, null, function(err, value) {

                var padid = context.message.data.padId;
                var path = project_path + padid;
                // remove newline character from the end of the string.
                var text = value.atext.text.slice(0, -1);

                fs.readFile(path, function(err, data) {
                    if (err) {
                        // notify user about the read error
                        console.log("codepad-read-error " + path);
                        var err_msg = {
                            type: 'COLLABROOM',
                            data: {
                                type: "CUSTOM",
                                payload: {
                                    padId: padid,
                                    from: "fs",
                                    errors: err
                                }
                            }
                        };
                        padMessageHandler.handleCustomObjectMessage(err_msg, undefined, cb);
                        callback(null);
                    } else {
                        var adat = data.toString();
                        if (adat !== text) {
                            value.setText(adat);
                            padMessageHandler.updatePadClients(value, cb);
                        }
                        send_ok(padid);
                    }
                });
            });
            callback(null);
        }
        if (msg == msg_write || msg == msg_push) {

            padManager.getPad(context.message.data.padId, null, function(err, value) {

                var padid = context.message.data.padId;
                var padsi = padid.indexOf('/');
                var folder = '';

                // since EEXISTS is an error, we skip that error
                // there will be a message if the write failes anyway
                mkdir_err = function(err) {};

                // create subfolders
                while (padsi > 0) {
                    folder = padid.substring(0, padsi);
                    fs.mkdir(project_path + folder, mkdir_err);
                    padsi = padid.indexOf('/', 1 + folder.length);
                }

                // full path to write the file to
                var path = project_path + padid;
                // get the file extension/brush
                var ext = getBrush(padid);

                // if all ok, send only one OK message.
                var all_is_ok = true;

                // the beutified or the raw text of the pad
                // remove newline character from the end of the string.
                var text = value.atext.text.slice(0, -1);
                var beat = text;
                    
                // if .js file beautify
                if (ext == 'js') {
                    //check for missing semiciolons forst
                    if (msg == msg_push && !jshint(text)) {

                        // determine if semicolons should be added at the end of line
                        var check = function(errors, line, length) {
                            var count = 0;
                            var chpos = 0;
                            errors.forEach(function(err) {
                                if (err) {
                                    // err.line range is 1..n while line is 1..m
                                    if (err.line == line + 1) {
                                        count++;
                                        if (err.code == 'W033') chpos = err.character;
                                        // TODO ... maybe it should abort the whole process if there was another error
                                    }
                                }
                            });

                            if (count === 1 && chpos !== 0 && length < chpos) return true;
                            else return false;
                        };


                        // Add the semicolons
                        var lines = text.split('\n');
                        beat = '';

                        for (var i = 0; i < lines.length; i++) {
                            //code here using lines[i] which will give you each line
                            if (check(jshint.errors, i, lines[i].length))
                                beat += lines[i] + ';' + '\n';
                            else beat += lines[i] + '\n';
                        }
                    }
                                        
                    // if push and jshint said ok, then beautify text for real
                    if (msg == msg_push && jshint(text)) beat = beautify(text, {
                        indent_size: 4
                    });
                    
                    // re-check the new beautified code
                    if (!jshint(beat)) {

                        // still has errors, we put them to the console log on the server
                        jshint.errors.forEach(function(err) {
                            if (err) {
                                console.info(" ! " + padid + ":" + err.line + ":" + err.character + " " + err.reason + "|" + err.evidence);
                                // more detailed if you wish
                                //console.info("  ! " + padid + ":" + err.line + ":" + err.character + " " + err.reason +  " !" + err.scope + "|" + err.evidence + "|" + err.id + "|" + err.code +  "|" + err.raw);
                            }
                        });

                        all_is_ok = false;
                        var err_msg = {
                            type: 'COLLABROOM',
                            data: {
                                type: "CUSTOM",
                                payload: {
                                    padId: padid,
                                    from: "jshint",
                                    errors: jshint.errors
                                }
                            }
                        };
                        padMessageHandler.handleCustomObjectMessage(err_msg, undefined, cb);

                    } 
                }

                // if .css file beautify
                if (ext == 'css' && msg == msg_push) {
                    beat = beautify_css(text, {
                        indent_size: 4
                    });
                }

                // if .html file beautify
                if (ext == 'xml' && msg == msg_push) {
                    beat = beautify_html(text, {
                        indent_size: 4
                    });
                }
                
                // text and beat may be different, depending on jsHint and the beutifier
                if (text !== beat) {
                    value.setText(beat);
                    padMessageHandler.updatePadClients(value, cb);
                }

                // WRITE to the FILE
                fs.writeFile(path, beat, function(err) {
                    if (err) {
                        all_is_ok = false;
                        console.log("Failed to write text to " + path);
                        var err_msg = {
                            type: 'COLLABROOM',
                            data: {
                                type: "CUSTOM",
                                payload: {
                                    padId: padid,
                                    from: "fs",
                                    errors: err
                                }
                            }
                        };
                        padMessageHandler.handleCustomObjectMessage(err_msg, undefined, cb);
                    } else {
                        console.log("Wrote pad contents to " + path);
                        
                        // if push_action is defined in settings.json, it will run here, use it for git/svn/hg ... or whatever.
                        if (settings.ep_codepad && msg == msg_push) {
                            if (settings.ep_codepad.push_action) {
                                exec(settings.ep_codepad.push_action, function(exec_err, stdout, stderr) {
                                    if (stdout) console.log("[codepad] push_action stdout: " + stdout);
                                    if (stderr) console.log("[codepad] push_action stderr: " + stderr);
                                    if (exec_err) {
                                        console.log('[codepad] push_action !error: ', exec_err);
                                        var err_msg = {
                                            type: 'COLLABROOM',
                                            data: {
                                                type: "CUSTOM",
                                                payload: {
                                                    padId: padid,
                                                    from: "exec",
                                                    errors: exec_err
                                                }
                                            }
                                        };
                                        padMessageHandler.handleCustomObjectMessage(err_msg, undefined, cb);
                                    } else if (all_is_ok) send_ok(padid);
                                });
                            } else if (all_is_ok) send_ok(padid);
                        } else if (all_is_ok) send_ok(padid);
                    }
                });
            });
            callback(null);
        } //END if (msg == msg_write || msg == msg_push)
    } //END if (context.message && context.message.data)
    callback();
}; //END exports.handleMessage

/// jshint - quickhelp
/* An example from err.

                    "id": "(error)",
                    "raw": "Missing semicolon.",
                    "code": "W033",
                    "evidence": "  };",
                    "line": 6,
                    "character": 5,
                    "scope": "(main)",
                    "reason": "Missing semicolon."

           *****/

