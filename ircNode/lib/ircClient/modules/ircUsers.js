var collection = false,
    session = false,
    Acl = require("virgen-acl").Acl,
    acl = new Acl();

exports.init = function () {
    loadPermissions();
    if (state.dbConnected && collection == false) {
        //Maak schema en laad het in:
        collection = db.collection('sessions');
    } else
        logThis("error", "Not connect to DB, can't initialize users module");


};

exports.getSession = function (line) {

    if (line.sender != false && line.sender.nick != false && line.sender.ident != false && line.sender.ident != 'server' && state.dbConnected) {
        collection.findOne({
            ident: line.sender.ident
        }, function (err, session) {
            if (err) {
                logThis('error', 'DB QUERY ERROR', err);
                return false
            } else if (session == undefined) {
                return registerNewSession(line);
            } else {
                return updateSession(session, line);
            }
        });
    }
    return false;
};

exports.getPermission = function (line) {
    console.log(line);
    if (line.sender != false && line.sender.nick != false && line.sender.ident != false && line.sender.ident != 'server' && line.response.cmd != false && line.response.cmd != undefined && cfg.client.permissions.commands[line.response.cmd] != undefined) {
        cmd = line.response.cmd.toUpperCase();
        if (cfg.client.permissions.commands[cmd].groups == false)return true;
        else if (cfg.client.permissions.commands[cmd].groups != undefined) {
            for (var num in cfg.client.permissions.commands[cmd].groups) {
                if (typeof cfg.client.permissions.commands[cmd].groups[num] == 'string' && cmd == cfg.client.permissions.commands[cmd].groups[num].toUpperCase())return true;
            }
        }
    }
    return false;
};

exports.deleteSession = function () {
    //@TODO delete session voor parts oid.
};

exports.parseSenderInfo = function (response) {
    try {
        var i = response[0].indexOf('!');
        if (-1 != i) nick = response[0].slice(1, i);

        var d = response[0].indexOf('@');
        if (-1 != d)  name = response[0].slice(i + 1, d);

        if (-1 != d) host = response[0].slice(d + 1);

        var sender = name + "@" + host;

        return {
            name: name,
            nick: nick,
            host: host,
            ident: sender
        };
    } catch (e) {
        return false
    }
};

registerNewSession = function (line) {
    if (line.receiver.type == 'channel')
        var channel = [line.receiver.recipient];
    else
        var channel = [];

    line.session = {
        ident: line.sender.ident,
        group: 'guest',
        mode: false,
        meta: {
            regDate: new Date(),
            msgCount: 1
        },
        last: {
            nick: line.sender.nick,
            msg: line.response.message,
            date: new Date(),
            chan: channel
        },
        history: {
            nicks: [line.sender.nick],
            chans: channel
        }
    };
    collection.insert(line.session);
    modules['ircParser'].processPrivMsg(line);
};
updateSession = function (session, line) {
    session.last = {
        nick: line.sender.nick,
        msg: line.response.message.join(" "),
        date: new Date(),
        to: line.receiver.recipient
    };

    if (!session.history.nicks.getKeyByValue(line.sender.nick))session.history.nicks.push(line.sender.nick);
    if (!session.history.chans.getKeyByValue(line.receiver.recipient))session.history.chans.push(line.receiver.recipient);
    session.meta.msgCount++;
    line.session = session;

    collection.update({ident: line.sender.ident}, line.session);
    modules['ircParser'].processPrivMsg(line);
};
//If it is there update the stats (Msg count, last active, latest msg +channel, expire date??, nick, )

loadPermissions = function () {
    //Permissions laden met virgin acl: virgin-acl https://github.com/djvirgen/virgen-acl
    for (var i = 0; i < cfg.client.permissions.groups.length; i++)acl.addRole(cfg.client.permissions.groups[i]);
    acl.addResource("system");
    acl.deny();

    state.permissionLoaded = true;
};


logThis = function (level, msg, arg) {
//@TODO LOGGER FUNCTION
};