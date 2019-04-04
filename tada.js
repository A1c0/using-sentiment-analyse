const R = require('ramda');
const {getSentimentsArray} = require('./lib/sentiment')

const addSentiment = arrayOfSentences => R.pipe(
  getSentimentsArray,
  R.then(R.pipe(
    R.zip(arrayOfSentences),
    R.map(R.zipObj(['sentence, sentiment'])),
    R.tap(console.log),
  ))
);

const process = R.pipe(
  addSentiment,
);

process(['Bonjour comment allez-vous ?', 'Je ne suis pas satifait de cette réponse']);