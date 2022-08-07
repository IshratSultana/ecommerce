const {check, body} = require('express-validator');

exports.validate = (method) => {
    switch (method) {
        case 'adminLogin': {
            return [
                check('email', "Invalid email.").exists().isEmail(),
                check('password', "Invalid password.").isLength({min: 4}),
            ];
        }
            break;

        case 'addCategory': {
            return [
                check('name', "Invalid name.").isLength({min: 1}),
                check('slug', "Invalid slug.").isLength({min: 1}),
                check('main_category_id', 'Invalid parent.').isNumeric()
            ];
        }
            break;

        case 'addCoupon': {
            return [
                body('name', "Invalid name.").isLength({min: 1}),
                body('discount', "Invalid discount.").isFloat(),
                body('code', "Invalid code.").isLength({min: 1}),
                body('min_amount', "Invalid minimum amount").isFloat(),
                body('status', "Invalid status.").isLength({min: 1}),
            ];
        }
            break;
        
        case 'updateOrder': {
            return [
                body('status', "Invalid status.").isLength({ min: 1 }),
            ];
        }
            break;

        case 'addStaff': {
            return [
                body('first_name', "Invalid first name.").isLength({min: 1}),
                body('last_name', "Invalid last name.").isLength({min: 1}),
                body('number', "Invalid number.").isNumeric().isLength({min: 5, max: 15}),
                body('email', "Invalid email.").exists().isEmail()
            ];
        }
            break;

        case 'adminProfile': {
            return [
                check('first_name', "Invalid first name.").isLength({min: 1}),
                check('last_name', "Invalid last name.").isLength({min: 1}),
                check('number', "Invalid number.").isNumeric().isLength({min: 5, max: 15}),
                check('email', "Invalid email.").exists().isEmail()
            ];
        }
            break;

        case 'placeOrder': {
            return [
                body('first_name', "Invalid first name.").isLength({min: 1}),
                body('last_name', "Invalid last name.").isLength({min: 1}),
                body('address', "Invalid address.").isLength({min: 1}),
                body('email', "Invalid email.").exists().isEmail(),
                body('number', "Invalid number.").isNumeric().isLength({min: 5, max: 15}),
            ];
        }
            break;


        case 'addPayment': {
            return [
                body('name', "Invalid name.").isLength({min: 2}),
            ];
        }
            break;
    }
}
