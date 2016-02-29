// use this css class for highlighting
var cls = "active";

// on keypress send a message to the server
exports.aceKeyEvent = function(hook_name, args, cb) {
    var type = args.evt.type;
    var keyCode = args.evt.keyCode;
    var charCode = args.evt.charCode;
    var message = {};
    var line = 1 + args.rep.selStart[0];

    if (type === "keypress" && (charCode > 0 || keyCode == 13 || keyCode == 8)) {
        message.type = 'EDIT';
        message.padId = pad.getPadId();
        message.userId = pad.getUserId();
        message.line = line;
        pad.collabClient.sendMessage(message);
    }
};

// clear stuck numbers-highlights
setInterval(function() {
    var nums = $('iframe[name="ace_outer"]').contents().find('#sidediv').contents().find("#sidedivinner").contents();
    nums.each(function() {
        $(this).removeClass(cls);
    });
}, 5000);

// process message from server
exports.handleClientMessage_CUSTOM = function(hook, context) {
    // process only keypress messages and display only forign users
    if (context.payload.from == 'ace' && context.payload.userId !== pad.getUserId()) {

        //f = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().eq(context.payload.line - 1);
        // get the element to be highlighted
        e = $('iframe[name="ace_outer"]').contents().find('#sidediv').contents().find("#sidedivinner").contents().eq(context.payload.line - 1);
        e.addClass(cls);
        // and remove it quickly
        setTimeout(function() {
            e.removeClass(cls);
        }, 200);

    }

};