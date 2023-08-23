const express = require('express')
const router = express.Router() 


//user routes
router.use('/auth', require('./User/Auth'))
router.use('/profile',require("./User/Profile"))


//chat routes
router.use('/chat', require('./Chat'))


// contest routes
router.use('/contest', require('./Contest'))


// post routes
router.use('/post', require('./Post'))


// gallery routes
router.use('/gallery', require('./Gallery'))


// plan routes
router.use('/plan', require('./Plan'))

// payment routes
router.use('/payment', require('./Payment'))

// //message routes 
// router.use('/message', require('./Message'))

//admin routes
router.use('/admin/auth', require('./Admin/AdminAuth'))
router.use('/admin/user', require('./Admin/AdminUser'))
router.use('/admin/payment', require('./Admin/AdminPayment'))
router.use('/admin/contests', require('./Admin/AdminContest'))
router.use('/admin/queries', require('./Admin/AdminQuery'))
router.use('/admin/entries', require('./Admin/AdminEntry'))




module.exports = router;

