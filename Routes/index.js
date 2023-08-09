const express = require('express')
const router = express.Router() 


//user routes
router.use('/auth', require('./Student/Auth'))
router.use('/profile',require("./Student/Profile"))


//chat routes
router.use('/chat', require('./Chat'))

//payment routes
router.use('/payment', require('./Payment'))

// //message routes 
// router.use('/message', require('./Message'))

//admin routes
router.use('/admin/auth', require('./Admin/AdminAuth'))
router.use('/admin/user', require('./Admin/AdminUser'))



module.exports = router;