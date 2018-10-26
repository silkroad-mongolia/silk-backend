// Imports the Google Cloud client library

const {Translate} = require('@google-cloud/translate');

// Your Google Cloud Platform project ID
const projectId = 'translate-testin-1540311383431';

// Instantiates a client
const translate = new Translate({
    projectId: projectId,
});

// The text to translate
// The target language
const target = 'mn';

// Translates some text into Mongolia
function translateToMongolian(text) {
    return translate.translate(text, target);
}

module.exports.translateToMongolian = translateToMongolian;
