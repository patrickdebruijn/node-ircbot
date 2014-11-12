exports.analyse = function (line) {

    logRawData(line);
    logChannelData(line);
    logUserData(line);

//@TODO log msg'es

};

exports.generateStats = function () {

};

exports.archive = function () {

};

exports.sync = function () {
    //Plaats heir scheduled processen om users in channels te syncen. + listeners voor NICK changes en part etc
};

logRawData = function (line) {
    //@TODO functie maken om ruwe data te archiveren
};

logChannelData = function (line) {
    //@TODO update current velocity per channel
};

logUserData = function (line) {

};

logThis = function (level, msg, arg) {
//@TODO LOGGER FUNCTION
};





