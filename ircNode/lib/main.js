//Development modus  -> SET VERBOSE

global.utils    = require('./utils');
global.cfg      = {};
global.log      = {};
global.appDir   = {};
global.baseDir  = {};

var bunyan = require('bunyan');
var path = require('path');
merge = require('merge');
var ircClient = require('./ircClient/engine');


exports.init = function (config) {
    if (config == undefined) log.error("No config specified.");
    else {
        //@TODO check override in merge
        clientConfig = require('./ircClient/config');
        appDir = path.dirname(require.main.filename);  //find the root of the application
        cfg = merge(clientConfig,config);                   //Store config in global so its accesible across the entire application
        log = bunyan.createLogger({     //Start bunyan logger
            name: "node-ircBot",
            streams: [
                {
                    stream: process.stdout,
                    level: 'trace'
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
