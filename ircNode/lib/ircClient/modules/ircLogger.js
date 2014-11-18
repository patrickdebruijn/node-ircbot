
exports.log = function (level, message, context, subject) {

    if(context==undefined)context='CORE';

    var ccontext = ircColor.bold('['+context.toUpperCase()+']');

    if(subject!=undefined)
        message = '['+subject.toUpperCase()+']'+message;

    switch(level = level.toLowerCase()){
        case 'fatal':
            log.fatal("["+context+"]"+message);
            message = ircColor.bgred(ircColor.bold("[FATAL]")+ccontext+message);
        case 'error':
            log.error("["+context+"]"+message);
            message = ircColor.bgbrown(ircColor.bold("[ERROR]")+ccontext+message);
            break;
        case 'warn':
            log.warn("["+context+"]"+message);
            message = ircColor.bgyellow(ircColor.bold("[WARN]")+ccontext+message);
            break;
        case 'info':
            log.info("["+context+"]"+message);
            message = ircColor.bgsilver(ircColor.bold("[INFO]")+ccontext+message);
            break;
        case 'debug':
            log.debug("["+context+"]"+message);
            message = ircColor.bggray(ircColor.bold("[DEBUG]")+ccontext+message);
            break;
        case 'trace':
            log.trace("["+context+"]"+message);
            message = ircColor.bgpink(ircColor.bold("[trace]")+ccontext+message);
            break;
    }

    notify(level,message,context)
};

notify = function (level,message,context) {
    if (cfg.development.debugModus && level != 'trace' && state.isConnected)modules['ircRequests'].fire("Say", [cfg.development.loggerChannel, " " + message]);
    //@TODO verbostiy, stuur logs via NOTICE/QUERY, CHANNEL, logGroups?
};
