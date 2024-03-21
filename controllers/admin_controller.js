var db = require('./../helpers/db_helpers')
var helper =  require('./../helpers/helpers')
var multiparty = require('multiparty')
var fs = require('fs');
var imageSavePath = "./public/img/"

const msg_success = "successfully";
    const msg_fail = "fail";

module.exports.controller = (app, io, socket_list ) => {

    //messages for user authentication
    const msg_invalidUser = "invalid username and password";
    const msg_already_register = "This email has been already registered";
    const msg_already_added = "This value has already been added";

    //Messages for brands
    const msg_brand_added = "Brand added successfully";
    const msg_brand_update = "Brand updated successfully";
    const msg_brand_delete = "Brand deleted successfully"

    //Messages for category
    const msg_category_added = "Category added successfully";
    const msg_category_update = "Category updated successfully";
    const msg_category_delete = "Category deleted successfully";

    //Messages for type
    const msg_type_added = "Type added successfully";
    const msg_type_update = "Type updated successfully";
    const msg_type_delete = "Type deleted successfully";



    //Brand Add brand Endpoint
    app.post('/api/admin/brand_add', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["brand_name"], () => {

            checkAccessToken(req.headers, res, (uObj) =>{
                 
                db.query("SELECT `brand_id`, `brand_name` FROM `brand_detail` WHERE `brand_name` = ? AND `status` = ?", [reqObj.brand_name, "1"],(err, result) =>{
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                if(result.length > 0){
                    //already added this brand
                    res.json({"status":"1", "payload":result[0],"message":msg_already_added});
                }else{
                    db.query("INSERT INTO `brand_detail`(`brand_name`, `created_date`, `modify_date`) VALUES (?, NOW(), NOW())", [
                        reqObj.brand_name
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result){
                            res.json({
                                    "status":"1", "payload":{
                                    "brand_id":result.insertId,
                                    "brand_name": reqObj.brand_name,
                                }, "message":msg_brand_added
                            });
                        } else {
                            res.json({ "status": "0", "message": msg_fail })
                        }
                     })
                    }
                })

            }, "2" )
            
        })
    })

    //Brand Update Endpoint
    app.post('/api/admin/brand_update', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["brand_id","brand_name"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 

                    db.query("UPDATE `brand_detail` SET `brand_name`= ?, `modify_date` = NOW() WHERE `brand_id`= ? AND `status` = ?" , [
                        reqObj.brand_name, reqObj.brand_id, "1"
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_brand_update
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })

        }, "2")
        })
    })

    //Brand Delete Endpoint
    app.post('/api/admin/brand_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["brand_id"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("UPDATE `brand_detail` SET `status`= ?, `modify_date` = NOW() WHERE `brand_id`= ?" , [
                       "2", reqObj.brand_id,
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_brand_delete
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })
        }, "2")
        })
    })

    //Brand List Endpoint
    app.post('/api/admin/brand_list', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("SELECT `brand_id`, `brand_name` FROM `brand_detail` WHERE `status`= ?" , [
                       "1", reqObj.brand_name, reqObj.brand_id,
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        res.json({
                            "status": "1", "payload": result
                         });
                })
        }, "2")
    })



    //Add Category Endpoint
    app.post('/api/admin/product_category_add', (req,res) =>{
            var form = new multiparty.Form();

            checkAccessToken(req.headers, res, (uObj) =>{
                form.parse(req, (err,reqObj, files) => {
                    if(err){
                        helper.ThrowHtmlError(err, res);
                        return
                    }
                     helper.Dlog("----------Parameter----------")
                     helper.Dlog(reqObj)
                     helper.Dlog("----------Files----------")
                     helper.Dlog(files)

                     helper.CheckParameterValid(res, reqObj, ["cat_name","color"], () => {
                        helper.CheckParameterValid(res, files, ["image"], () => {
                            var extension = files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1);

                            var imageFileName = "category/" + helper.fileNameGenerate(extension);
                            var newPath = imageSavePath + imageFileName;
                            fs.rename(files.image[0].path, newPath, (err) => {
                                if(err){
                                    helper.ThrowHtmlError(err, res);
                                    return
                                } else {
                                    db.query("INSERT INTO `category_details`(`cat_name`, `image`, `color`, `created_date`, `modify_date`) VALUES (?,?,?, NOW(), NOW())", [
                                        reqObj.cat_name[0], imageFileName, reqObj.color[0]
                                    ], (err, result) => {
                
                                        if(err){
                                            helper.ThrowHtmlError(err, res);
                                            return;
                                        }
                
                                        if(result){
                                            res.json({
                                                    "status":"1", "payload":{
                                                    "cat_id":result.insertId,
                                                    "cat_name": reqObj.cat_name[0],
                                                    "color": reqObj.color[0],
                                                    "image":helper.ImagePath() +imageFileName,
                                                }, "message":msg_category_added
                                            });
                                        } else {
                                            res.json({ "status": "0", "message": msg_fail })
                                        }
                                     })
                                }
                            })
                        })
                     })
                })


            })
    })

    //Update Category Endpoint
    app.post('/api/admin/product_category_update', (req,res) =>{
            var form = new multiparty.Form();

            checkAccessToken(req.headers, res, (uObj) =>{
                form.parse(req, (err,reqObj, files) => {
                    if(err){
                        helper.ThrowHtmlError(err, res);
                        return
                    }
                     helper.Dlog("----------Parameter----------")
                     helper.Dlog(reqObj)
                     helper.Dlog("----------Files----------")
                     helper.Dlog(files)

                        helper.CheckParameterValid(res, reqObj, ["cat_id","cat_name","color"], () => {
                        
                            var condition ="";
                            var imageFileName = "";

                            if(files.image != undefined || files.image != null){
                                var extension = files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1);

                                imageFileName = "category/" + helper.fileNameGenerate(extension);
                                var newPath = imageSavePath + imageFileName;

                                condition = " `image` = '" + imageFileName + "',";
                                fs.rename(files.image[0].path, newPath, (err) => {
                                if(err){
                                    helper.ThrowHtmlError(err, res);
                                    return
                                } else {
                                    
                                }
                            })
                            }

                            

                            db.query("UPDATE `category_details` SET `cat_name`=?," + condition +" `color`=?,`modify_date`= NOW() WHERE `cat_id` =? AND `status` = ?", [
                                reqObj.cat_name[0], reqObj.color[0], reqObj.cat_id[0], "1"
                            ], (err, result) => {
        
                                if(err){
                                    helper.ThrowHtmlError(err, res);
                                    return;
                                }
        
                                if(result){
                                    res.json({
                                            "status":"1", "payload":{
                                            "cat_id":parseInt(reqObj.cat_id[0]),
                                            "cat_name": reqObj.cat_name[0],
                                            "color": reqObj.color[0],
                                            "image":helper.ImagePath() +imageFileName,
                                        }, "message":msg_category_update
                                    });
                                } else {
                                    res.json({ "status": "0", "message": msg_fail })
                                }
                             })
                     })
                })


            })
    })

    //Delete Category Endpoint
    app.post('/api/admin/product_category_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["cat_id"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("UPDATE `category_details` SET `status`= ?, `modify_date` = NOW() WHERE `cat_id`= ?" , [
                       "2", reqObj.cat_id,
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_category_delete
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })
        }, "2")
        })
    })

    //List Category Endpoint
    app.post('/api/admin/product_category_list', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

            checkAccessToken(req.headers, res, (uObj) =>{
                 
                    db.query("SELECT `cat_id`, `cat_name`, (CASE WHEN `image` != '' THEN CONCAT('"+ helper.ImagePath() +"','',`image`) ELSE `image` END) AS `image`, `color` FROM `category_details` WHERE `status`= ?" , [
                       "1",
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        res.json({
                            "status": "1", "payload": result
                         });
                })
        }, "2")
    })



    //Add Type Endpoint
    app.post('/api/admin/product_type_add', (req,res) =>{
        var form = new multiparty.Form();

        checkAccessToken(req.headers, res, (uObj) =>{
            form.parse(req, (err,reqObj, files) => {
                if(err){
                    helper.ThrowHtmlError(err, res);
                    return
                }
                 helper.Dlog("----------Parameter----------")
                 helper.Dlog(reqObj)
                 helper.Dlog("----------Files----------")
                 helper.Dlog(files)

                 helper.CheckParameterValid(res, reqObj, ["type_name","color"], () => {
                    helper.CheckParameterValid(res, files, ["image"], () => {
                        var extension = files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1);

                        var imageFileName = "type/" + helper.fileNameGenerate(extension);
                        var newPath = imageSavePath + imageFileName;
                        fs.rename(files.image[0].path, newPath, (err) => {
                            if(err){
                                helper.ThrowHtmlError(err, res);
                                return
                            } else {
                                db.query("INSERT INTO `type_detail`(`type_name`, `image`, `color`, `created_date`, `modify_date`) VALUES (?,?,?, NOW(), NOW())", [
                                    reqObj.type_name[0], imageFileName, reqObj.color[0]
                                ], (err, result) => {
            
                                    if(err){
                                        helper.ThrowHtmlError(err, res);
                                        return;
                                    }
            
                                    if(result){
                                        res.json({
                                                "status":"1", "payload":{
                                                "type_id":result.insertId,
                                                "type_name": reqObj.type_name[0],
                                                "color": reqObj.color[0],
                                                "image":helper.ImagePath() +imageFileName,
                                            }, "message":msg_type_added
                                        });
                                    } else {
                                        res.json({ "status": "0", "message": msg_fail })
                                    }
                                 })
                            }
                        })
                    })
                 })
            })


        })
    })

    //Update Type Endpoint
    app.post('/api/admin/product_type_update', (req,res) =>{
            var form = new multiparty.Form();

            checkAccessToken(req.headers, res, (uObj) =>{
                form.parse(req, (err,reqObj, files) => {
                    if(err){
                        helper.ThrowHtmlError(err, res);
                        return
                    }
                    helper.Dlog("----------Parameter----------")
                    helper.Dlog(reqObj)
                    helper.Dlog("----------Files----------")
                    helper.Dlog(files)

                        helper.CheckParameterValid(res, reqObj, ["type_id","type_name","color"], () => {
                        
                            var condition ="";
                            var imageFileName = "";

                            if(files.image != undefined || files.image != null){
                                var extension = files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1);

                                imageFileName = "type/" + helper.fileNameGenerate(extension);
                                var newPath = imageSavePath + imageFileName;

                                condition = " `image` = '" + imageFileName + "',";
                                fs.rename(files.image[0].path, newPath, (err) => {
                                if(err){
                                    helper.ThrowHtmlError(err, res);
                                    return
                                } else {
                                    
                                }
                            })
                            }

                            

                            db.query("UPDATE `type_detail` SET `type_name`=?," + condition +" `color`=?,`modify_date`= NOW() WHERE `type_id` =? AND `status` = ?", [
                                reqObj.type_name[0], reqObj.color[0], reqObj.type_id[0], "1"
                            ], (err, result) => {
        
                                if(err){
                                    helper.ThrowHtmlError(err, res);
                                    return;
                                }
        
                                if(result){
                                    res.json({
                                            "status":"1", "payload":{
                                            "type_id":parseInt(reqObj.type_id[0]),
                                            "type_name": reqObj.type_name[0],
                                            "color": reqObj.color[0],
                                            "image":helper.ImagePath() +imageFileName,
                                        }, "message":msg_type_update
                                    });
                                } else {
                                    res.json({ "status": "0", "message": msg_fail })
                                }
                            })
                    })
                })


            })
    })

    //Delete Type Endpoint
    app.post('/api/admin/product_type_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

        helper.CheckParameterValid(res, reqObj, ["type_id"], () => {
            
            checkAccessToken(req.headers, res, (uObj) =>{
                
                    db.query("UPDATE `type_detail` SET `status`= ?, `modify_date` = NOW() WHERE `type_id`= ?" , [
                    "2", reqObj.type_id,
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        if(result.affectedRows > 0){
                            res.json({
                                "status": "1", "message": msg_type_delete
                        });
                        
                        } else{
                            res.json({ "status": "0", "message": msg_fail })
                        }
                })
        }, "2")
        })
    })

    //List Type Endpoint
    app.post('/api/admin/product_type_list', (req, res) => {
        helper.Dlog(req.body);
        var reqObj =  req.body;

            checkAccessToken(req.headers, res, (uObj) =>{
                
                    db.query("SELECT `type_id`, `type_name`, (CASE WHEN `image` != '' THEN CONCAT('"+ helper.ImagePath() +"','',`image`) ELSE `image` END) AS `image`, `color` FROM `type_detail` WHERE `status`= ?" , [
                    "1",
                    ], (err, result) => {

                        if(err){
                            helper.ThrowHtmlError(err, res);
                            return;
                        }

                        res.json({
                            "status": "1", "payload": result
                        });
                })
        }, "2")
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
