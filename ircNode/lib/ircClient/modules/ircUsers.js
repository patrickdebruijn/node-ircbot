var sessionSchema,
    session;

exports.init = function () {
    if (state.dbConnected) {
        //Maak schema en laad het in:
        sessionSchema = db.Schema({
            ident: {type: String, index: true },
            group: String,
            mode: String,
            meta: {
                regDate: Date,
                msgCount: Number,
                chans:[]
            },
            last: {
                nick: String,
                msg: String,
                date: { type: Date, default: Date.now },
                chan: String
            },
            history: {
                nicks:[{name: String,date: Date}],
                chans:[{name: String,date: Date}]
            }

        });

        //@TODO functies aan schema toevoegen voor easy gebruik

        session = db.model('Sessions', sessionScheme)
    } else
        logThis("error","Not connect to DB, can't initialize users module")
    loadPermissions();
};

exports.getSession = function (line) {

    if(state.dbConnected)
    {

        console.log(line);
        return true;
    }
    //If !ident return false;
    //Lookup ident in mongodb
    //If it is there update the stats (Msg count, last active, latest msg +channel, expire date??, nick, )
    //If not register new session
    //get session obj

    return false;
};

exports.getPermission = function (line) {

    //if !cmd return false;
    //Find cmd in config, if not return false.
    //If its there check virgin acl permission
};

exports.deleteSession = function () {
    //@TODO delete session voor parts oid.
};

loadPermissions = function () {
    //Permissions laden met virgin acl: virgin-acl https://github.com/djvirgen/virgen-acl

};



logThis = function (level, msg, arg) {
//@TODO LOGGER FUNCTION
};