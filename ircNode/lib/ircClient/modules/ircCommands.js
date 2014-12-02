var commands = {};
var cmds={};
var dateFormat = require('dateformat');
var usage = require('usage');


exports.fire = function (func, line) {
    console.log(line);

    //@TODO check if command has required arguments
    if(func!=undefined) {
        func = func.toLowerCase();
        if (commands[func] != undefined) {
            if (getPermission(line)) {
                nline = checkArguments(line)
                if (nline != false) {
                    commands[func](nline);
                    if (!line.response.params) var postmsg = '';
                    else var postmsg = ' with arguments: ' + nline.response.params.join(",");

                    cmds.logThis('info', 'executed by ' + ircColor.bold(nline.sender.nick) + postmsg, 'CONTROL' + '::' + nline.response.cmd.toUpperCase());
                } else {
                    if (!line.response.params) var postmsg = '';
                    else var postmsg = line.response.params.join(", ");

                    var premsg = 'Invalid arguments, please use: ' + cfg.bot.commandPrefix + line.response.cmd.toUpperCase() + ' ';
                    var msg = '';
                    for (var i = 0; i < cfg.client.permissions.commands[line.response.cmd.toUpperCase()].arg.length; i++) {
                        msg += '<';
                        if (!cfg.client.permissions.commands[cmd].arg[i].mandatory)msg += '*';
                        msg += cfg.client.permissions.commands[cmd].arg[i].name;
                        msg += '> ';
                    }

                    msg +='['+cfg.client.permissions.commands[line.response.cmd.toUpperCase()].description+']';

                    modules['ircRequests'].notifySender(line, false, premsg + msg);
                    cmds.logThis('info', ircColor.bold(line.sender.nick) + ' used invalid arguments: ' + postmsg, 'CONTROL' + '::' + line.response.cmd.toUpperCase());
                }
            } else {
                modules['ircRequests'].notifySender(line, false, "You have no permission to access this command: " + line.response.cmd.toUpperCase());
                cmds.logThis('info', line.sender.nick + ' has no permission to execute this command', 'CONTROL' + '::' + line.response.cmd.toUpperCase());
            }
        }
        else
            cmds.logThis('error', 'command is undefined', func);
    } else
        cmds.logThis('error', 'command is undefined','undefined');
};

commands.auth = function(line)
{
    console.log(line);
    //@TODO check usr db
    if(line.response.params[0]==cfg.bot.owner[0] && line.response.params[1]==cfg.bot.owner[1])
    {
        modules['ircUsers'].changeGroup(line,'admin');
        modules['ircRequests'].notifySender(line, true,"Welcome back "+cfg.bot.owner[0]);
    } else {
        modules['ircRequests'].notifySender(line, false,"Wrong credentials");
    }
}

commands.info = function(line)
{
    modules['ircRequests'].notifySender(line, true,"| Group:"+line.session.group+" | Message count:"+line.session.meta.msgCount+" | Last active:"+dateFormat(new Date(line.session.last.date),"dd-mm-yy HH:mm")+" | First active:"+dateFormat(new Date(line.session.meta.regDate),"dd-mm-yy HH:mm")+" |");
}

commands.reload = function(line)
{

}

commands.register = function(line)
{
    modules['ircUsers'].register(line.response.params[0],line.response.params[1],line);
}

commands.login = function(line) {
    modules['ircUsers'].login(line.response.params[0], line.response.params[1],line);
}
commands.restart = function(line)
{
  //@TODO clean sessions
}

commands.version = function (line){
    var exec = require('child_process').exec;
    exec('git log --pretty=format:\'%ad %h %d\' --abbrev-commit --date=short -1', function(error, stdout, stderr) {
        modules['ircRequests'].fire("Say", [line.receiver.recipient, stdout]);
    });
}

commands.uptime = function (line){
    var exec = require('child_process').exec;
    exec('uptime', function(error, stdout, stderr) {
        modules['ircRequests'].fire("Say", [line.receiver.recipient, stdout]);
    });
}

commands.stats = function (line){
    usage.lookup(process.pid, function(err, result) {
        modules['ircRequests'].fire("Say", [line.receiver.recipient, "[Client] "+Number((result.cpu).toFixed(1))+"% CPU "+Number((result.memory/1024/1024).toFixed(1))+" MB"]);
    });
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

//@TODO RELOAD gewijzigde bestanden tonen in logger channel
//@TODO show help