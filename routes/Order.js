const express = require('express');
const { newOrder, getSingleOrder, myOrders, Orders, updateOrder, deleteOrder } = require('../controllers/Order');
const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/Authenticate')


router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/myorders').get(isAuthenticatedUser, myOrders);

//  Admin routes
router.route('/admin/orders').get(isAuthenticatedUser,authorizeRoles('admin'), Orders);
router.route('/admin/order/:id').put(isAuthenticatedUser,authorizeRoles('admin'), updateOrder);
router.route('/admin/order/:id').delete(isAuthenticatedUser,authorizeRoles('admin'), deleteOrder);

module.exports = router;