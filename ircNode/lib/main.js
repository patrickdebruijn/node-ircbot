var     processManager  = require('./processManager');
var     bunyan          = require('bunyan');
var     path            = require('path');
var     ircCmd 		    = require('./ircClient/ircCmd');
var     ircConn         = require('./ircClient/ircConnection');
global.utils 		    = require('./utils');
global.cfg 				= {};
global.log 		        = {};
global.appDir 		    = {};

exports.init = function (config) {
    if(config==undefined) console.log('[ERROR] No config file specified');
    else {
        appDir=path.dirname(require.main.filename);

        global.cfg      = config;
        global.log      = bunyan.createLogger({
            name: "node-ircBot",
            streams: [
                {
                    stream: process.stdout,
                    level: 'info'
                },
                {
                    level: 'warn',
                    path: appDir + 'error.log',
                    src: true,
                    period: '1d',   // daily rotation
                    count: 3        // keep 3 back copies
                }
            ]
        });
        processManager.setupCommunication();
        processManager.start();
    }
};
