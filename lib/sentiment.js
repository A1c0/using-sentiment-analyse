const rp = require('request-promise');
const R = require('ramda');

const getSentimentsArray = async sentences_list => rp({
  method: 'POST', uri:
    `http://0.0.0.0:3000/getSentiment`, json: true, body:
    JSON.stringify(sentences_list)
});

module.exports = {getSentimentsArray};