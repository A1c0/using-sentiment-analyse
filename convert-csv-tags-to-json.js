const R = require('ramda');
const {getFileContentAsString, writeJson} = require('./lib/file');

const isNotEmpty = str => R.not(R.equals('')(str));

const haveMoreThan3Sentences = obj => R.pipe(
	R.prop('sentences'),
	R.length,
	R.gt(3),
	R.not,
)(obj);

const convertSentencesToArray = obj => R.pipe(
	R.prop('sentences'),
	R.split(','),
	R.filter(isNotEmpty),
	R.assoc('sentences', R.__, obj)
)(obj);

const process = R.pipe(
	getFileContentAsString,
	R.split('\n'),
	R.map(R.pipe(
		R.replace(/,/, '<delim>'),
		R.split('<delim>')
	)),
	R.map(R.zipObj(['tag', 'sentences'])),
	R.map(convertSentencesToArray),
	R.filter(haveMoreThan3Sentences),
	R.tap(console.log),
	writeJson('out/res-mot-sens-proche.json'),
);

process('input/res-mot-sens-proche.csv');
