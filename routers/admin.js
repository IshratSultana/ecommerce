const cors = require('cors')
const adminController = require('../controllers/admin')
const adminMiddlewares = require('../middlewares/admin')
const formValidators = require('../middlewares/formValidators')
const fileMiddleware = require('../middlewares/fileUpload')

const routes = (app, csrfProtection, __basedir) => {

    app.options('*', cors())

    app.get('/admin/login', adminMiddlewares.checkUserIsLoggedIn, adminController.getLogin)
    app.get('/admin', adminMiddlewares.checkUserIsLoggedIn, adminController.adminRedirect)
    app.post('/admin/login', adminMiddlewares.checkUserIsLoggedIn, formValidators.validate('adminLogin'), adminController.processLogin)

    app.get('/admin/profile', adminMiddlewares.checkUserIsAuthenticated, adminController.getProfile)
    app.put('/api/admin/profile/:id/update', adminMiddlewares.checkUserIsAuthenticated, fileMiddleware.uploadFileMiddleware, adminController.updateProfile) //formValidators

    app.get('/admin/dashboard', adminMiddlewares.checkUserIsAuthenticated, adminController.getDashboard)
    app.get('/admin/products', adminMiddlewares.checkUserIsAuthenticated, adminController.getProducts)
    app.get('/admin/sub_categories', adminMiddlewares.checkUserIsAuthenticated, adminController.getCategories)
    app.get('/admin/orders', adminMiddlewares.checkUserIsAuthenticated, adminController.getOrders)
    app.get('/admin/customers', adminMiddlewares.checkUserIsAuthenticated, adminController.getCustomers)
    app.get('/admin/discounts', adminMiddlewares.checkUserIsAuthenticated, adminController.getCoupons)
    app.get('/admin/settings', adminMiddlewares.checkUserIsAuthenticated, adminController.getSettings)
    app.get('/admin/settings/staff-members', adminMiddlewares.checkUserIsAuthenticated, adminController.getStaffMembers)
    app.get('/admin/logout', adminMiddlewares.checkUserIsAuthenticated, adminController.processLogOut)

    app.post('/api/admin/sub_categories', adminMiddlewares.checkUserIsAuthenticated, fileMiddleware.uploadFileMiddleware, adminController.addCategory) //formValidators
    app.get('/api/admin/sub_categories/:id', adminMiddlewares.checkUserIsAuthenticated, adminController.getCategory)
    app.put('/api/admin/sub_categories/:id/update', adminMiddlewares.checkUserIsAuthenticated, fileMiddleware.uploadFileMiddleware, adminController.updateCategory) //formValidators
    app.delete('/api/admin/sub_categories/:id/delete', adminMiddlewares.checkUserIsAuthenticated, adminController.deleteCategory)

    app.post('/api/admin/products', adminMiddlewares.checkUserIsAuthenticated, fileMiddleware.uploadFileMiddleware, adminController.addProduct) //formValidators
    app.get('/api/admin/products/:id', adminMiddlewares.checkUserIsAuthenticated, adminController.getProduct)
    app.put('/api/admin/products/:id/update', adminMiddlewares.checkUserIsAuthenticated, fileMiddleware.uploadFileMiddleware, adminController.updateProduct) //formValidators
    app.delete('/api/admin/products/:id/delete', adminMiddlewares.checkUserIsAuthenticated, adminController.deleteProduct)

    app.post('/api/admin/discounts', adminMiddlewares.checkUserIsAuthenticated, formValidators.validate('addCoupon'), adminController.addCoupon)
    app.get('/api/admin/discounts/:id', adminMiddlewares.checkUserIsAuthenticated, adminController.getCoupon)
    app.put('/api/admin/discounts/:id/update', adminMiddlewares.checkUserIsAuthenticated, formValidators.validate('addCoupon'), adminController.updateCoupon)
    app.delete('/api/admin/discounts/:id/delete', adminMiddlewares.checkUserIsAuthenticated, adminController.deleteCoupon)

    app.get('/api/admin/order/:id', adminMiddlewares.checkUserIsAuthenticated, adminController.getOrder)
    app.put('/api/admin/order/:id/update', adminMiddlewares.checkUserIsAuthenticated, formValidators.validate('updateOrder'), adminController.updateOrder)


    app.get('/api/admin/site-settings', adminMiddlewares.checkUserIsAuthenticated, adminController.getSiteSettings)
    app.post('/api/admin/site-settings', adminMiddlewares.checkUserIsAuthenticated, fileMiddleware.uploadFilesMiddleware, adminController.changeSiteSettings) //formValidators

    app.post('/api/admin/staffs', adminMiddlewares.checkUserIsAuthenticated, formValidators.validate('addStaff'), adminController.addStaff)
    app.get('/api/admin/staffs/:id', adminMiddlewares.checkUserIsAuthenticated, adminController.getStaff)
    app.put('/api/admin/staffs/:id/update', adminMiddlewares.checkUserIsAuthenticated, formValidators.validate('addStaff'), adminController.updateStaff)
    app.delete('/api/admin/staffs/:id/delete', adminMiddlewares.checkUserIsAuthenticated, adminController.deleteStaff)


    app.post('/api/admin/payment-methods', adminMiddlewares.checkUserIsAuthenticated, formValidators.validate('addPayment'), adminController.addPayment)
}

module.exports = routes;
