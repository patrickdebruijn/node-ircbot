//Kleurtjes, beter standaard  meldingen via functie //https://github.com/fent/irc-colors.js/blob/master/lib/irc-colors.js
var func    = {},
    queue   = new Array(),
    c = '\x03',
    pos2 = c.length + 2;


exports.state = state;

exports.fire = function(name,arg) {

    name = name.toLowerCase();
    if(func[name]!=undefined)
        func[name](arg);
    else if(constants.raw.COMMAND[name]!=undefined)
        send(name, arg);
    else
        log.error('Fire request: '+name+' is Undefined');
};
//@TODO dont send data untill welcome cmd
exports.send = function(cmd,arg,force) {
    if(constants.raw.COMMAND[cmd]!=undefined)
    {
        if(Array.isArray(arg))  arg = arg.join(" ");

        if(typeof arg =="string") {
            var msg = constants.raw.COMMAND[cmd] + " " + arg;
            //@TODO PREPEND USER IDENT   :#{nick}!ournick@company.com JOIN
            if(force!=undefined)communication.sendToServer(msg);
            else {
                queue.push(msg);
                sendQueue();
            }
        }
    } else
        log.error('Send irc command: '+cmd+' is Undefined');
};

send = function(cmd,arg,force) {exports.send(cmd,arg,force);};

sendQueue = function ()
{
    if(state.isAuthed && state.isAutoJoined && queue.length>0) {
        for (var i = 0; i < queue.length; i++) {
            communication.sendToServer(queue[i]);
            queue.remove(queue[i]);
        }
    }
};

func.away = function (msg) {
    if (state.isAway) {
        if (msg == undefined) send("AWAY"); else log.warn('Command: [AWAY] you are allready away');
    } else {
        if (msg != undefined) send("AWAY",msg); else log.warn('Command: [AWAY] you aren\'t away' );
    }
};

func.authenticate = function() {
    if (!state.isAuthed) {
        if (cfg.bot.pass != '' && cfg.bot.pass != false && cfg.bot.pass != undefined) send("PASS", cfg.bot.pass,true);
        send("NICK", [cfg.bot.defaultNick],true);
        send("USER", [cfg.bot.user + ' 8 * :' + cfg.bot.real],true);
        state.isAuthed=true;                //@TODO: Verplaats deze set var naar responseHandler op absis van welkom commando
        state.nick = cfg.bot.defaultNick;
    } else
        log.warn('You are allready authenticated...');
};

func.autojoinchannels = function() {
    if (!state.isAutoJoined) {
        for (var i = 0; i < cfg.bot.autoJoinChannels.length; i++)
            send("JOIN", cfg.bot.autoJoinChannels[i],true);
        if (cfg.development.loggerChannel != '' && cfg.development.loggerChannel != false && cfg.development.loggerChannel != undefined)send("JOIN", cfg.development.loggerChannel,true);
        state.isAutoJoined=true;  //@TODO state veranderingen hangen aan een reponse ipv vannuit gaan dat het goed gaat
    } else
        log.warn('You have allready auto joined...');
};

func.join = function(channel) {
    if (channel != undefined)
        send("JOIN", channel);
    else
        log.warn('Command: [JOIN] needs an function');
};

func.leave = function (channel) {
    if (channel != undefined)
        send("LEAVE", channel);
    else
        log.warn('Command: [LEAVE] needs an function');
};

func.say = function (arg) {

    if (arg[0] != undefined)
    {
        if (arg[1] != undefined)
            send("PRIVMSG",arg);
        else
            log.warn('Command: [SAY](chan,msg) needs a second argument');
    } else log.warn('Command: [SAY](chan,msg) needs two arguments');
};

setInterval(sendQueue,1000)

//@TODO: Nickserv auth
//@TODO: Logging duidelijker maken
//@TODO: Uitbreiden met: https://github.com/slate/slate-irc/tree/master/lib/plugins
//@TODO: Maak nick serv login en regist commandos
//@TODO: WHOIS COMMANDO FIXEN http://www.irchelp.org/irchelp/irctutorial.html http://en.wikipedia.org/wiki/List_of_Internet_Relay_Chat_commands
