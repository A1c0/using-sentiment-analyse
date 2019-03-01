const R = require('ramda');
const fs = require('fs-extra');
const {getSentimentsArray} = require('./lib/sentiment');

const input = fs.readJsonSync('data_test.json');
const writeJSON = R.curry((file, data) => fs.writeJsonSync(file, data));

const getSentimentAverage = R.pipe(
  R.prop('sentences'),
  getSentimentsArray,
  R.then(R.mean)
);

const addSentimentAverage = obj => R.pipe(
  getSentimentAverage,
  R.then(R.assoc('sentiment', R.__, obj))
)(obj);

const process = R.pipe(
  R.map(addSentimentAverage),
  writeJSON('blob.json')
);

process(input);