const R = require('ramda');
const fs = require('fs-extra');
const Papa = require('papaparse');

const getFileContentAsString = R.pipe(
	fs.readFileSync,
	R.toString
);

const papaParser = R.curry(
	(delimiter, data) => Papa.parse(data, {delimiter, header: true}));

const readCsv = R.curry((delimiter, path) => R.pipe(
	getFileContentAsString,
	papaParser(delimiter),
	R.prop('data'),
)(path));

const writeFile = R.curry((fileName, data) => fs.writeFileSync(fileName, data));
const writeJson = R.curry((fileName, data) => fs.writeJsonSync(fileName, data));

const writeJsonToCsv = R.curry((fileName, json) => R.pipe(
	Papa.unparse,
	writeFile(fileName)
)(json));

const readJson = fileName => fs.readJsonSync(fileName);

module.exports = {getFileContentAsString, readCsv, writeJson, writeFile, readJson, writeJsonToCsv};
