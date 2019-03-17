const R = require('ramda');
const fs = require('fs-extra');
const Bromise = require('bluebird');
const {getSentimentsArray} = require('./lib/sentiment');

const input = fs.readJsonSync('out/data_test.json');
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

const mapPromise = R.curry((f, x) => Bromise.map(x, f));

const process = R.pipe(
	mapPromise(addSentimentAverage),
	R.then(R.pipe(
		R.sort(R.ascend(R.prop('sentiment'))),
		writeJSON('out/blob.json')
	))
);

process(input);
