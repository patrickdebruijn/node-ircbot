var state       = {},
    handlers    = {};

exports.state = state;

exports.fire = function(name,arg) {

    if(name!=undefined) {
        name = name.toUpperCase();

        if (handlers[name] != undefined) {
            handlers[name](arg);
            return true;
        }
        else
            return false;
    }
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

handlers.PING = function(arg) {
    modules['ircCommunication'].send("PONG",arg[1]);
};

handlers.PRIVMSG = function(arg) {
    //SEND TO USER MODULE FOR SESSION MANAGEMENT
    var session = modules['ircUsers'].getSession(arg);
    if(arg.message[0]!=undefined)
    {
        var cmd=arg.message[0].replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '') ;
        if (constants.raw.COMMAND[cmd] != undefined) exports.fire(cmd,arg)
    }

    //CHECK IF FROM USER IS ON IGNORE LIST
    //CHECK FOR FIRST WORD IF IT IS A IRC COMMAND,
    //
};

handlers.VERSION = function(arg) {
    modules['ircCommunication'].send("PRIVMSG",'sdsd');
};

//@TODO uitbreiden: https://github.com/fent/node-irc/blob/master/lib/irc.js