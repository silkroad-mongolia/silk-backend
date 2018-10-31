const scrape_product = require('../utility/product_details');
const db = require('../models');
const Product = db.Product;
const PreviewProduct = db.PreviewProduct;
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

        const product = await Product.findOne({where: { product_id: product_website['id'] }});
        if (!product) {
            let item_details = {};
            if (product_website['taobao']) {
                item_details = await scrape_product.taobao_product(product_website['id']);
            }
            const updated_item = await scrape_product.translate_product(item_details);
            // console.log(item_details);
            // const create_item = Object.assign(updated_item, {});


            res.status(200).json(updated_item);
        } else {
            res.status(200).json(product);
        }



    } catch (e) {
        res.status(404).json({
            'error': e
        });
    }
};

