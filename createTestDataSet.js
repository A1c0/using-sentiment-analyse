const R = require('ramda');
const fs = require('fs-extra');
const Papa = require('papaparse');
const Bromise = require("bluebird");
const {shuffle, getFirstNthElements} = require('./lib/tab-utils')

const getFileContentAsString = R.pipe(
  fs.readFileSync,
  R.toString
);

const papaParser = R.curry(
  (delimiter, data) => Papa.parse(data, {delimiter, header: true}));

/**
 * Allows to parse a file of type *. csv
 * @param {String} delimiter The delimiter that separates the data from the
 *   same line
 * @param {String} column The column from which we want to retrieve the data
 * @param {String} path The relative or absolute path to the file
 * @returns {Array<String>} A sentence table
 */
const parseCsvFile = R.curry((delimiter, column, path) => R.pipe(
  getFileContentAsString,
  papaParser(delimiter),
  R.prop('data'),
  R.map(R.prop(column)),
)(path));

const isString = obj => R.equals(R.type(obj), 'String');

const writeFile = R.curry((file, data) => fs.writeFileSync(file, data));
const writeJSON = R.curry((file, data) => fs.writeJsonSync(file, data));

const getRandomSentences = R.pipe(
  parseCsvFile(';', 'Log'),
  R.filter(isString),
  shuffle,
  getFirstNthElements(100),
);

const data1 = getRandomSentences('input/psa-finance-2019-02-26-logs.csv');
const data2 = getRandomSentences('input/vinci-vega-2019-02-26-logs.csv');

const dataTest = R.concat(data1, data2);

console.log(dataTest);

R.pipe(
  R.map(R.assoc('sentence',R.__ , {})),
  Papa.unparse,
  writeFile('out/dataTest.csv')
)(dataTest);

