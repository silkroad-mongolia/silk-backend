const {URL} = require('url');
const translation = require('./translate').translateToMongolian;
const puppeteer = require('puppeteer');

function check_url(product_url) {
    const myURL = new URL(product_url);

    const hostname = myURL.hostname;
    const protocol = myURL.protocol;
    const item_id = myURL.searchParams.get('id');

    if (hostname === 'item.taobao.com' && protocol === 'https:' && isPositiveNumeric(item_id)) {
        return {'taobao': item_id};
    }

    return '';
}

function isPositiveNumeric(s) {
    return /^\d+$/.test(s);
}

async function taobao_product(item_id) {
    let item_details = {};
    try {
        // Starting the browser
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Block any images
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (request.resourceType() === 'image')
                request.abort();
            else
                request.continue();
        });
        // Go to the webpage
        const response = await page.goto('https://item.taobao.com/item.htm?id=' + item_id, {waitUntil: 'networkidle2'});
        console.log('Started scraping the webpage...');
        // await page.waitForSelector('#sufei-dialog-close');
        // await page.click('#sufei-dialog-close');

        // Looking for the SKU numbers
        const htmlText = await response.text();
        const lineByLine = htmlText.split('\n');

        let line = '';
        let sku = {};
        for (let i = lineByLine.length - 1; i >= 0; i--) {
            line = lineByLine[i].trim();
            let j = 0;
            for (j; j < line.length; j++) {
                if (line[j] === '{')
                    break;
            }
            if (line.startsWith('skuMap')) {
                sku = JSON.parse(line.substring(j));
                break;
            }
        }

        // Scrape the HTML
        const item_details_evaluation = await page.evaluate(() => {
            item_html_details = {};

            item_html_details['main_title'] = document.querySelector('.tb-main-title').textContent.trim();
            item_html_details['sub_title'] = document.querySelector('.tb-subtitle').textContent;

            item_html_details['price_regular'] = document.querySelector('#J_StrPrice').textContent;

            const price_promo = document.querySelector('#J_PromoPriceNum');
            if (price_promo) {
                item_html_details['price_promo'] = price_promo.textContent;
            }

            item_html_details['stock'] = document.querySelector('#J_SpanStock').textContent;
            item_html_details['cumm_comments'] = document.querySelector('#J_RateCounter').textContent;
            item_html_details['sell_counter'] = document.querySelector('#J_SellCounter').textContent;

            const sell_title = document.querySelector('.tb-sell-counter a');
            if (sell_title) {
                item_html_details['sell_title'] = sell_title.getAttribute('title');
            }

            // Image details
            const li_images = Array.from(document.querySelectorAll('#J_UlThumb li'));
            let images = [];

            for (let i = 0; i < li_images.length; i++) {
                images.push({'small': li_images[i].querySelector('div a img').getAttribute('src')})
            }

            // Size details
            const li_size = Array.from(document.querySelectorAll('.J_TMySizeProp dd ul li'));
            const sizes = [];
            for (let i = 0; i < li_size.length; i++) {
                sizes.push({'name': li_size[i].querySelector('a span').textContent, 'id': li_size[i].getAttribute('data-value')});
            }
            // const item_sizes = lis.map(li => li.querySelector('a span').textContent);
            // const item_size_ids = lis.map(li => li.getAttribute('data-value'));

            // Color details
            const li_color = Array.from(document.querySelectorAll('.J_Prop_Color dd ul li'));
            const colors = [];
            for (let i = 0; i < li_color.length; i++) {
                const color_image = li_color[i].getAttribute('a');
                let image_object = {
                    'name': li_color[i].querySelector('a span').textContent,
                    'id': li_color[i].getAttribute('data-value'),
                    'image': ''
                };
                if (color_image) {
                    image_object['image'] = color_image.getAttribute('style');
                }
                colors.push(image_object);
            }

            // Attributes of the item
            const li_attr = Array.from(document.querySelectorAll('.attributes-list li'));
            item_html_details['attributes'] = li_attr.map(li => li.textContent);

            // Description of the item
            const description_images = Array.from(document.querySelectorAll('#J_DivItemDesc img'));
            item_html_details['description_images'] = description_images.map(image => {
                let img = image['dataset']['ksLazyload'];
                if (img) {
                    return img;
                }
                return image.getAttribute('src');

            });

            item_html_details['sizes'] = sizes;
            item_html_details['colors'] = colors;
            item_html_details['images'] = images;

            return item_html_details;
        });

        item_details = {...item_details_evaluation};
        item_details['sku'] = sku;
        await browser.close();
        return item_details;
    } catch (e) {
        console.log('Error: ', e);
    }
}


function translate_product(item_details) {
    if (item_details['price_regular'].startsWith('¥')) {
        item_details['price_regular'] = item_details['price_regular'].substring(1);
    }
    const main_title_promise = translation(item_details['main_title']);
    const colors = item_details['colors'].map(color => color.name);
    const colors_promise = translation(colors);
    const attributes_promise = translation(item_details['attributes']);

    // Put larger images on the preview image
    const images = item_details['images'];

    for (let i = 0; i < images.length; i++) {
        images[i]['big'] =images[i]['small'].replace('50x50', '400x400');
    }

    return Promise.all([main_title_promise, colors_promise, attributes_promise])
        .then((responses) => {
            item_details['main_title'] = responses[0][0];
            item_details['colors'] = responses[1][0];
            item_details['attributes'] = responses[2][0];
            return item_details;
        }).catch((err) => {
            return err;
        });
}

module.exports.check_url = check_url;
module.exports.translate_product = translate_product;
module.exports.taobao_product = taobao_product;
