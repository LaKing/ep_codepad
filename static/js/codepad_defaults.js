exports.postAceInit = function (hook_name, args, cb) {

  pad.changeViewOption('showLineNumbers', true);
  pad.changeViewOption('noColors', false);
  pad.changeViewOption('rtlIsTrue', false);
  pad.changeViewOption('useMonospaceFont', true); //+ button.css
  pad.changeViewOption('showAuthorColors', false);


}


