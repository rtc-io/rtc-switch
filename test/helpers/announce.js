module.exports = function(data) {
  return ['/announce', JSON.stringify({ id: data.id }), JSON.stringify(data)].join('|');
};
