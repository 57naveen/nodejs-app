const express = require("express");
const userController = require("../controllers/users");
const router = express.Router();

router.post("/register", userController.register);
router.post("/Login", userController.Login);
router.post("/forgotPassword", userController.forgotPassword);
router.post("/resetPassword", userController.resetPassword); // New route for resetting password

router.post("/sideinput",userController.sideinput);
//router.get("/getUserName", userController.getUserName);

//router.post("/signin",userController.signin)



 

module.exports=router;       