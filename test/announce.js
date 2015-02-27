var test = require('tape');
var cuid = require('cuid');
var board;
var members = [];
var announce = require('./helpers/announce');

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
  var testId = cuid();

  t.plan(2);
  board.once('announce', function(data) {
    t.ok(data);
    t.equal(data.id, testId);
  });

  members[0].process(announce({ id: testId, room: 'a' }));
});
