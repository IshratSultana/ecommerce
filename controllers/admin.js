const express = require('express');
const app = express();
const {validationResult} = require('express-validator');
const db = require('../config/database')
const bcrypt = require('bcrypt')
const countryCodeWithNameAndFlagList = require('../data/country-code-with-svg-flag.json')
const helpers = require('../helpers/index');
const serviceWorkers = require('../serviceWorkers')

const getLogin = (req, res) => {
    res.render('pages/admin/login', {title: "Admin Login"})
}
const adminRedirect = (req, res) => {
    res.redirect('/admin/login')
}

const processLogin = async (req, res) => {
    try {
        const {email, password} = req.body
        // validation logics [TBD]
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(403).render('pages/admin/login', {valErrors: errors.errors, data: req.body})
        } else {
            db.connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
                if (err) throw err;
                if (result.length == 0 || !(await bcrypt.compare(password, result[0].password))) {
                    res.status(401).render('pages/admin/login', {
                        errMsg: "Email or password is incorrect.",
                        data: req.body
                    })
                } else {
                    let type;
                    if (result[0].type === 'SA') {
                        type = 'admin'
                    } else if (result[0].type === 'DM') {
                        type = 'deliveryman'
                    } else if (result[0].type === 'S') {
                        type = 'staff'
                    }
                    res
                        .status(200)
                        .cookie('e-comAuthenticatedUserEmail', email, {
                            expires: new Date(Date.now() + 24 * 3600000),
                            httpOnly: true
                        })
                        .cookie('e-comAuthenticatedUserType',  `${type}`, {
                            expires: new Date(Date.now() + 24 * 3600000),
                            httpOnly: true
                        })
                        .redirect('/admin/dashboard')
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}

const getProfile = (req, res) => {
    db.connection.query('SELECT * FROM users WHERE email = ?', [req.cookies['e-comAuthenticatedUserEmail']], async (err, result) => {
        if (err) throw err;
        res.render('pages/admin/profile', {
            title: "Admin Profile",
            profile: result[0],
            countryCodeWithNameAndFlagList: countryCodeWithNameAndFlagList
        })
    })
}

const getDashboard = (req, res) => {
    db.connection.query('SELECT * FROM users WHERE email = ?', [req.cookies['e-comAuthenticatedUserEmail']], async (err, result) => {
        if (err) throw err;
        app.locals.session = result[0];
        db.connection.query('SELECT COUNT(id) AS total FROM products', (err, result1) => {
            if (err) throw err;
            db.connection.query('SELECT COUNT(id) AS total FROM discount_codes', (err, result2) => {
                if (err) throw err;
                db.connection.query('SELECT COUNT(id) AS total FROM orders WHERE status = ?', ['Pending'], (err, result3) => {
                    if (err) throw err;
                    db.connection.query('SELECT COUNT(id) AS total FROM users WHERE type = ?', ['C'], (err, result4) => {
                        if (err) throw err;
                        db.connection.query(`select year(time) as year, month(time) as month, sum(amount) as sale from orders WHERE year(time) BETWEEN ${new Date().getFullYear() - 1} AND ${new Date().getFullYear()} group by year(time), month(time)`, (err, result5) => {
                            if (err) throw err;
                            db.connection.query(`select sum(amount) as sale from orders WHERE year(time) BETWEEN ${new Date().getFullYear() - 1} AND ${new Date().getFullYear()}`, (err, result6) => {
                                if (err) throw err;
                                // console.log(result6)
                                res.render('pages/admin/dashboard/index', {
                                    title: "Admin Dashboard",
                                    numOfProduct: result1[0],
                                    numOfCoupon: result2[0],
                                    numOfOrder: result3[0],
                                    numOfCustomer: result4[0],
                                    chartInfo: result5,
                                    salesOverTime: result6.length > 0 ? Math.round(result6[0]['sale']) : null
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

const getProducts = (req, res) => {
    try {
        db.connection.query('SELECT * FROM main_categories', (err, result1) => {
            if (err) throw err;
            db.connection.query('SELECT * FROM sub_categories', (err, result2) => {
                if (err) throw err;
                db.connection.query('SELECT products.id, products.image_name, products.name, main_categories.name AS type, products.unit, products.sale_price FROM products INNER JOIN main_categories ON products.main_category_id=main_categories.id ORDER BY products.id DESC', (err, result3) => {
                    if (err) throw err;
                    res.render('pages/admin/product/index', {
                        title: "Admin Products",
                        parents: result1,
                        sub_categories: result2,
                        products: result3
                    })
                })
            })
        })
    } catch (e) {
        console.log(e)
    }
}

const getCategories = (req, res) => {
    try {
        db.connection.query('SELECT * FROM main_categories', (err, result1) => {
            if (err) throw err;
            db.connection.query('SELECT sub_categories.id, sub_categories.image_name, sub_categories.name, sub_categories.slug, main_categories.name AS type FROM sub_categories INNER JOIN main_categories ON sub_categories.parent=main_categories.id ORDER BY sub_categories.id DESC', (err, result2) => {
                if (err) throw err;
                res.render('pages/admin/category/index', {
                    title: "Admin sub_categories",
                    parents: result1,
                    categories: result2
                })
            })
        })
    } catch (e) {
        console.log(e)
    }
}
const getOrders = (req, res) => {
    const userType = req.cookies['e-comAuthenticatedUserType'];
    if (userType === 'deliveryman') {
        db.connection.query('SELECT * FROM users WHERE email = ?', [req.cookies['e-comAuthenticatedUserEmail']], async (err, user) => {
            if (err) throw err;
            db.connection.query('SELECT * FROM orders where assigned_to = ? ORDER BY id DESC', [user[0].id], (err1, result) => {
                if (err1) throw err;
                db.connection.query('SELECT * FROM users where id = ?', [user[0].id], (err2, deliveryMen) => {
                    if (err2) throw err1;
                    res.render('pages/admin/order/index', {
                        title: "Admin Orders",
                        orders: result,
                        helpers: helpers,
                        deliveryMen: deliveryMen
                    })
                })
            })
        })
    } else {
        db.connection.query('SELECT * FROM orders ORDER BY id DESC', (err, result) => {
            if (err) throw err;
            db.connection.query('SELECT * FROM users where type in ("DM") ORDER BY id DESC', (err1, deliveryMen) => {
                if (err1) throw err1;
                res.render('pages/admin/order/index', {
                    title: "Admin Orders",
                    orders: result,
                    helpers: helpers,
                    deliveryMen: deliveryMen
                })
            })
        })
    }
}

const getCustomers = (req, res) => {
    db.connection.query('SELECT users.id, users.avatar, users.first_name, users.last_name, users.code, users.number, users.joining_date, COUNT(orders.id) AS NumberOfOrders, SUM(orders.amount) AS totalOrderAmount FROM orders LEFT JOIN users ON orders.customer_id = users.id GROUP BY id', (err, result) => {
        if (err) throw err;
        res.render('pages/admin/customer/index', {
            title: "Admin Customers",
            customers: result
        })
    })
}

const getCoupons = (req, res) => {
    try {
        db.connection.query('SELECT * FROM main_categories', (err, result1) => {
            if (err) throw err;
            db.connection.query('SELECT * FROM discount_codes ORDER BY id DESC', (err, result2) => {
                if (err) throw err;
                res.render('pages/admin/discounts/index', {
                    title: "Admin Discount",
                    parents: result1,
                    coupons: result2,
                    helpers: helpers
                })
            })
        })
    } catch (e) {
        console.log(e)
    }
}

const getSettings = (req, res) => {
    db.connection.query('SELECT * FROM main_categories', (err, result1) => {
        if (err) throw err;
        db.connection.query('SELECT * FROM sub_categories', (err, result2) => {
            if (err) throw err;
            res.render('pages/admin/settings/index', {
                title: "Admin Settings",
                parents: result1,
                categories: result2,
                countryCodeWithNameAndFlagList: countryCodeWithNameAndFlagList
            })
        })
    })
}

const processLogOut = (req, res) => {
    res.clearCookie('e-comAuthenticatedUserEmail')
    res.clearCookie('e-comAuthenticatedUserType')
    res.redirect('/admin/login')
}

const getStaffMembers = (req, res) => {
    db.connection.query('SELECT * FROM users WHERE type IN ("DM", "S") ORDER BY id DESC', (err, result) => {
        if (err) throw err;
        res.render('pages/admin/settings/staff-members', {
            title: "Staff Members",
            staffs: result,
            helpers: helpers,
            countryCodeWithNameAndFlagList: countryCodeWithNameAndFlagList
        })
    })
}

const addCategory = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            if (req.file !== undefined) {
                // console.log("Going for file deletion..")
                fs.unlink(app__basedir + "/assets/uploads/" + req.file.filename, (err) => {
                    if (err) {
                        console.log(err)
                        res.json({
                            success: false,
                            message: "Something went wrong!",
                        })
                    }
                    // console.log("File removed.")
                })
            }
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            if (req.file == undefined) {
                res.status(400).json({
                    success: false,
                    type: "file-up",
                    message: "Please upload a file."
                })
            } else {
                const {name, slug, main_category_id} = req.body
                db.connection.query('SELECT * FROM sub_categories WHERE slug = ?', [slug], (err, result) => {
                    if (err) throw err
                    if (result.length > 0) {
                        res.status(400).json({
                            success: false,
                            type: "slug",
                            message: "The slug is already in use, please choose something else."
                        })
                    } else {
                        db.connection.query('INSERT INTO sub_categories SET ?', {
                            name,
                            slug,
                            parent: main_category_id,
                            image_name: req.file.filename
                        }, (err, result) => {
                            if (err) throw err
                            res.status(201).json({
                                success: true,
                                message: "Added successfully."
                            })
                        })
                    }
                })
            }
        }
    } catch (e) {
        console.log(e)
    }
}

const getCategory = (req, res) => {
    try {
        db.connection.query('SELECT * FROM sub_categories WHERE id = ?', [req.params.id], (err, result) => {
            if (err) throw err
            if (result.length === 0) {
                res.status(400).json({
                    success: false,
                    data: {},
                    message: "Not found the category you are looking."
                })
            } else {
                res.status(200).json({
                    success: true,
                    data: result[0]
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

const updateCategory = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            if (req.file !== undefined) {
                // console.log("Going for file deletion..")
                fs.unlink(app__basedir + "/assets/uploads/" + req.file.filename, (err) => {
                    if (err) {
                        console.log(err)
                        res.json({
                            success: false,
                            message: "Something went wrong!",
                        })
                    }
                    // console.log("File removed.")
                })
            }
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            const {name, slug, main_category_id, cat_id, uploaded_img_name} = req.body
            db.connection.query('SELECT * from sub_categories WHERE slug = ? AND id != ?', [slug, cat_id], (err, result) => {
                if (err) throw err
                if (result.length > 0) {
                    res.status(400).json({
                        success: false,
                        type: "slug",
                        message: "The slug is already in use, please choose something else."
                    })
                } else {
                    db.connection.query('UPDATE sub_categories SET name = ?, slug = ?, parent = ?, image_name = ? WHERE id = ?', [name, slug, main_category_id, req.file !== undefined ? req.file.filename : uploaded_img_name, req.params.id], (err, result) => {
                        if (err) throw err
                        res.status(200).json({
                            success: true,
                            message: "Updated successfully."
                        })
                    })
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}

const deleteCategory = (req, res) => {
    try {
        db.connection.query('DELETE from sub_categories WHERE id = ?', [req.params.id], (err, result1) => {
            if (err) throw err
            if (result1.length === 0) {
                res.status(400).json({
                    success: false,
                    data: {},
                    message: "Not found the category you are looking."
                })
            } else {
                /*                console.log("id", req.params.id)
                                db.connection.query('SELECT * from sub_categories WHERE id = ?', [req.params.id], (err, result2) => {
                                    console.log(result2)
                                    if (err) throw err
                                    if (result2.length === 0) {
                                        res.status(400).json({
                                            success: false,
                                            data: {},
                                            message: "Not found the category you are looking."
                                        })
                                    } else {
                                        fs.unlink(app__basedir + "/assets/uploads/" + result2[0].image_name, (err) => {
                                            if (err) {
                                                console.log(err)
                                                res.json({
                                                    success: false,
                                                    message: "Something went wrong!",
                                                })
                                            }
                                            // console.log("File removed.")
                                        })
                                        res.status(200).json({
                                            success: true,
                                            message: "Deleted successfully."
                                        })
                                    }
                                })*/

                res.status(200).json({
                    success: true,
                    message: "Deleted successfully."
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

const addProduct = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            if (req.file !== undefined) {
                // console.log("Going for file deletion..")
                fs.unlink(app__basedir + "/assets/uploads/" + req.file.filename, (err) => {
                    if (err) {
                        console.log(err)
                        res.json({
                            success: false,
                            message: "Something went wrong!",
                        })
                    }
                    // console.log("File removed.")
                })
            }
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            if (req.file == undefined) {
                res.status(400).json({
                    success: false,
                    type: "file-up",
                    message: "Please upload a file."
                })
            } else {
                const {name, description, unit, price, sale_price, discount, qty, main_category_id, category_id} = req.body
                db.connection.query('INSERT INTO products SET ?', {
                    name,
                    description,
                    unit,
                    price,
                    sale_price,
                    discount,
                    qty,
                    main_category_id,
                    category_id,
                    image_name: req.file.filename
                }, (err, result) => {
                    if (err) throw err
                    res.status(201).json({
                        success: true,
                        message: "Added successfully."
                    })
                })
            }
        }
    } catch (e) {
        console.log(e)
    }
}

const getProduct = (req, res) => {
    try {
        db.connection.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, result) => {
            if (err) throw err
            if (result.length === 0) {
                res.status(400).json({
                    success: false,
                    data: {},
                    message: "Not found the product you are looking."
                })
            } else {
                res.status(200).json({
                    success: true,
                    data: result[0]
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

const updateProduct = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            if (req.file !== undefined) {
                // console.log("Going for file deletion..")
                fs.unlink(app__basedir + "/assets/uploads/" + req.file.filename, (err) => {
                    if (err) {
                        console.log(err)
                        res.json({
                            success: false,
                            message: "Something went wrong!",
                        })
                    }
                    // console.log("File removed.")
                })
            }
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            const {
                name,
                description,
                unit,
                price,
                sale_price,
                discount,
                qty,
                main_category_id,
                category_id,
                uploaded_img_name
            } = req.body
            db.connection.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, result) => {
                if (err) throw err
                if (result.length === 0) {
                    res.status(400).json({
                        success: false,
                        data: {},
                        message: "Not found the product you are looking."
                    })
                } else {
                    db.connection.query('UPDATE products SET name = ?, description = ?, unit = ?, price = ?, sale_price = ?, discount = ?, qty = ?, main_category_id = ?, category_id = ?, image_name = ? WHERE id = ?', [name, description, unit, price, sale_price, discount, qty, main_category_id, category_id, req.file !== undefined ? req.file.filename : uploaded_img_name, req.params.id], (err, result) => {
                        if (err) throw err
                        res.status(200).json({
                            success: true,
                            message: "Updated successfully."
                        })
                    })
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}

const deleteProduct = (req, res) => {
    try {
        db.connection.query('DELETE FROM products WHERE id = ?', [req.params.id], (err, result1) => {
            if (err) throw err
            if (result1.length === 0) {
                res.status(400).json({
                    success: false,
                    data: {},
                    message: "Not found the product you are looking."
                })
            } else {
                /*                console.log("id", req.params.id)
                                db.connection.query('SELECT * from sub_categories WHERE id = ?', [req.params.id], (err, result2) => {
                                    console.log(result2)
                                    if (err) throw err
                                    if (result2.length === 0) {
                                        res.status(400).json({
                                            success: false,
                                            data: {},
                                            message: "Not found the category you are looking."
                                        })
                                    } else {
                                        fs.unlink(app__basedir + "/assets/uploads/" + result2[0].image_name, (err) => {
                                            if (err) {
                                                console.log(err)
                                                res.json({
                                                    success: false,
                                                    message: "Something went wrong!",
                                                })
                                            }
                                            // console.log("File removed.")
                                        })
                                        res.status(200).json({
                                            success: true,
                                            message: "Deleted successfully."
                                        })
                                    }
                                })*/

                res.status(200).json({
                    success: true,
                    message: "Deleted successfully."
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

const addCoupon = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            // console.log(req.body);
            const {name, discount, code, min_amount, status} = req.body
            db.connection.query('INSERT INTO discount_codes SET ?', {
                name, discount, code, min_amount, status
            }, (err, result) => {
                if (err) throw err
                res.status(201).json({
                    success: true,
                    message: "Added successfully."
                })
            })
        }
    } catch (e) {
        console.log(e)
    }
}

const getCoupon = (req, res) => {
    try {
        db.connection.query('SELECT * FROM discount_codes WHERE id = ?', [req.params.id], (err, result) => {
            if (err) throw err
            if (result.length === 0) {
                res.status(400).json({
                    success: false,
                    data: {},
                    message: "Not found the campaign you are looking."
                })
            } else {
                res.status(200).json({
                    success: true,
                    data: result[0]
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

const updateCoupon = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            const {name, discount, code, min_amount, status} = req.body
            db.connection.query('UPDATE discount_codes SET name = ?, discount = ?, code = ?, min_amount = ?, status = ? WHERE id = ?', [name, discount, code, min_amount, status, req.params.id], (err, result) => {
                if (err) throw err
                res.status(200).json({
                    success: true,
                    message: "Updated successfully."
                })
            })
        }
    } catch (e) {
        console.log(e)
    }
}

const deleteCoupon = (req, res) => {
    try {
        db.connection.query('DELETE FROM discount_codes WHERE id = ?', [req.params.id], (err, result) => {
            if (err) throw err
            if (result.length === 0) {
                res.status(400).json({
                    success: false,
                    data: {},
                    message: "Not found the category you are looking."
                })
            } else {
                res.status(200).json({
                    success: true,
                    message: "Deleted successfully."
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

const getOrder = (req, res) => {
    try {
        db.connection.query('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, result) => {
            if (err) throw err
            if (result.length === 0) {
                res.status(400).json({
                    success: false,
                    data: {},
                    message: "Not found the Order you are looking."
                })
            } else {
                db.connection.query(`SELECT p.name, p.unit, p.sale_price, p.discount, ci.qty FROM cart_items ci, products p where ci.cart_id = ? and p.id = ci.product_id`, [result[0].cart_id], (err1, products) => {
                    if (err1) throw err1
                    res.status(200).json({
                        success: true,
                        data: result[0],
                        products: products
                    })
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

const updateOrder = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            const { name, discount, code, min_amount, status, assigned_to } = req.body
            if ((status === "Assigned" || status === 'In-progress' || status === 'Delivered' || status === 'Failed') && !assigned_to) {
                return res.status(400).json({
                    success: false,
                    message: "Selection of Delivery Man is required"
                })
            }
            if (assigned_to > 0  && (status === "Assigned" || status === 'In-progress' || status === 'Delivered' || status === 'Failed')) {
                db.connection.query('UPDATE orders SET status = ?, assigned_to = ? WHERE id = ?', [status, assigned_to, req.params.id], (err, result) => {
                    if (err) throw err
                    res.status(200).json({
                        success: true,
                        message: "Updated successfully."
                    })
                })
            } else {
                db.connection.query('UPDATE orders SET assigned_to = NULL, status = ? WHERE id = ?', [status, req.params.id], (err, result) => {
                    if (err) throw err
                    res.status(200).json({
                        success: true,
                        message: "Updated successfully."
                    })
                })
            }
        }
    } catch (e) {
        console.log(e)
    }
}

const getSiteSettings = (req, res) => {
    try {
        db.connection.query('SELECT * FROM site_settings', (err, result) => {
            if (err) throw err
            if (result.length === 0) {
                res.status(200).json({
                    success: true,
                    data: {},
                    message: "Not found the site-settings you are looking."
                })
            } else {
                res.status(200).json({
                    success: true,
                    data: result[0]
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

const changeSiteSettings = (req, res) => {
    try {
        if (req.files.logo == undefined && !req.body.uploaded_logo_name) {
            res.status(400).json({
                success: false,
                type: "file-up-logo",
                message: "Please upload a logo."
            })
        } else if (req.files.banner == undefined && !req.body.uploaded_banner_name) {
            res.status(400).json({
                success: false,
                type: "file-up-banner",
                message: "Please upload a banner."
            })
        } else {
            const {footer, uploaded_logo_name, uploaded_banner_name} = req.body
            const id = null
            db.connection.query('SELECT * FROM site_settings', (err, result1) => {
                if (err) throw err
                if (result1.length === 0) {
                    // insert
                    /*                    console.log(req.files.logo[0].filename)
                                        console.log(req.files.banner[0].filename)*/
                    db.connection.query('INSERT INTO site_settings SET ?', {
                        logo_name: req.files.logo[0].filename,
                        banner_name: req.files.banner[0].filename,
                        footer
                    }, (err, result2) => {
                        if (err) throw err
                        res.status(200).json({
                            success: true,
                            message: "Changed successfully."
                        })
                    })
                } else {
                    /*                    console.log(req.files.logo[0].filename)
                                        console.log(req.files.banner[0].filename)*/
                    // updated
                    db.connection.query('UPDATE site_settings SET logo_name = ?, banner_name = ?, footer = ? WHERE id = ?', [req.files.logo !== undefined ? req.files.logo[0].filename : uploaded_logo_name, req.files.banner !== undefined ? req.files.banner[0].filename : uploaded_banner_name, footer, req.body.id], (err, result3) => {
                        if (err) throw err
                        res.status(200).json({
                            success: true,
                            message: "Changed successfully."
                        })
                    })
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}

const addStaff = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            console.log(req.body);
            const {first_name, last_name, code, number, email, type} = req.body
            db.connection.query('SELECT email FROM users WHERE email = ?', [email], (err, result1) => {
                if (err) throw err
                if (result1.length > 0) {
                    res.status(400).json({
                        success: false,
                        type: "email-exist",
                        message: "This email is already been taken."
                    })
                } else {
                    db.connection.query('INSERT INTO users SET ?', {
                        first_name,
                        last_name,
                        code,
                        number,
                        email,
                        password: '$2b$10$j23QK0Sgyb1kQiuZJTuQAOe6MpDpsffC/BHZ/3DIU15jMucp2Sv.C',
                        joining_date: serviceWorkers.formatDate(Date()),
                        type: `${type}`
                    }, (err, result2) => {
                        if (err) throw err
                        console.log("============Added==========")
                        console.log(result2)
                        console.log("============Added==========")
                        res.status(201).json({
                            success: true,
                            message: "Added successfully."
                        })
                    })
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}

const getStaff = (req, res) => {
    try {
        db.connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, result) => {
            if (err) throw err
            if (result.length === 0) {
                res.status(400).json({
                    success: false,
                    data: {},
                    message: "Not found the staff you are looking."
                })
            } else {
                res.status(200).json({
                    success: true,
                    data: result[0]
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

const updateStaff = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            const {first_name, last_name, code, number, email, staff_id, type} = req.body
            db.connection.query('SELECT * FROM users WHERE email = ?', [email], (err, result1) => {
                if (err) throw err
                if (result1.length > 0) {
                    if (result1[0].id != staff_id) {
                        res.status(400).json({
                            success: false,
                            type: "email-exist",
                            message: "This email is already been taken."
                        })
                    } else {
                        db.connection.query('UPDATE users SET first_name = ?, last_name = ?, code = ?, number = ?, email = ?, type = ? WHERE id = ?', [first_name, last_name, code, number, email, type, req.params.id], (err, result) => {
                            if (err) throw err
                            res.status(200).json({
                                success: true,
                                message: "Updated successfully."
                            })
                        })
                    }
                } else {
                    db.connection.query('UPDATE users SET first_name = ?, last_name = ?, code = ?, number = ?, email = ?, type = ? WHERE id = ?', [first_name, last_name, code, number, email, type, req.params.id], (err, result) => {
                        if (err) throw err
                        res.status(200).json({
                            success: true,
                            message: "Updated successfully."
                        })
                    })
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}

const deleteStaff = (req, res) => {
    try {
        db.connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
            if (err) throw err
            if (result.length === 0) {
                res.status(400).json({
                    success: false,
                    data: {},
                    message: "Not found the staff you are looking."
                })
            } else {
                res.status(200).json({
                    success: true,
                    message: "Deleted successfully."
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

const updateProfile = async (req, res) => {
    try {
        console.log(req.file)
        console.log(req.body)
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            if (req.file !== undefined) {
                // console.log("Going for file deletion..")
                fs.unlink(app__basedir + "/assets/uploads/" + req.file.filename, (err) => {
                    if (err) {
                        console.log(err)
                        res.json({
                            success: false,
                            message: "Something went wrong!",
                        })
                    }
                    // console.log("File removed.")
                })
            }

            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            const {first_name, last_name, code, number, email, hashed_password, id} = req.body
            let {password} = req.body
            let {uploaded_image_name} = req.body

            if (uploaded_image_name === '') {
                uploaded_image_name = null
            }

            db.connection.query('SELECT * FROM users WHERE email = ?', [email], (err, result1) => {
                if (err) throw err
                if (result1.length > 0) {
                    if (result1[0].id != id) {
                        res.status(400).json({
                            success: false,
                            type: "email-exist",
                            message: "This email is already been taken."
                        })
                    } else {
                        if (password !== '') {
                            bcrypt.hash(password, 10, function (err, hash) {
                                console.log("!!!!!!!!!")
                                console.log(hash)
                                console.log("!!!!!!!!!")
                                db.connection.query('UPDATE users SET first_name = ?, last_name = ?, code = ?, number = ?, email = ?, password = ?, avatar = ? WHERE id = ?', [first_name, last_name, code, number, email, password !== '' ? hash : hashed_password, req.file !== undefined ? req.file.filename : uploaded_image_name, id], (err, result2) => {
                                    if (err) throw err
                                    console.log("============Updated==========")
                                    console.log(result2)
                                    console.log("============Updated==========")

                                    res.status(200).json({
                                        success: true,
                                        message: "Updated successfully."
                                    })
                                })
                            });
                        } else {
                            db.connection.query('UPDATE users SET first_name = ?, last_name = ?, code = ?, number = ?, email = ?, password = ?, avatar = ? WHERE id = ?', [first_name, last_name, code, number, email, password !== '' ? hash : hashed_password, req.file !== undefined ? req.file.filename : uploaded_image_name, id], (err, result2) => {
                                if (err) throw err
                                console.log("============Updated==========")
                                console.log(result2)
                                console.log("============Updated==========")

                                res.status(200).json({
                                    success: true,
                                    message: "Updated successfully."
                                })
                            })
                        }
                    }
                } else {
                    if (password !== '') {
                        bcrypt.hash(password, 10, function (err, hash) {
                            console.log("!!!!!!!!!")
                            console.log(hash)
                            console.log("!!!!!!!!!")
                            db.connection.query('UPDATE users SET first_name = ?, last_name = ?, code = ?, number = ?, email = ?, password = ?, avatar = ? WHERE id = ?', [first_name, last_name, code, number, email, password !== '' ? hash : hashed_password, req.file !== undefined ? req.file.filename : uploaded_image_name, id], (err, result2) => {
                                if (err) throw err
                                console.log("============Updated==========")
                                console.log(result2)
                                console.log("============Updated==========")

                                res.status(200).json({
                                    success: true,
                                    message: "Updated successfully."
                                })
                            })
                        });
                    } else {
                        db.connection.query('UPDATE users SET first_name = ?, last_name = ?, code = ?, number = ?, email = ?, password = ?, avatar = ? WHERE id = ?', [first_name, last_name, code, number, email, password !== '' ? hash : hashed_password, req.file !== undefined ? req.file.filename : uploaded_image_name, id], (err, result2) => {
                            if (err) throw err
                            console.log("============Updated==========")
                            console.log(result2)
                            console.log("============Updated==========")

                            res.status(200).json({
                                success: true,
                                message: "Updated successfully."
                            })
                        })
                    }
                }
            })
        }
    } catch (e) {
        console.log(e)
    }
}


const addPayment = (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: "Validation failure!",
                errors: errors.array()
            })
        } else {
            // console.log(req.body);
            const {name} = req.body
            db.connection.query('INSERT INTO payment_methods SET ?', {
                name
            }, (err, result) => {
                if (err) throw err
                res.status(201).json({
                    success: true,
                    message: "Added successfully."
                })
            })
        }
    } catch (e) {
        console.log(e)
    }
}


module.exports = {
    getLogin,
    adminRedirect,
    processLogin,
    getProfile,
    updateProfile,
    getDashboard,
    getProducts,
    addProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    addCategory,
    getCategory,
    updateCategory,
    deleteCategory,
    getOrders,
    getCustomers,
    getCoupons,
    addCoupon,
    getCoupon,
    updateCoupon,
    deleteCoupon,
    getOrder,
    updateOrder,
    getSettings,
    processLogOut,
    getStaffMembers,
    getSiteSettings,
    changeSiteSettings,
    addStaff,
    getStaff,
    updateStaff,
    deleteStaff,
    addPayment
}
