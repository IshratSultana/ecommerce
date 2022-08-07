const cors = require('cors')
const multer = require('multer');
const path = require('path');
const customerController = require('../controllers/customer')
const formValidators = require('../middlewares/formValidators')
const customerMiddlewares = require('../middlewares/customer')

const routes = (app, csrfProtection, __basedir) => {

    app.options('*', cors());

    app.get('/', customerController.getHome);
    app.get('/shop', customerController.getShop);
    app.get('/shop/:parent/:slug', customerController.getProductsByCategory);
    app.get('/products/:id/detail', customerController.getProductDetail);
    app.get('/cart', customerController.getCart);
    app.get('/checkout', customerController.getCheckout);
    app.get('/order-complete', customerController.getOrderComplete);
    app.get('/customer/login', customerController.getLogin);

    app.post('/api/get-products-by-price-range', customerController.getProductsByPriceRange)
    app.post('/api/get-more-products', customerController.getMoreProducts)
    app.post('/api/add-to-cart', customerController.addToCart)
    app.post('/api/apply-coupon', customerController.applyCoupon)
    app.post('/api/place-an-order', formValidators.validate('placeOrder'), customerController.placeAnOrder)

    app.get('/login', customerMiddlewares.checkUserIsLoggedIn, customerController.getLogin)
    app.post('/login', customerMiddlewares.checkUserIsLoggedIn, formValidators.validate('adminLogin'), customerController.processLogin)

    app.get('/profile', customerMiddlewares.checkUserIsAuthenticated, customerController.getProfile)

    app.get('/logout', customerMiddlewares.checkUserIsAuthenticated, customerController.processLogOut)
}

module.exports = routes;
