var prefixes = /^:[!,./\?@`]/;

exports.execute = function(data){
    var response = data.split('\r\n'),
        i;
    if (data.match('^PING')) {
        modules['ircServices'].fire("PING",data.split(" "));
    } else {
        for (i = response.length; i--;) {
            responseLine = utils.trim(response[i]);
            if (responseLine != '') {
                responseLine = parse(response[i].split(" "));
                console.log(responseLine.response);
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

    if (utils.isNumber(response[1])) {
        if (constants.raw.REPLY.getKeyByValue(response[1]) != false) {
            type='reply';
            response[1]=constants.raw.REPLY.getKeyByValue(response[1]);
        } else if(constants.raw.COMMAND.getKeyByValue(response[1])!=false) {
            type='command';
            response[1]=constants.raw.COMMAND.getKeyByValue(response[1]);
        }else if(constants.raw.ERROR.getKeyByValue(response[1])!=false) {
            type='error';
            response[1]=constants.raw.ERROR.getKeyByValue(response[1]);
        }
    } else {
        if (constants.raw.REPLY[response[1]] != undefined) {
            type='reply';
        } else if(constants.raw.COMMAND[response[1]]!=undefined) {
            type='command';
        }else if(constants.raw.ERROR[response[1]]!=undefined) {
            type='error';
        }
    }

    var returnObject = {
        method: response[1],
        type:type,
        receiver: response[2],
        sender: sender,
        response:response.join(" "),
        message: response.slice(3)

    };

    return returnObject;
}
//regexp msg parser: https://github.com/bleakgadfly/node-irc/blob/master/lib/client.js / https://github.com/gf3/IRC-js/blob/master/lib/message.js
// Detect if its is a command / error / reply, and handle them.  //
//Get irc session/user if command PRIVMSG and parse the message for commands/arguments etc
//Send info thought own command handler

//modules['ircServices'].fire("AutoJoinChannels");
