global.state = {
    isAuthed: false,
    isAutoJoined: false,
    isAway: false,
    nick: false,
    dbConnected: false,
    isConnected: false,
    communicationSetup: false
};
var processManager = require('./processManager'),
    connectionManager = require('./connectionManager'),
    fs = require('fs'),
    path = require('path'),
    db = require('mongoose');
global.db = false
global.communication = {};
global.modules = {};
global.constants = JSON.parse(fs.readFileSync('./ircNode/inc/constants.json', 'utf8')); //https://github.com/gf3/IRC-js/blob/master/lib/constants.js //https://www.alien.net.au/irc/irc2numerics.html
global.ircColor = require('irc-colors'); //https://github.com/fent/irc-colors.js


exports.init = function () {
    connectDB();
    loadModules();
    processManager.setupCommunications();   //Setup Messenger speakers and listerners for inter-process communication
    connectionManager.connect();            //Connect with socket to the configured irc server
    modules['ircUsers'].init();
    processManager.start();                 //Start a forked child process which will do the actual logic of this application, while this process will keep the actual socket open.


};

exports.kill = function () {
    processManager.stop();
    connectionManager.disconnect();
    disconnectDB();
};

exports.restart = function () {
    exports.kill();
    setTimeout(function () {
        exports.init();
    }, 2000)
};

loadModules = function () {
    var normalizedPath = path.join(__dirname, "Modules");
    fs.readdirSync(normalizedPath).forEach(function (file) {
        var name = file.split(".");
        name = name[0];
        modules[name] = require("./Modules/" + file);
    });
};
connectDB = function () {
    if (!state.dbConnected) {
        db.connect(cfg.client.db);
        db.connection.on('error', function(err){
            logThis('error', 'DB error: ' + cfg.client.db, err);
        });
        db.connection.once('open', function callback () {
            state.dbConnected = true;
            logThis('info', 'Connected to DB: ' + cfg.client.db);
        });
    } else
        logThis('warn', 'Allready connected to: ' + cfg.client.db);
};

disconnectDB = function () {
    if (state.dbConnected) {
        db.close();
        state.dbConnected = false;
        logThis('debug', 'Disconnected from DB');
    } else
        logThis('error', 'Cannot disconnect DB when not connected');
};

communication.listenToServer = function (data) {
    if (data == undefined)
        return logThis('error', 'ListenToServer: no data');
    else
        modules['ircParser'].execute(data.toString());
};

communication.sendToServer = function (data) {
    if (data == undefined)
        return logThis('error', 'SendToServer: no data');
    else
        connectionManager.send(data);
};

communication.listenToBot = function (data) {
    if (data == undefined)
        return logThis('error', 'ListenToBot: no data');
    else
        console.log(data)
};

communication.speakToBot = function (subject, data) {
    if (subject == undefined || data == undefined)
        return logThis('error', 'SpeakToBot: Subject or data empty');
    else
        processManager.send(subject, data);
};

logThis = function (level, msg, arg) {
//@TODO LOGGER FUNCTION
};