global.ircCmd           = require('./ircCmd');
var     processManager  = require('./processManager'),
        ircConn         = require('./ircConn');

exports.init = function(){
    moduleLoader();
    processManager.setupCommunications();   //Setup Messenger speakers and listerners for inter-process communication
    processManager.start();                 //Start a forked child process which will do the actual logic of this application, while this process will keep the actual socket open.
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