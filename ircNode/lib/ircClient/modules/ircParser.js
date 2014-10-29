//regexp msg parser: https://github.com/bleakgadfly/node-irc/blob/master/lib/client.js / https://github.com/gf3/IRC-js/blob/master/lib/message.js
// Detect if its is a command / error / reply, and handle them.  //
//Get irc session/user if command PRIVMSG and parse the message for commands/arguments etc
//Send info thought own command handler for system commands (RELOAD, etc) or to bot.
