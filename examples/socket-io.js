var http = require('http');
var server = http.createServer();
var io = require('socket.io')(server);
var board = require('..')();

io.on('connection', function(socket){
  var peer = board.connect();

  socket.on('message', peer.process);
  peer.on('data', function(data) {
    socket.send(data);
  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
