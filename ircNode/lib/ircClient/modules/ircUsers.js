exports.getSession = function(line){
    console.log(line);
    return true;
};
exports.getPermission= function(line){};
//In this handler, check the permissions with virgin-acl https://github.com/djvirgen/virgen-acl
//Plaats heir scheduled processen om users te syncen. + listeners voor NICK changes en part etc
//Scheduled /LIST /NAMES etc