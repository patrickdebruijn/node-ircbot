var handlers    = {};

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

handlers.PINGSTART = function(arg) {
    modules['ircCommunication'].send("PONG",arg[1],true);
};
//@TODO FIX IT ZODAT HIJ GEWOON EEN PING RESPONSE GEEFT
handlers.PING = function(arg) {
    modules['ircCommunication'].fire('say',[arg.sender,'\001PONG '+arg.message[1]]);
};


handlers.SNOTICE = function(arg) {
    //@TODO handle server notices
};
//@TODO FIX IT ZODAT HIJ GEWOON EEN VERSION RESPONSE GEEFT
handlers.VERSION = function(arg) {
    modules['ircCommunication'].fire('say',[arg.sender,'\001VERSION '+cfg.client.version+'\001']);
};

//@TODO uitbreiden: https://github.com/fent/node-irc/blob/master/lib/irc.js
//@TODO Meer CTCP replies maken
//@TODO Detect NICK changes etc
//@TODO check of onze client voldoet aan dit script: https://github.com/nornagon/ircv/blob/master/test/irc_test.coffee