const rp = require('request-promise');

const getSentimentsArray = async sentencesList => rp({
	method: 'POST', uri:
    'http://0.0.0.0:3000/getSentiment', json: true, body:
    JSON.stringify(sentencesList)
});

module.exports = {getSentimentsArray};
