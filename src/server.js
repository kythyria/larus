var requirejs = require("./js/lib/r.js");

requirejs.config({
    nodeRequire: require,
    baseUrl: './js'
});

var app = require('http').createServer(handler)
var io = require('socket.io').listen(app)
var fs = require('fs');

function handler (req, res) {
  fs.readFile(__dirname + '/demo.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

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