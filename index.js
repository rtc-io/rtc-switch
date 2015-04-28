var jsonparse = require('cog/jsonparse');
var EventEmitter = require('events').EventEmitter;
var FastMap = require('collections/fast-map');

/**
  # rtc-switch

  This is a processor layer for the rtc-switchboard that is capable of
  talking with an rtc-signaller up to and including version 5.

  ## Example Usage

  Plain old websockets:

  <<< examples/ws-server.js

  Using [socket.io](https://github.com/Automattic/socket.io):

  <<< examples/socket-io.js

**/
module.exports = function(opts) {
  var board = new EventEmitter();
  var rooms = board.rooms = new FastMap();

  function connect() {
    var peer = new EventEmitter();

    function process(data) {
      var command;
      var parts;
      var target;

      if (data.charAt(0) === '/') {
        // initialise the command name
        command = data.slice(1, data.indexOf('|', 1)).toLowerCase();

        // get the payload
        parts = data.slice(command.length + 2).split('|').map(jsonparse);

        // if we have a to command, and no designated target
        if (command === 'to') {
          target = peer.room.members.filter(function(member) {
            return member.id === parts[0];
          })[0];

          // if the target is unknown, refuse to send
          if (! target) {
            console.warn('got a to request for id "' + parts[0] + '" but cannot find target');
            return false;
          }

          return target.emit('data', data);
        }

        if (! target) {
          board.emit.apply(board, [command, data, peer].concat(parts));

          if (peer.room) {
            peer.room.members.filter(function(member) {
              return member !== peer;
            }).forEach(function(member) {
              member.emit('data', data);
            });
          }
        }
      }
    }

    // add peer functions
    peer.process = process;
    peer.leave = board.emit.bind(board, 'leave', peer);

    return peer;
  }

  function createRoom(name) {
    // create a simple room object
    rooms.set(name, {
      name: name,
      members: []
    });

    return rooms.get(name);
  }

  function destroy() {
    rooms.clear();
  }

  function emit(name, src) {
    var args = [].slice.call(arguments);

    return function(emitter) {
      // never send messages to ourself
      if (emitter === src) {
        return;
      }

      return emitter.emit.apply(emitter, args);
    };
  }

  function getOrCreateRoom(name) {
    return rooms.get(name) || createRoom(name);
  }

  // handle announce messages
  board.on('announce', function(payload, peer, sender, data) {
    var room;

    // if the peer is already in a room, then we need to remove them from
    // that room
    if (peer.room) {
      board.emit('leave', peer, sender, data);
    }

    // create the new room
    room = peer.room = data && data.room && getOrCreateRoom(data.room);

    // tag the peer id
    peer.id = data.id;

    // send through the announce
    if (room) {
      room.members.forEach(emit('data', payload));

      // add the peer to the room
      room.members.push(peer);

      // send the number of members back to the peer
      peer.emit('data', '/roominfo|{"memberCount":' + room.length + '}');
    }
  });

  board.on('leave', function(peer) {
    if (peer.room) {
      // remove the peer from the room
      peer.room.members = peer.room.members.filter(function(member) {
        return member !== peer;
      });

      // if we have no more members in the room, then destroy the room
      if (peer.room.members.length === 0) {
        board.emit('room:destroy', peer.room.name);
        rooms.delete(peer.room.name);
      }

      peer.room = undefined;
    }
  });

  board.connect = connect;
  board.destroy = destroy;

  return board;
};
