var db = require('./../helpers/db_helpers')
var helper =  require('./../helpers/helpers')
var multiparty = require('multiparty')
var fs = require('fs');
var imageSavePath = "./public/img/"



module.exports.controller = (app, io, socket_list ) => {

    const msg_success = "successfully";
    const msg_fail = "fail";
    const msg_invalidUser = "invalid username and password";
    const msg_already_register = "This email has been already registered";

    //Login Endpoint
    app.post('/api/login', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["email", "password", "device_token"], () => {

            var auth_token = helper.createRequestToken();
            db.query("UPDATE `user_detail` SET `auth_token`= ?,`device_token`=?,`modify_date`= NOW() WHERE `email` = ? AND  `password` = ? AND `status` = ?", [auth_token, reqObj.device_token,reqObj.email, reqObj.password, "1"], (err,result) => {

                if(err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }

                if(result.affectedRows > 0) {

                    db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date` FROM `user_detail` WHERE `email` = ? AND  `password` = ? AND `status` = "1" ', [ reqObj.email, reqObj.password ] , (err, result) => {

                        if(err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        if(result.length > 0) {
                            res.json({ "status": "1", "payload": result[0] , "message": msg_success })
                        }else{
                            res.json({ "status": "0", "message": msg_invalidUser })
                        }
                    })
                 } else {
                res.json({ "status": "0", "message": msg_invalidUser })
                }
            })
        } )
    } )

    //Sign Up Endpint
    app.post('/api/sign_up', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["username", "email", "password", "device_token"], () => {

            db.query('SELECT `user_id`,`status` FROM `user_detail` WHERE `email` = ? ', [ reqObj.email ] , (err, result) => {

                if(err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }

                if(result.length > 0) {
                    res.json({ "status": "1", "payload": result[0] , "message": msg_already_register })
                }else{
                    var auth_token = helper.createRequestToken();
                    db.query("INSERT INTO `user_detail`(`username`, `email`,`password`, `auth_token`, `device_token`,  `created_date`, `modify_date`) VALUES(?,?,?,?,?, NOW(), NOW())", [reqObj.username, reqObj.email, reqObj.password, auth_token,reqObj.device_token, ], (err, result) => {
                        if(err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        if(result){
                            db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date` FROM `user_detail` WHERE `user_id` = ? AND `status` = "1" ', [ result.insertId] , (err, result) => {

                                if(err) {
                                    helper.ThrowHtmlError(err, res);
                                    return
                                }
        
                                if(result.length > 0) {
                                    res.json({ "status": "1", "payload": result[0] , "message": msg_success })
                                }else{
                                    res.json({ "status": "0", "message": msg_invalidUser })
                                }
                            })
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                    })
                   
                }
            })
        }) 
    })



    app.post('/api/upload_image', (req, res) => {
        var form = new multiparty.Form();
        form.parse(req, (err, reqObj, files) => {
            if(err) {
                helper.ThrowHtmlError(err, res);
                return;
            }

            helper.Dlog("--------------- Parameter --------------")
            helper.Dlog(reqObj);

            helper.Dlog("--------------- Files --------------")
            helper.Dlog(files);

            if(files.image != undefined || files.image != null ) {
                var extension = files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1 );
                var imageFileName = helper.fileNameGenerate(extension);

                var newPath = imageSavePath + imageFileName;

                fs.rename(files.image[0].path, newPath, (err) => {

                    if(err) {
                        helper.ThrowHtmlError(err);
                        return;
                    }else{

                        var name = reqObj.name;
                        var address = reqObj.address;

                        helper.Dlog(name);
                        helper.Dlog(address);

                        res.json({
                            "status":"1",
                            "payload": {"name": name, "address": address, "image":  helper.ImagePath() + imageFileName },
                            "message": msg_success
                        })
                    }
                })
            }
        })
    })

    app.post('/api/upload_multi_image', (req, res) => {
        var form = new multiparty.Form();
        form.parse(req, (err, reqObj, files) => {
            if (err) {
                helper.ThrowHtmlError(err, res);
                return;
            }

            helper.Dlog("--------------- Parameter --------------")
            helper.Dlog(reqObj);

            helper.Dlog("--------------- Files --------------")
            helper.Dlog(files);

            if (files.image != undefined || files.image != null) {

                var imageNamePathArr = []
                var fullImageNamePathArr = [];
                files.image.forEach( imageFile => {
                    var extension = imageFile.originalFilename.substring(imageFile.originalFilename.lastIndexOf(".") + 1);
                    var imageFileName = helper.fileNameGenerate(extension);

                    imageNamePathArr.push(imageFileName);
                    fullImageNamePathArr.push(helper.ImagePath() + imageFileName);
                    saveImage(imageFile, imageSavePath + imageFileName );
                });

                helper.Dlog(imageNamePathArr);
                helper.Dlog(fullImageNamePathArr);

                var name = reqObj.name;
                var address = reqObj.address;

                helper.Dlog(name);
                helper.Dlog(address);
                

                res.json({
                    "status": "1",
                    "payload": { "name": name, "address": address, "image": fullImageNamePathArr },
                    "message": msg_success
                })
            }
        })
    })
}

function checkAccessToken(headerObj, res, callback, require_type=""){
    helper.Dlog(headerObj.access_token);
    helper.CheckParameterValid(res, headerObj, ["access_token"] , () => {
        db.query("SELECT `user_id`, `username`, `user_type`, `name`, `email`, `mobile`, `mobile_code`, `auth_token`, `device_token`, `status` FROM `user_detail` WHERE `auth_token` =? AND `status` = ?", [headerObj.access_token,"1"], (err, result) => {
            if(err){
                helper.ThrowHtmlError(err,res);
                return
            }  
            
            helper.Dlog(result);

            if(result.length > 0){
                if(require_type != ""){
                    if(require_type == result[0].user_type){
                        return callback(result[0]);
                    } else{
                        res.json({ "status": "0", "code":"404", "message": "Access denied! Unauthorized user access." })
                    }

                } else{
                    return callback(result[0]);
                }
            }else{
                res.json({ "status": "0", "code":"404", "message": "Access denied! Unauthorized user access." })
            }
        })
    })

}


function saveImage(imageFile, savePath ) {
    fs.rename(imageFile.path, savePath, (err) => {

        if (err) {
            helper.ThrowHtmlError(err);
            return;
        }
    })
}