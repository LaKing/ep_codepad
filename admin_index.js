var eejs = require('ep_etherpad-lite/node/eejs')
  , padManager = require('ep_etherpad-lite/node/db/PadManager')
  , api = require('ep_etherpad-lite/node/db/API')
  , log4js = require('log4js')
  , logger = log4js.getLogger("plugin:codepad_adminpads")
  , queryLimit=12
;
RegExp.quote = require('regexp-quote')
var isNumeric=function(arg){
  return typeof(arg)=="number" || (typeof(arg) == "string" && parseInt(arg));
};

var pads={
  pads:[] ,
  search: function(query, callback){
    padManager.listAllPads(function(null_value, the_pads) {
      pads._do_search(the_pads.padIDs, query, callback);
    });
  },
  _do_search: function(pads, query, callback){
    logger.debug("Admin/Pad | Query is",query);
    var data={
        progress : 1
        , message: "Search done."
        , query: query
        , total: pads.length
      }
      , maxResult=0
      , result=[]
    ;
    
    if(query["pattern"] != null && query["pattern"] != ''){
      var pattern=query.pattern+"*";
      pattern=RegExp.quote(pattern);
      pattern=pattern.replace(/(\\\*)+/g,'.*');
      pattern="^"+pattern+"$";
      var regex=new RegExp(pattern,"i");
      pads.forEach(function(padID){
        if(regex.test(padID)){
          result.push(padID);
        }
      });
    }else{
      result=pads;
    }
    
    data.total=result.length;
    
    maxResult=result.length-1;
    if(maxResult<0)maxResult=0;
    
    if(!isNumeric(query.offset) || query.offset<0) query.offset=0;
    else if(query.offset>maxResult) query.offset=maxResult;
    
    if(!isNumeric(query.limit) || query.limit<0) query.limit=queryLimit;
    
    var rs=result.slice(query.offset, query.offset + query.limit);
    
    pads.pads=rs;
    
    var entryset;
    data.results=[];
    
    rs.forEach(function(value){
        entryset={padName:value, lastEdited:''};
        api.getLastEdited(value,function(err,resultObject){
            if(err==null){
                entryset.lastEdited=resultObject.lastEdited;
            }
            data.results.push(entryset);
        });
    });
    callback(data);
  }
};

exports.registerRoute = function (hook_name, args, cb) {
  args.app.get('/admin/pads', function(req, res) {
    
    var render_args = {
      errors: []
    };
    res.send( eejs.require("ep_codepad/templates/admin/pads.html", render_args) );
  });
};

var io = null;

exports.socketio = function (hook_name, args, cb) {
  io = args.io.of("/pluginfw/admin/pads");
  io.on('connection', function (socket) {
    if (!socket.handshake.session.user || !socket.handshake.session.user.is_admin) return;

    socket.on("load", function (query) {
      pads.search({pattern:'', offset:0, limit:queryLimit}, function (progress) {
        socket.emit("search-result", progress);
      });
    });

    socket.on("search", function (query) {
      pads.search(query, function (progress) {
        io.emit("progress",{progress:1});
        socket.emit("search-result", progress);
      });
    });

    socket.on("delete", function (padId) {
      padManager.doesPadExists(padId,function(err, padExists){
        //What if error occurs?
        if(err) return;
        if(padExists){
          //pad exists, remove
          padManager.getPad(padId,null,function(err,pad){
            pad.remove(function(){});
            socket.emit("progress",{progress:1});
          });
        }else{
          //pad does not exist - what now?
        }
      });
    });
  });
};

exports.updatePads=function(hook_name, args, cb){
  io.emit("progress",{progress:1});
};

exports.eejsBlock_adminMenu = function (hook_name, args, cb) {
  var hasAdminUrlPrefix = (args.content.indexOf('<a href="admin/') != -1)
    , hasOneDirDown = (args.content.indexOf('<a href="../') != -1)
    , hasTwoDirDown = (args.content.indexOf('<a href="../../') != -1)
    , urlPrefix = hasAdminUrlPrefix ? "admin/" : hasTwoDirDown ? "../../" : hasOneDirDown ? "../" : ""
  ;
  
  args.content = args.content + '<li><a href="'+ urlPrefix +'pads">Manage pads</a> </li>';
  return cb();
};
