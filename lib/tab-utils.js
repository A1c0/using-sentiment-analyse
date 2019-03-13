const R = require('ramda');

const addRandomKey = array => R.pipe(
  R.map(Math.random),
  R.zip(array),
  R.map(R.zipObj(['value', 'key'])),
)(array);

const shuffle = R.pipe(
  addRandomKey,
  R.sort(R.ascend(R.prop('key'))),
  R.map(R.prop('value'))
);

const getFirstNthElements = R.curry((n, tab) => R.pipe(
  R.splitAt(n),
  R.head,
)(tab));

module.exports = {shuffle, getFirstNthElements};