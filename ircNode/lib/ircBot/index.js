var messenger       = require('messenger');
console.log("child started!");

speaker = messenger.createSpeaker(9020);
//setTimeout(function(){speaker.send('restartBot')},5000);

