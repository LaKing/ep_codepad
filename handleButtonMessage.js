var crypto = require('crypto');
var padManager = require("ep_etherpad-lite/node/db/PadManager");
var fs = require('fs');



// read base project folder from settings.json
var settings = require('ep_etherpad-lite/node/utils/Settings');
var authorManager = require('ep_etherpad-lite/node/db/AuthorManager');
var sessionManager = require('ep_etherpad-lite/node/db/SessionManager');

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

var padMessageHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler");


exports.handleMessage = function(hook_name, context, callback) {

    if (context.message && context.message.data) {

        var cb = function() {};

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
                        console.log("codepad-read-error " + path);
                    }

                    var adat = data.toString();
                    if (adat !== text) {
                        value.setText(adat);
                        padMessageHandler.updatePadClients(value, cb);
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
                // TODO, use mkdirP ?
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

                // the beutified text of the pad

                // remove newline character from the end of the string.
                var beat = value.atext.text.slice(0, -1);


                // if .js file beautify
                if (ext == 'js') {
                    if (msg == msg_push) beat = beautify(beat, {
                        indent_size: 4
                    });


                    //padMessageHandler.updatePadClients(value, cb);

                    if (!jshint(beat)) {

                        // determine if semicolons should be added at the end of line
                        check = function(errors, line, length) {
                            var count = 0;
                            var chpos = 0;
                            errors.forEach(function(err) {
                                if (err) {
                                    // err.line range is 1..n while line is 1..m
                                    if (err.line == line + 1) {
                                        count++;
                                        if (err.code == 'W033') chpos = err.character;
                                    }
                                }
                            });


                            if (count == 1 && chpos !== 0 && length < chpos) return true;
                            else return false;
                        };


                        // Add the semicolons
                        var lines = beat.split('\n');
                        beat = '';

                        for (var i = 0; i < lines.length; i++) {
                            //code here using lines[i] which will give you each line
                            if (check(jshint.errors, i, lines[i].length))
                                beat += lines[i] + ';' + '\n';
                            else beat += lines[i] + '\n';
                        }
                    }
                    // re-check the new beautified code
                    if (!jshint(beat)) {

                        jshint.errors.forEach(function(err) {
                            if (err) {
                                console.info(" ! " + padid + ":" + err.line + ":" + err.character + " " + err.reason + "|" + err.evidence);
                                // more detailed if you wish
                                //console.info("  ! " + padid + ":" + err.line + ":" + err.character + " " + err.reason +  " !" + err.scope + "|" + err.evidence + "|" + err.id + "|" + err.code +  "|" + err.raw);
                            }
                        });

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

                    } else {
                        var ok_msg = {
                            type: 'COLLABROOM',
                            data: {
                                type: "CUSTOM",
                                payload: {
                                    padId: padid,
                                    from: "jshint",
                                    errors: null
                                }
                            }
                        };
                        padMessageHandler.handleCustomObjectMessage(ok_msg, undefined, cb);
                    }

                    if (msg == msg_push) value.setText(beat);
                    padMessageHandler.updatePadClients(value, cb);
                }

                // if .css file beautify
                if (ext == 'css' && msg == msg_push) {
                    beat = beautify_css(beat, {
                        indent_size: 4
                    });
                    value.setText(beat);
                    padMessageHandler.updatePadClients(value, cb);
                }

                // if .html file beautify
                if (ext == 'xml' && msg == msg_push) {
                    beat = beautify_html(beat, {
                        indent_size: 4
                    });
                    value.setText(beat);
                    padMessageHandler.updatePadClients(value, cb);
                }

                // WRITE to the FILE
                fs.writeFile(path, beat, function(err) {
                    if (err) {
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
                        var ok_msg = {
                            type: 'COLLABROOM',
                            data: {
                                type: "CUSTOM",
                                payload: {
                                    padId: padid,
                                    from: "fs",
                                    errors: null
                                }
                            }
                        };
                        padMessageHandler.handleCustomObjectMessage(ok_msg, undefined, cb);
                        // if push_action is defined in settings.json, it will run here, use it for git/svn/hg ... or whatever.
                        if (settings.ep_codepad && msg == msg_push) {
                            if (settings.ep_codepad.push_action) {
                                exec(settings.ep_codepad.push_action, function(exec_err, stdout, stderr) {
                                    if (exec_err) {
                                        console.log('codepad-push-error: ', exec_err);
                                        var err_msg = {
                                            type: 'COLLABROOM',
                                            data: {
                                                type: "CUSTOM",
                                                payload: {
                                                    padId: padid,
                                                    from: "fs",
                                                    errors: exec_err
                                                }
                                            }
                                        };
                                        padMessageHandler.handleCustomObjectMessage(err_msg, undefined, cb);
                                    }
                                    if (stdout) console.log("codepad-push-stdout: " + stdout);
                                    if (stderr) console.log("codepad-push-stderr: " + stderr);
                                });
                            }
                        }
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