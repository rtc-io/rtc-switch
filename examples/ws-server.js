var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8080 });
var board = require('../')();

wss.on('connection', function connection(ws) {
  var peer = board.connect();

  ws.on('message', peer.process);
  peer.on('data', function(data) {
    if (ws.readyState === 1) {
      console.log('OUT <== ' + data);
      ws.send(data);
    }
  });

  ws.on('close', peer.leave);
});
