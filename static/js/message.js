exports.handleClientMessage_CUSTOM = function(hook, context) {

    console.log("&&& " + JSON.stringify(context));
    // TODO if from jsHint
    var hint = ''; //= $('#status').html();

    if (context.payload.from == 'jshint') {

        jsHintErrors = undefined;
        var status = null;

        if (context.payload.errors) {

            jsHintErrors = context.payload.errors;
            jsHintProcessLine = 0;

            //context.payload.errors.
            jsHintErrors.forEach(function(err) {
                if (err) {
                    //console.log("@err "+err);

                    if (!status) {
                        // display the first error
                        status = err.line + ":" + err.character + " " + err.reason;
                        hint += status + ' ';
                    }

                    console.info(" !: " + err.line + ":" + err.character + " " + err.reason + "|" + err.evidence);
                    // more detailed if you wish
                    //console.info(" ! " + padid + ":" + err.line + ":" + err.character + " " + err.reason + " !" + err.scope + "|" + err.evidence + "|" + err.id + "|" + err.code + "|" + err.raw);
                }
            });
        } else {
            console.log("jshint: OK");
            hint += 'OK';
        }
    }

    if (context.payload.from == 'fs') {
        if (context.payload.errors) {
            console.log("fs: Error! " + JSON.stringify(context.payload.errors));
            hint += 'File Write failed! ' + JSON.stringify(context.payload.errors);
        } else {
            console.log("fs: OK");
        }
    }
    if (hint !== '') $('#status').html(hint);
    setTimeout(function() {
        $("#status").html('');
    }, 5000);
};

// to test periodically, I used this test
// while true; do ssh root@d250.hu "ssh pad.d250.hu rc" && sleep 2 && firefox --private https://dev.pad.d250.hu/p/test.js; done
//  while true; do ssh root@d250.hu "ssh pad.d250.hu rc" && sleep 2 && firefox --private -jsconsole https://dev.pad.d250.hu/p/test.js; do