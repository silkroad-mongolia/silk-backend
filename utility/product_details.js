const {URL} = require('url');
const translation = require('./translate').translateToMongolian;
const puppeteer = require('puppeteer');

function check_url(product_url) {
    const myURL = new URL(product_url);

    const hostname = myURL.hostname;
    const protocol = myURL.protocol;
    const item_id = myURL.searchParams.get('id');

    if (hostname === 'item.taobao.com' && protocol === 'https:' && isPositiveNumeric(item_id)) {
        return {'id': item_id, 'taobao': true};
    }

    return '';
}

function isPositiveNumeric(s) {
    return /^\d+$/.test(s);
}

function cleanImages(image_url) {
    if (image_url) {
        for (let i = image_url.length - 1; i >= 0; i--) {
            if (image_url[i] === '_') {
                return image_url.substring(0, i);
            }
        }
    }
    return image_url;
}

async function taobao_product(item_id) {
    let item_details = {};
    console.log(item_id);
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
        const response = await page.goto('https://item.taobao.com/item.htm?id=' + item_id, {waitUntil: 'networkidle0'});
        console.log('Started scraping the webpage...');

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

            // Fetching the store details
            let item_store_details = {};
            item_store_details['name'] = document.querySelector('.tb-seller-name').getAttribute('title');
            item_store_details['cover_image'] = document.querySelector('#J_ShopInfo > a > img').getAttribute('src');

            if (document.querySelector('.tb-shop-age-val')) {
                item_store_details['age'] = document.querySelector('.tb-shop-age-val').textContent;
            }

            item_store_details['star_count'] = Array.from(document.querySelectorAll('.tb-shop-rank > dl > dd > a > i')).length.toString();

            const star = document.querySelector('.tb-shop-rank > dl > dd > a > i');

            item_store_details['star_image'] = JSON.parse(JSON.stringify(getComputedStyle(star)))['background'];

            item_store_details['gold_seller_image'] = '';
            if (document.querySelector('.tb-gold-icon')) {
                item_store_details['gold_seller_image'] = 'true';
            }

            item_store_details['gold_continuous_image'] = '';
            if (document.querySelector('.tb-gold-periods')) {
                item_store_details['gold_continuous_image'] = 'true';
            }

            const ratings =  Array.from(document.querySelectorAll('.tb-shop-rate dl'));
            item_store_details['description'] = '';
            if (ratings[0] && ratings[0].querySelector('dd a')) {
                item_store_details['description'] = ratings[0].querySelector('dd a').textContent.trim();
            }

            item_store_details['service'] = '';
            if (ratings[1] && ratings[1].querySelector('dd a')) {
                item_store_details['service'] = ratings[0].querySelector('dd a').textContent.trim();
            }

            item_store_details['logistics'] = '';
            if (ratings[2] && ratings[2].querySelector('dd a')) {
                item_store_details['logistics'] = ratings[0].querySelector('dd a').textContent.trim();
            }

            item_store_details['store_link'] = document.querySelector('.tb-seller-name').getAttribute('href');
            item_store_details['ratings_link'] = document.querySelector('.tb-shop-rank > dl > dd > a').getAttribute('href');

            item_store_details['shopkeeper'] = '';
            if (document.querySelector('.tb-seller-name')) {
                item_store_details['shopkeeper'] = document.querySelector('.tb-seller-name').textContent.trim();
            }

            if (document.querySelector('.tb-seller-bail-text')) {
                item_store_details['qualification'] = document.querySelector('.tb-seller-bail-text').textContent.trim();
            }

            // Item Details
            let item_html_details = {};
            item_html_details['main_title'] = document.querySelector('.tb-main-title').textContent.trim();
            item_html_details['sub_title'] = document.querySelector('.tb-subtitle').textContent;

            item_html_details['popularity'] = '';
            if (document.querySelector('.J_FavCount')) {
                let popularity = document.querySelector('.J_FavCount').textContent.trim();
                if (popularity.length >= 4) {
                    popularity = popularity.substring(1, popularity.length - 3);
                }
                item_html_details['popularity'] = popularity;
            }

            item_html_details['price_regular'] = document.querySelector('#J_StrPrice').textContent;
            item_html_details['price_promo'] = '';
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

            // Image description list details
            const li_images = Array.from(document.querySelectorAll('#J_UlThumb li'));
            let images = [];

            for (let i = 0; i < li_images.length; i++) {
                images.push(li_images[i].querySelector('div a img').getAttribute('src'));
            }

            // Size details
            const li_size = Array.from(document.querySelectorAll('.J_TMySizeProp dd ul li'));
            const sizes = [];
            for (let i = 0; i < li_size.length; i++) {
                sizes.push({'name': li_size[i].querySelector('a span').textContent, 'id': li_size[i].getAttribute('data-value')});
            }

            // Color details
            const li_color = Array.from(document.querySelectorAll('.J_Prop_Color dd ul li'));
            const colors = [];
            for (let i = 0; i < li_color.length; i++) {
                const color_image = li_color[i].querySelector('a');
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

            // Looked and watched items
            const li_looked_watched = Array.from(document.querySelectorAll('.tuijian-item'));
            let looked_watched = [];

            for (let i = 0; i < li_looked_watched.length; i++) {
                let obj = {};
                obj['image'] = li_looked_watched[i].querySelector('div > div > div > a > img').getAttribute('src');
                let link = li_looked_watched[i].querySelector('div > div > div > a').getAttribute('href');
                if (!link.startsWith('https://')) {
                    link = 'https:' + link;
                }
                const url = new URL(link);
                obj['product_id'] = url.searchParams.get('id');
                obj['price'] = li_looked_watched[i].querySelector('div > p > span > .price').textContent.trim();
                obj['title'] = li_looked_watched[i].querySelector('div > div > div > a > img').getAttribute('title');
                looked_watched.push(obj);
            }

            // Recommended items
            const li_recommended = Array.from(document.querySelectorAll('.item1line1'));
            let recommended = [];

            for (let i = 0; i < li_recommended.length; i++) {
                let obj = {};
                if (li_recommended[i].querySelector('div > dl > dt > a > img').getAttribute('data-ks-lazyload')) {
                    obj['image'] = li_recommended[i].querySelector('div > dl > dt > a > img').getAttribute('data-ks-lazyload');
                } else {
                    obj['image'] = li_recommended[i].querySelector('div > dl > dt > a > img').getAttribute('src');
                }
                let link = li_recommended[i].querySelector('div > dl > dt > a').getAttribute('href');
                if (!link.startsWith('https://')) {
                    link = 'https:' + link;
                }
                const url = new URL(link);
                obj['product_id'] = url.searchParams.get('id');
                obj['price'] = li_recommended[i].querySelector('div > dl > dd > div > div > .c-price').textContent.trim();
                obj['title'] = li_recommended[i].querySelector('div > dl > dd > a').textContent.trim();

                recommended.push(obj);
            }

            item_html_details['recommended'] = recommended;
            item_html_details['looked_watched'] = looked_watched;
            item_html_details['sizes'] = sizes;
            item_html_details['colors'] = colors;
            item_html_details['images'] = images;
            item_html_details['store'] = item_store_details;
            item_html_details['website'] = 'taobao';
            return item_html_details;
        });
        item_details = {...item_details_evaluation};
        item_details['sku'] = sku;
        item_details['product_id'] = item_id;
        await browser.close();
        console.log('Scraping done...');
        return item_details;
    } catch (e) {
        console.log('error is :', e);
        return {'error': e};
    }
}

