const scrape_product = require('../utility/product_details');


exports.getProduct = async (req, res, next) => {
    try {
        const url = req.body.url;
        const product_website = scrape_product.check_url(url);
        let item_details = {};
        if (!product_website) {
            res.status(404).json({
                'error': 'not a valid URL'
            })
        }

        if (product_website['taobao']) {
            item_details = await scrape_product.taobao_product(product_website['taobao']);
        }
        const updated_item = await scrape_product.translate_product(item_details);
        res.status(200).json(updated_item);
    } catch (e) {
        res.status(404).json({
            'error': e
        })
    }
};

