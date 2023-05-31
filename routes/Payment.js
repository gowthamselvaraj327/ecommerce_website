const express = require('express');
const { isAuthenticatedUser } = require('../middlewares/Authenticate');
const { processPayment, sendStripeApi } = require('../controllers/Payment');
const router = express.Router();

router.route('/payment/process').post(isAuthenticatedUser,processPayment);
router.route('/stripeapi').get(isAuthenticatedUser,sendStripeApi);


module.exports = router;