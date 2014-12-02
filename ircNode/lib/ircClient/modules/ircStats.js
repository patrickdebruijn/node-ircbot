var stats={};
exports.analyse = function (line) {

    logRawData(line);


//@TODO log msg'es

};

exports.generateStats = function () {
    //@TODO genereer een summary raport
};

exports.archive = function () {

};

exports.sync = function () {
    //Plaats heir scheduled processen om users in channels te syncen. + listeners voor NICK changes en part etc
    //@TODO deze functie in een interval hangen. Functie gaat via LIST en NAMES state opvragen van channels en users om op te slaan
    fetchChannelData(line);
    fetchUserData(line);
};

logRawData = function (line) {
    //@TODO insert nick+ident+chan+msg+date in db
};

logChannelData = function (line) {
    //@TODO update current velocity per channel
};

logUserData = function (line) {

};

stats.logThis = function (level, msg, vari) {
    modules['ircLogger'].log(level, '<'+vari+'> '+msg,'CORE','STATS');
};





