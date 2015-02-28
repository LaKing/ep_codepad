// TODO rewrite to include it like this
//var scrollToPadLine = require('ep_etherpad-lite/static/plugins/ep_codepad/static/js/pad_scrollto.js').scrollToPadLine;

// scrolltoPadLine should be a "global" function - currently used in static message.js, and in padsearch - for now defined twice
// https://github.com/JohnMcLear/ep_scrollto/blob/master/static/js/postAceInit.js
function scrollToPadLine(lineNumber) {
    var count = 1;
    if (lineNumber > 10) lineNumber = lineNumber - 10;
    else lineNumber = 1;

    $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().each(function() {
        if (count == lineNumber) {
            var newY = $(this).context.offsetTop + "px";
            var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");
            var $outerdocHTML = $('iframe[name="ace_outer"]').contents().find("#outerdocbody").parent();
            $outerdoc.animate({
                scrollTop: newY
            });

            // browser.mozilla is obsolete
            if (browser.mozilla || browser.firefox) $outerdocHTML.animate({
                scrollTop: newY
            }); // needed for FF     
            return false;
        }
        count++;
    });
}

// will get true only locally
push_by_this_user = false;

exports.handleClientMessage_CUSTOM = function(hook, context) {

    var hint = '';
    var hint_title = '';

    if (context.payload.from == 'jshint') {
        if (context.payload.errors) {

            var status = false;
            var idb = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody');

            context.payload.errors.forEach(function(err) {
                if (err) {

                    // brief console error log - presistent in the browser
                    console.info(" !: " + context.payload.padid + ":" + err.line + ":" + err.character + " " + err.reason + "|" + err.evidence);
                    // and on mouse over
                    hint_title += err.line + ":" + err.character + " " + err.reason + '\n';

                    if (!status) {
                        // display the first error on the top hint status bar
                        status = true;
                        hint = "js: " + err.line + ":" + err.character + " " + err.reason;
                        if (push_by_this_user) scrollToPadLine(err.line);
                    }

                    // a little delay, so the push-reply can refresh the text first
                    setTimeout(function() {
                        div = idb.find("div:nth-child(" + err.line + ")");
                        div.addClass("warn");
                        if (typeof div.attr("title") == "undefined") div.attr("title", err.reason);
                    }, 1000);

                    // setTimeout(function() {
                    // clear
                    //  $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody').find("*").removeClass('warn');
                    //  // and remove the attr title
                    // }, 10000);

                    // more detailed if you wish
                    //console.info(" ! " + padid + ":" + err.line + ":" + err.character + " " + err.reason + " !" + err.scope + "|" + err.evidence + "|" + err.id + "|" + err.code + "|" + err.raw);
                }
            });
        }
    }

    if (context.payload.from == 'fs') {
        if (context.payload.errors) {
            console.log(context.payload.padid + " fs: Error! " + JSON.stringify(context.payload.errors));
            hint += 'File Write failed! ' + JSON.stringify(context.payload.errors);
        }
    }

    if (context.payload.from == 'exec') {
        if (context.payload.errors) {
            console.log(context.payload.padid + " exec: Error! " + JSON.stringify(context.payload.errors));
            hint += 'Push action failed! ' + JSON.stringify(context.payload.errors);
        }
    }

    if (context.payload.from == 'push') {
        if (context.payload.errors) {
            console.log(context.payload.padid + " push: Blocked by " + context.payload.errors);
            if (context.payload.user == pad.getUserId()) hint += 'Push blocked by ' + context.payload.errors;
            else {
                if (context.payload.name) hint += 'Push attempt by ' + context.payload.name;
                else hint += 'Push attempt from ' + context.payload.user;
            }
        }
    }

    if (context.payload.from == 'codepad') {
        hint = "OK!";
        $('#status').addClass("ok");

        setTimeout(function() {
            $("#status").html('');
            $("#status").removeClass("ok");
            $("#status").removeClass("error");
        }, 5000);


    } else $('#status').addClass("error");

    if (hint !== '') $('#status').html(hint);
    if (hint_title !== '') $('#status').prop('title', hint_title);

    push_by_this_user = false;
};