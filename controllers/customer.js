const app = require('express')
const db = require('../config/database')
const countryCodeWithNameAndFlagList = require('../data/country-code-with-svg-flag.json')
const serviceWorkers = require('../serviceWorkers')
const bcrypt = require("bcrypt");
const {validationResult} = require('express-validator');

const getHome = (req, res) => {
    db.connection.query('SELECT * FROM site_settings', (err, result1) => {
        if (err) throw err
        db.connection.query('SELECT * FROM products ORDER BY id desc limit 4', (err, result2) => {
            if (err) throw err
            db.connection.query('SELECT * FROM products ORDER BY id ASC limit 8', (err, result3) => {
                if (err) throw err
                console.log(result3)
                res.render('pages/customer/home', {
                    title: "Home",
                    siteSettings: result1 ? result1[0] : null,
                    newArrival: result2,
                    products: result3
                })
            })
        })
    })
}

const getProductsByCategory = (req, res) => {
    db.connection.query('SELECT * FROM site_settings', (err, result1) => {
        if (err) throw err
        db.connection.query('SELECT * FROM main_categories', (err, result2) => {
            if (err) throw err
            db.connection.query('SELECT * from sub_categories', (err, result3) => {
                if (err) throw err
                db.connection.query('SELECT * from sub_categories WHERE slug = ?', [req.params.slug], (err, result4) => {
                    if (err) throw err
                    if (result4.length > 0) {
                        db.connection.query('SELECT * FROM products WHERE category_id = ? ORDER BY id DESC LIMIT 9', [result4[0].id], (err, result5) => {
                            if (err) throw err
                            // console.log(result5)
                            res.render('pages/customer/slugProducts', {
                                title: req.params.parent.toUpperCase() + ' -> ' + req.params.slug.toUpperCase(),
                                siteSettings: result1 ? result1[0] : null,
                                parents: result2,
                                categories: result3,
                                products: result5,
                                slug: req.params.slug.toUpperCase(),
                                parentOfSlug: req.params.parent.toUpperCase(),
                                catId: result4[0].id,
                                parentId: result4[0].parent,
                                categoryId: result4[0].id
                            })
                        })
                    } else {
                        res.redirect('/shop')
                    }
                })
            })
        })
    })
}

const getProductDetail = (req, res) => {
    db.connection.query('SELECT * FROM site_settings', (err, result1) => {
        if (err) throw err
        db.connection.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, result2) => {
            if (err) throw err
            if (result2.length > 0) {
                db.connection.query('SELECT * FROM products WHERE id != ? AND main_category_id = ? AND category_id = ?', [req.params.id, result2[0].main_category_id, result2[0].category_id], (err, result3) => {
                    if (err) throw err
                    // console.log(result3)
                    res.render('pages/customer/productDetail', {
                        title: result2[0].name,
                        siteSettings: result1 ? result1[0] : null,
                        product: result2[0],
                        similarProducts: result3
                    })
                })
            } else {
                res.redirect('/shop')
            }
        })
    })
}

const getCart = (req, res) => {
    db.connection.query('SELECT * FROM site_settings', (err, result1) => {
        if (err) throw err
        res.render('pages/customer/cart', {
            title: "Cart",
            siteSettings: result1 ? result1[0] : null,
        })
    })
}

const getCheckout = (req, res) => {
    db.connection.query('SELECT * FROM site_settings', (err, result1) => {
        if (err) throw err

        res.render('pages/customer/checkout', {
            title: "Checkout",
            siteSettings: result1 ? result1[0] : null,
            countryCodeWithNameAndFlagList: countryCodeWithNameAndFlagList
        })
    })
}

const getOrderComplete = (req, res) => {
    db.connection.query('SELECT * FROM site_settings', (err, result1) => {
        if (err) throw err
        res.render('pages/customer/orderComplete', {
            title: "Order Complete",
            siteSettings: result1 ? result1[0] : null,
        })
    })
}

const getLogin = (req, res) => {
    db.connection.query('SELECT * FROM site_settings', (err, result1) => {
        if (err) throw err
        res.render('pages/customer/login', {
            title: "Login",
            siteSettings: result1 ? result1[0] : null,
        })
    })
}

