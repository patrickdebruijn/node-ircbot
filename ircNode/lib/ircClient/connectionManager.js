var net 	    = require('net');
var isConnected = false;
var attempts    = 0;
var connection;

exports.connect = function(){
    if(!isConnected && cfg.server.maxRetries>=attempts){
        log.info("Connecting to irc server: " + cfg.server.addr + ":" + cfg.server.port);
        attempts++;
        connection = new net.Socket();
        connection.setEncoding('ascii');
        connection.setNoDelay(true);
        connection.setKeepAlive(true);
        connection.connect(cfg.server.port, cfg.server.addr);
        attachListenersToSocket();
    }
}

exports.disconnect = function(force){
    if(isConnected){
        log.warn("Disconnecting from irc server: "+cfg.server.addr+":"+cfg.server.port);
        connection.destroy();
    }
    disconnected();
    if(force==undefined && cfg.server.autoReconnect){
        log.warn("Reconnecting in "+cfg.server.retryDelay*1000+" seconds...");
        setTimeout(exports.connect,cfg.server.retryDelay*1000);
    }
}

exports.reconnect = function(){
    exports.disconnect(true);
    setTimeout(exports.connect,100);
}

exports.send = function(data){
    if(isConnected) {
        connection.write(data + '\n', 'ascii', function (){
            log.debug("Sending data to server: "+data);
        });
    }else log.error({subject:"Can't send data when disconnected from server",data:data});
}

attachListenersToSocket = function(){
    connection.on('connect',onconnect);
    connection.on('end',onend);
    connection.on('timeout',ontimeout);
    connection.on('error',onerror);
    connection.on('data',communication.listenToServer);
}


disconnected = function(){
    log.warn("Irc Bot is disconnected...");
    isConnected=false;
}

onconnect = function(){
    log.info("Connected...");
    isConnected=true;
    attempts=0;
}

onend = function(){
    log.warn('Irc server closed the connection');
    disconnect();
}

ontimeout = function(){
    log.warn('Irc server timeout');
    disconnect();
}

onerror = function(err){
    log.error(err);
    disconnect();
}