var collection = {},
    session = false;
var users = {};

exports.init = function () {
    if (state.dbConnected && collection['sessions'] == undefined && collection['users'] == undefined) {
        //Maak schema en laad het in:
        collection['sessions'] = db.collection('sessions');
        collection['users'] = db.collection('users');
    } else
        users.logThis("error", "Not connect to DB, can't initialize users module","INIT");


};

exports.getSession = function (line) {

    if (line.sender != false && line.sender.nick != false && line.sender.ident != false && line.sender.ident != 'server' && state.dbConnected) {
        collection['sessions'].findOne({
            ident: line.sender.ident
        }, function (err, session) {
            if (err) {
                users.logThis('error', 'DB QUERY ERROR', "GETSESSION");
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
    collection['sessions'].insert(line.session);
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

    collection['sessions'].update({ident: line.sender.ident}, line.session);
    modules['ircParser'].processPrivMsg(line);
};


users.logThis = function (level, msg, vari) {
    modules['ircLogger'].log(level, '<'+vari+'> '+msg,'CORE','USERS');
};

//@TODO maak ook een user object welke persisitent is, en laat session object echt een session zijn