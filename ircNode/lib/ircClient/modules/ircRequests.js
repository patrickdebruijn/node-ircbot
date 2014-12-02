//Kleurtjes, beter standaard  meldingen via functie //https://github.com/fent/irc-colors.js/blob/master/lib/irc-colors.js
var func = {},
    queue = [],
    c = '\x03',
    pos2 = c.length + 2;
var req={};


exports.state = state;

exports.fire = function (name, arg, force) {

    name = name.toLowerCase();
    if (func[name] != undefined)
        func[name](arg, force);
    else if (constants.raw.COMMAND[name] != undefined)
        send(name, arg, force);
    else
        req.logThis('error','function is undefined',name);
};

exports.send = function (cmd, arg, force) {

    if (constants.raw.COMMAND[cmd] != undefined) {
        if (Array.isArray(arg))  arg = arg.join(" ");

        if (typeof arg == "string") {
            var msg = constants.raw.COMMAND[cmd] + " " + arg;

            if (state.isConnected) {
                if ((state.isAuthed && state.isAutoJoined) || force != undefined) {
                    if (force != undefined)communication.sendToServer(msg);
                    else {
                        queue.push(msg);
                        sendQueue();
                    }
                } else {
                    queue.push(msg);
                }
            } else {
                queue.push(msg);
                req.logThis('debug','Can\'t send messages till i\'m connected',cmd);
            }
        }
    } else
        req.logThis('warn','irc command is undefined',cmd);

};

exports.notifySender = function(line,success,msg)
{
    var message;
    if(success)
        message= ircColor.bggreen(msg);
    else
        message= ircColor.bgpurple.red(msg);

    func.notice([line.sender.nick, message]);
};

send = function (cmd, arg, force) {
    exports.send(cmd, arg, force);
};

sendQueue = function () {
    if (state.isConnected && state.isAuthed && state.isAutoJoined && queue.length > 0) {
        for (var i = 0; i < queue.length; i++) {
            communication.sendToServer(queue[i]);
            queue.remove(queue[i]);
        }
    }
};

func.away = function (msg) {
    if (state.isAway) {
        if (msg == undefined) send("AWAY"); else req.logThis('warn','I\'m allready away....','AWAY');
    } else {
        if (msg != undefined) send("AWAY", msg); else req.logThis('warn','needs an argument (awaymsg)','AWAY');
    }
};

func.authenticate = function () {
    if (!state.isAuthed) {
        if (cfg.bot.pass != '' && cfg.bot.pass != false && cfg.bot.pass != undefined) send("PASS", cfg.bot.pass, true);
        send("NICK", [cfg.bot.defaultNick], true);
        send("USER", [cfg.bot.user + ' 8 * :' + cfg.bot.real], true);
        state.isAuthed = true;                //@TODO: Verplaats deze set var naar responseHandler op absis van welkom commando
        state.nick = cfg.bot.defaultNick;
    } else
        req.logThis('warn','Can\'t authenticate because, i\'m allready authenticated...','AUTHENTICATE');
};

func.autojoinchannels = function () {
    if (!state.isAutoJoined && state.isAuthed) {
        for (var i = 0; i < cfg.bot.autoJoinChannels.length; i++)
            send("JOIN", cfg.bot.autoJoinChannels[i], true);
        if (cfg.development.loggerChannel != '' && cfg.development.loggerChannel != false && cfg.development.loggerChannel != undefined)send("JOIN", cfg.development.loggerChannel, true);
        state.isAutoJoined = true;  //@TODO state veranderingen hangen aan een reponse ipv vannuit gaan dat het goed gaat
    } else
        req.logThis('warn','Allready auto joined or are not yet authed...','AUTOJOIN');
};

//@TODO uitzoeken of je meerdere chans tegelijk kan joinen met dit commando
func.join = function (channel) {
    if (channel != undefined) {
        if (Array.isArray(channel))  channel = arg.join(", ");
        send("JOIN", channel, true);
    }
    else
        req.logThis('warn','needs an argument or list ([chan,chan])','JOIN');
};

func.leave = function (channel) {
    if (channel != undefined)
        send("LEAVE", channel, true);
    else
        req.logThis('warn','needs an argument (chan)','LEAVE');
};

func.say = function (arg, force) {
    if (arg[0] != undefined) {
        if (arg[1] != undefined)
            send("PRIVMSG", arg, force);
        else
            req.logThis('warn','needs a second argument (chan,msg)','PRIVMSG')
    } else req.logThis('warn','needs two arguments (chan,msg)','PRIVMSG')
};

func.notice = function (arg) {
    if (arg[0] != undefined) {
        if (arg[1] != undefined)
            send("NOTICE", arg);
        else
            req.logThis('warn','needs a second argument (nick,msg)','NOTICE')
    } else req.logThis('warn','needs two arguments (nick,msg)','NOTICE')
};

setInterval(sendQueue, cfg.client.queueDelay);

req.logThis = function (level, msg, vari) {
    modules['ircLogger'].log(level, '<'+vari+'> '+msg,'CORE','REQUEST');
};


//@TODO: Maak nick serv login en regist commandos
//@TODO: WHOIS COMMANDO FIXEN http://www.irchelp.org/irchelp/irctutorial.html http://en.wikipedia.org/wiki/List_of_Internet_Relay_Chat_commands
