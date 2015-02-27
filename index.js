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
    var peer = {};

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
          target = mgr.peers.get(parts[0]);

          // if the target is unknown, refuse to send
          if (! target) {
            console.warn('got a to request for id "' + parts[0] + '" but cannot find target');
            return false;
          }
        }

        if (! target) {
          board.emit.apply(board, [command].concat(parts));
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

  board.connect = connect;
  board.destroy = destroy;

  return board;
};
