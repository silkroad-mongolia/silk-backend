const db = require('../models');
const Product = db.Product;
const PreviewProduct = db.PreviewProduct;
const Store = db.Store;
const RecommendedProduct = db.RecommendedProducts;
const LookedWatchedProduct = db.LookedWatchedProducts;





async function createProduct (
    product_id,
    website,
    main_title,
    sub_title,
    price_regular,
    price_promo,
    popularity,
    stock,
    cumm_comments,
    sell_counter,
    product_attributes_array,
    description_images_array,
    sizes_array_object,
    colors_array_object,
    images_array,
    StoreId,
    sku_object,
    recommended_array_object,
    looked_watched_array_object
    ) {
    try {
        const new_product = {
            product_id,
            website,
            main_title,
            sub_title,
            price_regular,
            price_promo,
            popularity,
            stock,
            cumm_comments,
            sell_counter,
            product_attributes: product_attributes_array.join('!@#$'),
            description_images: description_images_array.join('!@#$'),
            sizes: sizes_array_object.map(size => JSON.stringify(size)).join('!@#$'),
            colors: colors_array_object.map(color => JSON.stringify(color)).join('!@#$'),
            images: images_array.join('!@#$'),
            StoreId,
            sku: JSON.stringify(sku_object),
            recommended: recommended_array_object.map(rec => JSON.stringify(rec)).join('!@#$'),
            looked_watched: looked_watched_array_object.map(lw => JSON.stringify(lw)).join('!@#$')
        };
        return await Product.create(new_product, {attributes: ['id']});
    } catch (e) {
        console.log('Error on creating product: ', e);
        return Error('Error on creating product: ' + JSON.stringify(e));
    }
}

async function createStore(name,
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
    try {
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

        return await Store.create(new_store, {
            attributes: ['id']
        });
    } catch(e) {
        console.log('Error on creating store: ', e);
        return Error('Error on creating store: ' + JSON.stringify(e));
    }
}


async function addPreviewProduct(image, productId, price, title, StoreId) {
    try {
        const previewProduct = await PreviewProduct.findOne({
            where: { productId: productId },
            attributes: ['id']
        });
        if (previewProduct) {
            return previewProduct;
        }
        return await PreviewProduct.create({image, productId, price, title, StoreId});
    } catch(e) {
        console.log('Error on creating preview product: ', e);
        return Error('Error on creating preview product: ' + JSON.stringify(e));
    }
}


async function addRecommendedProduct(productId, previewProductId) {
    try {
        const row = await RecommendedProduct.findOne({
            where: {productId, previewProductId}
        });
        if (row) {
            return;
        }
        return await RecommendedProduct.create({productId, previewProductId});
    } catch(e) {
        console.log('Error on adding item to Recommended table: ', e);
        return Error('Error on adding item to Recommended table: ' + JSON.stringify(e));
    }

}


async function addLookedWatchedProduct(productId, previewProductId) {
    try {
        const row = await LookedWatchedProduct.findOne({
            where: {productId, previewProductId}
        });
        if (row) {
            return;
        }
        return await LookedWatchedProduct.create({productId, previewProductId});
    } catch (e) {
        console.log('Error on adding item to Looked and Watched table: ', e);
        return Error('Error on adding item to Looked and Watched table: ' + JSON.stringify(e));
    }
}


module.exports.addRecommendedProduct = addRecommendedProduct;
module.exports.addLookedWatchedProduct = addLookedWatchedProduct;
module.exports.addPreviewProduct = addPreviewProduct;
module.exports.createStore = createStore;
module.exports.createProduct = createProduct;
