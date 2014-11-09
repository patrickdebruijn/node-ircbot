var commands    = {},
    queue   = new Array(),
    c = '\x03',
    pos2 = c.length + 2;


exports.state = state;

exports.fire = function(name,arg) {

    name = name.toLowerCase();
    if(commands[name]!=undefined)
        commands[name](arg);
    else
        log.error('Fire command: '+name+' is Undefined');
};


//