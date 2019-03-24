const R = require('ramda');
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

const process = async (path) => {
	let array = readJson(path);
	for (let i = 0; i < array.length; i++) {
		console.log(`${i}/${array.length}`);
		array[i] = await addSentimentAverage(array[i]);
	}
	array = R.sort(R.ascend(R.prop('sentiment')), array);
	writeJson('out/res-with-sentiment.json', array);
  writeJsonToCsv('out/res-with-sentiment.csv', array);
};

process('input/res-mot-sens-proche.json');
