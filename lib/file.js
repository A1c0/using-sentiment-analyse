const R = require('ramda');
const fs = require('fs-extra');
const Papa = require('papaparse');

const getFileContentAsString = R.pipe(
  fs.readFileSync,
  R.toString
);

const getSentimentAsNumer = obj => R.pipe(
  R.prop('sentiment'),
  Number,
  R.assoc('sentiment', R.__, obj)
)(obj);

const papaParser = R.curry(
  (delimiter, data) => Papa.parse(data, {delimiter, header: true}));

const parseCsvFile = R.curry((delimiter, path) => R.pipe(
  getFileContentAsString,
  papaParser(delimiter),
  R.prop('data'),
)(path));

const writeFile = R.curry((file, data) => fs.writeFileSync(file, data));
const writeJSON = R.curry((file, data) => fs.writeJsonSync(file, data));

R.pipe(
  parseCsvFile(','),
  R.map(getSentimentAsNumer),
  R.tap(console.log),
  writeJSON('data_test2.json')
)('out/dataTest.csv');

//module.exports ={getFileContentAsString, parseCsvFile, writeJSON, writeFile};