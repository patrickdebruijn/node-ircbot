var child_process   = require('child_process');
var messenger       = require('messenger');
var communication   = false;
var childprocess, speaker, listener;

exports.start = function (){
    if(communication && (childprocess == undefined || childprocess.connected == undefined || childprocess.connected==false)) {
        log.info("Starting Irc Bot...");
        childprocess = child_process.fork(appDir+'/ircNode/lib/bot');
        attachListeners();
        return childprocess;
    } else
        return false;
}

exports.stop = function(){
    if(childprocess.connected) {
        log.info("Stopping Irc Bot...");
        return childprocess.kill();
    } else
        return false;
}

exports.restart = function(){
    exports.stop();
    setTimeout(exports.start,100);
}

exports.setupCommunications = function(){
    if(!communication) {
        listener = messenger.createListener(9020);
        listener.on('ircCmd', ircClient.cmd);
        listener.on('restartBot', exports.restart);
        speaker = messenger.createSpeaker(9021);
        return communication=true;
    } else return false;
}

exports.send = function(subject,data)
{
    return speaker.send(subject, data);
}

attachListeners = function(){
    if(childprocess.connected)
    {
        childprocess.on('disconnect',disconnected);
        childprocess.on('close',closed);
        childprocess.on('exit',exited);
        childprocess.on('error',onerror);
    }
}

disconnected = function() {
    childprocess.removeAllListeners('disconnect');
    childprocess.removeAllListeners('close');
    childprocess.removeAllListeners('exit');
    childprocess.removeAllListeners('error');
}

closed = function(code,signal) {
    log.warn({closedcode:code,closedsignal:signal});
}

exited = function(code,signal) {
    log.warn({exitedcode:code,exitedsignal:signal});
}

onerror = function(err) {
    log.error(err);
}