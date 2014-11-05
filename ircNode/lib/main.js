//Development modus  -> SET VERBOSE

global.utils    = require('./utils');
global.cfg      = {};
global.log      = {};
global.appDir   = {};
global.baseDir  = {};

var bunyan = require('bunyan');
var path = require('path');
var ircClient = require('./ircClient/engine');


exports.init = function (config) {
    if (config == undefined) log.error("No config specified.");
    else {
        appDir = path.dirname(require.main.filename);  //find the root of the application
        console.log(baseDir);
        cfg = config;                   //Store config in global so its accesible across the entire application
        log = bunyan.createLogger({     //Start bunyan logger
            name: "node-ircBot",
            streams: [
                {
                    stream: process.stdout,
                    level: 'debug',
                },
                {
                    level: 'trace',
                    path: appDir + '/error.log',
                    period: '1d',   // daily rotation
                    count: 3        // keep 3 back copies
                }
            ]
        });
    }
    ircClient.init();
};
