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
    mongoose = require ("mongoose"),
    uristring =
        process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        cfg.client.mongodbUrl;

var eng = {};
global.db       = false;
global.communication = {};
global.modules = {};
global.constants = JSON.parse(fs.readFileSync('./ircNode/inc/constants.json', 'utf8')); //https://github.com/gf3/IRC-js/blob/master/lib/constants.js //https://www.alien.net.au/irc/irc2numerics.html
global.ircColor = require('irc-colors'); //https://github.com/fent/irc-colors.js


exports.init = function () {
    loadModules();
    connectDB();
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
     var normalizedPath = path.join(__dirname, "modules");
    fs.readdirSync(normalizedPath).forEach(function (file) {
        var name = file.split(".");
        name = name[0];
        modules[name] = require("./modules/" + file);
    });
};
connectDB = function () {
    if (!state.dbConnected) {

        mongoose.connect(uristring, function (err, res) {
            if (err) {
                console.log ('ERROR connecting to: ' + uristring + '. ' + err);
            } else {
                state.dbConnected = true;
                console.log ('Succeeded connected to: ' + uristring);
            }
        });

    } else
        eng.logThis('warn', 'Allready connected to: ' + cfg.client.db,'CONNECTDB');
};

disconnectDB = function () {
    if (state.dbConnected) {
        db.close();
        state.dbConnected = false;
        eng.logThis('debug', 'Disconnected from DB');
    } else
        eng.logThis('error', 'Cannot disconnect DB when not connected',"DISCONNECTDB");
};

communication.listenToServer = function (data) {
    if (data == undefined)
        return eng.logThis('error', 'no data','LISTENTOSERVER');
    else
        modules['ircParser'].execute(data.toString());
};

communication.sendToServer = function (data) {
    if (data == undefined)
        return eng.logThis('error', 'no data', 'SENDTOSERVER');
    else
        connectionManager.send(data);
};

communication.listenToBot = function (data) {
    if (data == undefined)
        return eng.logThis('error', 'no data','LISTENTOBOT');
    else
        console.log(data)

    //@TODO maak listen functies voor bot voor het doorgeven van errors en commando's
};

communication.speakToBot = function (subject, data) {
    if (subject == undefined || data == undefined)
        return eng.logThis('error','Subject or data empty','SPEAKTOBOT');
    else
        processManager.send(subject, data);
};

eng.logThis = function (level, msg, vari) {
    modules['ircLogger'].log(level, '<'+vari+'> '+msg,'CORE','ENGINE');
};

//@TODO maak ircCommands parsing verder af, check op arguments en implementeer help
//@TODO ircUser.js af


//@TODO setup https://github.com/ncb000gt/node-cron  voor module scheduled jobs
//@TODO indexOf ?
