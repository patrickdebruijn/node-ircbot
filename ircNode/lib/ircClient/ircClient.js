global.ircCmd           = require('./ircCmd');
var     processManager  = require('./processManager'),
        ircConn         = require('./ircConn');

exports.init = function()
{
    processManager.setupCommunications();   //Setup Messenger speakers and listerners for inter-process communication
    processManager.start();                 //Start a forked child process which will do the actual logic of this application, while this process will keep the actual socket open.
    //Start irc connection + irc client. <--- maybe, verplaats dit + process manager naar irc client en ook irc commands.,
    //Pipe message to processManager
}

exports.parseLine = function(line)
{

}

exports.processLine = function(lineObj)
{

}