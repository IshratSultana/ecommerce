const checkUserIsAuthenticated = (req, res, next) => {
    const cookies = req.cookies
    if (cookies['e-comAuthenticatedUserEmail'] !== undefined && cookies['e-comAuthenticatedUserEmail'] !== '') {
        next()
    } else {
        res.status(401).redirect('/admin/login')
    }
}

const checkUserIsLoggedIn = (req, res, next) => {
    const cookies = req.cookies
    if (cookies['e-comAuthenticatedUserEmail'] !== undefined && cookies['e-comAuthenticatedUserEmail'] !== '') {
        res.status(200).redirect('/admin/dashboard')
    } else {
        next()
    }
}

module.exports = {
    checkUserIsAuthenticated,
    checkUserIsLoggedIn
}
