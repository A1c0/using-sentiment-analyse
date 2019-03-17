const R = require('ramda');
const {readJson, readCsv, writeJsonToCsv} = require('./lib/file');

const getSentimentAsNumber = obj => R.pipe(
	R.prop('sentiment'),
	Number,
	R.assoc('sentiment', R.__, obj)
)(obj);

const tabToAdd = R.pipe(
	readCsv(';'),
	R.map(getSentimentAsNumber),
)('out/dataTest_part3.csv');

R.pipe(
	readJson,
	R.concat(R.__, tabToAdd),
	writeJsonToCsv('out/dataTest3.csv')
)('out/data_test2.json');
