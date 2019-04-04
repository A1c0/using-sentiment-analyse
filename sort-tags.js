const R = require('ramda');
const Bromise = require('bluebird');

const {readJson, writeJson, writeJsonToCsv} = require('./lib/file');
const {getSentimentsArray} = require('./lib/sentiment');

const input = 'input/demo.json';

const mapPromise = R.curry((f, x) => Bromise.map(x, f));

const sortTag = async (input, outputCSV, outputJSON) => {
	const addSentiments = tab => R.pipe(
		getSentimentsArray,
		R.then(R.pipe(
			R.zip(tab),
			R.map(R.zipObj(['sentence', 'sentiment']))
		))
	)(tab);

	const mapSentencesSentiment = await R.pipe(
		readJson,
		R.map(R.prop('sentences')),
		R.flatten,
		R.uniq,
		R.splitEvery(5000),
		mapPromise(addSentiments),
		R.then(R.flatten)
	)(input);

	const isSentence = R.curry((sentenceSearched, obj) => R.pipe(
		R.prop('sentence'),
		R.equals(sentenceSearched)
	)(obj));

	const getSentiment = sentence => R.pipe(
		R.filter(isSentence(sentence)),
		R.head,
		R.prop('sentiment')
	)(mapSentencesSentiment);

	const getSentimentAverage = R.pipe(
		R.prop('sentences'),
		R.map(getSentiment),
		R.mean
	);

	const addSentimentAverage = obj => R.pipe(
		getSentimentAverage,
		R.assoc('sentiment', R.__, obj),
	)(obj);

	R.pipe(
		readJson,
		R.map(addSentimentAverage),
		R.sort(R.ascend(R.prop('sentiment'))),
		R.tap(writeJson(outputJSON)),
		R.tap(writeJsonToCsv(outputCSV))
	)(input);
};

sortTag(input, 'out/last/testi.csv', 'out/last/testi.json');
