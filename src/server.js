var requirejs = require("./js/lib/r.js");

requirejs.config({
    nodeRequire: require,
    baseUrl: './js'
});

var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
var fs = require('fs');

app.use(express.static(__dirname));

var changelist = [];

io.sockets.on('connection', function(sock){
    for (var i = 0; i < changelist.length; i++)
    {
        sock.emit("outchange", changelist[i]);
    }
    
    sock.on("inchange", function(data){
        console.log(data);
    });
});

app.listen(8080);
