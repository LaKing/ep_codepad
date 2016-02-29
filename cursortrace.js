/*
var crypto = require('crypto');
var padManager = require("ep_etherpad-lite/node/db/PadManager");
var fs = require('fs');

var settings = require('ep_etherpad-lite/node/utils/Settings');
var authorManager = require('ep_etherpad-lite/node/db/AuthorManager');
var sessionManager = require('ep_etherpad-lite/node/db/SessionManager');

var cb = function() {};
*/

exports.handleMessage = function(hook_name, context, callback) {
    /*
    if (context.message && context.message.data) {

        var msg = context.message.data.type;
        var uid = context.message.data.userId;
        var padid = context.message.data.padId;

        if (msg == "EDIT") {

            msg = {
                type: 'COLLABROOM',
                data: {
                    type: "EDIT",
                    payload: {
                        padId: padid,
                        from: "ace",
                        errors: frerr
                    }
                }
            };
            padMessageHandler.handleCustomObjectMessage(msg, undefined, cb);

        }


    }
*/
};