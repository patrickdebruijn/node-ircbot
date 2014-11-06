//Kleurtjes, beter standaard  meldingen via functie //https://github.com/fent/irc-colors.js/blob/master/lib/irc-colors.js
//Op alfabet + constants gebruiken
var state   = {isAuthed:false,isAutoJoined:false,isAway:false},
    func    = {},
    c = '\x03',
    pos2 = c.length + 2;


exports.state = state;

exports.fire = function(name,arg) {

    if(func[name]!=undefined)
        func[name](arg);
    else if(constants.raw.COMMAND[name]!=undefined)
        send(name, arg);
    else
        log.error('Fire: '+name+' is Undefined');
};

exports.send = function(cmd,arg) {
    if(constants.raw.COMMAND[cmd]!=undefined)
    {
        if(typeof arg =="array")
            arg = arg.join(" ");

        if(typeof arg =="string") {
            var msg = constants.raw.COMMAND[cmd] + " " + arg;
            communication.sendToServer(msg);
        }
    } else
        log.error('Send irc command: '+cmd+' is Undefined');
};

send = function(cmd,arg) {exports.send(cmd,arg);};

func.Away = function (msg) {
    if (state.isAway) {
        if (msg == undefined) send("AWAY"); else log.warn('Command: [AWAY] you are allready away');
    } else {
        if (msg != undefined) send("AWAY",msg); else log.warn('Command: [AWAY] you aren\'t away' );
    }
};

func.Authenticate = function() {
    if (!state.isAuthed) {
        if (cfg.bot.pass != '' && cfg.bot.pass != false && cfg.bot.pass != undefined) send("PASS", cfg.bot.pass);
        send("NICK", [cfg.bot.defaultNick]);
        send("USER", [cfg.bot.user + ' 8 * :' + cfg.bot.real]);
    } else
        log.warn('You are allready authenticated...');
};

func.AutoJoinChannels = function() {
    if (!state.isAutoJoined) {
        for (var i = 0; i < cfg.bot.autoJoinChannels.length; i++)
            func.Join(cfg.bot.autoJoinChannels[i]);
        if (cfg.development.loggerChannel != '' && cfg.development.loggerChannel != false && cfg.development.loggerChannel != undefined)func.Join(cfg.development.loggerChannel);
        state.isAutoJoined=true;
    } else
        log.warn('You have allready auto joined...');
};

func.Join = function(channel) {
    if (channel != undefined)
        send("JOIN", channel);
    else
        log.warn('Command: [JOIN] needs an function');
};

func.Leave = function (channel) {
    if (channel != undefined)
        send("LEAVE", channel);
    else
        log.warn('Command: [LEAVE] needs an function');
};

func.Say = function (arg) {

    if (arg[0] != undefined)
    {
        if (arg[1] != undefined)
            send("PRIVMSG",arg);
        else
            log.warn('Command: [SAY](chan,msg) needs a second argument');
    } else log.warn('Command: [SAY](chan,msg) needs two arguments');
};





//@TODO: Uitbreiden met: https://github.com/slate/slate-irc/tree/master/lib/plugins
//@TODO: Maak nick serv login en regist commandos
//@TODO: WHOIS COMMANDO FIXEN http://www.irchelp.org/irchelp/irctutorial.html http://en.wikipedia.org/wiki/List_of_Internet_Relay_Chat_commands

