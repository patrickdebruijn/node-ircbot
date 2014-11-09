var handlers    = {};

exports.catch = function(name,arg) {

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