const processLogin = async (req, res) => {
    try {
        const {email, password} = req.body
        // validation logics [TBD]
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            db.connection.query('SELECT * FROM site_settings', (err, result1) => {
                if (err) throw err
                res.status(403).render('pages/customer/login', {
                    title: "Login",
                    siteSettings: result1 ? result1[0] : null, valErrors: errors.errors, data: req.body
                })
            })
        } else {
            db.connection.query('SELECT * FROM users WHERE email = ? AND type = ?', [email, 'C'], async (err, result) => {
                if (err) throw err;
                if (result.length == 0 || !(await bcrypt.compare(password, result[0].password))) {
                    db.connection.query('SELECT * FROM site_settings', (err, result1) => {
                        if (err) throw err
                        res.status(401).render('pages/customer/login', {
                            title: "Login",
                            errMsg: "Email or password is incorrect.",
                            data: req.body,
                            siteSettings: result1 ? result1[0] : null, valErrors: errors.errors, data: req.body
                        })
                    })
                } else {
                    res
                        .status(200)
                        .cookie('e-comAuthenticatedCustomerEmail', email, {
                            expires: new Date(Date.now() + 24 * 3600000),
                            httpOnly: true
                        })
                        .cookie('e-comAuthenticatedCustomerType', 'customer', {
                            expires: new Date(Date.now() + 24 * 3600000),
                            httpOnly: true
                        })
                        .redirect('/profile')
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}

const getShop = (req, res) => {
    db.connection.query('SELECT * FROM site_settings', (err, result1) => {
        if (err) throw err
        db.connection.query('SELECT * FROM main_categories', (err, result2) => {
            if (err) throw err
            db.connection.query('SELECT * from sub_categories', (err, result3) => {
                if (err) throw err
                db.connection.query('SELECT * FROM (SELECT * FROM products ORDER BY id DESC LIMIT 9) sub ORDER BY id ASC', (err, result4) => {
                    if (err) throw err
                    console.log(result4)
                    res.render('pages/customer/shop', {
                        title: "Shop",
                        siteSettings: result1 ? result1[0] : null,
                        parents: result2,
                        categories: result3,
                        landingDefaultProducts: result4,
                        parentId: 0,
                        categoryId: 0
                    })
                })
            })
        })
    })
}

const getProductsByPriceRange = (req, res) => {
    try {
        const {from, to, parentId, categoryId} = req.body
        let query = null
        if (parentId == 0) {
            query = `SELECT * FROM products WHERE sale_price BETWEEN ${from} AND ${to}`
        } else {
            categoryId > 0 ? `SELECT * FROM products WHERE main_category_id = ${parentId} AND category_id = ${categoryId} AND sale_price BETWEEN ${from} AND ${to}` : `SELECT * FROM products WHERE main_category_id = ${parentId} AND sale_price BETWEEN ${from} AND ${to}`;
        }
        console.log(query)
        db.connection.query(query, (err, result) => {
            if (err) throw err
            res.status(200).json({
                success: true,
                data: result
            })
        })
    } catch (e) {
        console.log(e)
        res.json({
            success: false,
            message: "Something went wrong!",
        })
    }
}

const getMoreProducts = (req, res) => {
    try {
        const {offsetXn, parentId, categoryId} = req.body
        // console.log(offsetXn);
        let query = null
        if (parentId == 0) {
            query = `SELECT * FROM (SELECT * FROM products ORDER BY id DESC LIMIT 10 OFFSET ${(offsetXn - 1) * 10}) sub ORDER BY id ASC`
        } else {
            query = categoryId > 0 ? `SELECT * FROM (SELECT * FROM products WHERE main_category_id = ${parentId} AND category_id = ${categoryId} ORDER BY id DESC LIMIT 10 OFFSET ${(offsetXn - 1) * 10}) sub ORDER BY id ASC` : `SELECT * FROM (SELECT * FROM products WHERE main_category_id = ${parentId} ORDER BY id DESC LIMIT 10 OFFSET ${(offsetXn - 1) * 10}) sub ORDER BY id ASC`;
        }

        console.log(query)
        db.connection.query(query, (err, result) => {
            if (err) throw err
            res.status(200).json({
                success: true,
                data: result
            })
        })
    } catch (e) {
        console.log(e)
        res.json({
            success: false,
            message: "Something went wrong!",
        })
    }
}

const addToCart = (req, res) => {
    try {
        db.connection.query('SELECT * FROM products WHERE id = ?', [req.body.productId], (err, result) => {
            if (err) throw err
            if (result.length > 0) {
                if (req.body.qty > result[0].qty) {
                    res.status(400).json({
                        success: false,
                        data: {},
                        msg: "Quantity limit exceed. Allow upto " + result[0].qty + "."
                    })
                } else {
                    res.status(200).json({
                        success: true,
                        data: result[0]
                    })
                }
            } else {
                res.status(400).json({
                    success: false,
                    data: {},
                    msg: "Something went wrong!"
                })
            }
        })
    } catch (e) {
        console.log(e)
        res.json({
            success: false,
            message: "Something went wrong!",
        })
    }
}

const applyCoupon = (req, res) => {
    try {
        db.connection.query('SELECT * FROM discount_codes WHERE code = ?', [req.body.code], (err, result) => {
            if (err) throw err
            if (result.length > 0) {
                if (req.body.total < result[0].min_amount) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        msg: "To get the discount, please shop at least " + result[0].min_amount + "."
                    })
                } else if (result[0].status === "Revoked") {
                    res.status(400).json({
                        success: false,
                        data: null,
                        msg: "This coupon code is currently not active to use."
                    })
                } else {
                    res.status(200).json({
                        success: true,
                        data: result[0].discount / 100
                    })
                }
            } else {
                res.status(400).json({
                    success: false,
                    data: null,
                    msg: "Invalid coupon code."
                })
            }
        })
    } catch (e) {
        console.log(e)
        res.json({
            success: false,
            message: "Something went wrong!",
        })
    }
}

const placeAnOrder = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            // console.log();
            const {customer_id, first_name, last_name, address, email, password, code, number, cod, tNc} = req.body
            const cart = JSON.parse(req.body.cart)
            let errors = []
            if ((!req.body.hasOwnProperty('type') && customer_id == 0) || cod === 'false' || tNc === 'false' || password == '') {
                // console.log(typeof req.body.hasOwnProperty('type'))
                if (password == '' && customer_id == 0) {
                    errors.push({
                        msg: 'Invalid password.',
                        param: 'password'
                    })
                }

                if (!req.body.hasOwnProperty('type') && customer_id == 0) {
                    errors.push({
                        msg: 'This field is required.',
                        param: 'type'
                    })
                }

                if (cod === 'false') {
                    errors.push({
                        msg: 'This field is required.',
                        param: 'cod'
                    })
                }

                if (tNc === 'false') {
                    errors.push({
                        msg: 'This field is required.',
                        param: 'tNc'
                    })
                }

                res.status(400).json({
                    success: false,
                    message: "Validation failure!",
                    errors: errors
                })
            } else {
                let toBeCustomerId = customer_id
                if (customer_id == 0) {
                    console.log("_______")
                    db.connection.query('SELECT * FROM users WHERE email = ?', [email], (err, result1) => {
                        if (err) throw err
                        if (result1.length > 0) {
                            errors.push({
                                msg: 'This email is already been taken.',
                                param: 'email'
                            })

                            res.status(400).json({
                                success: false,
                                message: "Validation failure!",
                                errors: errors
                            })
                        } else {
                            bcrypt.hash(password, 10, function (err, hash) {
                                console.log("!!!!!!!!!")
                                console.log(hash)
                                console.log("!!!!!!!!!")

                                db.connection.query('INSERT INTO users SET ?', {
                                    first_name,
                                    last_name,
                                    email,
                                    address,
                                    password: hash,
                                    code,
                                    number,
                                    joining_date: serviceWorkers.formatDate(Date()),
                                    avatar: null,
                                    type: 'C'
                                }, (err, result) => {
                                    if (err) throw err
                                    console.log("============Added==========")
                                    console.log(result.insertId)
                                    // toBeCustomerId = result.insertId
                                    console.log("============Added==========")

                                    // cart in
                                    db.connection.query('INSERT INTO carts values()', (err, result2) => {
                                        if (err) throw err
                                        console.log("============Added==========")
                                        // console.log(result2.insertId)
                                        console.log("============Added==========")

                                        // cartItems IN
                                        for (const property in cart['products']) {
                                            db.connection.query('INSERT INTO cart_items SET ?', {
                                                product_id: cart['products'][property]['id'],
                                                qty: cart['products'][property]['qty'],
                                                cart_id: result2.insertId
                                            }, (err, result3) => {
                                                if (err) throw err
                                                console.log("============Added==========")
                                                // console.log(result3.insertId)
                                                console.log("============Added==========")

                                                // order in
                                                console.log("customerId:", toBeCustomerId)
                                                db.connection.query('SELECT * FROM products WHERE id = ?', [cart['products'][property]['id']], (err, result5) => {
                                                    if (err) throw err;
                                                    // console.log("result5", result5)
                                                    if (result5.length > 0) {
                                                        db.connection.query('UPDATE products SET qty = ? WHERE id = ?', [result5[0].qty - cart['products'][property]['qty'], cart['products'][property]['id']], (err, result6) => {
                                                            if (err) throw err
                                                            console.log("============Updated==========")
                                                            // console.log(result6)
                                                            console.log("============Updated==========")
                                                        })
                                                    }
                                                })
                                            })
                                        }
                                        db.connection.query('INSERT INTO orders SET ?', {
                                            address: address,
                                            time: serviceWorkers.formatDate(Date()),
                                            pay_method: 'COD',
                                            contact: code + number,
                                            status: 'Pending',
                                            cart_id: result2.insertId,
                                            customer_id: result.insertId,
                                            amount: cart.additionalInfo.total
                                        }, (err, result4) => {
                                            if (err) throw err
                                            console.log("============Added==========")
                                            // console.log(result4.insertId)
                                            console.log("============Added==========")
                                            console.log('Haw maw kaw')
                                            res.status(200).json({
                                                success: true,
                                                message: "Order placed successfully."
                                            })
                                        })
                                    })
                                })
                            });
                        }
                    })
                } else {
                    // cart in
                    db.connection.query('INSERT INTO carts values()', (err, result2) => {
                        if (err) throw err
                        console.log("============Added==========")
                        // console.log(result2.insertId)
                        console.log("============Added==========")

                        // cartItems IN
                        for (const property in cart['products']) {
                            db.connection.query('INSERT INTO cart_items SET ?', {
                                product_id: cart['products'][property]['id'],
                                qty: cart['products'][property]['qty'],
                                cart_id: result2.insertId
                            }, (err, result3) => {
                                if (err) throw err
                                console.log("============Added==========")
                                // console.log(result3.insertId)
                                console.log("============Added==========")

                                // order in
                                console.log("customerId:", toBeCustomerId)
                                db.connection.query('SELECT * FROM products WHERE id = ?', [cart['products'][property]['id']], (err, result5) => {
                                    if (err) throw err;
                                    // console.log("result5", result5)
                                    if (result5.length > 0) {
                                        db.connection.query('UPDATE products SET qty = ? WHERE id = ?', [result5[0].qty - cart['products'][property]['qty'], cart['products'][property]['id']], (err, result6) => {
                                            if (err) throw err
                                            console.log("============Updated==========")
                                            // console.log(result6)
                                            console.log("============Updated==========")
                                        })
                                    }
                                })
                            })
                        }
                        db.connection.query('INSERT INTO orders SET ?', {
                            address: address,
                            time: serviceWorkers.formatDate(Date()),
                            pay_method: 'COD',
                            contact: code + number,
                            status: 'Pending',
                            cart_id: result2.insertId,
                            customer_id: toBeCustomerId,
                            amount: cart.additionalInfo.total
                        }, (err, result4) => {
                            if (err) throw err
                            console.log("============Added==========")
                            // console.log(result4.insertId)
                            console.log("============Added==========")
                            console.log('Haw maw kaw')
                            res.status(200).json({
                                success: true,
                                message: "Order placed successfully."
                            })
                        })
                    })
                }
            }
        }
    } catch (e) {
        console.log(e)
    }
}

const getProfile = (req, res) => {
    db.connection.query('SELECT * FROM site_settings', (err, result1) => {
        if (err) throw err
        db.connection.query('SELECT * FROM users WHERE email = ?', [[req.cookies['e-comAuthenticatedCustomerEmail']]], (err, result2) => {
            if (err) throw err
            if (result2.length > 0) {
                db.connection.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC', [result2[0].id], (err, result3) => {
                    if (err) throw err
                    console.log(result3)
                    res.render('pages/customer/profile', {
                        title: "Profile",
                        siteSettings: result1 ? result1[0] : null,
                        orders: result3
                    })
                })
            } else {
                res.status(401).redirect('/login')
            }
        })
    })
}

const processLogOut = (req, res) => {
    res.clearCookie('e-comAuthenticatedCustomerEmail')
    res.clearCookie('e-comAuthenticatedCustomerType')
    res.redirect('/login')
}

module.exports = {
    getLogin,
    processLogin,
    getProfile,
    getHome,
    getShop,
    getProductDetail,
    getCart,
    getCheckout,
    getOrderComplete,
    getProductsByCategory,
    getProductsByPriceRange,
    getMoreProducts,
    addToCart,
    applyCoupon,
    placeAnOrder,
    processLogOut
}
