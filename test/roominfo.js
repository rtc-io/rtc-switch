var test = require('tape');
var cuid = require('cuid');
var board;
var members = [];
var announce = require('./helpers/announce');
var ids = [];

test('create a new switch', function(t) {
  t.plan(1);
  board = require('..')();
  t.ok(board && typeof board.connect == 'function', 'created');
});

test('connect member:0', function(t) {
  t.plan(1);
  t.ok(members[0] = board.connect(), 'member:0 connected');
});

test('connect member:1', function(t) {
  t.plan(1);
  t.ok(members[1] = board.connect(), 'member:1 connected');
});

test('0:announce', function(t) {
  var testId = ids[0] = cuid();

  t.plan(3);
  board.once('announce', function(peer, data) {
    t.ok(data);
    t.equal(data.id, testId);
  });

  members[0].once('data', function(data) {
    t.equal(data, '/roominfo|{"memberCount":1}');
  });

  members[0].process(announce({ id: testId, room: 'a' }));
});

test('1:announce', function(t) {
  var testId = ids[1] = cuid();

  t.plan(3);
  board.once('announce', function(peer, data) {
    t.ok(data);
    t.equal(data.id, testId);
  });

  members[1].once('data', function(data) {
    t.equal(data, '/roominfo|{"memberCount":2}');
  });
  members[1].process(announce({ id: testId, room: 'a' }));
});

test('0:announce (reannounce, should not increase membercont)', function(t) {
  function handleData(data) {
    var parts = data.split('|');

    if (parts[0] === '/roominfo') {
      t.equal(data, '/roominfo|{"memberCount":2}');
      members[0].removeListener('data', handleData);
    }
  }

  t.plan(3);
  board.once('announce', function(peer, data) {
    t.ok(data);
    t.equal(data.id, ids[0]);
  });

  members[0].on('data', handleData);
  members[0].process(announce({ id: ids[0], room: 'a' }));
});

test('create a new member:1 instance', function(t) {
  t.plan(1);
  t.ok(members[1] = board.connect(), 'member:1 connected');
});

test('1:announce (reannounce - separate instance, should not increase count', function(t) {
  function handleData(data) {
    var parts = data.split('|');

    if (parts[0] === '/roominfo') {
      t.equal(data, '/roominfo|{"memberCount":2}');
      members[0].removeListener('data', handleData);
    }
  }

  t.plan(3);
  board.once('announce', function(peer, data) {
    t.ok(data);
    t.equal(data.id, ids[1]);
  });

  members[1].on('data', handleData);
  members[1].process(announce({ id: ids[1], room: 'a' }));
});
