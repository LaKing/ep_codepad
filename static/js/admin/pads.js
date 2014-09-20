exports.documentReady=function(hooks, context, cb){
  
  if(context != 'admin/pads') return cb;
  
  var socket,
  loc = document.location,
  port = loc.port == "" ? (loc.protocol == "https:" ? 443 : 80) : loc.port,
  url = loc.protocol + "//" + loc.hostname + ":" + port + "/",
  pathComponents = location.pathname.split('/'),
  // Strip admin/plugins
  baseURL = pathComponents.slice(0,pathComponents.length-2).join('/') + '/',
  resource = baseURL.substring(1) + "socket.io";

  //connect
  socket = io.connect(url, {resource : resource}).of("/pluginfw/admin/pads");

  $('.search-results').data('query', {
    pattern: '',
    offset: 0,
    limit: 12,
  });

  var doUpdate = false;
  var doAutoUpdate=function(){
    return $('#results-autoupdate').attr('checked')==='checked';
  };

  var search = function () {
    socket.emit("search", $('.search-results').data('query'));
  };

  var submitSearch=function () {
    var query = $('.search-results').data('query');
    query.pattern = $("#search-query")[0].value;
    query.offset = 0;
    search();
  };
  
  var isInt=function(input){
    return typeof input === 'number' && input % 1 == 0;
  };
  
  var formatDate=function(longtime){
    var formattedDate='';
    if(longtime!=null && isInt(longtime)){
        var date=new Date(longtime);
        var month=date.getMonth()+1;
        formattedDate=date.getFullYear()+'-'+fillZeros(month)+'-'+fillZeros(date.getDay())+' '+fillZeros(date.getHours())+':'+fillZeros(date.getMinutes())+':'+fillZeros(date.getSeconds());
    }
    return formattedDate;
  };
  
  var fillZeros=function(fillForm){
    return isInt(fillForm) ? ( fillForm < 10 ? '0' + fillForm : fillForm) : '';
  };
  
  function updateHandlers() {
    $("#progress.dialog .close").unbind('click').click(function () {
      $("#progress.dialog").hide();
    });

    $("#search-form").unbind('submit').bind('submit', function(e){
      e.preventDefault();
      submitSearch();
    });
    
    $("#do-search").unbind('click').click(submitSearch);

    $(".do-delete").unbind('click').click(function (e) {
      var row = $(e.target).closest("tr");
      var padID=row.find(".padname").text();
      if(confirm("Do you really want to delete the pad '"+padID+"' ?")){
        doUpdate = true;
        socket.emit("delete", padID);
      }
    });

    $(".do-prev-page").unbind('click').click(function (e) {
      var query = $('.search-results').data('query');
      query.offset -= query.limit;
      if (query.offset < 0) {
        query.offset = 0;
      }
      search();
    });
    $(".do-next-page").unbind('click').click(function (e) {
      var query = $('.search-results').data('query');
      var total = $('.search-results').data('total');
      if (query.offset + query.limit < total) {
        query.offset += query.limit;
      }
      search();
    });
  }

  updateHandlers();

  socket.on('progress', function (data) {
    console.log(data);
    $("#progress .close").hide();
    $("#progress").show();

    $('#progress').data('progress', data.progress);

    var message = "Unknown status";
    if (data.message) {
      message = "<span class='status'>" + data.message.toString() + "</span>";
    }
    if (data.error) {
      message = "<span class='error'>" + data.error.toString() + "<span>";            
    }
    $("#progress .message").html(message);

    if (data.progress >= 1) {
      if (data.error) {
        $("#progress").show();
      } else {
        if (doUpdate || doAutoUpdate()) {
          doUpdate = false;
          socket.emit("load");
        }
        $("#progress").hide();
      }
    }
  });

  socket.on('search-result', function (data) {
    var widget=$(".search-results")
      , limit = data.query.offset + data.query.limit
    ;
    if(limit > data.total)limit=data.total;

    widget.data('query', data.query);
    widget.data('total', data.total);

    widget.find('.offset').html(data.query.offset);
    widget.find('.limit').html(limit);
    widget.find('.total').html(data.total);

    widget.find(".results *").remove();
    var resultList=widget.find('.results');
    
    data.results.forEach(function(resultset) {
      var padName=resultset.padName;
      var lastEdited=resultset.lastEdited;
      var row = widget.find(".template tr").clone();
      row.find(".padname").html('<a href="../p/'+padName+'">'+padName+'</a>');
      row.find(".last-edited").html(formatDate(lastEdited));
      resultList.append(row);
    });

    updateHandlers();
  });

  socket.emit("load");
  search();
  return cb;
};
