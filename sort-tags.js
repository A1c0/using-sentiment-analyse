const R = require('ramda');
const fs = require('fs-extra');
const Bromise = require('bluebird');
const {getSentimentsArray} = require('./lib/sentiment');
const {readJson, writeJsonToCsv, writeJson} = require('./lib/file');

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
	readJson,
	mapPromise(addSentimentAverage),
	R.then(R.pipe(
		R.sort(R.ascend(R.prop('sentiment'))),
		R.tap(console.log),
		R.tap(writeJsonToCsv('out/test-csv.csv')),
		writeJson('out/res-with-sentences.json')
	))
);

process('out/data_non_sentiment.json');
