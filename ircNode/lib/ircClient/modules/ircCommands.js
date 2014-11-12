var commands = {},
    queue = new Array(),
    c = '\x03',
    pos2 = c.length + 2;


exports.state = state;

exports.fire = function (name, arg) {
    var session = modules['ircUsers'].getSession(arg);  //Get Session info and check if the sender isn't on the ignore list
    console.log(arg);
    //SEND arg and session to ircSats module to gather stats and velocity
    //Is it a command?  check if the command is for a plugin or for the core, and send it to the correct handler.
    //In this handler, check the permissions with virgin-acl https://github.com/djvirgen/virgen-acl

    name = name.toLowerCase();
    if (commands[name] != undefined)
        commands[name](arg);
    else
        log.error('Fire ccommand: ' + name + ' is Undefined');
};

logThis = function (level, msg, arg) {
//@TODO LOGGER FUNCTION
};

//