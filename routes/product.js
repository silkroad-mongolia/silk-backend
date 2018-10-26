const express = require("express");
const router = express.Router();
const ProductController = require('../controllers/product');

router.post("/fetch", ProductController.getProduct);

module.exports = router;
