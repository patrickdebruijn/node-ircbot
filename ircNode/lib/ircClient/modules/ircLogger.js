exports.log= function(level,message){
    level=level.toLowerCase();
    var msg;
    if(level=='error')msg=ircColor.bold.red("[ERROR]");
    else if(level=='warn')msg=ircColor.bold.brown("[WARN]");
    else if(level=='info')msg=ircColor.bold.gray("[INFO]");
    else if(level=='debug')msg=ircColor.bold.lightgray("[DEBUG]");
    else if(level=='trace')msg=ircColor.bold.lightgray("[TRACE]");

    if(cfg.development.debugModus && level!='debug' && level!='trace')modules['ircRequests'].fire("Say",[cfg.development.loggerChannel," "+msg+message]);
};

//Maak een listener voor bunyon

//var log = bunyan.createLogger({name: 'mylog', streams: [{path: LOG_PATH}]});
// log.on('error', function (err, stream) {
 // Handle stream write or create error here.
// });