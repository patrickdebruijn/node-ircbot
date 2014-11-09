var prefixes    = /^:[!,./\?@`]/;
const COMMAND   = 'command';
const ERROR     = 'error';
const REPLY     = 'reply';
const SYSTEM    = 'system';
const BOT       = 'bot';
const PLUGIN    = 'plugin';

exports.execute = function(data){
    var response = data.split('\r\n'),  //Split a reponse in lines
        i;
    if (data.match('^PING')) {  //Intercept the response line if it starts with PING and dispatch a PONG command to keep te connection alive
        modules['ircResponseHandler'].fire("PINGSTART",data.split(" "));
    } else {
        for (i = response.length; i--;) {
            responseLine = utils.trim(response[i]);
            if (responseLine != '') {
                responseLine = parse(response[i].split(" "));
                log.trace("RECEIVING: "+responseLine.response);
                handleResponseLine(responseLine);
            }
        }
    }
};



parse = function(response) {
    var sender,
        formatUserhost,
        formatNick,
        formattedReturn,
        type=false,
        cmdType=false,
        recipient=false,
        forMe=false,
        recipient=false,
        message=false,
        cmd=false,
        nick;
    // In case sender is a nick!user@host, parse the nick.
    try {
        formatUserhost = new RegExp(/\b[^]*(.*?)!/);                // :nick!user@host =>
        nick = formatUserhost.exec(response[0]);                    // [n,i,c,k,!] =>
        formatNick = nick.join("");                                 // nick! =>
        sender = (formatNick.substring(0,(formatNick.length-1)));   // nick => Done.
    } catch(e) {
        sender = 'server';
    }


    //If the line descriptor is numeric get the relevant label for readability
    if (utils.isNumber(response[1])) {
        if (constants.raw.REPLY.getKeyByValue(response[1]) != false) response[1]=constants.raw.REPLY.getKeyByValue(response[1]);
        else if(constants.raw.COMMAND.getKeyByValue(response[1])!=false) response[1]=constants.raw.COMMAND.getKeyByValue(response[1]);
        else if(constants.raw.ERROR.getKeyByValue(response[1])!=false) response[1]=constants.raw.ERROR.getKeyByValue(response[1]);
    }
    if (utils.isNumber(response[1]))
        log.warn("Cannot find translation for line descriptor: "+response[1]);
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

    if(type==undefined)type="other"; //@TODO Maybe te string was part of the last line, should we buffer these things?

    var message = response.slice(3);
    if(message[0]!=undefined && message[0]!='')message[0]=utils.trim(message[0].substr(1)); //Strip the devide : from the message
    if(response[2] == state.nick) forMe=true; else  forMe=false;  //Check if message is directed at me
    if(response[2]!=undefined) {
        if (response[2].indexOf("#") == 0) receiver = 'channel'; else  receiver = 'user'; //Is the message in a channel or directed at me?
    }
    //CHECK if message is for me and  determine if the first word is a command for the irc bot. (CHeck if receiver is channel or user for command prefix)
    if(type==COMMAND && message[0]!=undefined) //Get first word of the message
    {
        //@TODO VIND een manier om wel die unicode mee te matchen zodat VERSION in chat niet meegmatched word.
        var cmd=message[0].replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '').toUpperCase(); //Filter non ascii out so we can read it in plain text
        if (constants.raw.COMMAND[cmd] != undefined){
            cmd=constants.raw.COMMAND[cmd];
            cmdType=SYSTEM;
        }
        else if(cmd!=undefined && cmd!='') {
            if(receiver=='channel')
            {
                if(cmd.indexOf(cfg.bot.commandPrefix)==0)
                {
                    cmd=cmd.substr(1);
                    if(cfg.client.permissions.commands[cmd]!=undefined)
                    {
                        cmdType=BOT;
                    }
                }
            } else {
                if(cfg.client.permissions.commands[cmd]!=undefined)
                {
                    cmdType=BOT;
                }
            }
        }
        if(!cmdType)cmd=false;
    }
    var returnObject = {
        method: response[1],
        forMe:forMe,
        type:type,
        receiver: receiver,
        recipient:response[2],
        sender: sender,
        botCommand:cmd,
        botCommandType:cmdType,
        response:response.join(" "),
        date: new Date(),
        message: message

    };

    return returnObject;
};

handleResponseLine = function (line) {

    switch(line.type) {
        case 'error':
            modules['ircLogger'].log("error","["+line.method+"] "+line.message.join(" "));
            log.warn("IRCSERVER: ["+line.method+"]: "+line.message.join(" "));

            //@TODO create een ircErrorHandler.js
            break;
        case 'reply':
            //@TODO Route replies back reponseHandler and/or to ircBot when needed
            //@TODO Listen to replies to detect if a command is executed correcly <-- Communication needs to be extended with a registry and callback functionality + Buffer function for multiLine reply
            break;
        case 'command':
            if(line.botCommandType=='system') //Check if response a PRIVMSG or NOTICE, if not send command to repsonse handler
            {
                modules['ircResponseHandler'].fire(line.botCommand,line);
                modules['ircLogger'].log("info","["+line.botCommand+"] "+line.response);
            } else if(line.method!='PRIVMSG' && line.method!='NOTICE') {
                modules['ircResponseHandler'].fire(line.method,line);
                modules['ircLogger'].log("info","["+line.method+"] "+line.response);
            } else {
                //@TODO Make reponse handlers when things need to be updated, (user modus, NICK, etc)
                var session = modules['ircUsers'].getSession(line);  //Get Session info and check if the sender isn't on the ignore list
                console.log(line);
                //SEND arg and session to ircSats module to gather stats and velocity
                //Is it a command?  check if the command is for a plugin or for the core, and send it to the correct handler.
                //In this handler, check the permissions with virgin-acl https://github.com/djvirgen/virgen-acl
            }
            break;
    }
    if(line.type!=undefined && line.type!='other')modules['ircResponseHandler'].fire(line.method,line); //
};
//regexp msg parser: https://github.com/bleakgadfly/node-irc/blob/master/lib/client.js / https://github.com/gf3/IRC-js/blob/master/lib/message.js