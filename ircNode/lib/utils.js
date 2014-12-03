var http = require("http");
var https = require("https");

module.exports =
{
    isNumber: function(obj) {return !isNaN(parseFloat(obj))},			//Helper function to check if var is really a number
    isArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    trim: function  (string) {
        string = string.replace(/(^\s*)|(\s*$)/gi,"");
        string = string.replace(/[ ]{2,}/gi," ");
        string = string.replace(/\n /,"\n");
        return string;
    },
    getJSON: function (options, onResult) {
        var prot = options.port == 443 ? https : http;
        var req = prot.request(options, function (res) {
            var output = '';
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                output += chunk;
            });

            res.on('end', function () {
                var obj = JSON.parse(output);
                onResult(res.statusCode, obj);
            });
        });

        req.on('error', function (err) {
            //res.send('error: ' + err.message);
        });

        req.end();
    }
};


//Function te remove value from array, ex: arry.remove("value");
Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


Object.defineProperty(Object.prototype, 'getKeyByValue', {
    get: function(value) {
        for( var prop in this ) {
            if( this.hasOwnProperty( prop ) ) {
                if( this[ prop ] === value )
                    return prop;
            }
        }
        return false;
    },
    enumerable: false // = Default
});