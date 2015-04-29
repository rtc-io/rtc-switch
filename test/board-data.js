var test = require('tape');
var cuid = require('cuid');
var board;
var members = [];
var announce = require('./helpers/announce');
var formatter = require('formatter');

test('create a new switch', function(t) {
  t.plan(1);
  board = require('..')();
  t.ok(board && typeof board.connect == 'function', 'created');
});

test('connect member:0', function(t) {
  t.plan(1);
  t.ok(members[0] = board.connect(), 'member:0 connected');
});

test('0:announce', function(t) {
  var testId = cuid();
  var expected = formatter('/announce|{{ 0 }}|{"id":"{{ 0 }}","room":"a"}');

  t.plan(1);
  board.once('data', function(data, peerid) {
    t.equal(data, expected(testId));
  });

  members[0].process(announce({ id: testId, room: 'a' }));
});
