# rtc-switch

This is a processor layer for the rtc-switchboard that is capable of
talking with an rtc-signaller up to and including version 5.


[![NPM](https://nodei.co/npm/rtc-switch.png)](https://nodei.co/npm/rtc-switch/)

[![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/dominictarr/stability#unstable) [![Build Status](https://api.travis-ci.org/rtc-io/rtc-switch.svg?branch=master)](https://travis-ci.org/rtc-io/rtc-switch) [![bitHound Score](https://www.bithound.io/github/rtc-io/rtc-switch/badges/score.svg)](https://www.bithound.io/github/rtc-io/rtc-switch) 

## Example Usage

Plain old websockets:

```js
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8080 });
var board = require('rtc-switch')();

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

```

Using [socket.io](https://github.com/Automattic/socket.io):

```js
var http = require('http');
var server = http.createServer();
var io = require('socket.io')(server);
var board = require('rtc-switch')();

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

```

## License(s)

### Apache 2.0

Copyright 2015 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
