var state       = {},
    services    = {};

exports.state = state;

exports.fire = function(name,arg) {

    name=name.toLowerCase();
    if(services[name]!=undefined) {
        services[name](arg);
        return true;
    }
    else
        return false;
};

send = function(cmd,arg) {
    if(constants.raw.COMMAND[cmd]!=undefined)
    {
        if(typeof arg =="Array")arg = arg.join(" ");
        var msg = constants.raw.COMMAND[cmd] + " " + arg;
        communication.sendToServer(msg);
    } else
        log.error('Send irc command: '+cmd+' is Undefined');
};

services.ping = function(arg) {
    modules['ircCommunication'].send("PONG",arg[1]);
};