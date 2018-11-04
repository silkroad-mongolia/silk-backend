const scrape_product = require('../utility/product_details');
const db = require('../models');
const insert_row = require('../utility/insert_row');
const Product = db.Product;
const Store = db.Store;


exports.getProduct = async (req, res, next) => {
    try {
        const url = req.body.url;
        const product_website = scrape_product.check_url(url);

        if (!product_website) {
            res.status(404).json({
                'error': 'not a valid URL'
            });
        }

        // Check if Product is there or not
        const product = await Product.findOne({
            where: { product_id: product_website['id'] },
            attributes: {
                exclude: ['id', 'createdAt', 'updatedAt', 'StoreId']
            }
        });
        if (!product) {
            console.log('Product not found from database...' + product_website['id']);
            let item_details = {};
            if (product_website['taobao']) {
                item_details = await scrape_product.taobao_product(product_website['id']);
            }
            const updated_item = await scrape_product.translate_product(item_details);

            // Check if Store is there or not
            const storeRow = await Store.findOne({where: {store_link: updated_item['store']['store_link']}, attributes: ['id']});
            let StoreId = '';
            if (!storeRow) {
                // Add store
                const storeData = updated_item['store'];
                const store = await insert_row.createStore(
                    storeData['name'],
                    storeData['cover_image'],
                    storeData['star_count'],
                    storeData['star_image'],
                    storeData['gold_seller_image'],
                    storeData['description'],
                    storeData['service'],
                    storeData['logistics'],
                    storeData['store_link'],
                    storeData['ratings_link'],
                    storeData['shopkeeper'],
                    storeData['qualification']
                );
                StoreId = store['id'];

            } else {
                StoreId = storeRow['id'];
            }

            // Add Product
            const new_product = await insert_row.createProduct(
                updated_item['product_id'],
                updated_item['website'],
                updated_item['main_title'],
                updated_item['sub_title'],
                updated_item['price_regular'],
                updated_item['price_promo'],
                updated_item['popularity'],
                updated_item['stock'],
                updated_item['cumm_comments'],
                updated_item['sell_counter'],
                updated_item['attributes'],
                updated_item['description_images'],
                updated_item['sizes'],
                updated_item['colors'],
                updated_item['images'],
                StoreId,
                updated_item['sku'],
                updated_item['recommended'],
                updated_item['looked_watched']
            );

            // Add recommended products
            const preview_recommended_products_promises = [];

            for (let i = 0; i < updated_item['recommended'].length; i++) {
                const recommended = updated_item['recommended'][i];
                preview_recommended_products_promises.push(insert_row.addPreviewProduct(
                    recommended['image'],
                    recommended['product_id'],
                    recommended['price'],
                    recommended['title'],
                    StoreId))
            }

            const recommended_products = await Promise.all(preview_recommended_products_promises);

            await new_product.addPreviewProducts(recommended_products, {through: {tag: 'recommended'}});

            // Add looked and watched items
            const preview_looked_watched_products_promises = [];

            for (let i = 0; i < updated_item['looked_watched'].length; i++) {
                const looked_watched = updated_item['looked_watched'][i];
                preview_looked_watched_products_promises.push(insert_row.addPreviewProduct(
                    looked_watched['image'],
                    looked_watched['product_id'],
                    looked_watched['price'],
                    looked_watched['title'],
                    StoreId))
            }
            const looked_watched_products = await Promise.all(preview_looked_watched_products_promises);

            await new_product.addPreviewProducts(looked_watched_products, {through: {tag: 'looked_watched'}});

            delete updated_item['store'];

            res.status(200).json(updated_item);
        } else {
            const product_json = product.toJSON();
            const convert_product = Object.assign(product_json, {
                attributes: product_json['product_attributes'].split('!@#$'),
                description_images: product_json['description_images'].split('!@#$'),
                sizes: product_json['sizes'].split('!@#$').map(obj => JSON.parse(obj)),
                colors: product_json['colors'].split('!@#$').map(obj => JSON.parse(obj)),
                images: product_json['images'].split('!@#$'),
                sku: JSON.parse(product_json['sku']),
                looked_watched: product_json['looked_watched'].split('!@#$').map(obj => JSON.parse(obj)),
                recommended: product_json['recommended'].split('!@#$').map(obj => JSON.parse(obj))
            });
            delete product_json['product_attributes'];

            res.status(200).json(convert_product);
        }
    } catch (e) {
        console.log('Error on Searching for product: ', e);
        res.status(404).json({
            'error': JSON.stringify(e)
        });
    }
};

