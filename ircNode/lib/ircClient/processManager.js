var child_process = require('child_process');
var messenger = require('messenger');
var childprocess, speaker, listener;

exports.start = function () {
    if (state.communicationSetup && (childprocess == undefined || childprocess.connected == undefined || childprocess.connected == false)) {
        log.info("Starting Irc Bot...");
        childprocess = child_process.fork(appDir + '/ircNode/lib/ircBot');
        attachListeners();
        return childprocess;
    } else
        return false;
};

exports.stop = function () {
    if (childprocess.connected) {
        log.info("Stopping Irc Bot...");
        childprocess.removeAllListeners('disconnect');
        return childprocess.kill();
    } else
        return false;
};

exports.restart = function () {
    exports.stop(true);
    setTimeout(exports.start, 100);
};

exports.setupCommunications = function () {
    if (!state.communicationSetup) {
        listener = messenger.createListener(9020);
        listener.on('sendIrcCmd', communication.listenToBot);
        speaker = messenger.createSpeaker(9021);
        return state.communicationSetup = true;
    } else return false;
};

exports.send = function (subject, data) {
    return speaker.send(subject, data);
};

attachListeners = function () {
    if (childprocess.connected) {
        childprocess.on('disconnect', disconnected);
        childprocess.on('close', closed);
        childprocess.on('exit', exited);
        childprocess.on('error', onerror);
    }
};

disconnected = function (force) {
    log.fatal("Irc Bot crashed...");
    childprocess.removeAllListeners('close');
    childprocess.removeAllListeners('exit');
    childprocess.removeAllListeners('error');
    if (force == undefined && cfg.bot.autoRestartOnFailure)setTimeout(exports.start, cfg.bot.restartDelay * 1000);
};

closed = function (code, signal) {
    log.warn({closedcode: code, closedsignal: signal});
};

exited = function (code, signal) {
    log.warn({exitedcode: code, exitedsignal: signal});
};

onerror = function (err) {
    log.error(err);
};

logThis = function (level, msg, arg) {
//@TODO LOGGER FUNCTION
};

//@TODO uitzoeken of we voor processen niet PM2 of forever oid moeten gebruiken https://github.com/Unitech/PM2/blob/development/ADVANCED_README.md#programmatic-example