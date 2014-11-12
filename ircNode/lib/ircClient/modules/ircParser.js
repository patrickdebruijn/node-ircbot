var prefixes = /^:[!,./\?@`]/;
const COMMAND = 'command';
const ERROR = 'error';
const REPLY = 'reply';
const OTHER = 'other';
const SYSTEM = 'system';
const BOT = 'bot';
const PLUGIN = 'plugin';

exports.execute = function (data) {
    var response = data.split('\r\n'),  //Split a reponse in lines
        i;
    if (data.match('^PING')) {  //Intercept the response line if it starts with PING and dispatch a PONG command to keep te connection alive
        modules['ircResponseHandler'].catch("PINGSTART", data.split(" "));
    } else {
        for (i = response.length; i--;) {
            responseLine = utils.trim(response[i]);
            if (responseLine != '') {
                lineObj = parse(response[i].split(" "));
                processLine(lineObj);
            }
        }
    }
};

parse = function (response) {  //@TODO opsplitsen in subfuncties, en user ssession info hier ook al pakken wanneer nodig
    var sender,
        formatUserhost,
        formatNick,
        formattedReturn,
        type = false,
        cmdType = false,
        recipient = false,
        forMe = false,
        recipient = false,
        message = false,
        cmd = false,
        nick = false,
        name = false,
        host = false;
    // In case sender is a nick!user@host, parse the nick.
    try {
        var i = response[0].indexOf('!');
        if (-1 != i) nick = response[0].slice(1, i);

        var d = response[0].indexOf('@');
        if (-1 != d)  name = response[0].slice(i + 1, d);

        if (-1 != d) host = response[0].slice(d + 1);

        var sender = name + "@" + host;
    } catch (e) {
        sender = 'server';
    }


    //If the line descriptor is numeric get the relevant label for readability
    if (utils.isNumber(response[1])) {
        if (constants.raw.REPLY.getKeyByValue(response[1]) != false) response[1] = constants.raw.REPLY.getKeyByValue(response[1]);
        else if (constants.raw.COMMAND.getKeyByValue(response[1]) != false) response[1] = constants.raw.COMMAND.getKeyByValue(response[1]);
        else if (constants.raw.ERROR.getKeyByValue(response[1]) != false) response[1] = constants.raw.ERROR.getKeyByValue(response[1]);
    }
    if (utils.isNumber(response[1]))
        log.warn("Cannot find translation for line descriptor: " + response[1]);
    else {
        //Check if the line is a reply, command or error so we know what we are dealing with.
        if (constants.raw.REPLY[response[1]] != undefined) {
            type = REPLY;
        } else if (constants.raw.COMMAND[response[1]] != undefined) {
            type = COMMAND;
        } else if (constants.raw.ERROR[response[1]] != undefined) {
            type = ERROR;
        }
    }

    if (type == undefined)type = OTHER; //@TODO Maybe te string was part of the last line, should we buffer these things?

    var message = response.slice(3);
    if (message[0] != undefined && message[0] != '' && utils.trim(message[0].substr(0,1))==':')message[0] = utils.trim(message[0].substr(1)); //Strip the devide : from the message
    if (response[2] == state.nick) forMe = true; else  forMe = false;  //Check if message is directed at me
    if (response[2] != undefined) {
        if (response[2].indexOf("#") == 0) receiver = 'channel'; else  receiver = 'user'; //Is the message in a channel or directed at me?
    }
    //CHECK if message is for me and  determine if the first word is a command for the irc bot. (CHeck if receiver is channel or user for command prefix)
    if (type == COMMAND && message[0] != undefined) //Get first word of the message
    {
        //@TODO VIND een manier om wel die unicode mee te matchen zodat VERSION in chat niet meegmatched word.
        var tmpCmd = message[0].replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '').toUpperCase(); //Filter non ascii out so we can read it in plain text
        if (constants.raw.COMMAND[tmpCmd] != undefined) {
            cmd = constants.raw.COMMAND[tmpCmd];
            cmdType = SYSTEM;
        }
        else if (tmpCmd != undefined && tmpCmd != '') {
            if (receiver == 'channel') {
                if (tmpCmd.indexOf(cfg.bot.commandPrefix) == 0)cmd = tmpCmd.substr(1);
            } else
                cmd = tmpCmd;

            if (cmd != false) {
                if (cmd == cfg.client.systemCommand.toUpperCase()) {
                    cmdType = BOT;
                    cmd = message[1];
                }
                else
                    cmdType = PLUGIN;
            }
        }
    }
    var returnObject = {
        method: response[1],
        type: type,
        sender: {
            name: name,
            nick: nick,
            host: host,
            ident: sender
        },
        receiver: {
            forMe: forMe,
            type: receiver,
            recipient: response[2]
        },
        response: {
            cmd: cmd,
            type: cmdType,
            content: response.join(" "),
            parts:response,
            message: message
        },
        date: new Date()
    };

    return returnObject;
};

processLine = function (line) {
    if (line.type != undefined) {
        switch (line.type) { //Parse line from irc server
            case ERROR: //Handle irc error messages
                modules['ircErrorHandler'].catch(line.method, line);
                modules['ircLogger'].log("error", "[" + line.method + "] " + line.response.message.join(" "));
                log.warn("IRCSERVER: [ERROR]<" + line.method + ">: " + line.response.message.join(" "));
                break;
            case REPLY: //Handle irc reply messages
                modules['ircResponseHandler'].catch(line.method, line);
                modules['ircLogger'].log("debug", "[REPLY]<" + line.method + "> " + line.response.parts.slice(1));
                log.debug("IRCSERVER: [" + line.method + "]: " + line.response.message.join(" "));
                break;
            case COMMAND: //Handle irc commands messages
                if (line.response.type == SYSTEM) //Check line has an irc commando
                {
                    modules['ircResponseHandler'].catch(line.response.cmd, line);
                    modules['ircLogger'].log("info", "[IRC]<" + line.response.cmd + ">" + line.response.content);
                    log.info("IRCSERVER: [IRC]<" + line.method + ">: " + line.response.message.join(" "));
                } else if (line.method == 'PRIVMSG') { //@TODO uitzoeken hoe ik notices van snotices kan onderscheiden
                    processPrivMsg(line);
                } else { //Other irc commando's like VERSION
                    modules['ircResponseHandler'].catch(line.method, line);
                    modules['ircLogger'].log("info", "[IRC]<" + line.method + "> " + line.response.content);
                    log.info("IRCSERVER: [IRC]<" + line.method + ">: " + line.response.message.join(" "));
                }
                break;
            case OTHER: //???
                modules['ircLogger'].log("warn", "[OTHER]" + line.response.content);
                break;
            default://Try to handle any unknown message
                modules['ircResponseHandler'].catch(line.method, line);
                modules['ircLogger'].log("debug", "[???]<" + line.method + "> " + line.response.content);
                log.debug("IRCSERVER: [???]<" + line.method + ">: " + line.response.message.join(" "));
        }
    }
};

processPrivMsg = function (line) {
    line.session = modules['ircUsers'].getSession(line);  //Get Session and register its state in mongodb
    modules['ircStats'].analyse(line); //send msg to irc stats for raw logging and velocity and channel stats

    if (line.response.type == BOT && cfg.client.permissions.commands[line.response.cmd] != undefined) //Check if this line is an existing control command
    {
        if (modules['ircUsers'].getPermission(line)) {
            modules['ircCommands'].fire(line.response.cmd, line);
            modules['ircLogger'].log("info", "[CONTROL]<" + line.response.cmd + "> uitgevoerd door " + line.sender.nick);
            log.info("IRCSERVER: [CONTROL]<" + line.response.cmd + ">: " + line.response.message.join(" "));
        } else {
            modules['ircLogger'].log("warn", "[CONTROL]<" + line.response.cmd + ">  geprobeerd door " + line.sender.nick);
            log.warn("IRCSERVER: [CONTROL]<" + line.response.cmd + ">: " + line.response.message.join(" "));
        }
    } else if (line.response.type == PLUGIN) {
        communication.speakToBot("CMD", line);
        modules['ircLogger'].log("info", "[PLUGIN]<" + line.response.cmd + "> " + line.response.content);
        log.info("IRCSERVER: [PLUGIN]<" + line.response.cmd + ">: " + line.response.message.join(" "));
    } else {
        modules['ircLogger'].log("trace", "[MSG]<" + line.response.cmd + "> " + line.response.content);
        log.trace("IRCSERVER: [MSG]<" + line.response.cmd + ">: " + line.response.message.join(" "));
        communication.speakToBot("MSG", line);
    }
};

logThis = function (level, msg, arg) {
//@TODO LOGGER FUNCTION
};