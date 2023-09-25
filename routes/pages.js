const express = require("express");
const router = express.Router();
const userController=require('../controllers/users')

router.get("/",(req,res) =>
{ 
    res.render("index");
});

router.get("/register",(req,res) =>
{ 
    res.render("register");
}); 

router.get("/profile",(req,res) =>
{ 
    res.render("profile");
}); 

router.get("/dash",userController.isLoggedIn,(req,res) =>
{   
    console.log(req.name);
    res.render("dash");
}); 


router.get("/forgotpage",(req,res) =>
{
    res.render("forgotpage");
})


router.get("/passreset",(req,res)=>
{
    res.render("passreset")
})

router.get("/sideinput",(req,res)=>
{
    res.render("sideinput")
})








module.exports=router;