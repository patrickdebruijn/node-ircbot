var prefixes = /^:[!,./\?@`]/;
var pars={};

const COMMAND = 'command';
const ERROR = 'error';
const REPLY = 'reply';
const OTHER = 'other';
const SYSTEM = 'system';
const BOT = 'bot';
const PLUGIN = 'plugin';
const MSG = 'MSG';
const UNKNOWN = 'UNKNOWN';

exports.execute = function (data) {
    var response = data.split('\r\n'),  //Split a reponse in lines
        i;
    if (data.match('^PING')) {  //Intercept the response line if it starts with PING and dispatch a PONG command to keep te connection alive
        modules['ircResponseHandler'].catch("PINGSTART", data.split(" "));
    } else {
        for (i = response.length; i--;) {
            responseLine = utils.trim(response[i]);
            if (responseLine != '') {
                lineObj = parseLine(response[i].split(" "));
                processLine(lineObj);
            }
        }
    }
};

parseLine = function (response) {  //@TODO opsplitsen in subfuncties, en user ssession info hier ook al pakken wanneer nodig
    var receiverType = false,
        receiver = false,
        forMe = false;


    //@TODO EXTRA CHRCK hier of response parts gevuld zijn en al bepalen wat we ermee kunnen doen
    if (response[2] != undefined) {
        if (response[2] == state.nick) forMe = true; else  forMe = false;  //Check if message is directed at me
        if (response[2].indexOf("#") == 0) receiverType = 'channel'; else  receiverType = 'user'; //Is the message in a channel or directed at me?
        receiver = {
            forMe: forMe,
            type: receiverType,
            recipient: response[2]
        }
    }

    var method = parseMethod(response);
    var sender = modules['ircUsers'].parseSenderInfo(response);

    var returnObject = {
        method: method.name,
        type: method.type,
        sender: sender,
        receiver: receiver,
        response: parseResponse(response, method, receiverType),
        date: new Date()
    };

    return returnObject;
};

parseMethod = function (response) {
    //If the line descriptor is numeric get the relevant label for readability
    var type;
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

    if (type == undefined)
        type = OTHER;

    //@TODO Maybe te string was part of the last line, should we buffer these things?

    return {type: type, name: response[1]}
};

parseResponse = function (response, method, receiverType) {

    var cmd = false,
        cmdType = false,
        params = false,
        count = 0,
        message = [];
    var messagetemp = response.slice(3);
    for (var i = 0; i < messagetemp.length; i++)if(messagetemp[i]=='' || messagetemp[i]==' ')messagetemp.remove(messagetemp[i]);
    for (var i in messagetemp)if(typeof messagetemp[i]=='string') message.push(messagetemp[i]);

    if (message[0] != undefined && message[0] != '' && utils.trim(message[0].substr(0, 1)) == ':')message[0] = utils.trim(message[0].substr(1)); //Strip the devide : from the message

    //CHECK if message is for me and  determine if the first word is a command for the irc bot. (CHeck if receiver is channel or user for command prefix)
    if (method.name == "PRIVMSG" && message[0] != undefined) //Get first word of the message
    {
        //@TODO VIND een manier om wel die unicode mee te matchen zodat VERSION in chat niet meegmatched word.
        var tmpCmd = message[0].replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '').toUpperCase(); //Filter non ascii out so we can read it in plain text

        if (constants.raw.COMMAND[tmpCmd] != undefined) {
            cmd = constants.raw.COMMAND[tmpCmd];
            cmdType = SYSTEM;
            if(message[1]!=undefined)params = message.slice(1);
            //@TODO DETECTEER CTCP MESAGES
        }
        else if (tmpCmd != undefined && tmpCmd != '') {
            if (receiverType == 'channel') {
                if (tmpCmd.indexOf(cfg.bot.commandPrefix) == 0)
                    cmd = tmpCmd.substr(1).toUpperCase();
            } else
                cmd = tmpCmd.toUpperCase();

            if (cmd != false) {
                if(message[2]!=undefined)params = message.slice(2);
                if (cmd == cfg.client.systemCommand.toUpperCase()) {
                    cmdType = BOT;
                    cmd = message[1].toUpperCase();

                }
                else
                {
                    for (var prop in cfg.client.permissions.commands) {
                        if(cfg.client.permissions.commands[prop].alias!=undefined && cfg.client.permissions.commands[prop].alias!=false)
                        {
                            for (var i = 0; i < cfg.client.permissions.commands[prop].alias.length; i++) {
                                if(cmd==cfg.client.permissions.commands[prop].alias[i].toUpperCase())
                                {
                                    cmd=prop;
                                    cmdType = BOT;
                                }
                            }
                        }
                    }
                    if(cmdType==false)
                    {
                        cmdType = PLUGIN;
                    }
                }
            }
        }
    }

    return {
        cmd: cmd,
        type: cmdType,
        params:params,
        parts: response,
        message: message  //@TODO Controleren of dit bericht gevuld is bij server commadns zoals NICK etc
    };
};

processLine = function (line) {
    if (line.type != undefined) {
        switch (line.type) { //Parse line from irc server
            case ERROR: //Handle irc error messages
                pars.logThis("error", line, 'PROCESSLINE::'+ERROR);
                modules['ircErrorHandler'].catch(line.method, line);
                break;
            case REPLY: //Handle irc reply messages
                pars.logThis("trace", line, 'PROCESSLINE::'+REPLY);
                modules['ircResponseHandler'].catch(line.method, line);
                break;
            case COMMAND: //Handle irc commands messages
                if (line.response.type == SYSTEM) //Check line has an irc commando
                {
                    pars.logThis("debug", line, 'PROCESSLINE::'+COMMAND);
                    modules['ircResponseHandler'].catch(line.response.cmd, line);
                } else if (line.method == 'PRIVMSG') { //@TODO uitzoeken hoe ik notices van snotices kan onderscheiden
                    modules['ircUsers'].getSession(line);  //Get Session and register its state in mongodb
                } else { //Other irc commando's like VERSION
                    pars.logThis("info", line, 'PROCESSLINE::'+COMMAND);
                    modules['ircResponseHandler'].catch(line.method, line);
                }
                break;
            case OTHER: //???
                pars.logThis("warn", line, 'PROCESSLINE::'+OTHER);
                break;
            default://Try to handle any unknown message
                pars.logThis("warn", line, 'PROCESSLINE::'+UNKNOWN);
                modules['ircResponseHandler'].catch(line.method, line);
        }
    }
};



exports.processPrivMsg = function (line) {
    if (line.response.type == BOT && cfg.client.permissions.commands[line.response.cmd] != undefined) //Check if this line is an existing control command
    {

        modules['ircCommands'].fire(cfg.client.permissions.commands[line.response.cmd].function, line);
    } else if (line.response.type == PLUGIN) {
        pars.logThis("debug", line, 'PROCESSPRIV::'+PLUGIN);
        //communication.speakToBot(PLUGIN, line);
        //@TODO maak handler voor plugins commands met permissions
    } else if(line.receiver.type == 'channel') {
        pars.logThis("trace", line, 'PROCESSPRIV::'+MSG);
        modules['ircStats'].analyse(line); //send msg to irc stats for raw logging and velocity and channel stats
        communication.speakToBot(MSG, line);
    } else {
        pars.logThis("warn", line, 'PROCESSPRIV::'+UNKNOWN);
    }
};



pars.logThis = function (level, msg, vari) {
    var message;

    if(msg.response!=undefined)
    {
        if(msg.response.cmd!=false)
            vari+="::"+msg.response.cmd;
        else
            vari+="::"+msg.method;

        message = msg.response.message.join(" ");
    } else
        message = msg;
    modules['ircLogger'].log(level, '<'+vari+'> '+message,'CORE','PARSER');
};