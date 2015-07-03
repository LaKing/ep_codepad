// Extend index for folder support. It will redirect to urlencoded path names. 
var fs = require('fs');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var padManager = require("ep_etherpad-lite/node/db/PadManager");
var padMessageHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler");

// abs - absolute part of the files path - the project path
var abs = '/tmp/';

if (settings.ep_codepad) {
    if (settings.ep_codepad.project_path) {
        abs = settings.ep_codepad.project_path;
    }
}

var err_msg = {};

//var padManager = require("../ep_etherpad-lite/node/db/PadManager");

exports.padCreate = function(hook, context) {

    // get the full path
    var path = abs + '/' + context.pad.id;

    try {
        //fs.exists(path, function(exists) {
        //    if (exists) {
        fs.readFile(path, {
            encoding: 'utf-8'
        }, function(err, data) {
            if (!err) {
                console.log("CODEPAD - INIT PAD - read: " + path);
                // load file to pad
                context.pad.setText(data);
                // update client(s)
                padManager.getPad(context.pad.id, null, function(error, value) {
                    if (error) throw error;
                    padMessageHandler.updatePadClients(value, function() {});
                });
            } else {
                console.log("CODEPAD ERR - INIT PAD FAILED to read: " + path);
                var cb = function() {};
                err_msg = {
                    type: 'COLLABROOM',
                    data: {
                        type: "CUSTOM",
                        payload: {
                            padId: context.pad.id,
                            from: "fs",
                            errors: err
                        }
                    }
                };
                padMessageHandler.handleCustomObjectMessage(err_msg, undefined, cb);

                //throw err;
            }
        });
        //}
        //});
    } catch (e) {
        console.log(" PadCreate error: " + e);
    }
};

//EOF