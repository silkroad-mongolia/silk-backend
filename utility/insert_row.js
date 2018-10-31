const db = require('../models');
const Product = db.Product;
const PreviewProduct = db.PreviewProduct;
const Store = db.Store;


async function addStore(name,
                        cover_image,
                        star_count,
                        star_image,
                        gold_seller_image,
                        description,
                        service,
                        logistics,
                        store_link,
                        ratings_link,
                        shopkeeper,
                        qualification
                        ) {

    const store = await Product.findOne({where: { store_link: store_link }});
    if (store) {
        return 'Store exists, no need to add a new one';
    }

    const new_store = {
        name,
        cover_image,
        star_count,
        star_image,
        gold_seller_image,
        description,
        service,
        logistics,
        store_link,
        ratings_link,
        shopkeeper,
        qualification
    };
    const result = await Store.create(new_store);

    if (result) {
        return result['id'];
    } else {
        return Error('Creating a new store failed');
    }
}



async function addPreviewProduct(image, product_id, price, title, StoreId) {
    const storeId = await Store.findById(StoreId);

}