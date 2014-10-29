var socket;
var isConnected = false;
var attempts    = 0;

exports.connect = function()
{
    if(!isConnected && cfg.server.maxRetries<attempts) {
        log.info("Connecting to irc server: " + cfg.server.addr + ":" + cfg.server.port);
        attempts++;
        socket = new net.Socket();
        socket.setEncoding('ascii');
        socket.setNoDelay(true);
        socket.setKeepAlive(true);
        attachListeners();
        socket.connect(cfg.server.port, cfg.server.addr);
    }
}

exports.disconnect = function(force)
{
    if(isConnected)
    {
        log.warn("Disconnecting from irc server: "+cfg.server.addr+":"+cfg.server.port);
        socket.destroy();
    }
    disconnected();
    if(force==undefined && cfg.server.autoReconnect)
    {
        log.warn("Reconnecting in "+cfg.server.retryDelay*1000+" seconds...");
        setTimeout(exports.connect,cfg.server.retryDelay*1000);
    }

}

exports.reconnect = function()
{
    exports.disconnect(true);
    setTimeout(exports.connect,100);
}

exports.send = function(data){
    if(isConnected) {
        socket.write(data + '\n', 'ascii', function () {
            console.log('SEND+++++::', data);
        });
    }else log.error({subject:"Can't send data when disconnected from server",data:data});
}

expost.socket=socket;

attachListeners = function()
{
    socket.on('connect',onconnect);
    socket.on('end',onend);
    socket.on('timeout',ontimeout);
    socket.on('error',onerror);
    socket.on('data',communication.listenToServer);
}


disconnected = function() {
    log.warn("Irc Bot is disconnected...");
    isConnected=false;
}

onconnect = function() {
    log.info("Connected to irc server!");
    isConnected=true;
    attempts=0;
}

onend = function() {
    log.warn('Irc server closed the connection');
    disconnect();
}

ontimeout = function() {
    log.warn('Irc server timeout');
    disconnect();
}

onerror = function(err) {
    log.error(err);
    disconnect();
}