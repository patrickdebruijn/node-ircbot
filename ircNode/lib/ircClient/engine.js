//Function calling verbetem, niet via eval: http://stackoverflow.com/questions/8206453/call-function-by-string-name-on-node-js
var processManager      = require('./processManager'),
    connectionManager   = require('./connectionManager'),
    fs                  = require('fs'),
    path                = require('path');
global.communication    = {};
global.modules          = {};
global.constants        = JSON.parse(fs.readFileSync('./ircNode/inc/constants.json', 'utf8')); //https://github.com/gf3/IRC-js/blob/master/lib/constants.js


exports.init = function () {
    loadModules();
    processManager.setupCommunications();   //Setup Messenger speakers and listerners for inter-process communication
    processManager.start();                 //Start a forked child process which will do the actual logic of this application, while this process will keep the actual socket open.
    connectionManager.connect();            //Connect with socket to the configured irc server
};

loadModules = function () {
    var normalizedPath = path.join(__dirname, "Modules");
    fs.readdirSync(normalizedPath).forEach(function(file) {
        var name = file.split(".");
        name=name[0];
        modules[name]=require("./Modules/" + file);
    });
};

communication.listenToServer = function (data) {
    if (data == undefined)
        return log.error('ListenToServer: no data');
    else
        modules['ircParser'].execute(data.toString());
};

communication.sendToServer = function (data) {
    if (data == undefined)
        return log.error('SendToServer: no data');
    else
        connectionManager.send(data);
};

communication.listenToBot = function (data) {
    if (data == undefined)
        return log.error('ListenToBot: no data');
    else
        console.log(data)
};

communication.speakToBot = function (subject, data) {
    if (subject == undefined || data == undefined)
        return log.error('SpeakToBot: Subject or data empty');
    else
        processManager.send(subject, data);
};