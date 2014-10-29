//Development modus  -> SET VERBOSE

global.utils 		    = require('./utils');
global.cfg 				= {};
global.log 		        = {};
global.appDir 		    = {};

var     bunyan          = require('bunyan');
var     path            = require('path');
var     ircClient 	    = require('./ircClient/engine');


exports.init = function (config) {
    if(config==undefined) log.error("No config specified.");
    else {
        appDir=path.dirname(require.main.filename);  //find the root of the application

        cfg      = config;                   //Store config in global so its accesible across the entire application
        log      = bunyan.createLogger({     //Start bunyan logger
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
    }
    ircClient.init();
};
