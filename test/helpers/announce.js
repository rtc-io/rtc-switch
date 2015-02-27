module.exports = function(data) {
  return ['/announce', JSON.stringify(data)].join('|');
};
