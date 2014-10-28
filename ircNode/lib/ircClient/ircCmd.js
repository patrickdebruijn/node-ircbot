exports.send= function(data)
{
	//irc.socket.write(data + '\n', 'ascii', function(){
		console.log('SEND+++++::', data);
	//});
};

exports.auth = function()
{
	if(!cfg.state.isAuthed)
	{
		if(cfg.user.pass!='' || cfg.user.pass!=false) exports.send('PASS ' + cfg.user.pass);
		exports.send('NICK ' + cfg.user.defaultNick);
		exports.send('USER ' + cfg.user.user + ' 8 * :' + cfg.user.real);
	} else Utils.logWarn("Your are allready authed");
};

exports.autoJoin = function()
{
	if(!cfg.state.isAutoJoined)
	{
		for (var i = 0; i < cfg.chans.length; i++)
		{
			exports.join(cfg.chans[i]);
		}
		if(cfg.debugChannel!=false)exports.join(cfg.debugChannel);
	} else Utils.logWarn("Your have allready auto joined channels");
};

exports.join = function (chan) {
	if(chan!=undefined) exports.send('JOIN ' + chan); else Utils.logWarn("/JOIN needs an argument");
};

exports.leave = function (chan) {
	if(chan!=undefined) exports.send('LEAVE ' + chan); else Utils.logWarn("/LEAVE needs an argument");
};

exports.away = function(msg)
{
	if(cfg.state.isAway)
	{
		if(msg==undefined) exports.send('AWAY'); else Utils.logWarn("You are allready AWAY");
	} else {
		if(msg!=undefined) exports.send('AWAY '+msg); else Utils.logWarn("You aren't AWAY");
	}
};

exports.nick = function(msg)
{
	if(msg!=undefined) exports.send('NICK '+msg); else Utils.logWarn("/NICK needs an argument");
}

exports.list = function()
{
	exports.send('LIST')
}

exports.names = function()
{
	exports.send('NAMES')
}

exports.version = function()
{
	exports.send('VERSION')
}

exports.users = function()
{
	exports.send('USERS')
}

exports.who = function(chan)
{
	if(chan==undefined)exports.send('WHO'); else exports.send('WHO '+chan);
}

exports.whois = function(user)
{
	if(user!=undefined) exports.send('WHOIS '+user); else Utils.logWarn("/WHOIS needs an argument");
}

exports.userip = function(user)
{
	if(user!=undefined) exports.send('USERIP '+user); else Utils.logWarn("/USERIP needs an argument");
}

exports.userhost = function(user)
{
	if(user!=undefined) exports.send('USERHOST '+user); else Utils.logWarn("/USERHOST needs an argument");
}

exports.trace = function(user)
{
	if(user!=undefined) exports.send('TRACE '+user); else Utils.logWarn("/TRACE needs an argument");
}

exports.me = function(msg)
{
	if(msg!=undefined) exports.send('ME '+msg); else Utils.logWarn("/ME needs an argument");
}

exports.topic = function(topic,chan)
{
	if(chan!=undefined && topic!=undefined)
	{
		exports.send('TOPIC '+chan+' '+topic); 
	} else Utils.logWarn("/TOPIC needs two arguments");
}

exports.invite = function(user,chan)
{
	if(user!=undefined && chan!=undefined)
	{
		exports.send('INVITE '+user+' '+chan); 
	} else Utils.logWarn("/INVITE needs two arguments");
}

exports.knock = function(msg,chan)
{
	if(msg!=undefined && chan!=undefined)
	{
		exports.send('KNOCK '+chan+' '+msg); 
	} else Utils.logWarn("/KNOCK needs two arguments");
}

exports.kick = function(chan,user,msg)
{
	if(user!=undefined && chan!=undefined)
	{
		if(msg==undefined) exports.send('KICK '+chan+' '+user); 
		else exports.send('KICK '+chan+' '+user+' '+msg); 
	} else Utils.logWarn("/KICK needs two arguments");
}

exports.say = function(msg,chan)
{
	if(msg!=undefined)
	{
		if(chan!=undefined) exports.send('PRIVMSG '+chan+' '+msg); 
		else for (var i = 0; i < cfg.state.info.chans.length; i++) exports.send('PRIVMSG '+cfg.state.info.chans[i]+' '+msg);
	} else Utils.logWarn("/MSG needs an argument");
}

exports.notice = function(msg,chan)
{
	if(msg!=undefined)
	{
		if(chan!=undefined) exports.send('NOTICE '+chan+' '+msg); 
		else for (var i = 0; i < cfg.state.info.chans.length; i++) exports.send('NOTICE '+cfg.state.info.chans[i]+' '+msg);
	} else Utils.logWarn("/NOTICE needs an argument");
}


exports.quit = function(msg)
{
	if(msg!=undefined)exports.send('QUIT '+msg); else exports.send('QUIT');
}
//@TODO: Uitbreiden met: https://github.com/slate/slate-irc/tree/master/lib/plugins
//@TODO: WHOIS COMMANDO FIXEN http://www.irchelp.org/irchelp/irctutorial.html http://en.wikipedia.org/wiki/List_of_Internet_Relay_Chat_commands

