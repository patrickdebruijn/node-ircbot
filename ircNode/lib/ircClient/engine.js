global.ircCmd               = require('./ircCmd');
global.communication        = {};
var     processManager      = require('./processManager'),
        connectionManager   = require('./connectionManager');

exports.init = function(){
    moduleLoader();
    processManager.setupCommunications();   //Setup Messenger speakers and listerners for inter-process communication
    processManager.start();                 //Start a forked child process which will do the actual logic of this application, while this process will keep the actual socket open.
    connectionManager.connect();
    //Start irc connection
    //parse line
}

parseLine = function(line){

}

processLine = function(lineObj){
    //pass message to process manager, or to own modules.
}

moduleLoader = function(){

}

communication.listenToServer = function (data)
{
    if(data==undefined)
        return log.error('ListenToServer: no data');
    else
        console.log(data)
}

communication.sendToServer = function (data)
{
    if(data==undefined)
        return log.error('SendToServer: no data');
    else
        connectionManager.send(data);
}

communication.listenToBot = function (data)
{
    if(data==undefined)
        return log.error('ListenToBot: no data');
    else
        console.log(data)
}

communication.speakToBot = function (subject,data)
{
    if(subject==undefined || data==undefined)
        return log.error('SpeakToBot: Subject or data empty');
    else
        processManager.send(subject,data);
}