// Translate and clean the item_details
function translate_clean_product(item_details) {
    console.log('Begin Translation...');
    try {
        if (item_details['price_regular'].startsWith('¥')) {
            item_details['price_regular'] = item_details['price_regular'].substring(1);
        }
        // // Put larger images on the preview image
        // const images = item_details['images'];
        //
        // for (let i = 0; i < images.length; i++) {
        //     images[i]['big'] = images[i]['small'].replace('50x50', '400x400');
        // }
    
        // Clean up the color images
        const color_images = item_details['colors'];
    
        for (let i = 0; i < color_images.length; i++) {
            let color_image = color_images[i]['image'];
            let open_parenthesis = -1;
            let closed_parenthesis = -1;
            if (color_image) {
                for (let j = 0; j < color_image.length; j++) {
                    if (color_image[j] === '(') {
                        open_parenthesis = j;
                        break
                    }
                }
                for (let j = color_image.length - 1; j >= 0; j--) {
                    if (color_image[j] === ')') {
                        closed_parenthesis = j;
                        break
                    }
                }
                if (open_parenthesis >= 0 && closed_parenthesis >= 0)
                    color_images[i]['image'] = color_image.substring(open_parenthesis + 1, closed_parenthesis);
            }
        }
    
        // Clean images
        for (let i = 0; i < item_details['recommended'].length; i++) {
            item_details['recommended'][i].image = cleanImages(item_details['recommended'][i].image);
        }
    
        for (let i = 0; i < item_details['looked_watched'].length; i++) {
            item_details['looked_watched'][i].image = cleanImages(item_details['looked_watched'][i].image);
        }
    
        for (let i = 0; i < item_details['images'].length; i++) {
            item_details['images'][i] = cleanImages(item_details['images'][i]);
        }
    
        for (let i = 0; i < item_details['colors'].length; i++) {
            item_details['colors'][i].image = cleanImages(item_details['colors'][i].image);
        }
    
    
        // Begin translation
        const main_title_promise = translation(item_details['main_title']);
        const colors = item_details['colors'].map(color => color.name);
        const colors_promise = translation(colors);
        const attributes_promise = translation(item_details['attributes']);
        const sell_title_promise = translation(item_details['sell_title']);
        const subtitle_promise = translation(item_details['sub_title']);
        const store_name_promise = translation(item_details['store']['name']);
        const store_qualification_promise = translation(item_details['store']['qualification']);
        const store_shopkeeper_promise = translation(item_details['store']['shopkeeper']);
        const looked_watched_products = item_details['looked_watched'].map(prod => prod.title);
        const looked_watched_promise = translation(looked_watched_products);
        const recommended_products = item_details['recommended'].map(prod => prod.title);
        const recommended_products_promise = translation(recommended_products);
        const sizes = item_details['sizes'].map(prod => prod.name);
        const sizes_promise = translation(sizes);
    
        return Promise.all([
            main_title_promise,
            colors_promise,
            attributes_promise,
            sell_title_promise,
            subtitle_promise,
            store_name_promise,
            store_qualification_promise,
            store_shopkeeper_promise,
            looked_watched_promise,
            recommended_products_promise,
            sizes_promise
        ]).then((responses) => {
                item_details['main_title'] = responses[0];
                let translated_colors = responses[1];
    
                for (let i = 0; i < translated_colors.length; i++) {
                    item_details['colors'][i].name = translated_colors[i];
                }
    
                item_details['attributes'] = responses[2];
                item_details['sell_title'] = responses[3];
                item_details['sub_title'] = responses[4];
    
                item_details['store']['name'] = responses[5];
                item_details['store']['qualification'] = responses[6];
                item_details['store']['shopkeeper'] = responses[7];
    
                let translated_lw_titles = responses[8];
    
                for (let i = 0; i < translated_lw_titles.length; i++) {
                    item_details['looked_watched'][i].title = translated_lw_titles[i];
                }
    
                let translated_r_titles = responses[9];
    
                for (let i = 0; i < translated_r_titles.length; i++) {
                    item_details['recommended'][i].title = translated_r_titles[i];
                }
    
                let translated_sizes = responses[10];
    
                for (let i = 0; i < translated_sizes.length; i++) {
                    item_details['sizes'][i].name = translated_sizes[i];
                }
                console.log('Translation Done...');
                return item_details;
            }).catch((err) => {
                console.log(err);
                return err;
            });
    } catch (e) {
        console.log('Translation Error: ', e);
    }
    
}

module.exports.check_url = check_url;
module.exports.translate_product = translate_clean_product;
module.exports.taobao_product = taobao_product;
