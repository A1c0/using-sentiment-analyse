const R = require('ramda');
const fs = require('fs-extra');
const Papa = require('papaparse');
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
const writeJSON = R.curry((file, data) => fs.writeJsonSync(file, data));

// exploitation de la donnée dans le but de donnée le sentiment des phrase du fichier de log
const process1 = R.pipe(
  parseCsvFile(';', 'Log'),
  R.filter(isString),
  getSentiment,
  R.then(R.pipe(
    R.map(addSentimentTag),
    R.sort(R.descend(R.prop('positive'))),
    Papa.unparse,
    writeFile('out.csv')
  )),
);

const blob = [
  {
    "tag": "voyage",
    "sentences": [
      "voyage vers lille"
    ]
  },
  {
    "tag": "avion",
    "sentences": [
      "voyage vers lille",
      "voyager en avion"
    ]
  },
  {
    "tag": "voiture",
    "sentences": [
      "voyage vers lille",
      "voyager en avion"
    ]
  },
  {
    "tag": "vacances",
    "sentences": [
      "voyage vers lille",
      "voyager en avion"
    ]
  },
  {
    "tag": "lille",
    "sentences": [
      "voyage vers lille"
    ]
  },
  {
    "tag": "Lille",
    "sentences": [
      "voyage vers lille"
    ]
  },
  {
    "tag": "voyager",
    "sentences": [
      "voyager en avion"
    ]
  },
  {
    "tag": "vivre",
    "sentences": [
      "vivre la vie"
    ]
  },
  {
    "tag": "vie",
    "sentences": [
      "vivre la vie"
    ]
  },
  {
    "tag": "mort",
    "sentences": [
      "vivre la vie"
    ]
  },
  {
    "tag": "médecine",
    "sentences": [
      "vivre la vie"
    ]
  }
];

const sameSentences = (a, b) => R.equals(R.prop('sentences', a), R.prop('sentences', b));

let concatValues = (k, l, r) => k === 'sentences' ? R.uniq(R.concat(l, r)) :
  R.concat(R.concat(l, ' '), r);

const mergeObject = (a, b) => R.mergeWithKey(concatValues,a, b);

const list_tag = R.pipe(
  R.map(R.prop('tag')),
  R.uniqBy(R.toLower),
)(blob);

const sameTagLowerCase = R.pipe(
  R.prop('tag'),
  R.includes(R.__, list_tag)
);

const data_test = R.pipe(
  R.filter(sameTagLowerCase),
  R.groupWith(sameSentences),
  R.map(R.reduce(mergeObject, [])),
  writeJSON('data_test.json')
)(blob);

console.log(data_test);

