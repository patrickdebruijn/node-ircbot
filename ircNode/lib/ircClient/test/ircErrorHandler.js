var handlers = {};
var error={};

exports.catch = function (name, arg) {

    if (name != undefined) {
        name = name.toUpperCase();

        if (handlers[name] != undefined) {
            handlers[name](arg);
            return true;
        }
        else
            return false;
    }
};

error.logThis = function (level, msg, vari) {
    modules['ircLogger'].log(level, '<'+vari+'> '+msg,'CORE','ERROR');
};