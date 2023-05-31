const express = require('express');
const multer = require('multer');
const path = require('path');


const { 
    getProducts, 
    newProduct, 
    getProductsbyId, 
    updateProducts, 
    deleteProducts, 
    createReview, 
    getReviews, 
    deleteReview, 
    getAdminProducts 
} = require('../controllers/Products');


const upload = multer({storage: multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname,'..','uploads/product'))
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})})

const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/Authenticate')

router.route('/products').get(getProducts);
router.route('/product/:id').get(getProductsbyId)
                             .put(isAuthenticatedUser, authorizeRoles('admin'),updateProducts);
router.route('/products/:id').delete(isAuthenticatedUser, authorizeRoles('admin'),deleteProducts);
router.route('/review').put(isAuthenticatedUser ,createReview);

//  admin routes
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), upload.array('images'), newProduct);
router.route('/admin/product/:id').put(isAuthenticatedUser, authorizeRoles('admin'), upload.array('images'), updateProducts);
router.route('/admin/product/:id').delete(isAuthenticatedUser, authorizeRoles('admin'),deleteProducts);
router.route('/admin/products').get(isAuthenticatedUser, authorizeRoles('admin'),getAdminProducts);
router.route('/admin/reviews').get(isAuthenticatedUser,  authorizeRoles('admin'), getReviews);
router.route('/admin/review').delete(isAuthenticatedUser,  authorizeRoles('admin'), deleteReview);


module.exports = router;


