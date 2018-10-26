// Imports the Google Cloud client library
// export GOOGLE_APPLICATION_CREDENTIALS="C:\Users\Tsenguun\Desktop\Scraping\Translate-Testing-171b376d9055.json"
const {Translate} = require('@google-cloud/translate');

// Your Google Cloud Platform project ID
const projectId = 'translate-testin-1540311383431';

// Instantiates a client
const translate = new Translate({
    projectId: projectId,
});

// The text to translate
// const text = 'Hello, world!';
// The target language
const target = 'mn';

// Translates some text into Russian
function translateToMongolian(text) {
    return translate.translate(text, target);
}

module.exports.translateToMongolian = translateToMongolian;
