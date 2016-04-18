exports.postAceInit = function(hook_name, args, cb) {

    pad.changeViewOption('showLineNumbers', true);
    pad.changeViewOption('noColors', false);
    pad.changeViewOption('rtlIsTrue', false);
    pad.changeViewOption('useMonospaceFont', true); //+ button.css
    pad.changeViewOption('showAuthorColors', false);

    var message = {};
    message.type = 'CHECK_ON_FILESYSTEM';
    message.padId = pad.getPadId();
    pad.collabClient.sendMessage(message);
};