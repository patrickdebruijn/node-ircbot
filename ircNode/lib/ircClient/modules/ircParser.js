var prefixes = /^:[!,./\?@`]/;

exports.execute = function(data){
    var response = data.split('\r\n'),  //Split a reponse in lines
        i;
    if (data.match('^PING')) {  //Intercept the response line if it starts with PING and dispatch a PONG command to keep te connection alive
        modules['ircResponseHandler'].fire("PING",data.split(" "));
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
        type,
        nick;
    // In case sender is a nick!user@host, parse the nick.
    try {
        formatUserhost = new RegExp(/\b[^]*(.*?)!/);                // :nick!user@host =>
        nick = formatUserhost.exec(response[0]);                    // [n,i,c,k,!] =>
        formatNick = nick.join("");                                 // nick! =>
        sender = (formatNick.substring(0,(formatNick.length-1)));   // nick => Done.
    } catch(e) {
        sender = undefined;
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
            type = 'reply';
        } else if (constants.raw.COMMAND[response[1]] != undefined) {
            type = 'command';
        } else if (constants.raw.ERROR[response[1]] != undefined) {
            type = 'error';
        }
    }

    if(type==undefined)type="other"; //@TODO Maybe te string was part of the last line, should we buffer these things?

    var message = response.slice(3);
    if(message[0]!=undefined && message[0]!='')message[0]=message[0].substr(1);
    var returnObject = {
        method: response[1],
        type:type,
        receiver: response[2],
        sender: sender,
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
            break;
        case 'reply':
            //@TODO Route replies back to ircBot when needed
            //@TODO Listen to replies to detect if a command is executed correcly <-- Communication needs to be extended with a registry and callback functionality + Buffer function for multiLine reply
            break;
        case 'command':
            //if(cfg.development.debugModus)modules['ircLogger'].log("info",line.method+" "+line.message.join(" "));
            //@TODO Send irc commands to logger channel
            //@TODO Make reponse handlers when things need to be updated, (user modus etc)
            break;
    }
    if(line.type!=undefined && line.type!='other')modules['ircResponseHandler'].fire(line.method,line); //
};
//regexp msg parser: https://github.com/bleakgadfly/node-irc/blob/master/lib/client.js / https://github.com/gf3/IRC-js/blob/master/lib/message.js