var commands = {};
var cmds={};
var dateFormat = require('dateformat');


exports.fire = function (func, line) {
    console.log(line);

    //@TODO check if command has required arguments
    func = func.toLowerCase();
    if (commands[func] != undefined)
    {
        if (getPermission(line)) {
            nline=checkArguments(line)
            if(nline!=false) {
                commands[func](nline);
                if(!line.response.params) var postmsg='';
                else var postmsg=' with arguments: '+nline.response.params.join(",");

                cmds.logThis('info', 'executed by ' + ircColor.bold(nline.sender.nick)+postmsg, 'CONTROL' + '::' + nline.response.cmd.toUpperCase());
            } else {
                if(!line.response.params) var postmsg='';
                else var postmsg=line.response.params.join(", ");

                var premsg='Invalid arguments, please use: '+cfg.bot.commandPrefix+line.response.cmd.toUpperCase()+' ';
                var msg = '';
                for (var i = 0; i < cfg.client.permissions.commands[line.response.cmd.toUpperCase()].arg.length; i++)
                {
                    msg+='<';
                    if(!cfg.client.permissions.commands[cmd].arg[i].mandatory)msg+='*';
                    msg+=cfg.client.permissions.commands[cmd].arg[i].name;
                    msg+='> ';
                }

                exports.notifySender(line, false,premsg+msg);
                cmds.logThis('info',ircColor.bold(line.sender.nick)+' used invalid arguments: '+postmsg,'CONTROL'+'::'+line.response.cmd.toUpperCase());
            }
        } else
        {
            exports.notifySender(line, false, "You have no permission to access this command: "+line.response.cmd.toUpperCase());
            cmds.logThis('info',line.sender.nick+' has no permission to execute this command','CONTROL'+'::'+line.response.cmd.toUpperCase());
        }
    }
    else
        cmds.logThis('error','command is undefined',func);
};

commands.auth = function(line)
{
    console.log(line);
    //@TODO check usr db
    if(line.response.params[0]==cfg.bot.owner[0] && line.response.params[1]==cfg.bot.owner[1])
    {
        modules['ircUsers'].changeGroup(line,'admin');
        exports.notifySender(line, true,"Welcome back "+cfg.bot.owner[0]);
    } else {
        exports.notifySender(line, false,"Wrong credentials");
    }
}

commands.info = function(line)
{
    exports.notifySender(line, true," | Group:"+line.session.group+" | Message count:"+line.session.meta.msgCount+" | Last active:"+dateFormat(new Date(line.session.last.date),"dd-mm-yy HH:mm")+" | First active:"+dateFormat(new Date(line.session.meta.regDate),"dd-mm-yy HH:mm")+" | ");
}

commands.reload = function(line)
{

}

commands.restart = function(line)
{
  //@TODO clean sessions
}


getPermission = function (line) {
    //@TODO check voor aliases
    if (line.sender != false && line.sender.nick != false && line.sender.ident != false && line.sender.ident != 'server' && line.response.cmd != false && line.response.cmd != undefined && cfg.client.permissions.commands[line.response.cmd] != undefined) {
        cmd = line.response.cmd.toUpperCase();
        if (cfg.client.permissions.commands[cmd].groups == false)return true;
        else if (cfg.client.permissions.commands[cmd].groups != undefined) {
            for (var num in cfg.client.permissions.commands[cmd].groups) {
                if (typeof cfg.client.permissions.commands[cmd].groups[num] == 'string' && line.session.group.toUpperCase() == cfg.client.permissions.commands[cmd].groups[num].toUpperCase())return true;
            }
        }
    }
    return false;
};

checkArguments = function (line){
    cmd = line.response.cmd.toUpperCase();
    if (cfg.client.permissions.commands[cmd].arg == false || cfg.client.permissions.commands[cmd].arg == undefined)return line;
    else {
        for (var i = 0; i < cfg.client.permissions.commands[cmd].arg.length; i++)
        {
            if(cfg.client.permissions.commands[cmd].arg[i].mandatory && line.response.params[i]==undefined)return false;
            else if(cfg.client.permissions.commands[cmd].arg[i].default!=false &&
                cfg.client.permissions.commands[cmd].arg[i].default!=undefined &&
                !cfg.client.permissions.commands[cmd].arg[i].mandatory &&
                line.response.params[i]==undefined)line.response.params[i]=cfg.client.permissions.commands[cmd].arg[i].default;
        }
        return line;
    }

};

cmds.logThis = function (level, msg, vari) {
    modules['ircLogger'].log(level, '<'+vari+'> '+msg,'CORE','COMMAND');
};

exports.notifySender = function(line,success,msg)
{
    var message;
    if(success)
        message= ircColor.bggreen(msg);
    else
        message= ircColor.bgpurple(msg);

    modules['ircRequests'].fire("Notice", [line.sender.nick, message]);
};

//@TODO RELOAD gewijzigde bestanden tonen in logger channel
//@TODO show help