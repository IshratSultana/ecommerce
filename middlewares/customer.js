const checkUserIsAuthenticated = (req, res, next) => {
    const cookies = req.cookies
    if (cookies['e-comAuthenticatedCustomerEmail'] !== undefined && cookies['e-comAuthenticatedCustomerEmail'] !== '') {
        next()
    } else {
        res.status(401).redirect('/login')
    }
}

const checkUserIsLoggedIn = (req, res, next) => {
    const cookies = req.cookies
    if (cookies['e-comAuthenticatedCustomerEmail'] !== undefined && cookies['e-comAuthenticatedCustomerEmail'] !== '') {
        res.status(200).redirect('/profile')
    } else {
        next()
    }
}

module.exports = {
    checkUserIsAuthenticated,
    checkUserIsLoggedIn
}
