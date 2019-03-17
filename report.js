const R = require('ramda');
const {readJson, writeJsonToCsv} = require('./lib/file');
const {getSentimentsArray} = require('./lib/sentiment');

const convertToSentiment = val => val > 0.5 ? 1 : 0;

const addsentimentArray = array => R.pipe(
	R.map(R.prop('sentence')),
	getSentimentsArray,
	R.then(R.pipe(
		R.map(convertToSentiment),
		R.zip(R.map(R.values, array)),
		R.map(R.pipe(
			R.flatten,
			R.zipObj(['sentence', 'sentimentTarget', 'sentimentComputed'])
		)),
		R.tap(console.log),
	)),
)(array);

const convert = x => x === 0 ? 'negative' : 'positive';

const process = R.pipe(
	readJson,
	addsentimentArray,
	R.then(R.pipe(
		R.sortWith([
			R.ascend(R.prop('sentimentTarget')),
			R.ascend(R.prop('sentimentComputed'))
		]),
		R.map(x => ({sentence: x.sentence, sentimentTarget: convert(x.sentimentTarget), sentimentComputed: convert(x.sentimentComputed)})),
		R.tap(console.log),
		writeJsonToCsv('out/report2.csv')
	))
);

process('out/data_test3.json');
