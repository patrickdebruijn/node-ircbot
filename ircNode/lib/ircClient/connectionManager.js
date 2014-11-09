var net = require('net');
var isConnected = false;
var attempts = 0;
var connection;

exports.connect = function () {
    if (!isConnected && cfg.server.maxRetries >= attempts) {
        log.info("Connecting to irc server: " + cfg.server.addr + ":" + cfg.server.port);
        attempts++;
        connection = new net.Socket();
        connection.setEncoding('ascii');
        connection.setNoDelay(true);
        connection.setKeepAlive(true);
        connection.connect(cfg.server.port, cfg.server.addr);
        attachListenersToSocket();
    }
};

exports.disconnect = function (force) {
    if (isConnected) {
        log.warn("Disconnecting from irc server: " + cfg.server.addr + ":" + cfg.server.port);
        connection.destroy();
    }
    disconnected();
    if (force == undefined && cfg.server.autoReconnect) {
        log.warn("Reconnecting in " + cfg.server.retryDelay * 1000 + " seconds...");
        setTimeout(exports.connect, cfg.server.retryDelay * 1000);
    }
};

exports.reconnect = function () {
    exports.disconnect(true);
    setTimeout(exports.connect, 100);
};

exports.send = function (data) {
    if (isConnected) {
        connection.write(data + '\r\n');
        log.debug("SEND TO IRC: " + data);
    } else log.error({subject: "Can't send data when disconnected from server", data: data});
};

attachListenersToSocket = function () {
    connection.on('connect', onconnect);
    connection.on('end', onend);
    connection.on('timeout', ontimeout);
    connection.on('error', onerror);
    connection.on('data', communication.listenToServer);
    //@TODO crash handling verbetere, reload na crash? Email alert/pushover alert?
};


disconnected = function () {
    log.warn("IrcClient is disconnected");
    isConnected = false;
};

onconnect = function () {
    log.info("IrcClient is connected");
    isConnected = true;
    attempts = 0;

    setTimeout(function(){
        modules['ircRequests'].fire("Authenticate");//Authenticate with the irc server
        setTimeout(function(){
            modules['ircRequests'].fire("AutoJoinChannels");
        },750);
    },750);

};

onend = function () {
    log.warn('Irc server  is closing the connection...');
    disconnected();
};

ontimeout = function () {
    log.warn('Irc server timeouts...');
    disconnected();
};

onerror = function (err) {
    log.error(err);
    disconnected();
};