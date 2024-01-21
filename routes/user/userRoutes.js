const express = require("express");
const Router = express.Router();
const isAuth = require('../../middleware/isAuh')
const userController = require('../../controller/user/userController')
const multer = require('multer');
const userProfileStorage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploaded_img/user_profile')
    },
    filename:function(req,file,cb){
        cb(null,req.userId+'-'+file.originalname);
    }
})

const uploadUserProfile = multer({storage:userProfileStorage})

Router.put('/api/user',isAuth,userController.putUser)

Router.get('/api/user',isAuth,userController.getUser)

Router.get('/getSubmit',(req,res)=>{
    console.log(req.body)
    console.log(req.params)
    console.log(req.query)
    res.json({msg:req})
})



Router.post('/user/profile/photo',isAuth,uploadUserProfile.single('profile'),userController.postProfilePhoto)

Router.put("/user",isAuth,userController.updateUser);
module.exports = Router
