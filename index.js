var jsonparse = require('cog/jsonparse');
var EventEmitter = require('events').EventEmitter;

/**
  # rtc-switch

  This is a processor layer for the rtc-switchboard that is capable of
  talking with an rtc-signaller up to and including version 5.

**/
module.exports = function(opts) {
  var rooms = {};
  var board = new EventEmitter();

  function connect() {
    var peer = new EventEmitter();

    function process(data) {
      var command;
      var parts;
      var target;

      console.log('IN  ==> ' + data);
      if (data.charAt(0) === '/') {
        // initialise the command name
        command = data.slice(1, data.indexOf('|', 1)).toLowerCase();

        // get the payload
        parts = data.slice(command.length + 2).split('|').map(jsonparse);

        // if we have a to command, and no designated target
        if (command === 'to') {
          target = peer.room.filter(function(member) {
            return member.id === parts[0];
          })[0];

          // if the target is unknown, refuse to send
          if (! target) {
            console.warn('got a to request for id "' + parts[0] + '" but cannot find target');
            return false;
          }

          target.emit('data', data);
        }

        if (! target) {
          board.emit.apply(board, [command, data, peer].concat(parts));

          if (peer.room) {
            peer.room.filter(function(member) {
              return member !== peer;
            }).forEach(function(member) {
              member.emit('data', data);
            });
          }
        }
      }
    }

    function leave() {
    }

    // add peer functions
    peer.process = process;
    peer.leave = leave;

    return peer;
  }

  function destroy() {
    rooms = {};
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
    return rooms[name] || (rooms[name] = []);
  }

  // handle announce messages
  board.on('announce', function(payload, peer, sender, data) {
    var room = peer.room = data && data.room && getOrCreateRoom(data.room);

    // tag the peer id
    peer.id = data.id;

    // send through the announce
    if (room) {
      room.forEach(emit('data', payload));

      // add the peer to the room
      room.push(peer);

      // send the number of members back to the peer
      peer.emit('data', '/roominfo|{"memberCount":' + room.length + '}');
    }
  });

  board.on('leave', function(peer, sender, data) {
    if (peer.room) {
      // remove the peer from the room
      peer.room = peer.room.filter(function(member) {
        return member !== peer;
      });

      peer.room = undefined;
    }
  });

  board.connect = connect;
  board.destroy = destroy;

  return board;
};
