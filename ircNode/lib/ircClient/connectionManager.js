var net = require('net');
var attempts = 0;
var connection;
var conn= {};

exports.connect = function () {
    if (!state.isConnected && cfg.server.maxRetries >= attempts) {
        conn.logThis("Connecting to irc server: " + cfg.server.addr + ":" + cfg.server.port);
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
    //@TODO send quit msg to irc
    if (state.isConnected) {
        conn.logThis("warn","Disconnecting from irc server: " + cfg.server.addr + ":" + cfg.server.port);
        connection.destroy();
    }
    if (force == undefined && cfg.server.autoReconnect) {
        conn.logThis("warn","Reconnecting in " + cfg.server.retryDelay * 1000 + " seconds...");
        setTimeout(exports.connect, cfg.server.retryDelay * 1000);
    }
};

exports.reconnect = function () {
    exports.disconnect(true);
    setTimeout(exports.connect, 100);
};

exports.send = function (data) {
    if (state.isConnected) {
        connection.write(data + '\r\n');
        conn.logThis('trace',"SEND TO IRC: " + data);
    } else log.error({subject: "Can't send data when disconnected from irc server", data: data});
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
    state.isConnected = false;
}

onconnect = function () {
    conn.logThis('info','IrcClient is connected');
    state.isConnected = true;
    attempts = 0;

    setTimeout(function () {
        modules['ircRequests'].fire("Authenticate");//Authenticate with the irc server
        setTimeout(function () {
            modules['ircRequests'].fire("AutoJoinChannels");
        }, 750);
    }, 750);

};

onend = function () {
    conn.logThis('warn','Irc server  is closing the connection...');
    disconnected();
};

ontimeout = function () {
    conn.logThis('warn','Irc server timeouts...');
    disconnected();
};

onerror = function (err) {
    conn.logThis('error',err);
    disconnected();
};

conn.logThis = function (level, msg) {
    modules['ircLogger'].log(level, msg,'CORE','CONNECTION');
};
