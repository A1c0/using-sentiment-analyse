const R = require('ramda');
const fs = require('fs-extra');
const Papa = require('papaparse');
const Bromise = require('bluebird');
const {getSentimentsArray} = require('./lib/sentiment');

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

const getSentiment = array => R.pipe(
	getSentimentsArray,
	R.then(R.pipe(
		R.zip(array),
		R.map(R.zipObj(['sentence', 'positive'])),
	))
)(array);

const convertToTag = value => value > 0.5 ? 'positive' : 'negative';

const addSentimentTag = obj => R.assoc('sentimentTag', convertToTag(R.prop('positive', obj)), obj);

const isString = obj => R.equals(R.type(obj), 'String');

const writeFile = R.curry((file, data) => fs.writeFileSync(file, data));

const mapPromise = R.curry((f, x) => Bromise.map(x, f));

const addSentimentToCsvLog = R.pipe(
	parseCsvFile(';', 'Log'),
	R.filter(isString),
	R.splitEvery(5000),
	mapPromise(getSentiment),
	R.then(R.pipe(
		R.flatten,
		R.map(addSentimentTag),
		R.sort(R.descend(R.prop('positive'))),
		Papa.unparse,
		writeFile('psa-finance-2019-02-26-logs_sentiment.csv')
	)),
);

addSentimentToCsvLog('input/psa-finance-2019-02-26-logs.csv');
