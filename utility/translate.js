const translate = require('china-google-translate-api');

function translateToMongolian(text) {
    if (typeof text === 'string')
        return translate(text, {from: 'zh-cn', to: 'mn'}).then(res => {
            return res.text;
        }).catch(err => {return err});
    if (Array.isArray(text)) {
        let promise_array = [];
        for (let i = 0; i < text.length; i++) {
            promise_array.push(translate(text[i], {from: 'zh-cn', to: 'mn'}));
        }
        return Promise.all(promise_array).then(responses => {
            return responses.map(obj => obj.text);
        }).catch(err => {return err});
    }
}

module.exports.translateToMongolian = translateToMongolian;

// // Imports the Google Cloud client library
//
// const {Translate} = require('@google-cloud/translate');
//
// // Your Google Cloud Platform project ID
// const projectId = 'translate-testin-1540311383431';
//
// // Instantiates a client
// const translate = new Translate({
//     projectId: projectId,
// });
//
// // The text to translate
// // The target language
// const target = 'mn';
//
// // Translates some text into Mongolia
// function translateToMongolian(text) {
//     return translate.translate(text, target);
// }
//
// module.exports.translateToMongolian = translateToMongolian;


