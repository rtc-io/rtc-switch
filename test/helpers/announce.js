module.exports = function(data) {
  return ['/announce', data.id, JSON.stringify(data)].join('|');
};
